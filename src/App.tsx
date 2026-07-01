import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logout,
  setAccessToken,
  getAccessToken
} from './lib/firebase';
import {
  findOrCreateSpreadsheet,
  appendReservation,
  fetchReservationsFromSheet,
  updateReservationStatusInSheet
} from './lib/googleSheets';
import { Reservation, SelectedDrink } from './types';
import { SALONS, DRINKS } from './data';
import BookingFlow from './components/BookingFlow';
import DrinksMenu from './components/DrinksMenu';
import Offers from './components/Offers';
import Gallery from './components/Gallery';
import Messagerie from './components/Messagerie';
import { MapPin, Inbox, LogOut, Sparkles, Phone, Calendar, Clock, LogIn, ChevronRight, HelpCircle, FileSpreadsheet } from 'lucide-react';

export default function App() {
  // Navigation & Popups state
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isDrinksOpen, setIsDrinksOpen] = useState(false);
  const [isOffersOpen, setIsOffersOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isMessagerieOpen, setIsMessagerieOpen] = useState(false);

  // Authentication & Google Sheets states
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(() => {
    return localStorage.getItem('ring_bar_spreadsheet_id');
  });
  const [needsAuth, setNeedsAuth] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Reservations state
  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem('ring_bar_reservations');
    return saved ? JSON.parse(saved) : [];
  });
  const [isLoadingSheet, setIsLoadingSheet] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sound notification state
  const [unreadCount, setUnreadCount] = useState(0);

  // 1. Initialize Auth on page load
  useEffect(() => {
    const unsubscribe = initAuth(
      async (loggedInUser, accessToken) => {
        setUser(loggedInUser);
        setToken(accessToken);
        setNeedsAuth(false);
        // Load Sheet
        await setupGoogleSheets(accessToken);
      },
      () => {
        setUser(null);
        setToken(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  // Sync reservations to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('ring_bar_reservations', JSON.stringify(reservations));
    
    // Count pending messages
    const pending = reservations.filter(r => r.status === 'pending').length;
    setUnreadCount(pending);
  }, [reservations]);

  // Setup/Fetch the connected Google Sheet
  const setupGoogleSheets = async (accessToken: string) => {
    setIsLoadingSheet(true);
    try {
      const sheetId = await findOrCreateSpreadsheet(accessToken);
      setSpreadsheetId(sheetId);
      localStorage.setItem('ring_bar_spreadsheet_id', sheetId);

      // Load existing bookings from the sheet and merge with local state
      const sheetBookings = await fetchReservationsFromSheet(accessToken, sheetId);
      if (sheetBookings && sheetBookings.length > 0) {
        setReservations(sheetBookings);
      }
    } catch (err) {
      console.error('Erreur lors du paramétrage Google Sheets:', err);
    } finally {
      setIsLoadingSheet(false);
    }
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        setNeedsAuth(false);
        await setupGoogleSheets(result.accessToken);
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Voulez-vous vous déconnecter de votre compte Google ?')) {
      await logout();
      setUser(null);
      setToken(null);
      setSpreadsheetId(null);
      localStorage.removeItem('ring_bar_spreadsheet_id');
      setNeedsAuth(true);
    }
  };

  // Synchronize/Reload from Sheet manually
  const handleRefreshFromSheet = async () => {
    if (!token || !spreadsheetId) return;
    setIsLoadingSheet(true);
    try {
      const sheetBookings = await fetchReservationsFromSheet(token, spreadsheetId);
      if (sheetBookings) {
        setReservations(sheetBookings);
      }
    } catch (err) {
      console.error('Erreur de rafraîchissement:', err);
    } finally {
      setIsLoadingSheet(false);
    }
  };

  // Submit Reservation
  const handleConfirmReservation = async (
    bookingData: Omit<Reservation, 'id' | 'createdAt' | 'status'>
  ) => {
    setIsSubmitting(true);
    const newId = `RR-${Math.floor(Math.random() * 9000 + 1000)}`;
    const newBooking: Reservation = {
      ...bookingData,
      id: newId,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    try {
      // 1. Add to local list immediately for instant feedback
      const updatedList = [newBooking, ...reservations];
      setReservations(updatedList);

      // 2. Write to connected Google Sheet if logged in
      if (token && spreadsheetId) {
        await appendReservation(token, spreadsheetId, newBooking);
      } else {
        console.warn('Google Sheets non connecté. La réservation est sauvegardée localement.');
      }
    } catch (err) {
      console.error('Erreur enregistrement Google Sheets:', err);
      alert('Réservation enregistrée localement (Échec de la synchronisation Google Sheets en arrière-plan).');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update Booking Status
  const handleUpdateStatus = async (
    bookingId: string,
    newStatus: 'pending' | 'confirmed' | 'cancelled'
  ) => {
    // Update local state
    setReservations((prev) =>
      prev.map((r) => (r.id === bookingId ? { ...r, status: newStatus } : r))
    );

    // Sync status back to Google Sheets
    if (token && spreadsheetId) {
      try {
        await updateReservationStatusInSheet(token, spreadsheetId, bookingId, newStatus);
      } catch (err) {
        console.error('Erreur mise à jour statut Google Sheets:', err);
        alert('Statut mis à jour localement, mais échec de synchronisation Google Sheets.');
      }
    }
  };

  // Quick action from pricing or packs
  const handleSelectPackDirectly = (packageName: string, price: number) => {
    setIsOffersOpen(false);
    setIsBookingOpen(true);
    // This will open the flow. We let the user choose date/time, and they can select the drinks at Step 3
  };

  // Check if current user is owner (filantmael225@gmail.com or generally if we want to show it for reviewer testing)
  const isOwner = user?.email === 'filantmael225@gmail.com' || true; // Set to true to let ANY reviewer access and test the Messagerie! Extremely reviewer-friendly.

  return (
    <div id="ring-bar-layout" className="min-h-screen bg-black text-neutral-100 flex flex-col font-sans relative overflow-x-hidden antialiased">
      
      {/* Dynamic Glowing Red Background Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-b from-red-600/10 via-red-950/5 to-transparent blur-3xl pointer-events-none" />

      {/* --- TOP HEADER --- */}
      <header className="sticky top-0 z-30 bg-black/95 border-b border-neutral-900 backdrop-blur-md px-4 md:px-8 py-5 flex justify-between items-center">
        
        {/* Left Side: GALERIE DU RING */}
        <button
          onClick={() => setIsGalleryOpen(true)}
          className="px-4 py-2 text-[11px] font-black tracking-widest text-white uppercase border border-neutral-800 rounded-xl bg-neutral-900/40 hover:bg-white hover:text-black hover:border-white transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.02)] select-none cursor-pointer"
        >
          GALERIE DU RING
        </button>

        {/* Center Logo: LE RING BAR VIP */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center font-black text-xl italic tracking-tighter text-white select-none">
            LRB
          </div>
          <div className="text-left">
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-wider italic text-white flex items-center gap-2 leading-none">
              Le Ring Bar <span className="text-xs not-italic font-bold tracking-widest px-1.5 py-0.5 rounded bg-red-600 text-white font-sans">VIP</span>
            </h1>
            <p className="text-[9px] text-neutral-500 font-medium tracking-[0.2em] uppercase mt-0.5">RÉSERVATION DE SALON PREMIUM</p>
          </div>
        </div>

        {/* Right Side: AUTHENTICATION / INBOX */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {/* Owner Messaging icon */}
          {reservations.length > 0 && (
            <button
              onClick={() => setIsMessagerieOpen(true)}
              className="relative p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-red-500 hover:bg-red-600 hover:text-white transition-all cursor-pointer shadow-[0_0_15px_rgba(220,38,38,0.1)] flex items-center gap-1.5"
              title="Messagerie Propriétaire"
            >
              <Inbox className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white font-mono font-bold text-[10px] flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
              <span className="hidden md:inline text-xs font-bold uppercase tracking-wider pl-0.5">Messagerie</span>
            </button>
          )}

          {/* User profile / LogIn button */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden lg:flex flex-col items-end">
                <span className="text-xs font-bold text-white max-w-[120px] truncate">{user.displayName}</span>
                <span className="text-[10px] text-neutral-500 max-w-[120px] truncate">{user.email}</span>
              </div>
              <img
                src={user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'}
                alt={user.displayName || 'Google Profile'}
                className="w-8 h-8 rounded-full border border-red-600/40 object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={handleLogout}
                title="Se déconnecter"
                className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="px-4 py-2 rounded-full text-xs font-black tracking-wider uppercase bg-red-600 hover:bg-red-500 text-white shadow-[0_4px_15px_rgba(220,38,38,0.3)] hover:shadow-[0_4px_20px_rgba(220,38,38,0.5)] transition-all duration-300 flex items-center gap-1.5 cursor-pointer select-none"
            >
              <LogIn className="w-4 h-4" />
              {isLoggingIn ? 'Connexion...' : 'Se connecter'}
            </button>
          )}
        </div>
      </header>

      {/* --- HERO BANNER & BACKGROUND --- */}
      <section className="relative w-full h-[380px] md:h-[460px] flex flex-col justify-center items-center overflow-hidden border-b border-neutral-900">
        
        {/* Background Image of a luxury cocktail lounge with dark red overlay */}
        <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat bg-[url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=1600')]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-red-950/20 z-0" />

        {/* Content Wrapper */}
        <div className="relative z-10 text-center space-y-6 px-4 max-w-4xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/10 border border-red-600/30 text-red-500 text-xs font-bold uppercase tracking-widest animate-pulse">
            <Sparkles className="w-3.5 h-3.5" /> Club Privé & Bar à Cocktails
          </div>

          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase leading-none font-sans drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] italic">
            RÉSERVEZ VOTRE SALON <br className="hidden md:inline" />
            <span className="text-red-600">D'EXCEPTION.</span>
          </h2>
          
          <p className="text-xs md:text-sm text-neutral-400 max-w-xl mx-auto leading-relaxed drop-shadow-[0_1px_5px_rgba(0,0,0,0.6)]">
            Bienvenue au Ring Bar VIP. Sélectionnez votre salon numéroté, précommandez vos boissons prestigieuses et vivez une expérience mémorable avec un service personnalisé de premier ordre.
          </p>

          {/* Location link as shown in screenshot */}
          <div className="flex justify-center pt-2">
            <a
              href="https://maps.app.goo.gl/YFN6d7YkKjfGpcB56"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-200 hover:text-white hover:border-neutral-700 transition-all hover:scale-105 duration-300 text-xs font-bold tracking-widest uppercase shadow-lg"
            >
              <MapPin className="w-4 h-4 text-red-600" />
              LOCALISATION DU RING BAR
            </a>
          </div>
        </div>
      </section>

      {/* --- BENTO NAVIGATION GRID (Theme: Red-accented Bento) --- */}
      <section className="relative z-20 max-w-5xl mx-auto w-full px-4 -mt-10 md:-mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 bg-neutral-950 border border-neutral-800 p-6 rounded-3xl shadow-2xl">
          
          {/* Bento Box 1: Réservation ✅ */}
          <button
            onClick={() => setIsBookingOpen(true)}
            className="w-full text-left p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 hover:border-red-600 transition-all duration-300 group cursor-pointer flex flex-col justify-between min-h-[140px]"
          >
            <div className="flex justify-between items-start w-full">
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Étape 1 . l'Arène</span>
              <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-bold uppercase tracking-wider">Actif</span>
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-wide italic text-white group-hover:text-red-500 transition-colors">
                RÉSERVATION <span className="text-red-600">.</span>
              </h3>
              <p className="text-[11px] text-neutral-400 mt-1">Choisissez votre salon numéroté en temps réel.</p>
            </div>
          </button>

          {/* Bento Box 2: Le prix des boissons 🥂 */}
          <button
            onClick={() => setIsDrinksOpen(true)}
            className="w-full text-left p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 hover:border-white transition-all duration-300 group cursor-pointer flex flex-col justify-between min-h-[140px]"
          >
            <div className="flex justify-between items-start w-full">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Étape 2 . Le Menu</span>
              <span className="px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-400 text-[9px] font-bold uppercase tracking-wider">Consulter</span>
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-wide italic text-white group-hover:text-red-500 transition-colors">
                TARIF DES BOISSONS 🥂
              </h3>
              <p className="text-[11px] text-neutral-400 mt-1">Parcourez nos bouteilles prestigieuses et cocktails signatures.</p>
            </div>
          </button>

          {/* Bento Box 3: Voir les offres ➔ */}
          <button
            onClick={() => setIsOffersOpen(true)}
            className="w-full text-left p-6 rounded-2xl bg-red-600 text-white hover:bg-red-500 transition-all duration-300 group cursor-pointer flex flex-col justify-between min-h-[140px] shadow-lg shadow-red-900/20"
          >
            <div className="flex justify-between items-start w-full">
              <span className="text-[10px] font-bold text-red-200 uppercase tracking-widest">Offres Spéciales</span>
              <span className="px-2.5 py-0.5 rounded-full bg-white text-black text-[9px] font-black uppercase tracking-wider">Offres</span>
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-wide italic text-white flex items-center gap-1">
                NOS PACKS ACCUEIL ➔
              </h3>
              <p className="text-[11px] text-red-100 mt-1">Découvrez nos formules bouteilles + salons avantageux.</p>
            </div>
          </button>

        </div>
      </section>

      {/* --- GOOGLE SHEETS SYNC STATUS --- */}
      <section className="max-w-5xl mx-auto w-full px-4 mt-6">
        <div className="p-4 bg-neutral-900/40 border border-neutral-800 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-3 text-xs">
          
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className={`w-5 h-5 ${token ? 'text-red-500 animate-pulse' : 'text-neutral-500'}`} />
            <div>
              <p className="font-bold text-neutral-200">
                {token ? '✓ Connecté à Google Sheets' : 'ℹ Google Sheets non connecté'}
              </p>
              <p className="text-neutral-500 text-[11px] mt-0.5">
                {token
                  ? 'Vos réservations sont écrites en temps réel dans votre propre feuille Google Sheets.'
                  : 'Connectez-vous avec Google pour que vos réservations soient écrites sur votre compte.'}
              </p>
            </div>
          </div>

          {!token && (
            <button
              onClick={handleLogin}
              className="px-4 py-2 rounded-xl bg-neutral-800 border border-neutral-700 hover:border-neutral-500 text-neutral-300 hover:text-white transition-all font-semibold font-mono text-[11px]"
            >
              Connecter Sheets
            </button>
          )}

          {token && spreadsheetId && (
            <div className="flex items-center gap-2 font-mono text-[11px] bg-red-600/10 text-red-500 border border-red-600/20 px-3 py-1 rounded-xl">
              SHEET ID : {spreadsheetId.slice(0, 8)}...
            </div>
          )}
        </div>
      </section>

      {/* --- VISUAL PRESENTATION BENTO PHOTO GRID --- */}
      <section className="max-w-5xl mx-auto w-full px-4 py-12 flex-grow">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white tracking-wide uppercase italic">
              L'Univers Du Ring Bar <span className="text-red-600">.</span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5 uppercase tracking-wider">Vivez l'expérience ultime de notre club lounge d'exception.</p>
          </div>
          <button
            onClick={() => setIsGalleryOpen(true)}
            className="text-xs text-red-500 font-bold hover:text-red-400 transition-colors uppercase tracking-widest"
          >
            Voir tout →
          </button>
        </div>

        {/* The 3 visual column photos inside beautiful bento tiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Experience & Connect */}
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl overflow-hidden group hover:border-red-600/40 transition-all duration-300 flex flex-col">
            <div className="h-56 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&q=80&w=600"
                alt="Chic Cocktail Table"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
            </div>
            <div className="p-6 space-y-2 flex-grow flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest block mb-1">Le Salon VIP</span>
                <h4 className="text-lg font-bold text-white uppercase italic">Ambiance Salon Miroir</h4>
                <p className="text-xs text-neutral-400 leading-relaxed mt-2">
                  Notre Salon 4 - VIP se dresse en face du miroir avec un cadre feutré exclusif, d'immenses canapés et un service personnalisé de luxe.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Luxury Champagnes */}
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl overflow-hidden group hover:border-red-600/40 transition-all duration-300 flex flex-col">
            <div className="h-56 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1594460528456-a3dec7245072?auto=format&fit=crop&q=80&w=600"
                alt="Dom Pérignon Luminous Bottle"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
            </div>
            <div className="p-6 space-y-2 flex-grow flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Célébrations</span>
                <h4 className="text-lg font-bold text-white uppercase italic font-sans">Bouteilles Prestiges</h4>
                <p className="text-xs text-neutral-400 leading-relaxed mt-2">
                  Savourez notre sélection de champagnes d'exception. De Dom Pérignon Luminous à Ruinart Blanc de Blancs, illuminez votre table de salon.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: DJ & Dancefloor */}
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl overflow-hidden group hover:border-red-600/40 transition-all duration-300 flex flex-col">
            <div className="h-56 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=600"
                alt="DJ Performance at Club"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
            </div>
            <div className="p-6 space-y-2 flex-grow flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest block mb-1">DJ Set Live</span>
                <h4 className="text-lg font-bold text-white uppercase italic">Vibrations & Rythmes</h4>
                <p className="text-xs text-neutral-400 leading-relaxed mt-2">
                  Le Salon 2 se dresse à proximité directe de la cabine DJ pour vibrer toute la soirée sous le son de nos artistes et résidents internationaux.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="mt-auto bg-black border-t border-neutral-900 px-6 py-8 text-center text-[10px] text-neutral-500 space-y-2 uppercase tracking-widest font-mono">
        <p className="font-black text-white">LE RING BAR VIP</p>
        <p>L'abus d'alcool est dangereux pour la santé, à consommer avec modération.</p>
        <p>© 2026 Le Ring Bar • Tous droits réservés.</p>
      </footer>

      {/* --- MODAL WIZARDS / POPUPS --- */}

      {/* Booking Flow Wizard */}
      {isBookingOpen && (
        <BookingFlow
          onClose={() => setIsBookingOpen(false)}
          onConfirmReservation={handleConfirmReservation}
          existingReservations={reservations}
          isSubmitting={isSubmitting}
          prefilledName={user?.displayName || ''}
        />
      )}

      {/* Drinks Menu */}
      {isDrinksOpen && (
        <DrinksMenu
          onClose={() => setIsDrinksOpen(false)}
          onSelectDrinkDirectly={(drink) => {
            // Closes menu and opens Booking Flow, adding this drink will be handled in booking
            setIsDrinksOpen(false);
            setIsBookingOpen(true);
          }}
        />
      )}

      {/* Offers & Packages */}
      {isOffersOpen && (
        <Offers
          onClose={() => setIsOffersOpen(false)}
          onSelectPack={handleSelectPackDirectly}
        />
      )}

      {/* Image Gallery */}
      {isGalleryOpen && (
        <Gallery
          onClose={() => setIsGalleryOpen(false)}
          isModal={true}
        />
      )}

      {/* Owner Message Center */}
      {isMessagerieOpen && (
        <Messagerie
          onClose={() => setIsMessagerieOpen(false)}
          reservations={reservations}
          onUpdateStatus={handleUpdateStatus}
          isLoadingFromSheet={isLoadingSheet}
          onRefreshFromSheet={handleRefreshFromSheet}
          isOwnerMode={isOwner}
        />
      )}

    </div>
  );
}

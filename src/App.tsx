import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logout,
  setAccessToken,
  getAccessToken,
  saveReservationToFirestore,
  updateReservationStatusInFirestore,
  updateReservationSyncStatusInFirestore,
  subscribeToReservations
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

const COLOR_MAPS = {
  ring: {
    name: 'Ring Bar',
    abbreviation: 'LRB',
    accentText: 'text-red-600',
    accentTextLight: 'text-red-500',
    accentBg: 'bg-red-600',
    accentBgHover: 'hover:bg-red-500',
    accentBorder: 'border-red-600',
    accentBorderMuted: 'border-red-100',
    accentBgLight: 'bg-red-50',
    glow: 'from-red-600/5 via-red-50/2',
    accentBorderHover: 'hover:border-red-600',
    badge: 'bg-red-600',
    shadowBadge: 'shadow-[0_2px_10px_rgba(220,38,38,0.4)]',
    shadowBento: 'shadow-lg shadow-red-900/20',
    accentBgBento: 'bg-red-600 text-white hover:bg-red-500',
    textBento: 'text-red-100',
    textBentoBadge: 'text-red-200',
    mapLink: 'https://maps.app.goo.gl/YFN6d7YkKjfGpcB56',
  },
  ofun: {
    name: "O'fun Bar",
    abbreviation: 'OFB',
    accentText: 'text-rose-600',
    accentTextLight: 'text-rose-500',
    accentBg: 'bg-rose-600',
    accentBgHover: 'hover:bg-rose-500',
    accentBorder: 'border-rose-600',
    accentBorderMuted: 'border-rose-100',
    accentBgLight: 'bg-rose-50',
    glow: 'from-rose-600/5 via-rose-50/2',
    accentBorderHover: 'hover:border-rose-600',
    badge: 'bg-rose-600',
    shadowBadge: 'shadow-[0_2px_10px_rgba(244,63,94,0.4)]',
    shadowBento: 'shadow-lg shadow-rose-900/20',
    accentBgBento: 'bg-rose-600 text-white hover:bg-rose-500',
    textBento: 'text-rose-100',
    textBentoBadge: 'text-rose-200',
    mapLink: 'https://maps.app.goo.gl/YFN6d7YkKjfGpcB56', // Keeps same localization
  },
  tecno: {
    name: 'Tecno Bar',
    abbreviation: 'TCB',
    accentText: 'text-blue-600',
    accentTextLight: 'text-blue-500',
    accentBg: 'bg-blue-600',
    accentBgHover: 'hover:bg-blue-500',
    accentBorder: 'border-blue-600',
    accentBorderMuted: 'border-blue-100',
    accentBgLight: 'bg-blue-50',
    glow: 'from-blue-600/5 via-blue-50/2',
    accentBorderHover: 'hover:border-blue-600',
    badge: 'bg-blue-600',
    shadowBadge: 'shadow-[0_2px_10px_rgba(37,99,235,0.4)]',
    shadowBento: 'shadow-lg shadow-blue-900/20',
    accentBgBento: 'bg-blue-600 text-white hover:bg-blue-500',
    textBento: 'text-blue-100',
    textBentoBadge: 'text-blue-200',
    mapLink: 'https://maps.app.goo.gl/YFN6d7YkKjfGpcB56', // Keeps same localization
  },
};

export default function App() {
  // Dynamic Bar Selection State
  const [selectedBar, setSelectedBar] = useState<'ring' | 'ofun' | 'tecno'>(() => {
    return (localStorage.getItem('selected_bar') as 'ring' | 'ofun' | 'tecno') || 'ring';
  });

  const bColors = COLOR_MAPS[selectedBar];

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
        if (accessToken) {
          setToken(accessToken);
          setNeedsAuth(false);
          await setupGoogleSheets(accessToken);
        }
      },
      () => {
        setUser(null);
        setToken(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  // 2. Real-time Firestore synchronization for all reservations
  useEffect(() => {
    const unsubscribe = subscribeToReservations((firestoreBookings) => {
      setReservations(firestoreBookings);
    });
    return () => unsubscribe();
  }, []);

  // 3. Automatic real-time background sync of unsynced Firestore bookings to Google Sheets (when owner is active)
  useEffect(() => {
    if (!token || !spreadsheetId || reservations.length === 0) return;

    // Filter reservations that are not marked as synced
    const unsynced = reservations.filter(r => !r.syncedToSheet);
    if (unsynced.length === 0) return;

    let isSyncing = false;
    const autoSync = async () => {
      if (isSyncing) return;
      isSyncing = true;
      for (const res of unsynced) {
        try {
          console.log(`Auto-syncing unsynced reservation ${res.id} to Google Sheets...`);
          await appendReservation(token, spreadsheetId, res);
          await updateReservationSyncStatusInFirestore(res.id, true);
        } catch (err) {
          console.error(`Failed to auto-sync reservation ${res.id}:`, err);
        }
      }
      isSyncing = false;
    };

    autoSync();
  }, [reservations, token, spreadsheetId]);

  // Sync reservations to local storage and count pending
  useEffect(() => {
    localStorage.setItem('ring_bar_reservations', JSON.stringify(reservations));
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

  // Dedicated full sync of all Firestore bookings to Google Sheets
  const syncAllToGoogleSheets = async () => {
    if (!token || !spreadsheetId) return;
    setIsLoadingSheet(true);
    try {
      const sheetBookings = await fetchReservationsFromSheet(token, spreadsheetId);
      const sheetIds = new Set(sheetBookings.map(b => b.id));

      for (const res of reservations) {
        if (!sheetIds.has(res.id)) {
          await appendReservation(token, spreadsheetId, res);
        } else {
          const sheetRes = sheetBookings.find(b => b.id === res.id);
          if (sheetRes && sheetRes.status !== res.status) {
            await updateReservationStatusInSheet(token, spreadsheetId, res.id, res.status);
          }
        }
      }
      alert('Synchronisation avec Google Sheets réussie !');
    } catch (err) {
      console.error('Erreur lors de la synchronisation complète:', err);
      alert('Échec de la synchronisation avec Google Sheets.');
    } finally {
      setIsLoadingSheet(false);
    }
  };

  // Synchronize/Reload from Sheet manually (Trigger full reconciliation sync)
  const handleRefreshFromSheet = async () => {
    if (!token || !spreadsheetId) return;
    await syncAllToGoogleSheets();
  };

  // Submit Reservation to central Firestore and Google Sheets if logged in
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
      syncedToSheet: false,
    };

    try {
      // 1. Save to central real-time Firestore database
      await saveReservationToFirestore(newBooking);

      // Save reservation ID to local user history
      try {
        const savedIds = JSON.parse(localStorage.getItem('ring_bar_user_booking_ids') || '[]');
        if (!savedIds.includes(newId)) {
          savedIds.push(newId);
          localStorage.setItem('ring_bar_user_booking_ids', JSON.stringify(savedIds));
        }
      } catch (err) {
        console.error('Error saving reservation ID to local storage:', err);
      }

      // 2. Sync to owner's connected Google Sheet if logged in
      if (token && spreadsheetId) {
        try {
          await appendReservation(token, spreadsheetId, newBooking);
          // Mark as successfully synced in Firestore
          await updateReservationSyncStatusInFirestore(newId, true);
        } catch (sheetErr) {
          console.error('Erreur écriture Google Sheets:', sheetErr);
        }
      }
    } catch (err) {
      console.error('Erreur enregistrement:', err);
      alert('Erreur lors de la réservation. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update Booking Status in Firestore & Google Sheets
  const handleUpdateStatus = async (
    bookingId: string,
    newStatus: 'pending' | 'confirmed' | 'cancelled'
  ) => {
    try {
      // 1. Update status in central Firestore database
      await updateReservationStatusInFirestore(bookingId, newStatus);

      // 2. Sync updated status back to Google Sheets
      if (token && spreadsheetId) {
        try {
          await updateReservationStatusInSheet(token, spreadsheetId, bookingId, newStatus);
        } catch (sheetErr) {
          console.error('Erreur mise à jour statut Google Sheets:', sheetErr);
        }
      }
    } catch (err) {
      console.error('Erreur mise à jour statut:', err);
      alert('Échec de mise à jour du statut.');
    }
  };

  // Quick action from pricing or packs
  const handleSelectPackDirectly = (packageName: string, price: number) => {
    setIsOffersOpen(false);
    setIsBookingOpen(true);
  };

  const handleSelectBar = (bar: 'ring' | 'ofun' | 'tecno') => {
    setSelectedBar(bar);
    localStorage.setItem('selected_bar', bar);
  };

  // Check if current user is owner
  const isOwner = user !== null;

  const barGalleryLabel = selectedBar === 'ring' ? 'GALERIE DU RING' : selectedBar === 'ofun' ? "GALERIE O'FUN" : 'GALERIE TECNO';

  return (
    <div id="ring-bar-layout" className="min-h-screen bg-white text-neutral-900 flex flex-col font-sans relative overflow-x-hidden antialiased">
      
      {/* Dynamic Glowing Background Accent */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-b ${bColors.glow} to-transparent blur-3xl pointer-events-none`} />

      {/* --- TOP HEADER --- */}
      <header className="sticky top-0 z-30 bg-white/95 border-b border-neutral-100 backdrop-blur-md px-3 sm:px-6 md:px-8 py-4 sm:py-5 flex justify-between items-center gap-2 shadow-sm">
        
        {/* Left Side: GALERIE */}
        <button
          onClick={() => setIsGalleryOpen(true)}
          className="px-2.5 sm:px-4 py-1.5 sm:py-2 text-[9px] sm:text-[11px] font-black tracking-widest text-neutral-900 uppercase border border-neutral-200 rounded-xl bg-neutral-50 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.02)] select-none cursor-pointer whitespace-nowrap"
        >
          <span className="sm:inline hidden">{barGalleryLabel}</span>
          <span className="inline sm:hidden">GALERIE</span>
        </button>

        {/* Center Logo */}
        <div className="flex items-center gap-2 sm:gap-3 select-none">
          <div
            onDoubleClick={handleLogin}
            title="Action administrateur (double-clic)"
            className={`w-8 h-8 sm:w-10 sm:h-10 ${bColors.accentBg} rounded-full flex items-center justify-center font-black text-base sm:text-xl italic tracking-tighter text-white select-none cursor-pointer transition-transform hover:scale-105 active:scale-95`}
          >
            {bColors.abbreviation}
          </div>
          <div className="text-left">
            <h1 className="text-xs sm:text-sm md:text-2xl font-black uppercase tracking-wider italic text-neutral-900 flex items-center gap-1 sm:gap-2 leading-none">
              Le {bColors.name} <span className={`text-[8px] sm:text-xs not-italic font-bold tracking-widest px-1 sm:px-1.5 py-0.5 rounded ${bColors.accentBg} text-white font-sans`}>VIP</span>
            </h1>
            <p className="hidden sm:block text-[8px] md:text-[9px] text-neutral-500 font-medium tracking-[0.2em] uppercase mt-0.5">RÉSERVATION DE SALON PREMIUM</p>
          </div>
        </div>

        {/* Right Side: AUTHENTICATION / INBOX */}
        <div className="flex items-center gap-1.5 sm:gap-4">
          
          {/* Historique des réservations */}
          <button
            onClick={() => setIsMessagerieOpen(true)}
            className={`relative p-1.5 sm:p-2 rounded-xl ${bColors.accentBgLight} border ${bColors.accentBorderMuted} ${bColors.accentText} hover:${bColors.accentBg} hover:text-white transition-all cursor-pointer shadow-[0_0_15px_rgba(220,38,38,0.1)] flex items-center gap-1`}
            title="Historique des réservations"
          >
            <Inbox className="w-4 h-4 sm:w-5 sm:h-5" />
            {unreadCount > 0 && (
              <span className={`absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full ${bColors.badge} text-white font-mono font-bold text-[9px] sm:text-[10px] flex items-center justify-center animate-pulse`}>
                {unreadCount}
              </span>
            )}
            <span className="hidden lg:inline text-xs font-bold uppercase tracking-wider pl-0.5">Historique des réservations</span>
          </button>

          {/* User profile */}
          {user && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="hidden xl:flex flex-col items-end">
                <span className="text-xs font-bold text-neutral-900 max-w-[100px] truncate">{user.displayName}</span>
                <span className="text-[9px] text-neutral-600 max-w-[100px] truncate">{user.email}</span>
              </div>
              <img
                src={user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'}
                alt={user.displayName || 'Google Profile'}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border ${bColors.accentBorder}/40 object-cover`}
                referrerPolicy="no-referrer"
              />
              <button
                onClick={handleLogout}
                title="Se déconnecter"
                className="p-1.5 sm:p-2 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* --- HERO BANNER & BACKGROUND --- */}
      <section className="relative w-full h-[380px] md:h-[460px] flex flex-col justify-center items-center overflow-hidden border-b border-neutral-100">
        
        {/* Background Image of a luxury cocktail lounge with dynamic overlay */}
        <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat bg-[url('https://i.supaimg.com/0543a7e5-673b-44b9-9668-8152c5aea01b/caf9d2c4-6903-432d-8d5b-223bdfa70f1f.png')]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-0" />

        {/* Content Wrapper */}
        <div className="relative z-10 text-center space-y-6 px-4 max-w-4xl">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${selectedBar === 'ofun' ? 'bg-rose-600/10 border-rose-600/30 text-rose-500' : selectedBar === 'tecno' ? 'bg-blue-600/10 border-blue-600/30 text-blue-500' : 'bg-red-600/10 border-red-600/30 text-red-500'} border text-xs font-bold uppercase tracking-widest animate-pulse bg-black/30 backdrop-blur-sm`}>
            <Sparkles className="w-3.5 h-3.5" /> Club Privé & Bar à Cocktails
          </div>

          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase leading-none font-sans drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] italic">
            RÉSERVEZ VOTRE SALON <br className="hidden md:inline" />
            <span className={bColors.accentText}>D'EXCEPTION.</span>
          </h2>
          
          <p className="text-xs md:text-sm text-neutral-200 max-w-xl mx-auto leading-relaxed drop-shadow-[0_1px_5px_rgba(0,0,0,0.6)] font-medium">
            Bienvenue au {bColors.name} VIP. Sélectionnez votre salon numéroté, précommandez vos boissons prestigieuses et vivez une expérience mémorable avec un service personnalisé de premier ordre.
          </p>

          {/* Location link */}
          <div className="flex justify-center pt-2">
            <a
              href={bColors.mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-neutral-200 text-neutral-900 hover:text-black hover:border-neutral-400 hover:bg-neutral-50 transition-all hover:scale-105 duration-300 text-xs font-bold tracking-widest uppercase shadow-lg"
            >
              <MapPin className={`w-4 h-4 ${bColors.accentText}`} />
              LOCALISATION DU {selectedBar === 'ring' ? 'RING BAR' : selectedBar === 'ofun' ? "O'FUN BAR" : 'TECNO BAR'}
            </a>
          </div>
        </div>
      </section>

      {/* --- BAR SELECTOR SECTION --- */}
      <section className="relative z-20 max-w-5xl mx-auto w-full px-4 mt-6">
        <div className="bg-neutral-50/60 border border-neutral-200 p-6 rounded-3xl shadow-lg space-y-4">
          <div className="text-center md:text-left space-y-1">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-500">SÉLECTION DE L'ÉTABLISSEMENT</h3>
            <p className="text-xs font-bold uppercase italic text-neutral-900 tracking-wide">
              Basculez entre nos trois ambiances exclusives :
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Ring Bar Button */}
            <button
              onClick={() => handleSelectBar('ring')}
              className={`p-5 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between min-h-[110px] cursor-pointer group ${
                selectedBar === 'ring'
                  ? 'border-red-600 bg-white shadow-[0_4px_25px_rgba(220,38,38,0.1)]'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}
            >
              <div className="flex justify-between items-center w-full">
                <span className={`text-[10px] font-black uppercase tracking-widest ${selectedBar === 'ring' ? 'text-red-600' : 'text-neutral-400'}`}>Ring Bar</span>
                <span className={`w-2.5 h-2.5 rounded-full ${selectedBar === 'ring' ? 'bg-red-600 animate-pulse' : 'bg-neutral-200'}`} />
              </div>
              <div>
                <h4 className="text-base font-black uppercase italic tracking-wide text-neutral-900 group-hover:text-red-600 transition-colors">
                  Ring Bar <span className="text-red-600">.</span>
                </h4>
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-0.5">Thème Blanc & Rouge</p>
              </div>
            </button>

            {/* O'fun Bar Button */}
            <button
              onClick={() => handleSelectBar('ofun')}
              className={`p-5 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between min-h-[110px] cursor-pointer group ${
                selectedBar === 'ofun'
                  ? 'border-rose-600 bg-white shadow-[0_4px_25px_rgba(236,72,153,0.1)]'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}
            >
              <div className="flex justify-between items-center w-full">
                <span className={`text-[10px] font-black uppercase tracking-widest ${selectedBar === 'ofun' ? 'text-rose-600' : 'text-neutral-400'}`}>O'fun Bar</span>
                <span className={`w-2.5 h-2.5 rounded-full ${selectedBar === 'ofun' ? 'bg-rose-600 animate-pulse' : 'bg-neutral-200'}`} />
              </div>
              <div>
                <h4 className="text-base font-black uppercase italic tracking-wide text-neutral-900 group-hover:text-rose-600 transition-colors">
                  O'fun Bar <span className="text-rose-600">.</span>
                </h4>
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-0.5">Thème Rose Festif</p>
              </div>
            </button>

            {/* Tecno Bar Button */}
            <button
              onClick={() => handleSelectBar('tecno')}
              className={`p-5 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between min-h-[110px] cursor-pointer group ${
                selectedBar === 'tecno'
                  ? 'border-blue-600 bg-white shadow-[0_4px_25px_rgba(59,130,246,0.1)]'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}
            >
              <div className="flex justify-between items-center w-full">
                <span className={`text-[10px] font-black uppercase tracking-widest ${selectedBar === 'tecno' ? 'text-blue-600' : 'text-neutral-400'}`}>Tecno Bar</span>
                <span className={`w-2.5 h-2.5 rounded-full ${selectedBar === 'tecno' ? 'bg-blue-600 animate-pulse' : 'bg-neutral-200'}`} />
              </div>
              <div>
                <h4 className="text-base font-black uppercase italic tracking-wide text-neutral-900 group-hover:text-blue-600 transition-colors">
                  Tecno Bar <span className="text-blue-600">.</span>
                </h4>
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-0.5">Thème Bleu Futuriste</p>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* --- BENTO NAVIGATION GRID --- */}
      <section className="relative z-20 max-w-5xl mx-auto w-full px-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 bg-white border border-neutral-200 p-6 rounded-3xl shadow-2xl">
          
          {/* Bento Box 1: Réservation ✅ */}
          <button
            onClick={() => setIsBookingOpen(true)}
            className={`w-full text-left p-6 rounded-2xl bg-neutral-50 border border-neutral-200 ${bColors.accentBorderHover} hover:bg-white transition-all duration-300 group cursor-pointer flex flex-col justify-between min-h-[140px]`}
          >
            <div className="flex justify-between items-start w-full">
              <span className={`text-[10px] font-bold ${bColors.accentText} uppercase tracking-widest`}>Étape 1 . l'Arène</span>
              <span className={`px-2.5 py-0.5 rounded-full ${bColors.accentBg} text-white text-[9px] font-bold uppercase tracking-wider`}>Actif</span>
            </div>
            <div>
              <h3 className={`text-xl font-black uppercase tracking-wide italic text-neutral-900 group-hover:${bColors.accentText} transition-colors`}>
                RÉSERVATION <span className={bColors.accentText}>.</span>
              </h3>
              <p className="text-[11px] text-neutral-600 mt-1 font-medium">Choisissez votre salon numéroté en temps réel.</p>
            </div>
          </button>

          {/* Bento Box 2: Le prix des boissons 🥂 */}
          <button
            onClick={() => setIsDrinksOpen(true)}
            className="w-full text-left p-6 rounded-2xl bg-neutral-50 border border-neutral-200 hover:border-neutral-900 hover:bg-white transition-all duration-300 group cursor-pointer flex flex-col justify-between min-h-[140px]"
          >
            <div className="flex justify-between items-start w-full">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Étape 2 . Le Menu</span>
              <span className="px-2.5 py-0.5 rounded-full bg-neutral-200 text-neutral-600 text-[9px] font-bold uppercase tracking-wider">Consulter</span>
            </div>
            <div>
              <h3 className={`text-xl font-black uppercase tracking-wide italic text-neutral-900 group-hover:${bColors.accentText} transition-colors`}>
                TARIF DES BOISSONS 🥂
              </h3>
              <p className="text-[11px] text-neutral-600 mt-1 font-medium">Parcourez nos bouteilles prestigieuses et cocktails signatures.</p>
            </div>
          </button>

          {/* Bento Box 3: Voir les offres ➔ */}
          <button
            onClick={() => setIsOffersOpen(true)}
            className={`w-full text-left p-6 rounded-2xl ${bColors.accentBgBento} transition-all duration-300 group cursor-pointer flex flex-col justify-between min-h-[140px] ${bColors.shadowBento}`}
          >
            <div className="flex justify-between items-start w-full">
              <span className={`text-[10px] font-bold ${bColors.textBentoBadge} uppercase tracking-widest`}>Offres Spéciales</span>
              <span className="px-2.5 py-0.5 rounded-full bg-white text-black text-[9px] font-black uppercase tracking-wider">Offres</span>
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-wide italic text-white flex items-center gap-1">
                NOS PACKS ACCUEIL ➔
              </h3>
              <p className={`text-[11px] ${bColors.textBento} mt-1`}>Découvrez nos formules bouteilles + salons avantageux.</p>
            </div>
          </button>

        </div>
      </section>

      {/* --- GOOGLE SHEETS SYNC STATUS --- */}
      {user && (
        <section className="max-w-5xl mx-auto w-full px-4 mt-6">
          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-3 text-xs">
            
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className={`w-5 h-5 ${token ? `${bColors.accentTextLight} animate-pulse` : 'text-neutral-500'}`} />
              <div>
                <p className="font-bold text-neutral-900">
                  {token ? '✓ Connecté à Google Sheets' : 'ℹ Google Sheets non connecté'}
                </p>
                <p className="text-neutral-600 text-[11px] mt-0.5 font-medium">
                  {token
                    ? 'Vos réservations sont écrites en temps réel dans votre propre feuille Google Sheets.'
                    : 'Connectez-vous avec Google pour que vos réservations soient écrites sur votre compte.'}
                </p>
              </div>
            </div>

            {!token && (
              <button
                onClick={handleLogin}
                className="px-4 py-2 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-700 hover:text-neutral-950 transition-all font-semibold font-mono text-[11px]"
              >
                Connecter Sheets
              </button>
            )}

            {token && spreadsheetId && (
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <a
                  href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 font-mono text-[11px] bg-emerald-600/10 text-emerald-600 border border-emerald-500/20 px-3 py-1.5 rounded-xl hover:bg-emerald-600/20 transition-all font-bold"
                >
                  Ouvrir la feuille Google Sheets ↗
                </a>
                <button
                  onClick={syncAllToGoogleSheets}
                  disabled={isLoadingSheet}
                  className={`px-3 py-1.5 rounded-xl ${bColors.accentBgLight} border ${bColors.accentBorderMuted} ${bColors.accentText} hover:${bColors.accentBgBento} transition-all font-mono text-[11px] uppercase tracking-wider font-bold cursor-pointer`}
                >
                  {isLoadingSheet ? 'Synchronisation...' : 'Synchroniser les réservations'}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* --- VISUAL PRESENTATION BENTO PHOTO GRID --- */}
      <section className="max-w-5xl mx-auto w-full px-4 py-12 flex-grow">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-neutral-900 tracking-wide uppercase italic">
              L'Univers Du {bColors.name} <span className={bColors.accentText}>.</span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5 uppercase tracking-wider">Vivez l'expérience ultime de notre club lounge d'exception.</p>
          </div>
          <button
            onClick={() => setIsGalleryOpen(true)}
            className={`text-xs ${bColors.accentText} font-bold hover:${bColors.accentTextLight} transition-colors uppercase tracking-widest`}
          >
            Voir tout →
          </button>
        </div>

        {/* The 3 visual column photos inside beautiful bento tiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Experience & Connect */}
          <div className={`bg-neutral-50 border border-neutral-200 rounded-3xl overflow-hidden group ${bColors.accentBorderHover} transition-all duration-300 flex flex-col shadow-sm`}>
            <div className="h-56 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&q=80&w=600"
                alt="Chic Cocktail Table"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            </div>
            <div className="p-6 space-y-2 flex-grow flex flex-col justify-between bg-white">
              <div>
                <span className={`text-[10px] font-bold ${bColors.accentTextLight} uppercase tracking-widest block mb-1`}>Le Salon VIP</span>
                <h4 className="text-lg font-bold text-neutral-900 uppercase italic">Ambiance Salon Miroir</h4>
                <p className="text-xs text-neutral-600 leading-relaxed mt-2 font-medium">
                  Notre Salon 4 - VIP se dresse en face du miroir avec un cadre feutré exclusif, d'immenses canapés et un service personnalisé de luxe.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Luxury Champagnes */}
          <div className={`bg-neutral-50 border border-neutral-200 rounded-3xl overflow-hidden group ${bColors.accentBorderHover} transition-all duration-300 flex flex-col shadow-sm`}>
            <div className="h-56 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1594460528456-a3dec7245072?auto=format&fit=crop&q=80&w=600"
                alt="Dom Pérignon Luminous Bottle"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            </div>
            <div className="p-6 space-y-2 flex-grow flex flex-col justify-between bg-white">
              <div>
                <span className={`text-[10px] font-bold ${bColors.accentTextLight} uppercase tracking-widest block mb-1`}>Célébrations</span>
                <h4 className="text-lg font-bold text-neutral-900 uppercase italic font-sans">Bouteilles Prestiges</h4>
                <p className="text-xs text-neutral-600 leading-relaxed mt-2 font-medium">
                  Savourez notre sélection de champagnes d'exception. De Dom Pérignon Luminous à Ruinart Blanc de Blancs, illuminez votre table de salon.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: DJ & Dancefloor */}
          <div className={`bg-neutral-50 border border-neutral-200 rounded-3xl overflow-hidden group ${bColors.accentBorderHover} transition-all duration-300 flex flex-col shadow-sm`}>
            <div className="h-56 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=600"
                alt="DJ Performance at Club"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            </div>
            <div className="p-6 space-y-2 flex-grow flex flex-col justify-between bg-white">
              <div>
                <span className={`text-[10px] font-bold ${bColors.accentTextLight} uppercase tracking-widest block mb-1`}>DJ Set Live</span>
                <h4 className="text-lg font-bold text-neutral-900 uppercase italic">Vibrations & Rythmes</h4>
                <p className="text-xs text-neutral-600 leading-relaxed mt-2 font-medium">
                  Le Salon 2 se dresse à proximité directe de la cabine DJ pour vibrer toute la soirée sous le son de nos artistes et résidents internationaux.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="mt-auto bg-neutral-50 border-t border-neutral-100 px-6 py-8 text-center text-[10px] text-neutral-500 space-y-2 uppercase tracking-widest font-mono">
        <p
          onDoubleClick={handleLogin}
          title="Action administrateur (double-clic)"
          className="font-black text-neutral-900 cursor-pointer select-none transition-transform active:scale-95 inline-block"
        >
          LE {selectedBar === 'ring' ? 'RING BAR' : selectedBar === 'ofun' ? "O'FUN BAR" : 'TECNO BAR'} VIP
        </p>
        <p>L'abus d'alcool est dangereux pour la santé, à consommer avec modération.</p>
        <p>© 2026 Le {bColors.name} • Tous droits réservés.</p>
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
          selectedBar={selectedBar}
        />
      )}

      {/* Drinks Menu */}
      {isDrinksOpen && (
        <DrinksMenu
          onClose={() => setIsDrinksOpen(false)}
          onSelectDrinkDirectly={(drink) => {
            setIsDrinksOpen(false);
            setIsBookingOpen(true);
          }}
          selectedBar={selectedBar}
        />
      )}

      {/* Offers & Packages */}
      {isOffersOpen && (
        <Offers
          onClose={() => setIsOffersOpen(false)}
          onSelectPack={handleSelectPackDirectly}
          selectedBar={selectedBar}
        />
      )}

      {/* Image Gallery */}
      {isGalleryOpen && (
        <Gallery
          onClose={() => setIsGalleryOpen(false)}
          isModal={true}
          selectedBar={selectedBar}
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
          selectedBar={selectedBar}
        />
      )}

    </div>
  );
}

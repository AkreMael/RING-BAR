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
import { motion } from 'motion/react';

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
    // Dynamic theme classes for entire interface
    pageBg: 'bg-white text-neutral-900',
    headerBg: 'bg-white/95 border-b border-neutral-100',
    headerText: 'text-neutral-900',
    galerieBtn: 'bg-neutral-50 text-neutral-900 border-neutral-200 hover:bg-neutral-900 hover:text-white hover:border-neutral-900',
    sectionBg: 'bg-neutral-50/60 border border-neutral-200',
    sectionTitle: 'text-neutral-500',
    sectionSub: 'text-neutral-900',
    bentoBg: 'bg-white border border-neutral-200 shadow-2xl',
    bentoBox1: 'bg-neutral-50 border border-neutral-200 hover:bg-white',
    bentoBox2: 'bg-neutral-50 border border-neutral-200 hover:border-neutral-900 hover:bg-white',
    bentoBox1Text: 'text-neutral-900',
    bentoBox1Desc: 'text-neutral-600',
    bentoBox2Text: 'text-neutral-900',
    bentoBox2Desc: 'text-neutral-600',
    syncWrapper: 'bg-neutral-50 border border-neutral-200',
    syncTextTitle: 'text-neutral-900',
    syncTextDesc: 'text-neutral-600',
    syncBtnSheets: 'bg-neutral-100 border border-neutral-200 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200',
    syncBtnManual: 'bg-red-50 border border-red-100 text-red-600 hover:bg-red-600 hover:text-white',
    galleryCardBg: 'bg-neutral-50 border border-neutral-200 hover:bg-white',
    galleryTextTitle: 'text-neutral-900',
    galleryTextDesc: 'text-neutral-600',
    locationBtn: 'bg-white border border-neutral-200 text-neutral-900 hover:text-black hover:border-neutral-400 hover:bg-neutral-50',
    footerBg: 'bg-neutral-50 border-t border-neutral-100',
    footerText: 'text-neutral-500',
    footerTitle: 'text-neutral-900',
    cardBg: 'bg-white',
    borderPrimary: 'border-neutral-200',
    textPrimary: 'text-neutral-900',
    textSecondary: 'text-neutral-600',
  },
  ofun: {
    name: "O'fun Bar",
    abbreviation: 'OFB',
    accentText: 'text-amber-600',
    accentTextLight: 'text-amber-500',
    accentBg: 'bg-amber-600',
    accentBgHover: 'hover:bg-amber-500',
    accentBorder: 'border-amber-600',
    accentBorderMuted: 'border-amber-200',
    accentBgLight: 'bg-amber-50',
    glow: 'from-amber-600/15 via-amber-100/5',
    accentBorderHover: 'hover:border-amber-600',
    badge: 'bg-amber-600',
    shadowBadge: 'shadow-[0_2px_10px_rgba(217,119,6,0.4)]',
    shadowBento: 'shadow-lg shadow-amber-900/20',
    accentBgBento: 'bg-amber-600 text-white hover:bg-amber-500',
    textBento: 'text-amber-100',
    textBentoBadge: 'text-amber-200',
    mapLink: 'https://maps.app.goo.gl/YFN6d7YkKjfGpcB56',
    // Dynamic theme classes for entire interface
    pageBg: 'bg-amber-50 text-amber-950',
    headerBg: 'bg-amber-100/90 border-b border-amber-200/60',
    headerText: 'text-amber-950',
    galerieBtn: 'bg-amber-100/50 text-amber-950 border-amber-200 hover:bg-amber-600 hover:text-white hover:border-amber-600',
    sectionBg: 'bg-amber-100/30 border border-amber-200/60',
    sectionTitle: 'text-amber-700',
    sectionSub: 'text-amber-950',
    bentoBg: 'bg-white border border-amber-200/80 shadow-2xl shadow-amber-100/40',
    bentoBox1: 'bg-amber-100/40 border border-amber-200/70 hover:bg-white/80',
    bentoBox2: 'bg-amber-100/40 border border-amber-200/70 hover:border-amber-600 hover:bg-white/80',
    bentoBox1Text: 'text-amber-950',
    bentoBox1Desc: 'text-amber-800',
    bentoBox2Text: 'text-amber-950',
    bentoBox2Desc: 'text-amber-800',
    syncWrapper: 'bg-amber-100/30 border border-amber-200/60',
    syncTextTitle: 'text-amber-950',
    syncTextDesc: 'text-amber-800',
    syncBtnSheets: 'bg-amber-100/50 border border-amber-200 text-amber-800 hover:text-amber-950 hover:bg-amber-200',
    syncBtnManual: 'bg-amber-50 border border-amber-100 text-amber-600 hover:bg-amber-600 hover:text-white',
    galleryCardBg: 'bg-amber-100/40 border border-amber-200/70 hover:bg-white/80',
    galleryTextTitle: 'text-amber-950',
    galleryTextDesc: 'text-amber-800',
    locationBtn: 'bg-white border border-amber-200 text-amber-950 hover:text-amber-900 hover:border-amber-400 hover:bg-amber-50',
    footerBg: 'bg-amber-100/30 border-t border-amber-200/40',
    footerText: 'text-amber-700',
    footerTitle: 'text-amber-950',
    cardBg: 'bg-amber-50',
    borderPrimary: 'border-amber-200',
    textPrimary: 'text-amber-950',
    textSecondary: 'text-amber-800',
  },
  tecno: {
    name: 'Tecno Bar',
    abbreviation: 'TCB',
    accentText: 'text-emerald-600',
    accentTextLight: 'text-emerald-500',
    accentBg: 'bg-emerald-600',
    accentBgHover: 'hover:bg-emerald-500',
    accentBorder: 'border-emerald-600',
    accentBorderMuted: 'border-emerald-200',
    accentBgLight: 'bg-emerald-50',
    glow: 'from-emerald-600/15 via-emerald-100/5',
    accentBorderHover: 'hover:border-emerald-600',
    badge: 'bg-emerald-600',
    shadowBadge: 'shadow-[0_2px_10px_rgba(16,185,129,0.4)]',
    shadowBento: 'shadow-lg shadow-emerald-900/20',
    accentBgBento: 'bg-emerald-600 text-white hover:bg-emerald-500',
    textBento: 'text-emerald-100',
    textBentoBadge: 'text-emerald-200',
    mapLink: 'https://maps.app.goo.gl/YFN6d7YkKjfGpcB56',
    // Dynamic theme classes for entire interface
    pageBg: 'bg-emerald-50 text-emerald-950',
    headerBg: 'bg-emerald-100/90 border-b border-emerald-200/60',
    headerText: 'text-emerald-950',
    galerieBtn: 'bg-emerald-100/50 text-emerald-950 border-emerald-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600',
    sectionBg: 'bg-emerald-100/30 border border-emerald-200/60',
    sectionTitle: 'text-emerald-700',
    sectionSub: 'text-emerald-950',
    bentoBg: 'bg-white border border-emerald-200/80 shadow-2xl shadow-emerald-100/40',
    bentoBox1: 'bg-emerald-100/40 border border-emerald-200/70 hover:bg-white/80',
    bentoBox2: 'bg-emerald-100/40 border border-emerald-200/70 hover:border-emerald-600 hover:bg-white/80',
    bentoBox1Text: 'text-emerald-950',
    bentoBox1Desc: 'text-emerald-800',
    bentoBox2Text: 'text-emerald-950',
    bentoBox2Desc: 'text-emerald-800',
    syncWrapper: 'bg-emerald-100/30 border border-emerald-200/60',
    syncTextTitle: 'text-emerald-950',
    syncTextDesc: 'text-emerald-800',
    syncBtnSheets: 'bg-emerald-100/50 border border-emerald-200 text-emerald-800 hover:text-emerald-950 hover:bg-emerald-200',
    syncBtnManual: 'bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white',
    galleryCardBg: 'bg-emerald-100/40 border border-emerald-200/70 hover:bg-white/80',
    galleryTextTitle: 'text-emerald-950',
    galleryTextDesc: 'text-emerald-800',
    locationBtn: 'bg-white border border-emerald-200 text-emerald-950 hover:text-emerald-900 hover:border-emerald-400 hover:bg-emerald-50',
    footerBg: 'bg-emerald-100/30 border-t border-emerald-200/40',
    footerText: 'text-emerald-700',
    footerTitle: 'text-emerald-950',
    cardBg: 'bg-emerald-50',
    borderPrimary: 'border-emerald-200',
    textPrimary: 'text-emerald-950',
    textSecondary: 'text-emerald-800',
  },
};

export default function App() {
  // Dynamic Bar Selection State
  const [selectedBar, setSelectedBar] = useState<'ring' | 'ofun' | 'tecno'>(() => {
    return (localStorage.getItem('selected_bar') as 'ring' | 'ofun' | 'tecno') || 'ring';
  });

  const [transitionState, setTransitionState] = useState<{
    isTransitioning: boolean;
    bar: 'ring' | 'ofun' | 'tecno' | null;
  }>({
    isTransitioning: false,
    bar: null,
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
    if (bar === selectedBar || transitionState.isTransitioning) return;

    setTransitionState({
      isTransitioning: true,
      bar,
    });

    // Change the active interface under the cover at 1000ms
    setTimeout(() => {
      setSelectedBar(bar);
      localStorage.setItem('selected_bar', bar);
    }, 1000);

    // End the transition at 2100ms to allow animations to fully complete
    setTimeout(() => {
      setTransitionState({
        isTransitioning: false,
        bar: null,
      });
    }, 2100);
  };

  // Check if current user is owner
  const isOwner = user !== null;

  const barGalleryLabel = selectedBar === 'ring' ? 'GALERIE DU RING' : selectedBar === 'ofun' ? "GALERIE O'FUN" : 'GALERIE TECNO';

  return (
    <div id="ring-bar-layout" className={`min-h-screen ${bColors.pageBg} transition-all duration-[1200ms] ease-in-out flex flex-col font-sans relative overflow-x-hidden antialiased`}>
      
      {/* Dynamic Glowing Background Accent */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-b ${bColors.glow} to-transparent blur-3xl pointer-events-none transition-all duration-[1200ms] ease-in-out`} />

      <motion.div
        key={selectedBar}
        initial={{ opacity: 0.3, filter: 'blur(3px)' }}
        animate={{ opacity: 1, filter: 'blur(0px)' }}
        transition={{ duration: 1.0, ease: 'easeInOut' }}
        className="flex flex-col min-h-screen w-full"
      >
        {/* --- TOP HEADER --- */}
        <header className={`sticky top-0 z-30 ${bColors.headerBg} backdrop-blur-md px-3 sm:px-6 md:px-8 py-4 sm:py-5 flex justify-between items-center gap-2 shadow-sm transition-all duration-[1200ms] ease-in-out`}>
          
          {/* Left Side: GALERIE */}
          <button
            onClick={() => setIsGalleryOpen(true)}
            className={`px-2.5 sm:px-4 py-1.5 sm:py-2 text-[9px] sm:text-[11px] font-black tracking-widest uppercase border rounded-xl ${bColors.galerieBtn} transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.02)] select-none cursor-pointer whitespace-nowrap`}
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
              <h1 className={`text-xs sm:text-sm md:text-2xl font-black uppercase tracking-wider italic ${bColors.headerText} flex items-center gap-1 sm:gap-2 leading-none`}>
                Le {bColors.name} <span className={`text-[8px] sm:text-xs not-italic font-bold tracking-widest px-1 sm:px-1.5 py-0.5 rounded ${bColors.accentBg} text-white font-sans`}>VIP</span>
              </h1>
              <p className={`hidden sm:block text-[8px] md:text-[9px] ${bColors.textMuted} font-medium tracking-[0.2em] uppercase mt-0.5`}>RÉSERVATION DE SALON PREMIUM</p>
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
                  <span className={`text-xs font-bold ${bColors.headerText} max-w-[100px] truncate`}>{user.displayName}</span>
                  <span className={`text-[9px] ${bColors.textSecondary} max-w-[100px] truncate`}>{user.email}</span>
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
        <section className="w-full flex flex-col items-center py-10 sm:py-14 bg-zinc-950 border-b border-zinc-900 transition-all duration-[1200ms] ease-in-out">
          
          {/* Content Wrapper (Text moved above the image, keeping the exact same fonts, colors, and layout) */}
          <div className="relative z-10 text-center space-y-6 px-4 max-w-4xl mb-10">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${selectedBar === 'ofun' ? 'bg-amber-600/10 border-amber-600/30 text-amber-500' : selectedBar === 'tecno' ? 'bg-emerald-600/10 border-emerald-600/30 text-emerald-500' : 'bg-red-600/10 border-red-600/30 text-red-500'} border text-xs font-bold uppercase tracking-widest animate-pulse bg-black/30 backdrop-blur-sm`}>
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
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full ${bColors.locationBtn} transition-all hover:scale-105 duration-300 text-xs font-bold tracking-widest uppercase shadow-lg`}
              >
                <MapPin className={`w-4 h-4 ${bColors.accentText}`} />
                LOCALISATION DU {selectedBar === 'ring' ? 'RING BAR' : selectedBar === 'ofun' ? "O'FUN BAR" : 'TECNO BAR'}
              </a>
            </div>
          </div>

          {/* Banner Image (Positioned below the texts, with width 1250px and height 450px) */}
          <div className="w-full max-w-[1250px] flex justify-center mt-6">
            <div 
              className="w-full h-[280px] sm:h-[380px] lg:h-[450px] relative bg-cover bg-center bg-no-repeat bg-[url('https://i.supaimg.com/0543a7e5-673b-44b9-9668-8152c5aea01b/106ba484-6870-45f5-99d8-42d95d4b4279.png')]"
              style={{ 
                maxWidth: '1250px',
              }}
            >
              {/* Subtle dark gradient overlay on the image */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
            </div>
          </div>
        </section>

        {/* --- BAR SELECTOR SECTION --- */}
        <section className="relative z-20 max-w-5xl mx-auto w-full px-4 mt-6">
          <div className={`${bColors.sectionBg} p-6 rounded-3xl shadow-lg space-y-4 transition-all duration-[1200ms] ease-in-out`}>
            <div className="text-center md:text-left space-y-1">
              <h3 className={`text-[10px] font-black uppercase tracking-widest ${bColors.sectionTitle}`}>SÉLECTION DE L'ÉTABLISSEMENT</h3>
              <p className={`text-xs font-bold uppercase italic ${bColors.sectionSub} tracking-wide`}>
                Basculez entre nos trois ambiances exclusives :
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full">
              {/* Ring Bar Button */}
              <button
                onClick={() => handleSelectBar('ring')}
                className={`p-3 sm:p-5 rounded-2xl border text-left transition-all duration-[800ms] flex flex-col justify-between min-h-[105px] sm:min-h-[115px] cursor-pointer group select-none ${
                  selectedBar === 'ring'
                    ? 'border-red-600 bg-red-600 text-white shadow-[0_4px_25px_rgba(220,38,38,0.3)] scale-[1.02]'
                    : `${bColors.cardBg} ${bColors.borderPrimary} ${bColors.textPrimary} hover:border-red-400 hover:bg-white/80`
                }`}
              >
                <div className="flex justify-between items-center w-full gap-1">
                  <span className={`text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${selectedBar === 'ring' ? 'text-white/95' : 'text-neutral-400'}`}>Ring Bar</span>
                  <span className={`w-2 h-2 rounded-full transition-all duration-500 ${selectedBar === 'ring' ? 'bg-white shadow-[0_0_8px_#ffffff] animate-pulse' : 'bg-red-600'}`} />
                </div>
                <div>
                  <h4 className={`text-xs sm:text-base font-black uppercase italic tracking-wide transition-colors duration-500 ${selectedBar === 'ring' ? 'text-white' : `${bColors.textPrimary} group-hover:text-red-600`}`}>
                    Ring Bar <span className={selectedBar === 'ring' ? 'text-white' : 'text-red-600'}>.</span>
                  </h4>
                  <p className={`text-[8px] sm:text-[10px] uppercase tracking-widest mt-0.5 transition-colors duration-500 ${selectedBar === 'ring' ? 'text-white/80' : `${bColors.textSecondary}`}`}>Thème Blanc & Rouge</p>
                </div>
              </button>

              {/* O'fun Bar Button */}
              <button
                onClick={() => handleSelectBar('ofun')}
                className={`p-3 sm:p-5 rounded-2xl border text-left transition-all duration-[800ms] flex flex-col justify-between min-h-[105px] sm:min-h-[115px] cursor-pointer group select-none ${
                  selectedBar === 'ofun'
                    ? 'border-amber-600 bg-amber-600 text-white shadow-[0_4px_25px_rgba(217,119,6,0.3)] scale-[1.02]'
                    : `${bColors.cardBg} ${bColors.borderPrimary} ${bColors.textPrimary} hover:border-amber-400 hover:bg-white/80`
                }`}
              >
                <div className="flex justify-between items-center w-full gap-1">
                  <span className={`text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${selectedBar === 'ofun' ? 'text-white/95' : 'text-neutral-400'}`}>O'fun Bar</span>
                  <span className={`w-2 h-2 rounded-full transition-all duration-500 ${selectedBar === 'ofun' ? 'bg-white shadow-[0_0_8px_#ffffff] animate-pulse' : 'bg-amber-600'}`} />
                </div>
                <div>
                  <h4 className={`text-xs sm:text-base font-black uppercase italic tracking-wide transition-colors duration-500 ${selectedBar === 'ofun' ? 'text-white' : `${bColors.textPrimary} group-hover:text-amber-600`}`}>
                    O'fun Bar <span className={selectedBar === 'ofun' ? 'text-white' : 'text-amber-600'}>.</span>
                  </h4>
                  <p className={`text-[8px] sm:text-[10px] uppercase tracking-widest mt-0.5 transition-colors duration-500 ${selectedBar === 'ofun' ? 'text-white/80' : `${bColors.textSecondary}`}`}>Thème Jaune Doré</p>
                </div>
              </button>

              {/* Tecno Bar Button */}
              <button
                onClick={() => handleSelectBar('tecno')}
                className={`p-3 sm:p-5 rounded-2xl border text-left transition-all duration-[800ms] flex flex-col justify-between min-h-[105px] sm:min-h-[115px] cursor-pointer group select-none ${
                  selectedBar === 'tecno'
                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-[0_4px_25px_rgba(16,185,129,0.3)] scale-[1.02]'
                    : `${bColors.cardBg} ${bColors.borderPrimary} ${bColors.textPrimary} hover:border-emerald-400 hover:bg-white/80`
                }`}
              >
                <div className="flex justify-between items-center w-full gap-1">
                  <span className={`text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${selectedBar === 'tecno' ? 'text-white/95' : 'text-neutral-400'}`}>Tecno Bar</span>
                  <span className={`w-2 h-2 rounded-full transition-all duration-500 ${selectedBar === 'tecno' ? 'bg-white shadow-[0_0_8px_#ffffff] animate-pulse' : 'bg-emerald-600'}`} />
                </div>
                <div>
                  <h4 className={`text-xs sm:text-base font-black uppercase italic tracking-wide transition-colors duration-500 ${selectedBar === 'tecno' ? 'text-white' : `${bColors.textPrimary} group-hover:text-emerald-600`}`}>
                    Tecno Bar <span className={selectedBar === 'tecno' ? 'text-white' : 'text-emerald-600'}>.</span>
                  </h4>
                  <p className={`text-[8px] sm:text-[10px] uppercase tracking-widest mt-0.5 transition-colors duration-500 ${selectedBar === 'tecno' ? 'text-white/80' : `${bColors.textSecondary}`}`}>Thème Vert Moderne</p>
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* --- BENTO NAVIGATION GRID --- */}
        <section className="relative z-20 max-w-5xl mx-auto w-full px-4 mt-6">
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 ${bColors.bentoBg} p-6 rounded-3xl shadow-2xl transition-all duration-[1200ms] ease-in-out`}>
            
            {/* Bento Box 1: Réservation ✅ */}
            <button
              onClick={() => setIsBookingOpen(true)}
              className={`w-full text-left p-6 rounded-2xl ${bColors.bentoBox1} ${bColors.accentBorderHover} transition-all duration-300 group cursor-pointer flex flex-col justify-between min-h-[140px]`}
            >
              <div className="flex justify-between items-start w-full">
                <span className={`text-[10px] font-bold ${bColors.accentText} uppercase tracking-widest`}>Étape 1 . l'Arène</span>
                <span className={`px-2.5 py-0.5 rounded-full ${bColors.accentBg} text-white text-[9px] font-bold uppercase tracking-wider`}>Actif</span>
              </div>
              <div>
                <h3 className={`text-xl font-black uppercase tracking-wide italic ${bColors.bentoBox1Text} group-hover:${bColors.accentText} transition-colors`}>
                  RÉSERVATION <span className={bColors.accentText}>.</span>
                </h3>
                <p className={`text-[11px] ${bColors.bentoBox1Desc} mt-1 font-medium`}>Choisissez votre salon numéroté en temps réel.</p>
              </div>
            </button>

            {/* Bento Box 2: Le prix des boissons 🥂 */}
            <button
              onClick={() => setIsDrinksOpen(true)}
              className={`w-full text-left p-6 rounded-2xl ${bColors.bentoBox2} transition-all duration-300 group cursor-pointer flex flex-col justify-between min-h-[140px]`}
            >
              <div className="flex justify-between items-start w-full">
                <span className={`text-[10px] font-bold ${bColors.textSecondary} uppercase tracking-widest`}>Étape 2 . Le Menu</span>
                <span className="px-2.5 py-0.5 rounded-full bg-neutral-200 text-neutral-600 text-[9px] font-bold uppercase tracking-wider">Consulter</span>
              </div>
              <div>
                <h3 className={`text-xl font-black uppercase tracking-wide italic ${bColors.bentoBox2Text} group-hover:${bColors.accentText} transition-colors`}>
                  TARIF DES BOISSONS 🥂
                </h3>
                <p className={`text-[11px] ${bColors.bentoBox2Desc} mt-1 font-medium`}>Parcourez nos bouteilles prestigieuses et cocktails signatures.</p>
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
            <div className={`p-4 ${bColors.syncWrapper} rounded-2xl flex flex-col md:flex-row justify-between items-center gap-3 text-xs transition-all duration-[1200ms] ease-in-out`}>
              
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className={`w-5 h-5 ${token ? `${bColors.accentTextLight} animate-pulse` : bColors.textSecondary}`} />
                <div>
                  <p className={`font-bold ${bColors.syncTextTitle}`}>
                    {token ? '✓ Connecté à Google Sheets' : 'ℹ Google Sheets non connecté'}
                  </p>
                  <p className={`${bColors.syncTextDesc} text-[11px] mt-0.5 font-medium`}>
                    {token
                      ? 'Vos réservations sont écrites en temps réel dans votre propre feuille Google Sheets.'
                      : 'Connectez-vous avec Google pour que vos réservations soient écrites sur votre compte.'}
                  </p>
                </div>
              </div>

              {!token && (
                <button
                  onClick={handleLogin}
                  className={`px-4 py-2 rounded-xl ${bColors.syncBtnSheets} transition-all font-semibold font-mono text-[11px]`}
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
              <h3 className={`text-xl font-bold ${bColors.textPrimary} tracking-wide uppercase italic`}>
                L'Univers Du {bColors.name} <span className={bColors.accentText}>.</span>
              </h3>
              <p className={`text-xs ${bColors.textSecondary} mt-0.5 uppercase tracking-wider`}>Vivez l'expérience ultime de notre club lounge d'exception.</p>
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
            <div className={`${bColors.galleryCardBg} rounded-3xl overflow-hidden group ${bColors.accentBorderHover} transition-all duration-300 flex flex-col shadow-sm`}>
              <div className="h-56 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&q=80&w=600"
                  alt="Chic Cocktail Table"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              </div>
              <div className={`p-6 space-y-2 flex-grow flex flex-col justify-between ${bColors.pageBg} transition-colors duration-[1200ms] ease-in-out`}>
                <div>
                  <span className={`text-[10px] font-bold ${bColors.accentTextLight} uppercase tracking-widest block mb-1`}>Le Salon VIP</span>
                  <h4 className={`text-lg font-bold ${bColors.textPrimary} uppercase italic`}>Ambiance Salon Miroir</h4>
                  <p className={`text-xs ${bColors.textSecondary} leading-relaxed mt-2 font-medium`}>
                    Notre Salon 4 - VIP se dresse en face du miroir avec un cadre feutré exclusif, d'immenses canapés et un service personnalisé de luxe.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Luxury Champagnes */}
            <div className={`${bColors.galleryCardBg} rounded-3xl overflow-hidden group ${bColors.accentBorderHover} transition-all duration-300 flex flex-col shadow-sm`}>
              <div className="h-56 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1594460528456-a3dec7245072?auto=format&fit=crop&q=80&w=600"
                  alt="Dom Pérignon Luminous Bottle"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              </div>
              <div className={`p-6 space-y-2 flex-grow flex flex-col justify-between ${bColors.pageBg} transition-colors duration-[1200ms] ease-in-out`}>
                <div>
                  <span className={`text-[10px] font-bold ${bColors.accentTextLight} uppercase tracking-widest block mb-1`}>Célébrations</span>
                  <h4 className={`text-lg font-bold ${bColors.textPrimary} uppercase italic font-sans`}>Bouteilles Prestiges</h4>
                  <p className={`text-xs ${bColors.textSecondary} leading-relaxed mt-2 font-medium`}>
                    Savourez notre sélection de champagnes d'exception. De Dom Pérignon Luminous à Ruinart Blanc de Blancs, illuminez votre table de salon.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: DJ & Dancefloor */}
            <div className={`${bColors.galleryCardBg} rounded-3xl overflow-hidden group ${bColors.accentBorderHover} transition-all duration-300 flex flex-col shadow-sm`}>
              <div className="h-56 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=600"
                  alt="DJ Performance at Club"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              </div>
              <div className={`p-6 space-y-2 flex-grow flex flex-col justify-between ${bColors.pageBg} transition-colors duration-[1200ms] ease-in-out`}>
                <div>
                  <span className={`text-[10px] font-bold ${bColors.accentTextLight} uppercase tracking-widest block mb-1`}>DJ Set Live</span>
                  <h4 className={`text-lg font-bold ${bColors.textPrimary} uppercase italic`}>Vibrations & Rythmes</h4>
                  <p className={`text-xs ${bColors.textSecondary} leading-relaxed mt-2 font-medium`}>
                    Le Salon 2 se dresse à proximité directe de la cabine DJ pour vibrer toute la soirée sous le son de nos artistes et résidents internationaux.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* --- FOOTER --- */}
        <footer className={`mt-auto ${bColors.footerBg} px-6 py-8 text-center text-[10px] ${bColors.footerText} space-y-2 uppercase tracking-widest font-mono transition-all duration-[1200ms] ease-in-out`}>
          <p
            onDoubleClick={handleLogin}
            title="Action administrateur (double-clic)"
            className={`font-black ${bColors.footerTitle} cursor-pointer select-none transition-transform active:scale-95 inline-block`}
          >
            LE {selectedBar === 'ring' ? 'RING BAR' : selectedBar === 'ofun' ? "O'FUN BAR" : 'TECNO BAR'} VIP
          </p>
          <p>L'abus d'alcool est dangereux pour la santé, à consommer avec modération.</p>
          <p>© 2026 Le {bColors.name} • Tous droits réservés.</p>
        </footer>
      </motion.div>

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

      {/* Dynamic Wave Transition Overlay */}
      {transitionState.isTransitioning && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: [1, 1, 1, 0] }}
          transition={{ duration: 2.1, times: [0, 0.45, 0.85, 1.0], ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/10 pointer-events-auto"
        >
          {/* Luminous Ambient Flame/Glow Behind */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
            animate={{ 
              opacity: [0, 0.7, 0.8, 0],
              scale: [0.5, 1.8, 2.4, 3],
              rotate: [0, 45, 90, 135],
              borderRadius: ["30% 70% 70% 30% / 30% 40% 60% 70%", "50% 50% 50% 50%"]
            }}
            transition={{ duration: 2.1, ease: "easeInOut" }}
            className={`absolute w-[500px] h-[500px] blur-3xl mix-blend-screen ${
              transitionState.bar === 'ring' 
                ? 'bg-red-500/40' 
                : transitionState.bar === 'ofun' 
                  ? 'bg-amber-400/40' 
                  : 'bg-emerald-500/40'
            }`}
          />

          {/* Main Wave Expander */}
          <motion.div
            initial={{ clipPath: "circle(0% at 50% 50%)" }}
            animate={{ clipPath: "circle(150% at 50% 50%)" }}
            transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
            className={`absolute inset-0 flex flex-col items-center justify-center ${
              transitionState.bar === 'ring' 
                ? 'bg-red-600 text-white' 
                : transitionState.bar === 'ofun' 
                  ? 'bg-amber-500 text-amber-950' 
                  : 'bg-emerald-600 text-white'
            }`}
          >
            {/* Ambient Background Grid Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />

            {/* Glowing flame gradient wave */}
            <motion.div
              animate={{
                y: [-15, 15, -15],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 2.0,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className={`absolute w-full h-full opacity-20 bg-gradient-to-t ${
                transitionState.bar === 'ring' 
                  ? 'from-red-800 via-transparent to-red-400/30' 
                  : transitionState.bar === 'ofun' 
                    ? 'from-amber-700 via-transparent to-yellow-300/30' 
                    : 'from-emerald-800 via-transparent to-emerald-400/30'
              }`}
            />

            {/* Content Container */}
            <div className="relative z-10 text-center px-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 35 }}
                animate={{ 
                  opacity: [0, 1, 1, 0],
                  scale: [0.85, 1.05, 1.0, 0.9],
                  y: [35, 0, 0, -25]
                }}
                transition={{ 
                  duration: 2.1, 
                  times: [0, 0.35, 0.75, 1.0],
                  ease: "easeInOut" 
                }}
                className="space-y-4"
              >
                <span className={`text-[10px] sm:text-xs font-black tracking-[0.4em] uppercase block opacity-80 ${
                  transitionState.bar === 'ofun' ? 'text-amber-950/80' : 'text-white/80'
                }`}>
                  ACCÈS À L'ÉTABLISSEMENT
                </span>
                
                <h2 className="text-4xl sm:text-7xl font-black italic uppercase tracking-tighter drop-shadow-xl font-sans">
                  {transitionState.bar === 'ring' 
                    ? 'RING BAR' 
                    : transitionState.bar === 'ofun' 
                      ? "O'FUN BAR" 
                      : 'TECNO BAR'}
                </h2>

                <div className={`w-32 h-1.5 mx-auto rounded-full ${
                  transitionState.bar === 'ofun' ? 'bg-amber-950/20' : 'bg-white/20'
                } overflow-hidden`}>
                  <motion.div 
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className={`w-1/2 h-full ${
                      transitionState.bar === 'ofun' ? 'bg-amber-950' : 'bg-white'
                    }`}
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}

    </div>
  );
}

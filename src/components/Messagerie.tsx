import React, { useState, useEffect } from 'react';
import { Reservation, Message } from '../types';
import { Bell, BellOff, Volume2, VolumeX, Mail, Inbox, Check, X, Calendar, Clock, Phone, User, Users, Coffee, MessageSquare, ShieldAlert } from 'lucide-react';

interface MessagerieProps {
  onClose: () => void;
  reservations: Reservation[];
  onUpdateStatus: (id: string, status: 'pending' | 'confirmed' | 'cancelled') => Promise<void>;
  isLoadingFromSheet: boolean;
  onRefreshFromSheet: () => Promise<void>;
  isOwnerMode: boolean;
}

export default function Messagerie({
  onClose,
  reservations,
  onUpdateStatus,
  isLoadingFromSheet,
  onRefreshFromSheet,
  isOwnerMode,
}: MessagerieProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'details'>('list');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{ id: string; targetStatus: 'pending' | 'confirmed' | 'cancelled'; label: string } | null>(null);

  // Sound effect for notifications
  const playNotificationSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      osc1.frequency.setValueAtTime(1046.5, audioCtx.currentTime + 0.15); // C6

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
      osc2.frequency.setValueAtTime(523.25, audioCtx.currentTime + 0.15); // C5

      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(audioCtx.currentTime + 0.4);
      osc2.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      console.warn('Audio feedback failed or not allowed yet:', e);
    }
  };

  // Convert reservations into messages
  useEffect(() => {
    const messages: Message[] = reservations.map((res) => ({
      id: `msg-${res.id}`,
      title: `Nouvelle réservation - ${res.clientName}`,
      content: `Réservation du Salon ${res.salonId} pour le ${res.date} à ${res.time}.`,
      reservation: res,
      isRead: false,
      createdAt: res.createdAt,
    }));
    
    // Sort by newest
    messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Trigger notification sound if a new message arrived compared to previous length
    if (localMessages.length > 0 && messages.length > localMessages.length) {
      playNotificationSound();
    }
    
    setLocalMessages(messages);

    // Default select first message if none selected
    if (messages.length > 0 && !selectedMessageId) {
      setSelectedMessageId(messages[0].id);
    }
  }, [reservations]);

  const filteredMessages = localMessages.filter((msg) => {
    if (filter === 'all') return true;
    return msg.reservation.status === filter;
  });

  const activeMessage = localMessages.find((m) => m.id === selectedMessageId);

  const getStatusBadge = (status: 'pending' | 'confirmed' | 'cancelled') => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
            Confirmé
          </span>
        );
      case 'cancelled':
        return (
          <span className="bg-red-500/10 text-red-400 border border-red-500/30 text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
            Annulé
          </span>
        );
      default:
        return (
          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider animate-pulse">
            En attente
          </span>
        );
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog) return;
    await onUpdateStatus(confirmDialog.id, confirmDialog.targetStatus);
    setConfirmDialog(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      {/* Box */}
      <div className="relative w-full max-w-6xl h-[85vh] bg-black border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Top Header */}
        <div className="p-4 md:p-6 border-b border-neutral-900 flex justify-between items-center bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600/10 border border-red-600/20 rounded-xl">
              <Inbox className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-wider uppercase italic flex items-center gap-2">
                Historique des réservations
                {isOwnerMode && (
                  <span className="text-[9px] bg-red-600/10 text-red-500 border border-red-600/20 px-2 py-0.5 rounded-full font-sans uppercase font-black">
                    Propriétaire Connecté
                  </span>
                )}
              </h3>
              <p className="text-xs text-neutral-400 uppercase tracking-widest mt-1">
                Suivez en temps réel l'état de vos demandes de réservation (En attente, Validée ou Annulée).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Audio Toggle */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                playNotificationSound();
              }}
              title={soundEnabled ? 'Désactiver le son de notification' : 'Activer le son de notification'}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                soundEnabled
                  ? 'bg-red-600/10 border-red-600/20 text-red-500'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-white'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Refresh from Sheet */}
            <button
              onClick={onRefreshFromSheet}
              disabled={isLoadingFromSheet}
              className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-[10px] font-black uppercase tracking-widest text-neutral-300 hover:text-white hover:border-neutral-700 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoadingFromSheet ? 'Sync...' : 'Actualiser'}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-[10px] font-black uppercase tracking-widest text-neutral-300 hover:text-white hover:border-neutral-700 transition-all cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>

        {/* Split Panel Body */}
        <div className="flex-grow flex overflow-hidden relative">
          
          {/* Left Panel: Message List (40% width) */}
          <div className={`w-full md:w-[380px] border-r border-neutral-900 bg-black flex flex-col overflow-hidden ${mobileView === 'details' ? 'hidden md:flex' : 'flex'}`}>
            
            {/* Status tabs */}
            <div className="p-3 border-b border-neutral-900 flex gap-1.5 bg-neutral-950">
              {(['all', 'pending', 'confirmed', 'cancelled'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                    filter === s
                      ? 'bg-red-600 text-white shadow-[0_2px_8px_rgba(220,38,38,0.3)]'
                      : 'text-neutral-500 hover:text-white'
                  }`}
                >
                  {s === 'all' ? 'Tous' : s === 'pending' ? 'Attente' : s === 'confirmed' ? 'Confirmé' : 'Annulé'}
                </button>
              ))}
            </div>

            {/* Scrollable list */}
            <div className="flex-grow overflow-y-auto divide-y divide-neutral-900 bg-black">
              {filteredMessages.length === 0 ? (
                <div className="p-8 text-center text-neutral-500 text-[10px] uppercase tracking-widest font-mono">
                  Aucun message trouvé.
                </div>
              ) : (
                filteredMessages.map((msg) => {
                  const isSelected = msg.id === selectedMessageId;
                  const dateObj = new Date(msg.createdAt);
                  const formattedTime = isNaN(dateObj.getTime())
                    ? ''
                    : dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div
                      key={msg.id}
                      className={`w-full p-4 text-left transition-all hover:bg-neutral-900/20 flex flex-col gap-1.5 relative ${
                        isSelected ? 'bg-neutral-900/40 border-l-2 border-red-600' : ''
                      }`}
                    >
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider bg-neutral-950 px-1.5 py-0.5 rounded border border-neutral-900">
                          RÉF : {msg.reservation.id}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono">{formattedTime}</span>
                      </div>

                      <h4 className={`text-sm font-black uppercase italic text-white tracking-wide ${isSelected ? 'text-red-500' : ''}`}>
                        {msg.reservation.clientName}
                      </h4>

                      <p className="text-xs text-neutral-400 font-medium">
                        Salon {msg.reservation.salonId} • {msg.reservation.date} à {msg.reservation.time}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 my-0.5">
                        <span className="text-[10px] uppercase font-bold text-neutral-500 font-mono">Statut :</span>
                        {getStatusBadge(msg.reservation.status)}
                      </div>

                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-neutral-950">
                        <span className="text-xs font-mono font-black text-red-500">
                          {msg.reservation.totalPrice} €
                        </span>
                        <button
                          onClick={() => {
                            setSelectedMessageId(msg.id);
                            setMobileView('details');
                          }}
                          className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                            isSelected 
                              ? 'bg-red-600 text-white shadow-[0_2px_8px_rgba(220,38,38,0.3)]' 
                              : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 hover:border-neutral-700'
                          }`}
                        >
                          Consulter les détails ➔
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel: Message Details View (60% width) */}
          <div className={`w-full md:flex flex-grow bg-black flex-col overflow-hidden ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}>
            {activeMessage ? (
              <div className="flex-grow flex flex-col overflow-hidden">
                {/* Header detail */}
                <div className="p-4 sm:p-6 border-b border-neutral-900 bg-neutral-950 flex justify-between items-start gap-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => setMobileView('list')}
                      className="md:hidden p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-all"
                      title="Retour à la liste"
                    >
                      <Inbox className="w-4 h-4" />
                    </button>
                    <div>
                      <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block">
                        RÉSERVATION RÉF : {activeMessage.reservation.id}
                      </span>
                      <h2 className="text-lg sm:text-xl font-black uppercase italic text-white mt-1 tracking-wide">
                        {activeMessage.reservation.clientName}
                      </h2>
                      <p className="text-[10px] uppercase tracking-wider text-neutral-400 mt-1 flex items-center gap-1">
                        Enregistré le : {new Date(activeMessage.reservation.createdAt).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className="text-[9px] uppercase tracking-widest text-neutral-500">Statut actuel</span>
                    {getStatusBadge(activeMessage.reservation.status)}
                  </div>
                </div>

                {/* Detail contents */}
                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                  
                  {/* Grid details */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Salon details */}
                    <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-neutral-900 text-red-500 border border-neutral-800">
                        <Coffee className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[9px] text-neutral-500 uppercase tracking-widest block">Salon réservé</span>
                        <span className="text-sm font-bold text-white">{activeMessage.reservation.salonName}</span>
                      </div>
                    </div>

                    {/* Guest count */}
                    <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-neutral-900 text-red-500 border border-neutral-800">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[9px] text-neutral-500 uppercase tracking-widest block">Personnes</span>
                        <span className="text-sm font-bold text-white">{activeMessage.reservation.guestsCount} invités</span>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-neutral-900 text-red-500 border border-neutral-800">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[9px] text-neutral-500 uppercase tracking-widest block">Date d'arrivée</span>
                        <span className="text-sm font-bold text-white">{activeMessage.reservation.date}</span>
                      </div>
                    </div>

                    {/* Time */}
                    <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-neutral-900 text-red-500 border border-neutral-800">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[9px] text-neutral-500 uppercase tracking-widest block">Heure d'arrivée</span>
                        <span className="text-sm font-bold text-white">{activeMessage.reservation.time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info Card */}
                  <div className="p-5 rounded-2xl bg-neutral-900/30 border border-neutral-800/80 space-y-3">
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest border-b border-neutral-800 pb-2">
                      Fiche de contact client
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-neutral-500" />
                        <span className="text-neutral-400">Nom & Prénom :</span>
                        <span className="font-semibold text-white">{activeMessage.reservation.clientName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-neutral-500" />
                        <span className="text-neutral-400">Téléphone :</span>
                        <span className="font-mono text-red-500 select-all font-semibold">{activeMessage.reservation.clientPhone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Drink Order Receipt */}
                  <div className="p-5 rounded-2xl bg-neutral-900/30 border border-neutral-800/80 space-y-4">
                    <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                      <h4 className="text-[10px] font-black text-white uppercase tracking-widest">
                        Boissons Commandées
                      </h4>
                      <span className="text-[9px] font-black uppercase tracking-widest text-red-500">Détail Consommation</span>
                    </div>

                    <div className="space-y-2.5 max-h-48 overflow-y-auto">
                      {activeMessage.reservation.drinks.length === 0 ? (
                        <p className="text-xs text-neutral-500 italic uppercase tracking-wider">Aucune boisson présélectionnée.</p>
                      ) : (
                        activeMessage.reservation.drinks.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <div className="flex gap-2">
                              <span className="font-bold text-red-500 font-mono">{item.quantity}x</span>
                              <span className="text-neutral-300">{item.drink.name}</span>
                            </div>
                            <span className="text-neutral-400 font-mono">
                              {item.drink.price * item.quantity} €
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="pt-3 border-t border-neutral-800 flex justify-between items-center">
                      <span className="text-xs text-neutral-500 font-black uppercase tracking-widest">Montant Total :</span>
                      <span className="text-lg font-mono font-black text-red-500 bg-red-600/10 px-3 py-1 border border-red-500/20 rounded-xl">
                        {activeMessage.reservation.totalPrice} €
                      </span>
                    </div>
                  </div>

                  {/* Comment */}
                  {activeMessage.reservation.comment && (
                    <div className="p-4 rounded-2xl bg-red-600/5 border border-red-600/10 space-y-2">
                      <span className="text-[9px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" /> Commentaire Client :
                      </span>
                      <p className="text-xs text-neutral-300 italic leading-relaxed pl-4 border-l border-red-500/30">
                        "{activeMessage.reservation.comment}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom action panel */}
                <div className="p-4 border-t border-neutral-900 bg-neutral-950 flex justify-end gap-3">
                  {activeMessage.reservation.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          setConfirmDialog({
                            id: activeMessage.reservation.id,
                            targetStatus: 'cancelled',
                            label: 'Voulez-vous annuler cette réservation ? Cette action sera synchronisée.'
                          });
                        }}
                        className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 cursor-pointer"
                      >
                        <X className="w-4 h-4" /> Annuler la demande
                      </button>

                      <button
                        onClick={() => {
                          setConfirmDialog({
                            id: activeMessage.reservation.id,
                            targetStatus: 'confirmed',
                            label: 'Voulez-vous confirmer cette réservation ? Le client et l\'équipe seront notifiés.'
                          });
                        }}
                        className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-[0_4px_15px_rgba(220,38,38,0.3)] transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4" /> Accepter & Confirmer
                      </button>
                    </>
                  )}

                  {activeMessage.reservation.status === 'confirmed' && (
                    <button
                      onClick={() => {
                        setConfirmDialog({
                          id: activeMessage.reservation.id,
                          targetStatus: 'pending',
                          label: 'Remettre cette réservation en attente ?'
                        });
                      }}
                      className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 transition-all text-[10px] font-black uppercase tracking-widest cursor-pointer"
                    >
                      Remettre en attente
                    </button>
                  )}

                  {activeMessage.reservation.status === 'cancelled' && (
                    <button
                      onClick={() => {
                        setConfirmDialog({
                          id: activeMessage.reservation.id,
                          targetStatus: 'pending',
                          label: 'Réhabiliter cette demande de réservation ?'
                        });
                      }}
                      className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 transition-all text-[10px] font-black uppercase tracking-widest cursor-pointer"
                    >
                      Réhabiliter la demande
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center p-8 text-neutral-500">
                <Mail className="w-12 h-12 mb-4 text-neutral-700 animate-pulse" />
                <p className="text-xs uppercase tracking-widest font-mono mb-4 text-center">Sélectionnez une réservation à gauche.</p>
                <button
                  onClick={() => setMobileView('list')}
                  className="md:hidden px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-[10px] font-black uppercase tracking-widest text-neutral-300 transition-all hover:bg-neutral-800"
                >
                  Retourner à la liste
                </button>
              </div>
            )}
          </div>
        </div>

        {/* CUSTOM STATE DIALOG OVERLAY (Replaces window.confirm) */}
        {confirmDialog && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-[110] animate-fade-in">
            <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl max-w-sm text-center space-y-6 shadow-2xl">
              <ShieldAlert className="w-12 h-12 text-red-500 mx-auto animate-bounce" />
              <div className="space-y-2">
                <h4 className="text-lg font-black text-white uppercase italic">Confirmation</h4>
                <p className="text-xs text-neutral-400 leading-relaxed uppercase tracking-wider">{confirmDialog.label}</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setConfirmDialog(null)}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirmAction}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-[0_4px_12px_rgba(220,38,38,0.3)] transition-all text-[10px] font-black uppercase tracking-widest cursor-pointer"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

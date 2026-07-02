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
    let listToConvert = reservations;
    if (!isOwnerMode) {
      try {
        const savedIds = JSON.parse(localStorage.getItem('ring_bar_user_booking_ids') || '[]');
        listToConvert = reservations.filter((res) => savedIds.includes(res.id));
      } catch (e) {
        console.error('Failed to load user booking ids:', e);
      }
    }

    const messages: Message[] = listToConvert.map((res) => ({
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
  }, [reservations, isOwnerMode]);

  const filteredMessages = localMessages.filter((msg) => {
    if (filter === 'all') return true;
    return msg.reservation.status === filter;
  });

  const getStatusBadge = (status: 'pending' | 'confirmed' | 'cancelled') => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
            Validée
          </span>
        );
      case 'cancelled':
        return (
          <span className="bg-red-500/10 text-red-400 border border-red-500/30 text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
            Annulée
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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
      {/* Box */}
      <div className="relative w-full max-w-6xl h-[85vh] bg-white border border-neutral-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-fade-in">
        
        {/* Top Header */}
        <div className="p-4 md:p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600/10 border border-red-600/20 rounded-xl">
              <Inbox className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-base font-black text-neutral-900 tracking-wider uppercase italic flex items-center gap-2">
                Historique des réservations
                {isOwnerMode && (
                  <span className="text-[9px] bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full font-sans uppercase font-black">
                    Propriétaire Connecté
                  </span>
                )}
              </h3>
              <p className="text-xs text-neutral-600 uppercase tracking-widest mt-1 font-medium">
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
                  ? 'bg-red-50 border-red-100 text-red-600'
                  : 'bg-neutral-100 border-neutral-200 text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Fermer */}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white border border-red-600 hover:border-red-500 text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_4px_15px_rgba(220,38,38,0.3)] hover:shadow-[0_4px_20px_rgba(220,38,38,0.5)] cursor-pointer flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" /> Fermer
            </button>
          </div>
        </div>

        {/* Unified Body */}
        <div className="flex-grow flex flex-col overflow-hidden bg-white relative">
          
          {/* Status filter tabs */}
          <div className="p-4 border-b border-neutral-100 flex gap-2 bg-neutral-50 items-center justify-between">
            <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {(['all', 'pending', 'confirmed', 'cancelled'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap ${
                    filter === s
                      ? 'bg-red-600 text-white shadow-[0_2px_8px_rgba(220,38,38,0.3)]'
                      : 'text-neutral-600 hover:text-neutral-900 bg-neutral-100 border border-neutral-200'
                  }`}
                >
                  {s === 'all' ? 'Tous' : s === 'pending' ? 'En attente' : s === 'confirmed' ? 'Validée' : 'Annulée'}
                </button>
              ))}
            </div>
            
            <div className="text-[10px] text-neutral-600 uppercase tracking-wider font-mono hidden sm:block">
              {filteredMessages.length} réservation{filteredMessages.length > 1 ? 's' : ''}
            </div>
          </div>

          {/* Scrollable grid of complete reservation cards */}
          <div className="flex-grow overflow-y-auto p-4 md:p-6 bg-white">
            {filteredMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-neutral-500 text-center">
                <Inbox className="w-12 h-12 mb-4 text-neutral-300 animate-pulse" />
                <p className="text-xs uppercase tracking-widest font-mono">Aucune réservation trouvée.</p>
              </div>
            ) : (
              <div className={`grid grid-cols-1 ${isOwnerMode ? 'md:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'} gap-4 max-w-5xl mx-auto`}>
                {filteredMessages.map((msg) => {
                  const dateObj = new Date(msg.createdAt);

                  if (!isOwnerMode) {
                    // Highly compact card for client view (no private details or admin actions)
                    return (
                      <div
                        key={msg.id}
                        className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col justify-between gap-3 shadow-md hover:border-neutral-300 hover:bg-white transition-all duration-300"
                      >
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                            RÉF : {msg.reservation.id}
                          </span>
                          {getStatusBadge(msg.reservation.status)}
                        </div>

                        <div className="flex items-center gap-2 text-neutral-900">
                          <Coffee className="w-4 h-4 text-red-600 shrink-0" />
                          <span className="text-sm font-bold uppercase italic tracking-wide">
                            {msg.reservation.salonName || `Salon ${msg.reservation.salonId}`}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs border-t border-neutral-200/60 pt-2 text-neutral-600">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Calendar className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                            <span className="truncate">{msg.reservation.date} à {msg.reservation.time}</span>
                          </div>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Users className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                            <span className="truncate">{msg.reservation.guestsCount} pers.</span>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Full detailed card for administrator / owner mode
                  return (
                    <div
                      key={msg.id}
                      className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 hover:border-neutral-300 hover:bg-white transition-all duration-300 flex flex-col justify-between gap-4 relative shadow-md"
                    >
                      {/* Card Content */}
                      <div className="space-y-3">
                        {/* Ref and recorded date */}
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[9px] font-mono text-neutral-600 uppercase tracking-wider bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                            RÉF : {msg.reservation.id}
                          </span>
                          <span className="text-[9px] text-neutral-500 font-mono">
                            Enregistré le : {isNaN(dateObj.getTime()) ? msg.reservation.date : dateObj.toLocaleString('fr-FR')}
                          </span>
                        </div>

                        {/* Client Name */}
                        <div>
                          <h4 className="text-base font-black uppercase italic text-neutral-900 tracking-wide">
                            {msg.reservation.clientName}
                          </h4>
                        </div>

                        {/* Booking specifics */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs border-t border-neutral-200 pt-3">
                          <div className="flex items-center gap-2 text-neutral-600">
                            <Phone className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                            <span className="truncate">Tél : <strong className="text-neutral-900 font-mono select-all">{msg.reservation.clientPhone}</strong></span>
                          </div>
                          <div className="flex items-center gap-2 text-neutral-600">
                            <Coffee className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                            <span className="truncate">Salon : <strong className="text-neutral-900">{msg.reservation.salonName || `Salon ${msg.reservation.salonId}`}</strong></span>
                          </div>
                          <div className="flex items-center gap-2 text-neutral-600">
                            <Calendar className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                            <span className="truncate">Le : <strong className="text-neutral-900">{msg.reservation.date} à {msg.reservation.time}</strong></span>
                          </div>
                          <div className="flex items-center gap-2 text-neutral-600">
                            <Users className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                            <span>Invités : <strong className="text-neutral-900">{msg.reservation.guestsCount} pers.</strong></span>
                          </div>
                        </div>

                        {/* Selected drinks */}
                        {msg.reservation.drinks && msg.reservation.drinks.length > 0 && (
                          <div className="p-3 rounded-xl bg-white border border-neutral-200 shadow-sm">
                            <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest block mb-2">Boissons commandées :</span>
                            <div className="space-y-1.5">
                              {msg.reservation.drinks.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-[11px]">
                                  <span className="text-neutral-700 font-medium">
                                    <strong className="text-red-600 font-mono mr-1.5">{item.quantity}x</strong> 
                                    {item.drink.name}
                                  </span>
                                  <span className="text-neutral-600 font-mono">
                                    {(item.drink.price * item.quantity).toLocaleString('fr-FR')} F CFA
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Comment */}
                        {msg.reservation.comment && (
                          <div className="p-3 rounded-xl bg-red-50 border border-red-100">
                            <span className="text-[9px] font-black text-red-600 uppercase tracking-widest block mb-1 flex items-center gap-1.5">
                              <MessageSquare className="w-3 h-3" /> Commentaire :
                            </span>
                            <p className="text-[11px] text-neutral-700 italic leading-relaxed">
                              "{msg.reservation.comment}"
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Footer: Price, Status, and Actions */}
                      <div className="border-t border-neutral-200 pt-3 mt-1 space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold text-neutral-500 font-mono">Statut :</span>
                            {getStatusBadge(msg.reservation.status)}
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-mono font-black text-red-600 bg-red-50 px-3 py-1 border border-red-100 rounded-xl">
                              {msg.reservation.totalPrice.toLocaleString('fr-FR')} F CFA
                            </span>
                          </div>
                        </div>

                        {/* Owner Admin Actions */}
                        {isOwnerMode && (
                          <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200">
                            {msg.reservation.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => {
                                    setConfirmDialog({
                                      id: msg.reservation.id,
                                      targetStatus: 'cancelled',
                                      label: 'Voulez-vous annuler cette réservation ? Cette action sera synchronisée.'
                                    });
                                  }}
                                  className="flex-1 py-2 rounded-xl bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 transition-all text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" /> Annuler
                                </button>
                                <button
                                  onClick={() => {
                                    setConfirmDialog({
                                      id: msg.reservation.id,
                                      targetStatus: 'confirmed',
                                      label: 'Voulez-vous confirmer cette réservation ? Le client et l\'équipe seront notifiés.'
                                    });
                                  }}
                                  className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-[0_2px_10px_rgba(220,38,38,0.3)] transition-all text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" /> Confirmer
                                </button>
                              </>
                            )}

                            {msg.reservation.status === 'confirmed' && (
                              <button
                                onClick={() => {
                                  setConfirmDialog({
                                    id: msg.reservation.id,
                                    targetStatus: 'pending',
                                    label: 'Remettre cette réservation en attente ?'
                                  });
                                }}
                                className="w-full py-2 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200 hover:border-neutral-300 transition-all text-[9px] font-black uppercase tracking-widest cursor-pointer"
                              >
                                Remettre en attente
                              </button>
                            )}

                            {msg.reservation.status === 'cancelled' && (
                              <button
                                onClick={() => {
                                  setConfirmDialog({
                                    id: msg.reservation.id,
                                    targetStatus: 'pending',
                                    label: 'Réhabiliter cette demande de réservation ?'
                                  });
                                }}
                                className="w-full py-2 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200 hover:border-neutral-300 transition-all text-[9px] font-black uppercase tracking-widest cursor-pointer"
                              >
                                Réhabiliter la demande
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* CUSTOM STATE DIALOG OVERLAY (Replaces window.confirm) */}
        {confirmDialog && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-[110] animate-fade-in">
            <div className="bg-white border border-neutral-200 p-8 rounded-3xl max-w-sm text-center space-y-6 shadow-2xl">
              <ShieldAlert className="w-12 h-12 text-red-600 mx-auto animate-bounce" />
              <div className="space-y-2">
                <h4 className="text-lg font-black text-neutral-900 uppercase italic">Confirmation</h4>
                <p className="text-xs text-neutral-600 leading-relaxed uppercase tracking-wider font-semibold">{confirmDialog.label}</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setConfirmDialog(null)}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-200 bg-neutral-100 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200 hover:border-neutral-300 transition-all text-[10px] font-black uppercase tracking-widest cursor-pointer"
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

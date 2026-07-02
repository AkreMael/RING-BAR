import React, { useState, useEffect } from 'react';
import { Reservation, Salon, Drink, SelectedDrink } from '../types';
import { SALONS, DRINKS } from '../data';
import InteractiveMap from './InteractiveMap';
import { Calendar, Clock, Users, ArrowRight, ArrowLeft, Check, AlertTriangle, Sparkles, Pencil, ShoppingBag, ShoppingCart } from 'lucide-react';

interface BookingFlowProps {
  onClose: () => void;
  onConfirmReservation: (reservation: Omit<Reservation, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  existingReservations: Reservation[];
  isSubmitting: boolean;
  prefilledName?: string;
}

export default function BookingFlow({
  onClose,
  onConfirmReservation,
  existingReservations,
  isSubmitting,
  prefilledName = '',
}: BookingFlowProps) {
  const [step, setStep] = useState<number>(1);

  // Form states
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedTime, setSelectedTime] = useState<string>('21:00');
  const [guestsCount, setGuestsCount] = useState<number>(4);
  const [selectedSalonId, setSelectedSalonId] = useState<number | null>(null);
  
  // Selected drinks list
  const [selectedDrinks, setSelectedDrinks] = useState<SelectedDrink[]>([]);
  
  // Customer info states
  const [clientName, setClientName] = useState<string>(prefilledName);
  const [clientPhone, setClientPhone] = useState<string>('');
  const [comment, setComment] = useState<string>('');

  // Update client name when prefilled name changes (e.g. after Google Login)
  useEffect(() => {
    if (prefilledName && !clientName) {
      setClientName(prefilledName);
    }
  }, [prefilledName]);

  // Selected Salon object
  const selectedSalon = SALONS.find((s) => s.id === selectedSalonId) || null;

  // Real-time calculations
  const drinksTotal = selectedDrinks.reduce((acc, curr) => acc + (curr.drink.price * curr.quantity), 0);
  
  // Minimum spend verification
  const isMinSpendSatisfied = selectedSalon ? drinksTotal >= selectedSalon.priceMin : true;
  const differenceToMinSpend = selectedSalon ? Math.max(0, selectedSalon.priceMin - drinksTotal) : 0;
  
  // Total price is at least the drinks total
  const finalTotalPrice = drinksTotal;

  // Handle quantity modification
  const handleUpdateDrinkQuantity = (drink: Drink, qty: number) => {
    if (qty <= 0) {
      setSelectedDrinks(prev => prev.filter(item => item.drink.id !== drink.id));
      return;
    }
    setSelectedDrinks(prev => {
      const existing = prev.find(item => item.drink.id === drink.id);
      if (existing) {
        return prev.map(item => item.drink.id === drink.id ? { ...item, quantity: qty } : item);
      } else {
        return [...prev, { drink, quantity: qty }];
      }
    });
  };

  const currentDrinkQty = (drinkId: string) => {
    const found = selectedDrinks.find((item) => item.drink.id === drinkId);
    return found ? found.quantity : 0;
  };

  // Step 1 validation: General details
  const isStep1Valid = selectedDate !== '' && selectedTime !== '' && guestsCount > 0;

  // Step 2 validation: Salon selection
  const isStep2Valid = selectedSalonId !== null;

  // Step 4 validation: Client Info
  const isStep4Valid = clientName.trim() !== '' && clientPhone.trim() !== '';

  const handleNextStep = () => {
    if (step === 1 && isStep1Valid) setStep(2);
    else if (step === 2 && isStep2Valid) setStep(3);
    else if (step === 3) setStep(4);
    else if (step === 4 && isStep4Valid) setStep(5);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!selectedSalonId || !selectedSalon) return;
    
    await onConfirmReservation({
      salonId: selectedSalonId,
      salonName: selectedSalon.name,
      drinks: selectedDrinks,
      totalPrice: finalTotalPrice,
      clientName,
      clientPhone,
      date: selectedDate,
      time: selectedTime,
      guestsCount,
      comment,
    });
    setStep(6); // Go to success confirmation screen
  };

  // Render Steps Indicators
  const renderStepsHeader = () => {
    if (step === 6) return null; // Success step doesn't need the tracker
    const stepTitles = ['Date/Heure', 'Salon', 'Boissons', 'Infos', 'Validation'];
    return (
      <div id="booking-stepper-tracker" className="p-3 sm:p-4 border-b border-neutral-100 bg-neutral-50 flex justify-start md:justify-between items-center overflow-x-auto gap-3 sm:gap-4 scrollbar-none">
        {stepTitles.map((title, index) => {
          const stepNum = index + 1;
          const isActive = step === stepNum;
          const isCompleted = step > stepNum;

          return (
            <div key={title} className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <span
                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-black transition-all ${
                  isCompleted
                    ? 'bg-neutral-100 text-red-600 border border-neutral-200'
                    : isActive
                    ? 'bg-red-600 text-white shadow-[0_2px_10px_rgba(220,38,38,0.4)]'
                    : 'bg-neutral-200 text-neutral-550'
                }`}
              >
                {isCompleted ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : stepNum}
              </span>
              <span className={`text-[10px] sm:text-xs uppercase tracking-wider font-bold ${isActive ? 'text-red-500' : isCompleted ? 'text-neutral-600' : 'text-neutral-400'}`}>
                {title}
              </span>
              {index < stepTitles.length - 1 && (
                <div className="hidden md:block w-8 h-[1px] bg-neutral-200" />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
      {/* Central Booking Card */}
      <div className="relative w-full max-w-5xl bg-white border border-neutral-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Title Header */}
        <div className="p-5 border-b border-neutral-100 bg-neutral-50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-red-600" />
            <h3 className="text-base font-black text-neutral-900 tracking-wider uppercase italic font-sans">
              Réservation de Salon VIP <span className="text-red-600">—</span> Le Ring Bar
            </h3>
          </div>
          {step !== 6 && (
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-neutral-100 border border-neutral-200 text-xs font-bold uppercase tracking-widest text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200 hover:border-neutral-300 transition-colors cursor-pointer"
            >
              Annuler
            </button>
          )}
        </div>

        {/* Dynamic Stepper Header */}
        {renderStepsHeader()}

        {/* Main Body Scrollable Area */}
        <div className="flex-grow p-6 overflow-y-auto bg-white">
          
          {/* STEP 1: Date, Time & Guest count */}
          {step === 1 && (
            <div id="step-datetime-container" className="max-w-xl mx-auto space-y-6 py-4">
              <div className="text-center space-y-2">
                <h4 className="text-xl font-bold text-neutral-900 tracking-wide uppercase italic">Quand souhaitez-vous venir ?</h4>
                <p className="text-xs text-neutral-600 uppercase tracking-widest">
                  Veuillez spécifier la date, l'heure et le nombre de convives pour votre salon.
                </p>
              </div>

              <div className="space-y-4 bg-neutral-50 border border-neutral-200 p-6 rounded-2xl">
                {/* Date Picker */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-600 uppercase tracking-widest block">Date de Réservation</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="date"
                      value={selectedDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setSelectedSalonId(null); // Reset salon selection as availability changes
                      }}
                      className="w-full bg-white border border-neutral-200 rounded-xl pl-10 pr-4 py-3 text-sm text-neutral-900 focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                {/* Time Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-600 uppercase tracking-widest block">Heure d'arrivée</label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <select
                      value={selectedTime}
                      onChange={(e) => {
                        setSelectedTime(e.target.value);
                        setSelectedSalonId(null); // Reset salon
                      }}
                      className="w-full bg-white border border-neutral-200 rounded-xl pl-10 pr-4 py-3 text-sm text-neutral-900 focus:outline-none focus:border-red-600 appearance-none"
                    >
                      <option value="21:00">21:00</option>
                      <option value="21:30">21:30</option>
                      <option value="22:00">22:00 (Recommandé)</option>
                      <option value="22:30">22:30</option>
                      <option value="23:00">23:00</option>
                      <option value="23:30">23:30</option>
                      <option value="00:00">00:00 (Minuit)</option>
                      <option value="00:30">00:30</option>
                      <option value="01:00">01:00</option>
                    </select>
                  </div>
                </div>

                {/* Guest counter */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-600 uppercase tracking-widest block">Nombre d'invités</label>
                  <div className="relative">
                    <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <select
                      value={guestsCount}
                      onChange={(e) => setGuestsCount(parseInt(e.target.value, 10))}
                      className="w-full bg-white border border-neutral-200 rounded-xl pl-10 pr-4 py-3 text-sm text-neutral-900 focus:outline-none focus:border-red-600 appearance-none"
                    >
                      <option value="2">2 Personnes</option>
                      <option value="4">4 Personnes</option>
                      <option value="6">6 Personnes</option>
                      <option value="8">8 Personnes</option>
                      <option value="10">10 Personnes (Salon VIP conseillé)</option>
                      <option value="12">12 Personnes (Grande Table)</option>
                      <option value="15">15 Personnes (Groupe VIP)</option>
                    </select>
                  </div>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider mt-2 block font-medium">
                    Pour les groupes de plus de 15 personnes, veuillez nous contacter directement ou réserver plusieurs salons.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Salon selection */}
          {step === 2 && (
            <div id="step-salon-container" className="space-y-4 py-2">
              <div className="text-center space-y-2 max-w-md mx-auto mb-6">
                <h4 className="text-xl font-bold text-neutral-900 tracking-wide uppercase italic">Choisissez votre Salon</h4>
                <p className="text-xs text-neutral-600 uppercase tracking-widest">
                  Consultez la carte ci-dessous et sélectionnez l'emplacement désiré pour votre soirée.
                </p>
              </div>

              <InteractiveMap
                selectedSalonId={selectedSalonId}
                onSelectSalon={(id) => setSelectedSalonId(id)}
                existingReservations={existingReservations}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
              />
            </div>
          )}

          {/* STEP 3: Drink selection */}
          {step === 3 && selectedSalon && (
            <div id="step-drinks-container" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start py-2">
              {/* Product selector list (8 cols) */}
              <div className="lg:col-span-8 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 pb-4 border-b border-neutral-100">
                  <div>
                    <h4 className="text-lg font-bold text-neutral-900 tracking-wide uppercase italic">Choix des boissons</h4>
                    <p className="text-xs text-neutral-600 uppercase tracking-widest mt-1">
                      Sélectionnez à l'avance les bouteilles et softs pour votre table.
                    </p>
                  </div>

                  <span className="text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-xl bg-red-50 text-red-600 border border-red-100 font-bold">
                    Salon choisi : <strong className="text-neutral-900">{selectedSalon.name}</strong>
                  </span>
                </div>

                {/* Beverage Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-none md:max-h-[450px] overflow-y-visible md:overflow-y-auto pr-1">
                  {DRINKS.map((drink) => {
                    const qty = currentDrinkQty(drink.id);
                    return (
                      <div
                        key={drink.id}
                        className="p-3 bg-neutral-50 border border-neutral-200 rounded-2xl flex gap-3 hover:border-neutral-300 hover:bg-white transition-all duration-300"
                      >
                        <img
                          src={drink.image}
                          alt={drink.name}
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 rounded-xl object-cover bg-white border border-neutral-200 flex-shrink-0"
                        />
                        <div className="flex flex-col justify-between flex-grow">
                          <div>
                            <div className="flex justify-between items-start gap-1">
                              <h5 className="text-sm font-bold text-neutral-900 tracking-wide uppercase italic line-clamp-1">{drink.name}</h5>
                              <span className="text-sm font-mono font-bold text-red-600 flex-shrink-0">{drink.price}€</span>
                            </div>
                            <p className="text-[11px] text-neutral-600 line-clamp-1 leading-relaxed">{drink.description}</p>
                          </div>

                          {/* Qty selector */}
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-[9px] text-neutral-500 font-mono uppercase tracking-wider">{drink.category}</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleUpdateDrinkQuantity(drink, qty - 1)}
                                className="w-6 h-6 rounded bg-neutral-200 text-neutral-600 hover:bg-neutral-300 hover:text-neutral-900 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                              >
                                -
                              </button>
                              <span className="w-6 text-center text-xs font-mono font-bold text-neutral-900">{qty}</span>
                              <button
                                onClick={() => handleUpdateDrinkQuantity(drink, qty + 1)}
                                className="w-6 h-6 rounded bg-red-600 text-white hover:bg-red-500 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Booking receipt & constraints card (4 cols) */}
              <div className="lg:col-span-4 bg-neutral-50 border border-neutral-200 rounded-3xl p-5 space-y-5 shadow-lg">
                <h4 className="text-neutral-900 font-bold text-xs uppercase tracking-widest pb-3 border-b border-neutral-200 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-red-600" /> Récapitulatif Table
                </h4>

                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {selectedDrinks.length === 0 ? (
                    <div className="text-center py-6 text-xs text-neutral-500 italic uppercase tracking-wider">
                      Aucune boisson sélectionnée.
                    </div>
                  ) : (
                    selectedDrinks.map((item) => (
                      <div key={item.drink.id} className="flex justify-between items-center text-xs">
                        <div className="flex gap-1.5 items-center">
                          <span className="text-red-600 font-bold font-mono">{item.quantity}x</span>
                          <span className="text-neutral-700 line-clamp-1">{item.drink.name}</span>
                        </div>
                        <span className="text-neutral-900 font-mono font-semibold">{item.drink.price * item.quantity} €</span>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-3 border-t border-neutral-200 space-y-2">
                  {/* Minimum spend details */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-500 font-medium">Consommation min. requise :</span>
                    <span className="font-semibold text-neutral-900 font-mono">{selectedSalon.priceMin} €</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-500 font-medium">Total boissons actuel :</span>
                    <span className="font-semibold text-neutral-900 font-mono">{drinksTotal} €</span>
                  </div>

                  {/* Warning if minimum spend is not satisfied */}
                  {!isMinSpendSatisfied && (
                    <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-100 text-[10px] text-red-600 leading-relaxed flex gap-2 font-medium">
                      <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                      <div>
                        Note : Il vous reste <strong className="text-neutral-900 font-bold">{differenceToMinSpend} €</strong> de boissons à commander pour atteindre le minimum requis. La différence sera facturée sur place.
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-neutral-200 flex justify-between items-center">
                    <span className="text-xs font-bold text-neutral-700">Sous-total Réservation :</span>
                    <span className="text-lg font-black font-mono text-red-600">{finalTotalPrice} €</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Client information */}
          {step === 4 && (
            <div id="step-client-container" className="max-w-xl mx-auto space-y-6 py-4">
              <div className="text-center space-y-2">
                <h4 className="text-xl font-bold text-neutral-900 tracking-wide uppercase italic">Fiche de contact</h4>
                <p className="text-xs text-neutral-600 uppercase tracking-widest">
                  Renseignez vos coordonnées afin de valider et lier votre réservation.
                </p>
              </div>

              <div className="space-y-4 bg-neutral-50 border border-neutral-200 p-6 rounded-2xl">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-600 uppercase tracking-widest block">Nom et Prénom</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ex: Jean Dupont"
                    className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:border-red-600 font-medium"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-600 uppercase tracking-widest block">Numéro de Téléphone</label>
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="Ex: +33 6 12 34 56 78"
                    className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:border-red-600 font-medium"
                  />
                </div>

                {/* Comment (Optional) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-600 uppercase tracking-widest block">Demande Spéciale (facultatif)</label>
                  <textarea
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Ex: Anniversaire, préférences d'emplacement de table, etc."
                    className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:border-red-600 resize-none font-sans font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Summary, editing and final validation */}
          {step === 5 && selectedSalon && (
            <div id="step-review-container" className="max-w-2xl mx-auto space-y-6 py-2">
              <div className="text-center space-y-2 mb-4">
                <h4 className="text-xl font-bold text-neutral-900 tracking-wide uppercase italic">Vérifiez vos informations</h4>
                <p className="text-xs text-neutral-600 uppercase tracking-widest">
                  Relisez votre récapitulatif de réservation avant de confirmer.
                </p>
              </div>

              {/* Receipt Body */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-3xl divide-y divide-neutral-200 overflow-hidden shadow-xl">
                
                {/* Section 1: Date & Time */}
                <div className="p-4 md:p-5 flex justify-between items-center gap-4">
                  <div className="flex gap-3 items-center">
                    <Calendar className="w-5 h-5 text-red-600" />
                    <div>
                      <span className="text-[10px] text-neutral-500 uppercase tracking-widest block">Date & Heure</span>
                      <p className="text-sm font-bold text-neutral-900">
                        Le {selectedDate} à {selectedTime} • {guestsCount} personnes
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="p-1.5 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200 hover:border-neutral-300 transition-all flex items-center gap-1 text-[10px] font-black uppercase tracking-widest cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Modifier
                  </button>
                </div>

                {/* Section 2: Salon */}
                <div className="p-4 md:p-5 flex justify-between items-center gap-4">
                  <div className="flex gap-3 items-center">
                    <Check className="w-5 h-5 text-red-600" />
                    <div>
                      <span className="text-[10px] text-neutral-500 uppercase tracking-widest block">Salon</span>
                      <p className="text-sm font-bold text-neutral-900 uppercase italic">
                        {selectedSalon.name} • {selectedSalon.location}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    className="p-1.5 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200 hover:border-neutral-300 transition-all flex items-center gap-1 text-[10px] font-black uppercase tracking-widest cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Modifier
                  </button>
                </div>

                {/* Section 3: Drinks */}
                <div className="p-4 md:p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-3 items-center">
                      <ShoppingBag className="w-5 h-5 text-red-600" />
                      <div>
                        <span className="text-[10px] text-neutral-500 uppercase tracking-widest block">Boissons commandées</span>
                        <p className="text-xs text-neutral-600 font-medium">
                          {selectedDrinks.length} article(s) sélectionné(s)
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setStep(3)}
                      className="p-1.5 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200 hover:border-neutral-300 transition-all flex items-center gap-1 text-[10px] font-black uppercase tracking-widest cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Modifier
                    </button>
                  </div>

                  {selectedDrinks.length > 0 && (
                    <div className="pl-8 pt-1 space-y-1.5 max-h-36 overflow-y-auto">
                      {selectedDrinks.map((item) => (
                        <div key={item.drink.id} className="flex justify-between items-center text-xs">
                          <span className="text-neutral-700 font-medium">
                            <strong className="text-red-600 font-mono">{item.quantity}x</strong> {item.drink.name}
                          </span>
                          <span className="text-neutral-600 font-mono">{item.drink.price * item.quantity} €</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section 4: Customer Details */}
                <div className="p-4 md:p-5 flex justify-between items-center gap-4">
                  <div className="flex gap-3 items-center">
                    <Users className="w-5 h-5 text-red-600" />
                    <div>
                      <span className="text-[10px] text-neutral-500 uppercase tracking-widest block">Client</span>
                      <p className="text-sm font-bold text-neutral-900">
                        {clientName} • <span className="font-mono text-red-600">{clientPhone}</span>
                      </p>
                      {comment && <p className="text-xs text-neutral-500 italic mt-1 font-sans line-clamp-1">"{comment}"</p>}
                    </div>
                  </div>
                  <button
                    onClick={() => setStep(4)}
                    className="p-1.5 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200 hover:border-neutral-300 transition-all flex items-center gap-1 text-[10px] font-black uppercase tracking-widest cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Modifier
                  </button>
                </div>

                {/* Section 5: Receipts totals */}
                <div className="p-5 bg-neutral-100 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-500 font-medium">Consommation minimum salon :</span>
                    <span className="font-semibold text-neutral-900 font-mono">{selectedSalon.priceMin} €</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-500 font-medium">Total consommations :</span>
                    <span className="font-semibold text-neutral-900 font-mono">{drinksTotal} €</span>
                  </div>
                  
                  {!isMinSpendSatisfied && (
                    <div className="p-2.5 rounded-lg bg-red-50 border border-red-100 text-[10px] text-red-600 font-semibold">
                      Rappel : Le minimum de {selectedSalon.priceMin} € n'est pas atteint. La différence de {differenceToMinSpend} € sera régularisée sur place.
                    </div>
                  )}

                  <div className="pt-3 border-t border-neutral-200 flex justify-between items-center">
                    <span className="text-xs font-bold text-neutral-900 uppercase tracking-widest">Montant Total :</span>
                    <span className="text-xl font-black font-mono text-red-600">
                      {finalTotalPrice} €
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Success Confirmation */}
          {step === 6 && selectedSalon && (
            <div id="step-success-container" className="max-w-md mx-auto text-center space-y-6 py-10">
              <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 text-red-600 flex items-center justify-center mx-auto shadow-[0_4px_15px_rgba(220,38,38,0.2)] animate-bounce">
                <Check className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h4 className="text-2xl font-black text-neutral-900 tracking-wide uppercase italic">Demande Reçue !</h4>
                <p className="text-sm text-neutral-600 font-medium">
                  Félicitations, votre demande de réservation a été envoyée automatiquement à la messagerie de l'établissement !
                </p>
              </div>

              <div className="bg-neutral-50 border border-neutral-200 p-5 rounded-2xl text-left text-xs space-y-2.5">
                <div className="flex justify-between border-b border-neutral-200 pb-2">
                  <span className="text-neutral-500">Salon :</span>
                  <span className="font-bold text-neutral-900 uppercase italic">{selectedSalon.name}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-200 pb-2">
                  <span className="text-neutral-500">Date & Heure :</span>
                  <span className="font-bold text-neutral-900">Le {selectedDate} à {selectedTime}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-200 pb-2">
                  <span className="text-neutral-500">Nom client :</span>
                  <span className="font-bold text-neutral-900">{clientName}</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-neutral-500">Montant :</span>
                  <span className="font-bold font-mono text-red-600">{finalTotalPrice} €</span>
                </div>
              </div>

              <p className="text-[11px] text-neutral-500 uppercase tracking-wider leading-relaxed font-semibold">
                Le propriétaire de Le Ring Bar VIP a été notifié de votre réservation sur sa messagerie et consultera votre demande sous peu.
              </p>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs tracking-widest uppercase shadow-[0_4px_15px_rgba(220,38,38,0.3)] transition-all cursor-pointer"
              >
                Retour au site web
              </button>
            </div>
          )}

        </div>

        {/* Bottom controls panel */}
        {step !== 6 && (
          <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex justify-between items-center">
            {/* Back Button */}
            <button
              onClick={handlePrevStep}
              disabled={step === 1 || isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-100 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200 hover:border-neutral-300 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Précédent
            </button>

            {/* Next or Confirm Button */}
            {step === 5 ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-[0_4px_15px_rgba(220,38,38,0.3)] transition-all flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Envoi en cours...' : 'Confirmer la Réservation'} <Check className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleNextStep}
                disabled={
                  (step === 1 && !isStep1Valid) ||
                  (step === 2 && !isStep2Valid) ||
                  (step === 4 && !isStep4Valid) ||
                  isSubmitting
                }
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-[0_4px_15px_rgba(220,38,38,0.3)] transition-all flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
              >
                Suivant <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

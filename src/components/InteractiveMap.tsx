import React from 'react';
import { Salon, Reservation } from '../types';
import { SALONS } from '../data';
import { CheckCircle2, AlertCircle, Users, MapPin, Sparkles } from 'lucide-react';

interface InteractiveMapProps {
  selectedSalonId: number | null;
  onSelectSalon: (salonId: number) => void;
  existingReservations: Reservation[];
  selectedDate: string;
  selectedTime: string;
}

export default function InteractiveMap({
  selectedSalonId,
  onSelectSalon,
  existingReservations,
  selectedDate,
  selectedTime,
}: InteractiveMapProps) {
  // Check if a salon is reserved for the selected date and hour (within a reasonable window, say same evening)
  const isSalonReserved = (salonId: number) => {
    return existingReservations.some(
      (res) =>
        res.salonId === salonId &&
        res.date === selectedDate &&
        res.status !== 'cancelled'
    );
  };

  return (
    <div id="interactive-map-container" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Visual SVG Map (7 cols on large screens) */}
      <div className="lg:col-span-7 bg-white border border-neutral-200 p-6 shadow-xl relative overflow-hidden rounded-3xl">
        {/* Ambient red decorative background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex justify-between items-center mb-6 relative z-10">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 tracking-wide uppercase italic">Plan du Ring Bar</h3>
            <p className="text-xs text-neutral-600 mt-1 uppercase tracking-widest">
              Vue interactive . <span className="text-red-500 font-bold">{selectedDate}</span>
            </p>
          </div>
          <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-neutral-700">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-200 border border-neutral-300" />
              Libre
            </span>
            <span className="flex items-center gap-1.5 text-red-500">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.5)] animate-pulse" />
              Occupé
            </span>
          </div>
        </div>

        {/* SVG Wrapper */}
        <div className="relative aspect-[4/3] w-full border border-neutral-200 rounded-2xl bg-neutral-50 p-2 select-none">
          <svg
            viewBox="0 0 800 600"
            className="w-full h-full text-neutral-600"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outline of the whole Bar */}
            <rect x="20" y="20" width="760" height="560" rx="20" fill="none" stroke="#e5e5e5" strokeWidth="4" />
            
            {/* ENTRÉE Zone */}
            <g transform="translate(40, 500)">
              <rect x="0" y="0" width="120" height="60" rx="8" fill="#f5f5f5" stroke="#e5e5e5" strokeDasharray="4 4" />
              <text x="60" y="35" textAnchor="middle" fill="#737373" className="text-xs font-black tracking-widest font-mono">
                ENTRÉE
              </text>
            </g>

            {/* DJ BOOTH Zone */}
            <g transform="translate(620, 40)">
              <rect x="0" y="0" width="140" height="70" rx="8" fill="#f5f5f5" stroke="#dc2626" strokeWidth="1" />
              <text x="70" y="32" textAnchor="middle" fill="#dc2626" className="text-[10px] font-black tracking-widest font-mono italic">
                CABINE DJ
              </text>
              <path d="M 30,45 L 110,45" stroke="#e5e5e5" strokeWidth="2" strokeDasharray="2 2" />
              {/* Turntables */}
              <circle cx="45" cy="52" r="10" fill="#e5e5e5" stroke="#dc2626" />
              <circle cx="95" cy="52" r="10" fill="#e5e5e5" stroke="#dc2626" />
            </g>

            {/* COMPTOIR (The main bar counter) */}
            <g transform="translate(30, 40)">
              <rect x="0" y="0" width="220" height="70" rx="8" fill="#f5f5f5" stroke="#e5e5e5" strokeWidth="1.5" />
              <text x="110" y="32" textAnchor="middle" fill="#111111" className="text-[10px] font-black tracking-widest font-mono">
                LE COMPTOIR (BAR)
              </text>
              <rect x="15" y="45" width="190" height="15" rx="4" fill="#dc2626" fillOpacity="0.1" />
            </g>

            {/* PISTE DE DANSE (Central Dancefloor) */}
            <g transform="translate(320, 240)">
              <rect x="0" y="0" width="240" height="180" rx="12" fill="#ffffff" stroke="#e5e5e5" strokeWidth="2" strokeDasharray="3 3" />
              <circle cx="120" cy="90" r="40" fill="none" stroke="#e5e5e5" strokeWidth="1" strokeOpacity="0.5" />
              <text x="120" y="95" textAnchor="middle" fill="#404040" className="text-[10px] font-black tracking-widest font-mono">
                PISTE DE DANSE
              </text>
            </g>

            {/* GRAND MIROIR (On the wall opposite Salon 4) */}
            <g transform="translate(770, 180)">
              <rect x="0" y="0" width="10" height="180" rx="2" fill="#dc2626" className="animate-pulse" />
              <text x="-90" y="18" transform="rotate(-90)" fill="#404040" className="text-[10px] font-black tracking-widest font-mono">
                GRAND MIROIR
              </text>
            </g>

            {/* Interactive Salons rendered as SVG groups */}
            {SALONS.map((salon) => {
              const reserved = isSalonReserved(salon.id);
              const selected = selectedSalonId === salon.id;

              // Compute coordinates on map based on salon.id
              let x = 0;
              let y = 0;
              let w = 110;
              let h = 100;

              switch (salon.id) {
                case 1: // Salon 1 – À l'entrée du bar
                  x = 40;
                  y = 360;
                  break;
                case 2: // Salon 2 – Proche DJ
                  x = 640;
                  y = 150;
                  break;
                case 3: // Salon 3 – Zone centrale
                  x = 340;
                  y = 100;
                  w = 120;
                  h = 80;
                  break;
                case 4: // Salon 4 – VIP (en face du miroir)
                  x = 640;
                  y = 290;
                  w = 120;
                  h = 100;
                  break;
                case 5: // Salon 5 – Près de la piste de danse
                  x = 180;
                  y = 360;
                  break;
                case 6: // Salon 6 – Zone feutrée
                  x = 480;
                  y = 470;
                  w = 130;
                  h = 80;
                  break;
                case 7: // Dernier salon – À côté du comptoir (represented as salon.id = 7)
                  x = 40;
                  y = 160;
                  break;
              }

              // Color determination
              let strokeColor = '#e5e5e5';
              let fillColor = selected
                ? 'rgba(220, 38, 38, 0.15)' // selected red glow
                : reserved
                ? 'rgba(239, 68, 68, 0.05)' // reserved dim red
                : 'rgba(245, 245, 245, 0.9)'; // normal light

              if (reserved) strokeColor = '#fca5a5';
              else if (selected) strokeColor = '#dc2626';

              return (
                <g
                  key={salon.id}
                  className={`cursor-pointer transition-all duration-300 ${
                    reserved ? 'cursor-not-allowed opacity-40' : 'hover:scale-[1.02]'
                  }`}
                  onClick={() => !reserved && onSelectSalon(salon.id)}
                >
                  {/* Outer glow if selected */}
                  {selected && (
                    <rect
                      x={x - 4}
                      y={y - 4}
                      width={w + 8}
                      height={h + 8}
                      rx={12}
                      fill="none"
                      stroke="#dc2626"
                      strokeWidth="2"
                      strokeOpacity="0.4"
                      className="animate-pulse"
                    />
                  )}

                  {/* Salon Main Shape */}
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    rx={10}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={selected ? 3 : 2}
                    className="transition-colors duration-300"
                  />

                  {/* Salon text overlay */}
                  <text
                    x={x + w / 2}
                    y={y + 35}
                    textAnchor="middle"
                    fill={selected ? '#dc2626' : reserved ? '#f87171' : '#111111'}
                    className="text-xs font-black font-sans uppercase tracking-wider"
                  >
                    {salon.name === 'Dernier salon' ? 'Salon 7' : salon.name}
                  </text>

                  {/* Salon details text */}
                  <text
                    x={x + w / 2}
                    y={y + 55}
                    textAnchor="middle"
                    fill={selected ? '#ef4444' : reserved ? '#ef4444' : '#525252'}
                    className="text-[9px] font-mono uppercase tracking-widest font-semibold"
                    fillOpacity="0.8"
                  >
                    {salon.id === 4 ? '✨ VIP' : salon.capacity.replace(' personnes', 'p')}
                  </text>

                  <text
                    x={x + w / 2}
                    y={y + 75}
                    textAnchor="middle"
                    fill={reserved ? '#ef4444' : selected ? '#dc2626' : '#737373'}
                    className="text-[8px] font-black font-mono tracking-widest"
                  >
                    {reserved ? 'OCCUPÉ' : selected ? 'SÉLECTIONNÉ' : 'DISPO'}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Salon Selection Details Panel (5 cols on large screens) */}
      <div className="lg:col-span-5 space-y-4">
        <h4 className="text-neutral-900 font-bold text-xs uppercase tracking-widest px-1 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-red-500" />
          Sélectionnez votre Salon
        </h4>

        <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto pr-1">
          {SALONS.map((salon) => {
            const reserved = isSalonReserved(salon.id);
            const selected = selectedSalonId === salon.id;

            return (
              <button
                key={salon.id}
                disabled={reserved}
                onClick={() => onSelectSalon(salon.id)}
                className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col ${
                  reserved
                    ? 'bg-neutral-50/20 border-neutral-100 opacity-40 cursor-not-allowed'
                    : selected
                    ? 'bg-white border-red-600 shadow-[0_4px_20px_rgba(220,38,38,0.1)]'
                    : 'bg-neutral-50 border-neutral-200 hover:border-neutral-300 hover:bg-white'
                }`}
              >
                {/* Visual indicator bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{ backgroundColor: reserved ? '#ef4444' : selected ? '#dc2626' : '#e5e5e5' }}
                />

                <div className="flex justify-between items-start pl-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-widest uppercase block" style={{ color: reserved ? '#ef4444' : selected ? '#ef4444' : '#737373' }}>
                      {salon.id === 4 ? '★ SALON EXCLUSIF VIP ★' : `EMPLACEMENT N°${salon.id}`}
                    </span>
                    <h5 className="text-base font-black text-neutral-900 mt-1 uppercase italic">
                      {salon.name} {salon.id === 4 && '👑'}
                    </h5>
                  </div>

                  <span
                    className={`text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full font-black flex items-center gap-1 ${
                      reserved
                        ? 'bg-red-50 text-red-500 border border-red-100'
                        : selected
                        ? 'bg-red-600 text-white shadow-[0_2px_10px_rgba(220,38,38,0.3)]'
                        : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                    }`}
                  >
                    {reserved ? (
                      <>
                        <AlertCircle className="w-3 h-3" />
                        Indisponible
                      </>
                    ) : selected ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        Sélectionné
                      </>
                    ) : (
                      'Disponible'
                    )}
                  </span>
                </div>

                <p className="text-xs text-neutral-600 mt-3 pl-2 leading-relaxed">
                  {salon.description}
                </p>

                <div className="flex flex-wrap gap-4 mt-4 pl-2 text-xs text-neutral-600 font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    {salon.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-neutral-400" />
                    Capacité: {salon.capacity}
                  </span>
                </div>

                {/* Minimum spend reminder */}
                <div className="mt-4 pt-3 border-t border-neutral-200 pl-2 flex justify-between items-center text-xs font-semibold">
                  <span className="text-neutral-500 uppercase tracking-wider text-[10px]">Consommation minimum :</span>
                  <span className="text-neutral-900 font-mono">{salon.priceMin} €</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

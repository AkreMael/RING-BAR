import React from 'react';
import { X, Sparkles, Trophy, Award, Crown } from 'lucide-react';

interface OffersProps {
  onClose: () => void;
  onSelectPack?: (packageName: string, price: number) => void;
  selectedBar?: 'ring' | 'ofun' | 'tecno';
}

export default function Offers({ onClose, onSelectPack, selectedBar = 'ring' }: OffersProps) {
  const barName = selectedBar === 'ofun' ? "O'fun Bar" : selectedBar === 'tecno' ? "Tecno Bar" : "Ring Bar";
  const themeColor = selectedBar === 'ofun' ? 'rose' : selectedBar === 'tecno' ? 'blue' : 'red';

  // Dynamic colors
  const textTheme = selectedBar === 'ofun' ? 'text-rose-600' : selectedBar === 'tecno' ? 'text-blue-600' : 'text-red-600';
  const text500Theme = selectedBar === 'ofun' ? 'text-rose-500' : selectedBar === 'tecno' ? 'text-blue-500' : 'text-red-500';
  const bgTheme = selectedBar === 'ofun' ? 'bg-rose-600' : selectedBar === 'tecno' ? 'bg-blue-600' : 'bg-red-600';
  const bgHoverTheme = selectedBar === 'ofun' ? 'hover:bg-rose-500' : selectedBar === 'tecno' ? 'hover:bg-blue-500' : 'hover:bg-red-500';
  const shadowTheme = selectedBar === 'ofun' ? 'shadow-[0_4px_15px_rgba(236,72,153,0.3)]' : selectedBar === 'tecno' ? 'shadow-[0_4px_15px_rgba(59,130,246,0.3)]' : 'shadow-[0_4px_15px_rgba(220,38,38,0.3)]';
  const badgeShadowTheme = selectedBar === 'ofun' ? 'shadow-[0_2px_10px_rgba(236,72,153,0.4)]' : selectedBar === 'tecno' ? 'shadow-[0_2px_10px_rgba(59,130,246,0.4)]' : 'shadow-[0_2px_10px_rgba(220,38,38,0.4)]';

  const popularCardClasses = selectedBar === 'ofun'
    ? 'border-rose-600 bg-white shadow-[0_4px_25px_rgba(236,72,153,0.1)] hover:border-rose-500'
    : selectedBar === 'tecno'
    ? 'border-blue-600 bg-white shadow-[0_4px_25px_rgba(59,130,246,0.1)] hover:border-blue-500'
    : 'border-red-600 bg-white shadow-[0_4px_25px_rgba(220,38,38,0.1)] hover:border-red-500';

  const popularBadgeColor = selectedBar === 'ofun' ? 'bg-rose-600 text-white' : selectedBar === 'tecno' ? 'bg-blue-600 text-white' : 'bg-red-600 text-white';

  const packs = [
    {
      name: 'PACK CHALLENGER',
      icon: <Award className="w-8 h-8 text-neutral-400" />,
      price: 120000,
      description: 'Idéal pour s\'échauffer et lancer sa soirée entre amis dans une ambiance festive.',
      features: [
        '1 Bouteille de Champagne Moët & Chandon Brut',
        '4 Softs ou jus de fruits au choix',
        'Assortiment de tapas salés',
        'Salon réservé (Salon 1, 5 ou 6)',
        'Accès pour 4 à 6 personnes'
      ],
      color: 'border-neutral-200 hover:border-neutral-400 bg-neutral-50',
      badgeColor: 'bg-neutral-100 text-neutral-600'
    },
    {
      name: 'PACK CHAMPION',
      icon: <Trophy className={`w-8 h-8 ${text500Theme}`} />,
      price: 230000,
      description: `Le choix royal de nos habitués. Pour célébrer une grande occasion ou faire la fête en grand au ${barName}.`,
      features: [
        '1 Bouteille de Ruinart Blanc de Blancs',
        '1 Bouteille de Jack Daniel\'s Single Barrel',
        '8 Softs ou Red Bull au choix',
        'Planche de tapas chauds & froids du chef',
        'Salon premium (Salon 2 ou 3)',
        'Accès pour 6 à 8 personnes'
      ],
      color: popularCardClasses,
      badgeColor: popularBadgeColor,
      popular: true
    },
    {
      name: 'PACK KNOCKOUT (K.O.)',
      icon: <Crown className={`w-8 h-8 ${text500Theme}`} />,
      price: 395000,
      description: `L'expérience ultime VIP ${barName}. Pour ceux qui veulent marquer les esprits et régner sur le bar.`,
      features: [
        '1 Bouteille de Dom Pérignon Luminous (Lumineuse)',
        '1 Bouteille de Chivas Regal 18 Ans',
        '12 Softs et Red Bull à volonté',
        'Plateau de fruits frais et assortiment VIP',
        'Salon 4 VIP exclusif (en face du miroir)',
        'Accès pour 8 à 10 personnes'
      ],
      color: 'border-neutral-200 hover:border-neutral-400 bg-neutral-50',
      badgeColor: 'bg-neutral-100 text-neutral-600'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
      {/* Container */}
      <div className="relative w-full max-w-5xl bg-white border border-neutral-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-55">
          <div className="flex items-center gap-2">
            <Sparkles className={`w-5 h-5 ${textTheme} animate-pulse`} />
            <h3 className="text-lg font-black text-neutral-900 tracking-wider uppercase italic font-sans">
              Formules & Packs VIP <span className={textTheme}>—</span> Le {barName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-neutral-100 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto bg-white">
          <p className="text-xs text-neutral-600 max-w-2xl mx-auto text-center mb-8 uppercase tracking-widest leading-relaxed">
            Profitez de nos offres VIP clé en main. Réservez un salon avec boissons incluses à un tarif privilégié pour une soirée mémorable.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packs.map((pack) => (
              <div
                key={pack.name}
                className={`border rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 group ${pack.color}`}
              >
                {pack.popular && (
                  <div className={`absolute top-4 right-4 ${popularBadgeColor} text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full uppercase ${badgeShadowTheme}`}>
                    Recommandé
                  </div>
                )}

                <div>
                  <div className="mb-4">
                    {pack.icon}
                  </div>

                  <h4 className="text-lg font-black text-neutral-900 tracking-wide uppercase italic">{pack.name}</h4>
                  
                  <div className="flex items-baseline gap-1 mt-3">
                    <span className="text-2xl font-mono font-black text-neutral-900">{pack.price.toLocaleString('fr-FR')}</span>
                    <span className={`text-xs font-bold ${textTheme}`}>F CFA</span>
                  </div>

                  <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                    {pack.description}
                  </p>

                  <div className="mt-5 space-y-2.5">
                    {pack.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-neutral-700">
                        <span className={`${text500Theme} mt-0.5`}>•</span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {onSelectPack && (
                  <button
                    onClick={() => onSelectPack(pack.name, pack.price)}
                    className={`w-full py-2.5 rounded-xl font-black text-[10px] tracking-widest uppercase mt-6 transition-all cursor-pointer ${
                      pack.popular
                        ? `${bgTheme} ${bgHoverTheme} text-white ${shadowTheme}`
                        : 'bg-neutral-100 border border-neutral-200 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900'
                    }`}
                  >
                    Choisir ce pack
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-100 text-center text-xs text-neutral-600 uppercase tracking-widest font-mono">
          Les réservations de packs incluent la gratuité des entrées pour l'ensemble des invités du salon.
        </div>
      </div>
    </div>
  );
}

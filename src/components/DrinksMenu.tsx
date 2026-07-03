import React, { useState } from 'react';
import { DRINKS } from '../data';
import { Drink } from '../types';
import { X, Search, Sparkles } from 'lucide-react';

interface DrinksMenuProps {
  onClose: () => void;
  onSelectDrinkDirectly?: (drink: Drink) => void;
  selectedBar?: 'ring' | 'ofun' | 'tecno';
}

export default function DrinksMenu({ onClose, onSelectDrinkDirectly, selectedBar = 'ring' }: DrinksMenuProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Champagne', 'Whisky', 'Cognac', 'Vin', 'Liqueur'];

  const filteredDrinks = DRINKS.filter((drink) => {
    const matchesSearch = drink.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          drink.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || drink.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const barName = selectedBar === 'ofun' ? "O'fun Bar" : selectedBar === 'tecno' ? "Tecno Bar" : "Ring Bar";
  const themeColor = selectedBar === 'ofun' ? 'rose' : selectedBar === 'tecno' ? 'blue' : 'red';

  // Dynamic class mapping helper
  const textTheme = selectedBar === 'ofun' ? 'text-rose-600' : selectedBar === 'tecno' ? 'text-blue-600' : 'text-red-600';
  const bgTheme = selectedBar === 'ofun' ? 'bg-rose-600' : selectedBar === 'tecno' ? 'bg-blue-600' : 'bg-red-600';
  const borderFocusTheme = selectedBar === 'ofun' ? 'focus:border-rose-600' : selectedBar === 'tecno' ? 'focus:border-blue-600' : 'focus:border-red-600';
  const hoverBorderTheme = selectedBar === 'ofun' ? 'hover:border-rose-600/30' : selectedBar === 'tecno' ? 'hover:border-blue-600/30' : 'hover:border-red-600/30';
  const hoverBgTheme = selectedBar === 'ofun' ? 'hover:bg-rose-600 hover:border-rose-600' : selectedBar === 'tecno' ? 'hover:bg-blue-600 hover:border-blue-600' : 'hover:bg-red-600 hover:border-red-600';
  const badgeTheme = selectedBar === 'ofun' ? 'text-rose-600 border-rose-100' : selectedBar === 'tecno' ? 'text-blue-600 border-blue-100' : 'text-red-600 border-red-100';
  const activeCategoryShadow = selectedBar === 'ofun' 
    ? 'bg-rose-600 text-white shadow-[0_2px_10px_rgba(236,72,153,0.4)]' 
    : selectedBar === 'tecno' 
    ? 'bg-blue-600 text-white shadow-[0_2px_10px_rgba(37,99,235,0.4)]' 
    : 'bg-red-600 text-white shadow-[0_2px_10px_rgba(220,38,38,0.4)]';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
      {/* Container */}
      <div className="relative w-full max-w-5xl bg-white border border-neutral-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-55">
          <div className="flex items-center gap-2">
            <Sparkles className={`w-5 h-5 ${textTheme} animate-pulse`} />
            <h3 className="text-lg font-black text-neutral-900 tracking-wider uppercase italic font-sans">
              La Carte des Boissons <span className={textTheme}>—</span> Le {barName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-neutral-100 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category filter */}
        <div className="p-6 bg-white border-b border-neutral-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Categories */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? activeCategoryShadow
                    : 'bg-neutral-50 border border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:text-neutral-900'
                }`}
              >
                {cat === 'All' ? 'Tous' : cat}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Rechercher une boisson..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full bg-neutral-55 border border-neutral-200 rounded-full pl-10 pr-4 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none ${borderFocusTheme} transition-colors`}
            />
          </div>
        </div>

        {/* Drink List */}
        <div className="p-6 overflow-y-auto bg-white">
          {filteredDrinks.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 uppercase tracking-widest font-mono text-xs">
              Aucune boisson ne correspond à votre recherche.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDrinks.map((drink) => (
                <div
                  key={drink.id}
                  className={`bg-neutral-50/55 border border-neutral-200 rounded-2xl overflow-hidden ${hoverBorderTheme} transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 group flex flex-col h-full`}
                >
                  {/* Drink Image */}
                  <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-100 relative border-b border-neutral-100">
                    <img
                      src={drink.image}
                      alt={drink.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className={`absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-sm text-[9px] border font-mono font-bold uppercase tracking-wider shadow-sm ${badgeTheme}`}>
                      {drink.category}
                    </div>
                  </div>

                  {/* Drink details (Under the image) */}
                  <div className="p-4 flex flex-col justify-between flex-grow">
                    <div>
                      <h4 className={`text-sm font-extrabold text-neutral-900 tracking-wide uppercase italic group-hover:${textTheme} transition-colors line-clamp-2 min-h-[2.5rem] flex items-center`}>
                        {drink.name}
                      </h4>
                      <div className="mt-1.5">
                        <span className={`text-base font-mono font-black ${textTheme}`}>
                          {drink.price.toLocaleString('fr-FR')} F CFA
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 mt-2.5 leading-relaxed line-clamp-2 min-h-[2.5rem]">
                        {drink.description}
                      </p>
                    </div>

                    {/* Quick booking link if available */}
                    {onSelectDrinkDirectly && (
                      <button
                        onClick={() => onSelectDrinkDirectly(drink)}
                        className={`mt-4 w-full py-2 bg-neutral-100 ${hoverBgTheme} hover:text-white text-neutral-800 border border-neutral-200 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer`}
                      >
                        Ajouter à ma réservation →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-100 text-center text-xs text-neutral-600 uppercase tracking-widest font-mono">
          Les boissons sélectionnées s'ajouteront à votre montant total de réservation.
        </div>
      </div>
    </div>
  );
}

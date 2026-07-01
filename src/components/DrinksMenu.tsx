import React, { useState } from 'react';
import { DRINKS } from '../data';
import { Drink } from '../types';
import { X, Search, Sparkles } from 'lucide-react';

interface DrinksMenuProps {
  onClose: () => void;
  onSelectDrinkDirectly?: (drink: Drink) => void;
}

export default function DrinksMenu({ onClose, onSelectDrinkDirectly }: DrinksMenuProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Champagne', 'Whisky', 'Cognac', 'Cocktail', 'Soft'];

  const filteredDrinks = DRINKS.filter((drink) => {
    const matchesSearch = drink.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          drink.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || drink.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      {/* Container */}
      <div className="relative w-full max-w-4xl bg-black border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-neutral-900 flex justify-between items-center bg-neutral-950">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-red-600 animate-pulse" />
            <h3 className="text-lg font-black text-white tracking-wider uppercase italic font-sans">
              La Carte des Boissons <span className="text-red-600">—</span> Le Ring Bar
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category filter */}
        <div className="p-6 bg-black border-b border-neutral-900 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Categories */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-red-600 text-white shadow-[0_2px_10px_rgba(220,38,38,0.4)]'
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
                }`}
              >
                {cat === 'All' ? 'Tous' : cat}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Rechercher une boisson..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-600 transition-colors"
            />
          </div>
        </div>

        {/* Drink List */}
        <div className="p-6 overflow-y-auto bg-black">
          {filteredDrinks.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 uppercase tracking-widest font-mono text-xs">
              Aucune boisson ne correspond à votre recherche.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredDrinks.map((drink) => (
                <div
                  key={drink.id}
                  className="bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-4 flex gap-4 hover:border-red-600/30 transition-all duration-300 group"
                >
                  {/* Drink Image */}
                  <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-950 border border-neutral-800 relative">
                    <img
                      src={drink.image}
                      alt={drink.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded bg-black/80 text-[8px] text-red-500 font-mono font-bold uppercase tracking-wider">
                      {drink.category}
                    </div>
                  </div>

                  {/* Drink details */}
                  <div className="flex flex-col justify-between flex-grow">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-base font-bold text-white tracking-wide uppercase italic group-hover:text-red-500 transition-colors">
                          {drink.name}
                        </h4>
                        <span className="text-base font-mono font-bold text-red-500">
                          {drink.price} €
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-2 leading-relaxed line-clamp-2">
                        {drink.description}
                      </p>
                    </div>

                    {/* Quick booking link if available */}
                    {onSelectDrinkDirectly && (
                      <button
                        onClick={() => onSelectDrinkDirectly(drink)}
                        className="mt-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 flex items-center gap-1 self-start transition-colors cursor-pointer"
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
        <div className="p-4 bg-neutral-950 border-t border-neutral-900 text-center text-xs text-neutral-500 uppercase tracking-widest font-mono">
          Les boissons sélectionnées s'ajouteront à votre montant total de réservation.
        </div>
      </div>
    </div>
  );
}

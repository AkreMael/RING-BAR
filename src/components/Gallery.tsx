import React, { useState } from 'react';
import { X, ZoomIn, Heart, Share2, Sparkles, Check } from 'lucide-react';

interface GalleryProps {
  onClose?: () => void;
  isModal?: boolean;
  selectedBar?: 'ring' | 'ofun' | 'tecno';
}

export default function Gallery({ onClose, isModal = false, selectedBar = 'ring' }: GalleryProps) {
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [likedImages, setLikedImages] = useState<{ [key: number]: boolean }>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const barName = selectedBar === 'ofun' ? "O'fun Bar" : selectedBar === 'tecno' ? "Tecno Bar" : "Ring Bar";
  const textTheme = selectedBar === 'ofun' ? 'text-rose-600' : selectedBar === 'tecno' ? 'text-blue-600' : 'text-red-600';
  const text500Theme = selectedBar === 'ofun' ? 'text-rose-500' : selectedBar === 'tecno' ? 'text-blue-500' : 'text-red-500';
  const bg50Theme = selectedBar === 'ofun' ? 'bg-rose-50 border-rose-100' : selectedBar === 'tecno' ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-100';
  const hoverBorderTheme = selectedBar === 'ofun' 
    ? 'hover:border-rose-600/40 hover:shadow-[0_4px_25px_rgba(236,72,153,0.1)]' 
    : selectedBar === 'tecno' 
    ? 'hover:border-blue-600/40 hover:shadow-[0_4px_25px_rgba(37,99,235,0.1)]' 
    : 'hover:border-red-600/40 hover:shadow-[0_4px_25px_rgba(220,38,38,0.1)]';
  const likedTheme = selectedBar === 'ofun' 
    ? 'bg-rose-50 text-rose-500 border border-rose-100' 
    : selectedBar === 'tecno' 
    ? 'bg-blue-50 text-blue-500 border border-blue-100' 
    : 'bg-red-50 text-red-500 border border-red-100';

  const galleryItems = [
    {
      url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=800',
      title: 'Le Comptoir & Ambiance Néon',
      category: 'Bar',
      description: `Notre comptoir principal illuminé de couleurs et de nuances chaudes, où nos barmans créent des cocktails signatures d'exception.`
    },
    {
      url: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&q=80&w=800',
      title: 'Le Salon 4 - VIP Miroir',
      category: 'Salons',
      description: 'L\'expérience de réservation ultime avec de grands canapés somptueux et notre miroir signature.'
    },
    {
      url: 'https://images.unsplash.com/photo-1574096079513-d8259312b785?auto=format&fit=crop&q=80&w=800',
      title: 'Vibrations du DJ résident',
      category: 'DJ & Dancefloor',
      description: 'Le meilleur de l\'électro, du hip-hop et de la deep house distillé chaque week-end de 22h à l\'aube.'
    },
    {
      url: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&q=80&w=800',
      title: 'Nos Cocktails Signatures',
      category: 'Boissons',
      description: 'Découvrez notre fameux cocktail et nos créations élaborés avec des spiritueux d\'exception.'
    },
    {
      url: 'https://images.unsplash.com/photo-1594460528456-a3dec7245072?auto=format&fit=crop&q=80&w=800',
      title: 'Célébrations au Champagne',
      category: 'VIP',
      description: 'Dom Pérignon Luminous, Ruinart ou Moët & Chandon pour illuminer vos tables de salons.'
    },
    {
      url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800',
      title: 'La Piste de Danse Animée',
      category: 'DJ & Dancefloor',
      description: 'Plongez au cœur du rythme sous des projections lumineuses spectaculaires.'
    }
  ];

  const handleLike = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedImages(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleShare = (item: typeof galleryItems[0], e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: item.description,
        url: window.location.href,
      }).catch(console.error);
    } else {
      showToast(`Lien de partage copié pour : ${item.title}`);
    }
  };

  const content = (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[120] bg-white border border-neutral-200 text-neutral-900 text-xs font-black uppercase tracking-widest px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-fade-in">
          <Check className={`w-4 h-4 ${text500Theme}`} />
          {toastMessage}
        </div>
      )}

      {!isModal && (
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className={`w-5 h-5 ${textTheme}`} />
          <h3 className="text-base font-black text-neutral-900 tracking-wider uppercase italic font-sans">
            Galerie {barName} VIP
          </h3>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleryItems.map((item, index) => (
          <div
            key={index}
            onClick={() => setActiveImageIndex(index)}
            className={`group relative aspect-[4/3] rounded-3xl overflow-hidden bg-white border border-neutral-200 cursor-pointer transition-all duration-300 ${hoverBorderTheme}`}
          >
            {/* Image */}
            <img
              src={item.url}
              alt={item.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Light gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/50 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Hover details */}
            <div className="absolute inset-0 p-5 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex justify-between items-center">
                <span className={`text-[9px] font-black tracking-widest ${textTheme} ${bg50Theme} px-2.5 py-1 rounded-full uppercase`}>
                  {item.category}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => handleLike(index, e)}
                    className={`p-1.5 rounded-full backdrop-blur-sm transition-colors cursor-pointer ${
                      likedImages[index] ? likedTheme : 'bg-white/80 text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5" fill={likedImages[index] ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={(e) => handleShare(item, e)}
                    className="p-1.5 rounded-full bg-white/80 text-neutral-500 hover:text-neutral-900 backdrop-blur-sm transition-colors cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-black text-neutral-900 tracking-wide uppercase italic flex items-center gap-1.5">
                  {item.title}
                </h4>
                <p className="text-[11px] text-neutral-700 mt-1 line-clamp-2 leading-relaxed font-medium">
                  {item.description}
                </p>
                <span className={`text-[10px] ${textTheme} font-black tracking-widest uppercase mt-3 inline-flex items-center gap-1`}>
                  <ZoomIn className="w-3.5 h-3.5" /> Agrandir
                </span>
              </div>
            </div>

            {/* Non-hover tiny titles */}
            <div className="absolute bottom-5 left-5 right-5 flex justify-between items-center group-hover:opacity-0 transition-opacity duration-300">
              <h4 className="text-sm font-black text-neutral-900 uppercase italic tracking-wide">{item.title}</h4>
              <span className="text-[9px] font-black tracking-widest uppercase text-neutral-500">{item.category}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activeImageIndex !== null && (
        <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-lg flex items-center justify-center p-4">
          <button
            onClick={() => setActiveImageIndex(null)}
            className="absolute top-6 right-6 p-2 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200 transition-all z-10 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="w-full max-w-4xl max-h-[85vh] flex flex-col items-center justify-center">
            {/* Image display */}
            <div className="relative max-h-[60vh] rounded-3xl overflow-hidden border border-neutral-200 shadow-xl">
              <img
                src={galleryItems[activeImageIndex].url}
                alt={galleryItems[activeImageIndex].title}
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[60vh] object-contain"
              />
            </div>

            {/* Image text detail */}
            <div className="w-full max-w-2xl text-center mt-6 space-y-2 px-4">
              <span className={`text-[9px] font-black tracking-widest ${textTheme} ${bg50Theme} px-3 py-1.5 rounded-full uppercase`}>
                {galleryItems[activeImageIndex].category}
              </span>
              <h3 className="text-lg font-black text-neutral-900 uppercase italic mt-2">
                {galleryItems[activeImageIndex].title}
              </h3>
              <p className="text-xs text-neutral-600 max-w-lg mx-auto leading-relaxed font-medium">
                {galleryItems[activeImageIndex].description}
              </p>
            </div>

            {/* Stepper buttons */}
            <div className="flex gap-4 mt-6">
              <button
                disabled={activeImageIndex === 0}
                onClick={() => setActiveImageIndex(activeImageIndex - 1)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              >
                Précédent
              </button>
              <button
                disabled={activeImageIndex === galleryItems.length - 1}
                onClick={() => setActiveImageIndex(activeImageIndex + 1)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
        {/* Container */}
        <div className="relative w-full max-w-5xl bg-white border border-neutral-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-55">
            <div className="flex items-center gap-2">
              <Sparkles className={`w-5 h-5 ${textTheme} animate-pulse`} />
              <h3 className="text-lg font-black text-neutral-900 tracking-wider uppercase italic font-sans">
                Galerie Le {barName}
              </h3>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-neutral-100 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="p-6 overflow-y-auto bg-white">
            {content}
          </div>
        </div>
      </div>
    );
  }

  return content;
}

import React, { useState } from 'react';
import { ShoppingBag, Star, ArrowUpRight } from 'lucide-react';

export const SneakerCard = ({
  title,
  brand,
  price,
  originalPrice,
  imageUrl,
  sizes = [38, 39, 40, 41, 42, 43],
  rating = 4.9,
  isNew = false,
  onAddToCart,
}) => {
  const [selectedSize, setSelectedSize] = useState(sizes[2] || sizes[0]);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="group relative w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-800 p-4 transition-all duration-300 hover:-translate-y-1.5 hover:border-zinc-700 hover:shadow-2xl hover:shadow-emerald-500/10 overflow-hidden font-sans"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between z-10 relative">
        <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400">
          {brand}
        </span>
        <div className="flex items-center gap-2">
          {isNew && (
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase text-emerald-400">
              Drop Novo
            </span>
          )}
          <span className="flex items-center gap-1 rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-300">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {rating}
          </span>
        </div>
      </div>

      <div className="relative my-4 flex h-52 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-zinc-800/50 to-transparent">
        <img
          src={imageUrl}
          alt={title}
          className={`h-44 w-auto object-contain transition-transform duration-500 ease-out ${
            isHovered ? 'scale-110 -rotate-6' : 'scale-100'
          }`}
        />
      </div>

      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
            {title}
          </h3>
          <ArrowUpRight className="w-5 h-5 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0" />
        </div>
        
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-extrabold text-white">
            R$ {price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          {originalPrice && (
            <span className="text-xs text-zinc-500 line-through">
              R$ {originalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-2">
          Tamanho BR: <span className="text-white font-bold">{selectedSize}</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`h-8 w-10 rounded-lg text-xs font-bold transition-all ${
                selectedSize === size
                  ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onAddToCart && onAddToCart({ title, price, size: selectedSize })}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-extrabold text-black transition-all hover:bg-emerald-400 active:scale-[0.98] shadow-lg shadow-emerald-500/15"
      >
        <ShoppingBag className="w-4 h-4" />
        Garantir Tênis
      </button>
    </div>
  );
};
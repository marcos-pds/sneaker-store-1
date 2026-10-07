import React, { useState } from 'react';
import { ShoppingBag, Star, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export function SneakerCard({ sneaker }) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(sneaker.sizes?.[0] || 40);

  // Pega o ID gerado pelo MongoDB ou C#
  const productId = sneaker.id || sneaker._id;

  return (
    <div className="group relative rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-4 hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-1">
      {/* Badges */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{sneaker.brand}</span>
        {sneaker.isNew && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 uppercase">
            <Flame className="w-3 h-3 fill-emerald-400" /> Drop Exclusivo
          </span>
        )}
      </div>

      {/* 1. Imagem Clicável com Link */}
      <Link to={`/product/${productId}`} className="block">
        <div className="relative h-48 flex items-center justify-center rounded-xl bg-gradient-to-b from-zinc-800/40 to-transparent p-4 cursor-pointer">
          <img
            src={sneaker.imageUrl}
            alt={sneaker.title}
            className="max-h-full object-contain group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 ease-out"
          />
        </div>
      </Link>

      {/* 2. Título Clicável com Link */}
      <div className="mt-4 space-y-1">
        <Link to={`/product/${productId}`}>
          <h3 className="font-bold text-white text-base truncate group-hover:text-emerald-400 transition-colors cursor-pointer">
            {sneaker.title}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2">
          <span className="text-lg font-black text-white">
            R$ {sneaker.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          {sneaker.originalPrice && (
            <span className="text-xs text-zinc-500 line-through">
              R$ {sneaker.originalPrice?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          )}
        </div>
      </div>

      {/* Seleção de Tamanhos */}
      <div className="mt-3">
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Tamanho BR</p>
        <div className="flex flex-wrap gap-1">
          {sneaker.sizes?.slice(0, 5).map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`h-7 w-8 rounded-md text-xs font-bold transition-all ${
                selectedSize === size
                  ? 'bg-emerald-500 text-black'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Botão de Compra sem redirecionar (Adiciona direto no carrinho) */}
      <button
        onClick={() => addToCart({ ...sneaker, selectedSize })}
        className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-xs font-black text-black uppercase tracking-wider hover:bg-emerald-400 active:scale-95 transition-all shadow-md shadow-emerald-500/10"
      >
        <ShoppingBag className="w-4 h-4" />
        Garantir Par
      </button>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Star, ShieldCheck, Truck, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

export function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [sneaker, setSneaker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSize, setSelectedSize] = useState(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetch(`https://localhost:7219/api/sneaker/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setSneaker(data);
        setSelectedImage(data.imageUrl);
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-xs font-bold text-zinc-500 uppercase">Carregando detalhes do sneaker...</p>
      </div>
    );
  }

  if (!sneaker) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-sm font-bold text-zinc-400">Sneaker não encontrado.</p>
        <Link to="/catalog" className="text-xs font-black text-emerald-400 uppercase underline">
          Voltar ao Catálogo
        </Link>
      </div>
    );
  }

  // Lista de imagens galeria (prioriza o array ImageUrls do banco)
  const galleryImages = sneaker.imageUrls && sneaker.imageUrls.length > 0 
    ? sneaker.imageUrls 
    : [sneaker.imageUrl];

  const handleAddToCart = () => {
    if (!selectedSize) return alert('Selecione um tamanho BR.');
    addToCart(sneaker, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="mx-3 sm:mx-6 md:mx-12 my-8 space-y-8 max-w-6xl mx-auto">
      <Link to="/catalog" className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors uppercase">
        <ArrowLeft className="w-4 h-4" /> Voltar para o Catálogo
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Galeria de Fotos */}
        <div className="md:col-span-6 space-y-4">
          <div className="rounded-3xl bg-zinc-900 border border-zinc-800/80 p-6 flex items-center justify-center min-h-[380px] relative overflow-hidden">
            <span className="absolute top-4 left-4 text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              Drop Exclusivo
            </span>
            <img
              src={selectedImage || sneaker.imageUrl}
              alt={sneaker.title}
              className="max-h-[340px] w-auto object-contain transition-all duration-300 hover:scale-105"
            />
          </div>

          {/* Thumbnails da Galeria */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`h-16 w-16 rounded-2xl bg-zinc-900 border p-1 transition-all flex-shrink-0 ${
                  (selectedImage || sneaker.imageUrl) === img
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'border-zinc-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Ângulo ${idx + 1}`} className="h-full w-full object-contain rounded-xl" />
              </button>
            ))}
          </div>
        </div>

        {/* Informações de Compra */}
        <div className="md:col-span-6 space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase text-zinc-500">{sneaker.brand}</span>
              <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400" /> {sneaker.rating || 4.9}
              </div>
            </div>
            <h1 className="text-xl sm:text-3xl font-black uppercase text-white leading-tight">
              {sneaker.title}
            </h1>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-1">
            <p className="text-[10px] font-bold uppercase text-zinc-500">Preço Final no Pix / Cartão</p>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                R$ {sneaker.price?.toFixed(2)}
              </span>
              {sneaker.originalPrice && (
                <span className="text-xs font-bold text-zinc-500 line-through">
                  R$ {sneaker.originalPrice?.toFixed(2)}
                </span>
              )}
            </div>
            <p className="text-[10px] text-zinc-400 font-medium">Em até 10x de R$ {(sneaker.price / 10).toFixed(2)} sem juros.</p>
          </div>

          {/* Seleção de Tamanho */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase text-zinc-300">Selecione o Tamanho (BR)</span>
              <span className="text-[10px] font-bold uppercase text-emerald-400 cursor-pointer">Guia de Medidas</span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {sneaker.sizes?.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`py-2.5 rounded-xl text-xs font-black transition-all ${
                    selectedSize === size
                      ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Botão Adicionar ao Carrinho */}
          <button
            onClick={handleAddToCart}
            className={`w-full py-4 rounded-2xl font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl ${
              added
                ? 'bg-emerald-400 text-black scale-[0.99]'
                : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" /> Adicionado ao Carrinho!
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" /> Adicionar ao Carrinho • TAM {selectedSize}
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800/60">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase text-white">Autenticidade</p>
                <p className="text-[9px] text-zinc-500">Verificada</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800/60">
              <Truck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase text-white">Envio Direto</p>
                <p className="text-[9px] text-zinc-500">Ao Cliente</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Descrição do Produto */}
      <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 space-y-4">
        <h3 className="text-sm font-black uppercase text-white tracking-wider">Especificações do Produto</h3>
        <p className="text-xs text-zinc-400 leading-relaxed">{sneaker.description}</p>
      </div>
    </div>
  );
}
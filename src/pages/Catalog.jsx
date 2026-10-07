import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { SneakerCard } from '../components/product/SneakerCard';

export function Catalog() {
  const [sneakers, setSneakers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || 'ALL');
  const [selectedSize, setSelectedSize] = useState(searchParams.get('size') || 'ALL');
  const [maxPrice, setMaxPrice] = useState(2500);

useEffect(() => {
    fetch('https://localhost:7219/api/sneaker?onlyPublished=true')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setSneakers(data);
        setLoading(false); // <-- Libera a renderização da lista
      })
      .catch((err) => {
        console.error('Erro ao carregar o catálogo:', err);
        setLoading(false); // <-- Garante que não fique travado em 'Carregando...' em caso de erro
      });
  }, []);

  const handleResetFilters = () => {
    setSelectedBrand('ALL');
    setSelectedSize('ALL');
    setMaxPrice(2500);
    setSearchParams({});
  };

  const filteredSneakers = sneakers.filter((sneaker) => {
    const matchesBrand = selectedBrand === 'ALL' || sneaker.brand?.toUpperCase() === selectedBrand.toUpperCase();
    const matchesSize = selectedSize === 'ALL' || sneaker.sizes?.includes(Number(selectedSize));
    const matchesPrice = (sneaker.price || 0) <= maxPrice;
    return matchesBrand && matchesSize && matchesPrice;
  });

  return (
    <div className="mx-3 sm:mx-6 md:mx-12 my-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-white">
          Catálogo <span className="text-emerald-400">Completo</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-1">Filtre por marca, tamanho e faixa de preço.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Painel de Filtros (3 cols) */}
        <aside className="lg:col-span-3 rounded-2xl bg-zinc-900 border border-zinc-800 p-5 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <span className="flex items-center gap-2 text-xs font-black uppercase text-white">
              <SlidersHorizontal className="w-4 h-4 text-emerald-400" /> Filtros
            </span>
            <button
              onClick={handleResetFilters}
              className="text-[10px] font-bold text-zinc-500 hover:text-emerald-400 uppercase flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Limpar
            </button>
          </div>

          {/* Filtro por Marca */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase text-zinc-400">Marca</label>
            <div className="flex flex-col gap-1">
              {['ALL', 'JORDAN', 'NIKE', 'ADIDAS'].map((brand) => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedBrand === brand
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                  }`}
                >
                  {brand === 'ALL' ? 'Todas as Marcas' : brand}
                </button>
              ))}
            </div>
          </div>

          {/* Filtro por Tamanho */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase text-zinc-400">Tamanho BR</label>
            <div className="grid grid-cols-4 gap-1.5">
              {['ALL', '37', '38', '39', '40', '41', '42'].map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    selectedSize === size
                      ? 'bg-emerald-500 text-black border-emerald-500'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Filtro por Preço */}
          <div className="space-y-2">
            <div className="flex justify-between text-[11px] font-bold uppercase">
              <span className="text-zinc-400">Preço Máximo</span>
              <span className="text-emerald-400">R$ {maxPrice}</span>
            </div>
            <input
              type="range"
              min="500"
              max="3000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-zinc-950 rounded-lg cursor-pointer"
            />
          </div>
        </aside>

        {/* Grid de Resultados (9 cols) */}
        <main className="lg:col-span-9 space-y-4">
          <div className="flex justify-between items-center text-xs text-zinc-500 font-bold uppercase">
            <span>Mostrando {filteredSneakers.length} resultados</span>
          </div>

          {loading ? (
            <div className="py-20 text-center text-emerald-400 font-bold">Carregando catálogo...</div>
          ) : filteredSneakers.length === 0 ? (
            <div className="py-20 text-center text-zinc-500 rounded-2xl bg-zinc-900/40 border border-zinc-800">
              Nenhum produto encontrado com estes filtros.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredSneakers.map((sneaker) => (
                <SneakerCard key={sneaker.id || sneaker._id} sneaker={sneaker} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
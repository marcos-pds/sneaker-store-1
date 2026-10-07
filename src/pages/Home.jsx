import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  Lock, 
  ArrowRight, 
  Flame, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Percent,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';
import { SneakerCard } from '../components/product/SneakerCard';

export function Home() {
  const [sneakers, setSneakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emailInput, setEmailInput] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Refs para controle de scroll dos dois carrosséis
  const bestsellersRef = useRef(null);
  const promoRef = useRef(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const selectedBrand = searchParams.get('brand') || 'ALL';

useEffect(() => {
    fetch('https://localhost:7219/api/sneaker?onlyPublished=true')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setSneakers(data);
        setLoading(false); // <-- Desativa a mensagem "Carregando mais vendidos..."
      })
      .catch((err) => {
        console.error('Erro ao carregar home:', err);
        setLoading(false);
      });
  }, []);

  // Tênis em Promoção
  const promoSneakers = sneakers.filter((s) => s.originalPrice && s.originalPrice > s.price);

  // Carrossel Automático para Drops em Promoção
  useEffect(() => {
    if (promoSneakers.length === 0) return;

    const interval = setInterval(() => {
      if (promoRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = promoRef.current;
        // Se chegar ao final, volta suavemente para o início
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          promoRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          promoRef.current.scrollBy({ left: 320, behavior: 'smooth' });
        }
      }
    }, 3500); // Rola a cada 3.5 segundos

    return () => clearInterval(interval);
  }, [promoSneakers]);

  // Função genérica de Scroll Manual
  const scrollContainer = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = ref.current.clientWidth * 0.8;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleBrandFilter = (brand) => {
    const params = new URLSearchParams(searchParams);
    if (brand === 'ALL') {
      params.delete('brand');
    } else {
      params.set('brand', brand.toLowerCase());
    }
    setSearchParams(params);
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (emailInput) {
      setNewsletterSubscribed(true);
      setEmailInput('');
    }
  };

  const filteredSneakers = sneakers.filter((sneaker) => {
    const matchesQuery = !searchQuery || 
      sneaker.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sneaker.brand?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBrand = selectedBrand === 'ALL' || 
      sneaker.brand?.toLowerCase() === selectedBrand.toLowerCase();

    return matchesQuery && matchesBrand;
  });

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      
      {/* 1. HERO BANNER */}
      <section className="mx-3 sm:mx-6 md:mx-12 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800/80 p-6 sm:p-10 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-black text-emerald-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 fill-emerald-400" /> Season Drop 2026
            </span>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white leading-tight">
              Exclusividade <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-white bg-clip-text text-transparent">
                Em Cada Passo
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
              Sua vitrine direta de lançamentos limitados das marcas mais cobiçadas do streetwear global.
            </p>

            <div className="pt-2 flex flex-wrap justify-center lg:justify-start gap-4">
              <a 
                href="#catalog"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-xs font-black text-black uppercase tracking-wider hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                Explorar Coleção <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center relative">
            <div className="relative w-full max-w-xs sm:max-w-sm h-64 sm:h-72 flex items-center justify-center rounded-2xl bg-gradient-to-b from-zinc-800/30 to-transparent border border-zinc-800/50 p-4">
              <img 
                src="https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop" 
                alt="Sneaker Highlight"
                className="max-h-full object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)] -rotate-12 hover:rotate-0 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIS VENDIDOS (CARROSSEL MANUAL) */}
      <section className="mx-3 sm:mx-6 md:mx-12 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-emerald-400 tracking-wider">
              <TrendingUp className="w-4 h-4" /> Bestsellers
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-wide">
              Mais <span className="text-emerald-400">Vendidos</span> da Semana
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollContainer(bestsellersRef, 'left')}
              className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-emerald-500 hover:text-emerald-400 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollContainer(bestsellersRef, 'right')}
              className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-emerald-500 hover:text-emerald-400 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div 
          ref={bestsellersRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-none scroll-smooth pb-4 pt-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loading ? (
            <p className="text-zinc-500 text-xs font-bold py-8">Carregando mais vendidos...</p>
          ) : (
            sneakers.map((sneaker) => (
              <div key={sneaker.id || sneaker._id} className="min-w-[260px] sm:min-w-[300px] flex-shrink-0">
                <SneakerCard sneaker={sneaker} />
              </div>
            ))
          )}
        </div>
      </section>

{/* DROPS EM PROMOÇÃO (ESTEIRA CONTÍNUA) */}
{promoSneakers.length > 0 && (
  <section className="mx-3 sm:mx-6 md:mx-12 rounded-3xl bg-gradient-to-r from-red-950/30 via-zinc-900 to-zinc-900 border border-red-500/20 p-6 space-y-4 overflow-hidden">
    
    {/* Header */}
    <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
      <div className="space-y-0.5">
        <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-red-400 tracking-wider">
          <Percent className="w-4 h-4" /> Ofertas por Tempo Limitado
        </span>
        <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-wide">
          Drops em <span className="text-red-500">Promoção</span>
        </h2>
      </div>
      <span className="text-[10px] font-bold uppercase text-zinc-500 border border-zinc-800 rounded-full px-3 py-1">
        Passe o mouse para pausar
      </span>
    </div>

    {/* Container da Esteira Infinita */}
    <div className="w-full overflow-hidden py-2">
      <div className="animate-infinite-scroll flex gap-4 sm:gap-6">
        {/* Duplicamos a lista para criar a transição contínua perfeita */}
        {[...promoSneakers, ...promoSneakers].map((sneaker, index) => (
          <div key={`${sneaker.id || sneaker._id}-${index}`} className="w-[260px] sm:w-[300px] flex-shrink-0">
            <SneakerCard sneaker={sneaker} />
          </div>
        ))}
      </div>
    </div>

  </section>
      )}

      {/* 4. BANNER DE DIFERENCIAIS */}
      <section className="mx-3 sm:mx-6 md:mx-12 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="flex items-center gap-3.5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 p-4">
          <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0" />
          <div>
            <h4 className="text-xs font-extrabold text-white uppercase">100% Autêntico</h4>
            <p className="text-[10px] text-zinc-400">Inspeção minuciosa</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 p-4">
          <Truck className="w-6 h-6 text-emerald-400 flex-shrink-0" />
          <div>
            <h4 className="text-xs font-extrabold text-white uppercase">Frete Sincronizado</h4>
            <p className="text-[10px] text-zinc-400">Rastreio em tempo real</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 p-4">
          <RefreshCw className="w-6 h-6 text-emerald-400 flex-shrink-0" />
          <div>
            <h4 className="text-xs font-extrabold text-white uppercase">Troca Garantida</h4>
            <p className="text-[10px] text-zinc-400">Até 7 dias corridos</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 p-4">
          <Lock className="w-6 h-6 text-emerald-400 flex-shrink-0" />
          <div>
            <h4 className="text-xs font-extrabold text-white uppercase">Checkout Seguro</h4>
            <p className="text-[10px] text-zinc-400">Pix e Cartão em 10x</p>
          </div>
        </div>
      </section>

      {/* 5. FILTROS DE MARCAS */}
      <section className="mx-3 sm:mx-6 md:mx-12 space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Navegue por Silhueta / Marca</h3>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {['ALL', 'JORDAN', 'NIKE', 'ADIDAS'].map((brand) => {
            const isActive = selectedBrand.toUpperCase() === brand;
            return (
              <button
                key={brand}
                onClick={() => handleBrandFilter(brand)}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 scale-[1.02]'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                {brand === 'ALL' ? 'Todos os Drops' : brand}
              </button>
            );
          })}
        </div>
      </section>

      {/* 6. CATÁLOGO COMPLETO */}
      <section id="catalog" className="mx-3 sm:mx-6 md:mx-12 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <h2 className="text-lg sm:text-2xl font-black uppercase tracking-wider text-white">
            {searchQuery ? `Pesquisa: "${searchQuery}"` : 'Todos os Drops'}
          </h2>
          <span className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase">
            {filteredSneakers.length} {filteredSneakers.length === 1 ? 'modelo' : 'modelos'}
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-emerald-400 font-bold flex justify-center items-center gap-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            Sincronizando catálogo...
          </div>
        ) : filteredSneakers.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 space-y-2 rounded-2xl bg-zinc-900/30 border border-zinc-800/80">
            <p className="text-base font-bold text-white">Nenhum sneaker encontrado para os filtros selecionados.</p>
            <button 
              onClick={() => setSearchParams({})}
              className="text-xs font-bold text-emerald-400 hover:underline uppercase"
            >
              Limpar Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredSneakers.map((sneaker) => (
              <SneakerCard key={sneaker.id || sneaker._id} sneaker={sneaker} />
            ))}
          </div>
        )}
      </section>

      {/* 7. NEWSLETTER */}
      <section className="mx-3 sm:mx-6 md:mx-12 rounded-3xl bg-zinc-900 border border-zinc-800 p-8 sm:p-12 text-center space-y-4">
        <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-emerald-400">
          <Flame className="w-4 h-4 fill-emerald-400" /> Acesso Antecipado
        </span>
        <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
          Entre na lista VIP dos próximos Drops
        </h3>

        {newsletterSubscribed ? (
          <div className="inline-flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 rounded-xl">
            <CheckCircle2 className="w-4 h-4" /> E-mail cadastrado com sucesso!
          </div>
        ) : (
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input
              type="email"
              required
              placeholder="Digite seu melhor e-mail..."
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="flex-1 rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-3 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-xl bg-emerald-500 px-6 py-3 text-xs font-black text-black uppercase tracking-wider hover:bg-emerald-400 transition-all"
            >
              Inscrever
            </button>
          </form>
        )}
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-800 pt-12 mx-3 sm:mx-6 md:mx-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs text-zinc-400">
          <div className="space-y-3">
            <Link to="/" className="text-lg font-black uppercase tracking-tighter text-white">
              <span className="text-emerald-400">FLUXO</span> SNEAKERS
            </Link>
            <p className="text-[11px] leading-relaxed">
              Sua vitrine autorizada de cultura streetwear e lançamentos limitados.
            </p>
          </div>
          <div>
            <h5 className="font-extrabold uppercase text-white mb-3">Categorias</h5>
            <ul className="space-y-2">
              <li><button onClick={() => handleBrandFilter('JORDAN')} className="hover:text-emerald-400">Air Jordan</button></li>
              <li><button onClick={() => handleBrandFilter('NIKE')} className="hover:text-emerald-400">Nike Dunk</button></li>
              <li><button onClick={() => handleBrandFilter('ADIDAS')} className="hover:text-emerald-400">Yeezy</button></li>
            </ul>
          </div>
          <div>
            <h5 className="font-extrabold uppercase text-white mb-3">Suporte</h5>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-emerald-400">Políticas de Envio</a></li>
              <li><a href="#" className="hover:text-emerald-400">Trocas e Devoluções</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-extrabold uppercase text-white mb-3">Tecnologia</h5>
            <p className="text-[11px] leading-relaxed">
              Backend C# .NET 8, Banco MongoDB Atlas e Frontend React + Vite.
            </p>
          </div>
        </div>

        <div className="border-t border-zinc-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-[10px] text-zinc-500 uppercase tracking-widest gap-4">
          <span>© 2026 Fluxo Sneakers • Todos os direitos reservados.</span>
          <span>Powered by C# .NET 8 & MongoDB</span>
        </div>
      </footer>

    </div>
  );
}
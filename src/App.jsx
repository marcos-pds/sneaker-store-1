import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ShoppingBag, 
  Zap, 
  X, 
  Trash2, 
  Menu, 
  Search, 
  ChevronRight, 
  Flame 
} from 'lucide-react';
import { CartProvider, useCart } from './context/CartContext';
import { Home } from './pages/Home';
import { Catalog } from './pages/Catalog';
import { ProductDetail } from './pages/ProductDetail';
import { Checkout } from './pages/Checkout';
import { SupportChat } from './components/common/SupportChat';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';

// Componente da Navbar Global
function Navbar() {
  const { cart, cartTotal, isCartOpen, setIsCartOpen, removeFromCart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState('');
  
  const navigate = useNavigate();

  // Processa a busca no menu mobile
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (mobileSearch.trim()) {
      navigate(`/?search=${encodeURIComponent(mobileSearch.trim())}`);
      setIsMenuOpen(false);
      setMobileSearch('');
    } else {
      navigate('/');
    }
  };

  return (
    <>
      {/* Top Banner Promocional */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 px-4 py-1.5 text-center text-[11px] sm:text-xs font-black uppercase tracking-widest text-black flex items-center justify-center gap-2">
        <Zap className="w-3.5 h-3.5 fill-black flex-shrink-0" />
        <span className="truncate">Envio Expresso • Entregas Sincronizadas via Dropshipping</span>
      </div>

      {/* Header Central */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 px-4 md:px-12 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 text-xl sm:text-2xl font-black uppercase tracking-tighter">
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">FLUXO</span>
            <span className="text-white">SNEAKERS</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <Link to="/" className="hover:text-emerald-400 transition-colors">Drops</Link>
            <Link to="/catalog" className="hover:text-emerald-400 transition-colors">Catálogo</Link>
            <Link to="/?search=jordan" className="hover:text-emerald-400 transition-colors">Jordan</Link>
            <Link to="/?search=nike" className="hover:text-emerald-400 transition-colors">Nike</Link>
            <Link to="/?search=adidas" className="hover:text-emerald-400 transition-colors">Adidas</Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 rounded-xl bg-emerald-500 px-3 sm:px-4 py-2 text-xs font-black text-black hover:bg-emerald-400 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline uppercase">Carrinho</span>
            {cart.length > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
                {cart.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-all"
            aria-label="Abrir menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Menu Mobile */}
      {isMenuOpen && (
        <div className="fixed inset-x-0 top-[88px] z-30 bg-zinc-950/95 border-b border-zinc-800 backdrop-blur-xl p-6 md:hidden">
          <div className="space-y-6">
            
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar tênis ou marca... (pressione Enter)"
                value={mobileSearch}
                onChange={(e) => setMobileSearch(e.target.value)}
                className="w-full rounded-xl bg-zinc-900 border border-zinc-800 py-2.5 pl-9 pr-4 text-xs font-medium text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
              />
            </form>

            <nav className="flex flex-col space-y-3 font-black text-sm uppercase tracking-wider text-zinc-300">
              <Link 
                to="/" 
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:text-emerald-400"
              >
                <span className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-emerald-400" /> Todos os Drops
                </span>
                <ChevronRight className="w-4 h-4 text-zinc-600" />
              </Link>
              <Link 
                to="/catalog" 
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:text-emerald-400"
              >
                <span>Catálogo Completo</span>
                <ChevronRight className="w-4 h-4 text-zinc-600" />
              </Link>
              <Link 
                to="/?search=jordan" 
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:text-emerald-400"
              >
                <span>Jordan</span>
                <ChevronRight className="w-4 h-4 text-zinc-600" />
              </Link>
              <Link 
                to="/?search=nike" 
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:text-emerald-400"
              >
                <span>Nike</span>
                <ChevronRight className="w-4 h-4 text-zinc-600" />
              </Link>
              <Link 
                to="/?search=adidas" 
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:text-emerald-400"
              >
                <span>Adidas</span>
                <ChevronRight className="w-4 h-4 text-zinc-600" />
              </Link>
            </nav>
          </div>
        </div>
      )}

      {/* Drawer do Carrinho Lateral */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border-l border-zinc-800 p-6 flex flex-col justify-between h-full shadow-2xl">
            <div>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-black text-lg uppercase tracking-wide">Seu Carrinho</h3>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="py-20 text-center text-zinc-500 space-y-2">
                  <ShoppingBag className="w-12 h-12 mx-auto stroke-1" />
                  <p className="text-sm font-medium">Seu carrinho está vazio.</p>
                </div>
              ) : (
                <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  {cart.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-xl bg-zinc-800/60 p-3 border border-zinc-700/50"
                    >
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-white line-clamp-1">{item.title}</p>
                        <p className="text-xs text-zinc-400">
                          Tam: <span className="text-emerald-400 font-bold">{item.selectedSize}</span>
                        </p>
                        <p className="text-sm font-black text-white">
                          R$ {item.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(index)}
                        className="text-zinc-500 hover:text-red-400 p-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-zinc-800 pt-4 space-y-4">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-zinc-400 uppercase">Subtotal:</span>
                  <span className="text-xl text-white font-extrabold">
                    R$ {cartTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <Link
                  to="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="block w-full text-center rounded-xl bg-emerald-500 py-3.5 text-sm font-black text-black uppercase tracking-wider hover:bg-emerald-400 active:scale-98 shadow-lg shadow-emerald-500/20"
                >
                  Finalizar Compra
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// Componente Principal do App
export function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-emerald-500 selection:text-black relative">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/admin" element={<AdminLogin />} />
           <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
          <SupportChat />
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
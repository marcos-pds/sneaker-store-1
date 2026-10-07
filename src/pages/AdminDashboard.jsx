import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  Pencil, 
  X, 
  DollarSign, 
  Package, 
  LogOut, 
  Tag, 
  Truck, 
  Send, 
  CheckCircle2, 
  Clock, 
  ShoppingBag,
  Sparkles,
  Link as LinkIcon,
  Eye,
  EyeOff,
  Check,
  ImagePlus,
  Percent
} from 'lucide-react';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'orders'

  // Estados de Produtos
  const [sneakers, setSneakers] = useState([]);
  const [loadingSneakers, setLoadingSneakers] = useState(true);
  const [editingId, setEditingId] = useState(null);

  // Estados do Formulário de Produtos
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('NIKE');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [isOnSale, setIsOnSale] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageUrls, setImageUrls] = useState([]);
  const [sizes, setSizes] = useState('38, 39, 40, 41, 42');
  const [description, setDescription] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  // Estado da Importação Automática AliExpress
  const [aliExpressUrl, setAliExpressUrl] = useState('');
  const [importMargin, setImportMargin] = useState(50);
  const [importing, setImporting] = useState(false);

  // Estados de Pedidos
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [trackingInputs, setTrackingInputs] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin');
      return;
    }
    fetchSneakers();
    fetchOrders();
  }, [navigate]);

  const fetchSneakers = () => {
    fetch('https://localhost:7219/api/sneaker')
      .then((res) => res.json())
      .then((data) => {
        setSneakers(data);
        setLoadingSneakers(false);
      })
      .catch(() => setLoadingSneakers(false));
  };

  const fetchOrders = () => {
    fetch('https://localhost:7219/api/order')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setOrders(data);
        setLoadingOrders(false);
      })
      .catch(() => setLoadingOrders(false));
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setBrand('NIKE');
    setPrice('');
    setOriginalPrice('');
    setIsOnSale(false);
    setImageUrlInput('');
    setImageUrls([]);
    setSizes('38, 39, 40, 41, 42');
    setDescription('');
    setIsPublished(true);
  };

  // Inicia edição do produto (rascunho ou publicado)
  const handleStartEdit = (sneaker) => {
    const productId = sneaker.id || sneaker._id;
    setEditingId(productId);
    setTitle(sneaker.title || '');
    setBrand(sneaker.brand?.toUpperCase() || 'NIKE');
    setPrice(sneaker.price || '');
    
    // Configura o desconto se houver preço original
    if (sneaker.originalPrice && sneaker.originalPrice > sneaker.price) {
      setOriginalPrice(sneaker.originalPrice);
      setIsOnSale(true);
    } else {
      setOriginalPrice('');
      setIsOnSale(false);
    }

    setImageUrlInput('');
    const imgs = sneaker.imageUrls && sneaker.imageUrls.length > 0 
      ? sneaker.imageUrls 
      : (sneaker.imageUrl ? [sneaker.imageUrl] : []);
    setImageUrls(imgs);
    
    setSizes(sneaker.sizes ? sneaker.sizes.join(', ') : '38, 39, 40, 41, 42');
    setDescription(sneaker.description || '');
    setIsPublished(sneaker.isPublished !== false);
  };

  // Adicionar foto manualmente
  const handleAddImageUrl = (e) => {
    e.preventDefault();
    if (!imageUrlInput.trim()) return;
    
    setImageUrls((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  // Remover foto específica
  const handleRemoveImage = (indexToRemove) => {
    setImageUrls((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Salvar/Publicar Produto
  const handleSaveProduct = (e) => {
    e.preventDefault();
    const finalPrice = parseFloat(price);
    const finalOriginalPrice = isOnSale && originalPrice ? parseFloat(originalPrice) : null;

    const defaultImg = 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800';
    const mainImg = imageUrls.length > 0 ? imageUrls[0] : defaultImg;

    const productData = {
      title,
      brand,
      price: finalPrice,
      originalPrice: finalOriginalPrice,
      imageUrl: mainImg,
      imageUrls: imageUrls.length > 0 ? imageUrls : [defaultImg],
      sizes: sizes.split(',').map((s) => parseInt(s.trim())).filter((n) => !isNaN(n)),
      description,
      isPublished: isPublished,
      isNew: true
    };

    const isEdit = !!editingId;
    const url = isEdit
      ? `https://localhost:7219/api/sneaker/${editingId}`
      : 'https://localhost:7219/api/sneaker';
    const method = isEdit ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    })
      .then((res) => {
        if (res.ok) {
          alert(isPublished ? 'Produto publicado na loja com sucesso!' : 'Rascunho atualizado!');
          resetForm();
          fetchSneakers();
        } else {
          alert('Erro ao salvar produto.');
        }
      })
      .catch((err) => console.error(err));
  };

  // Importar Produto do AliExpress
  const handleImportFromAliExpress = (e) => {
    e.preventDefault();
    if (!aliExpressUrl) return alert('Cole uma URL do AliExpress.');

    setImporting(true);
    const endpoint = `https://localhost:7219/api/sneaker/import-aliexpress?url=${encodeURIComponent(aliExpressUrl)}&margin=${importMargin}`;

    fetch(endpoint, { method: 'POST' })
      .then(async (res) => {
        if (res.ok) {
          const newSneaker = await res.json();
          alert('Produto importado como RASCUNHO! Revise o título, fotos e descrição antes de publicar.');
          setAliExpressUrl('');
          fetchSneakers();
          handleStartEdit(newSneaker);
        } else {
          const errText = await res.text();
          alert(`Falha na importação: ${errText}`);
        }
      })
      .catch(() => alert('Erro na requisição.'))
      .finally(() => setImporting(false));
  };

  // Excluir Produto
  const handleDeleteProduct = (sneaker) => {
    const productId = sneaker.id || sneaker._id;
    if (!productId || !window.confirm(`Remover "${sneaker.title}"?`)) return;

    fetch(`https://localhost:7219/api/sneaker/${productId}`, { method: 'DELETE' })
      .then((res) => {
        if (res.ok) {
          setSneakers((prev) => prev.filter((item) => (item.id || item._id) !== productId));
          if (editingId === productId) resetForm();
        }
      })
      .catch((err) => console.error(err));
  };

  // Disparar Pedido Fornecedor
  const handleSendToSupplier = (orderId) => {
    fetch(`https://localhost:7219/api/order/${orderId}/send-supplier`, { method: 'POST' })
      .then((res) => {
        if (res.ok) {
          alert('Pedido repassado ao fornecedor!');
          fetchOrders();
        }
      });
  };

  // Salvar Código Rastreio
  const handleUpdateTracking = (orderId) => {
    const trackingCode = trackingInputs[orderId];
    if (!trackingCode) return alert('Digite o rastreio.');

    fetch('https://localhost:7219/api/webhooks/supplier/tracking-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ supplierOrderId: orderId, trackingCode })
    }).then((res) => {
      if (res.ok) {
        alert('Rastreio atualizado!');
        fetchOrders();
      }
    });
  };

  const draftSneakers = sneakers.filter((s) => s.isPublished === false);
  const publishedSneakers = sneakers.filter((s) => s.isPublished !== false);

  return (
    <div className="mx-3 sm:mx-6 md:mx-12 my-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase text-white">
            Painel <span className="text-emerald-400">Administrativo</span>
          </h1>
          <p className="text-xs text-zinc-400">Curadoria de produtos importados e gestão de estoque.</p>
        </div>
        <button
          onClick={() => { localStorage.removeItem('adminToken'); navigate('/admin'); }}
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2 text-xs font-bold text-zinc-400 hover:text-red-400 transition-all self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 space-y-1">
          <span className="text-xs font-bold uppercase text-zinc-400">Publicados na Loja</span>
          <p className="text-2xl font-black text-emerald-400">{publishedSneakers.length}</p>
        </div>

        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 space-y-1">
          <span className="text-xs font-bold uppercase text-amber-400">Aguardando Curadoria (Rascunhos)</span>
          <p className="text-2xl font-black text-amber-400">{draftSneakers.length}</p>
        </div>

        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 space-y-1">
          <span className="text-xs font-bold uppercase text-zinc-400">Pedidos Totais</span>
          <p className="text-2xl font-black text-white">{orders.length}</p>
        </div>

        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 space-y-1">
          <span className="text-xs font-bold uppercase text-zinc-400">Aguardando Rastreio</span>
          <p className="text-2xl font-black text-white">{orders.filter((o) => !o.trackingCode).length}</p>
        </div>
      </div>

      {/* Navegação por Abas */}
      <div className="flex gap-2 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${
            activeTab === 'inventory'
              ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
              : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          Catálogo & Curadoria ({draftSneakers.length > 0 ? `${draftSneakers.length} Rascunhos` : 'OK'})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${
            activeTab === 'orders'
              ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
              : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          Pedidos & Dropshipping ({orders.length})
        </button>
      </div>

      {/* ABA 1: CURADORIA & ESTOQUE */}
      {activeTab === 'inventory' && (
        <div className="space-y-8">
          {/* MÓDULO IMPORTADOR */}
          <div className="rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-emerald-950/30 border border-emerald-500/30 p-6 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-black uppercase text-white">Importar do AliExpress para Curadoria</h3>
            </div>
            <p className="text-xs text-zinc-400">
              O produto será importado como **Rascunho**. Você poderá revisar fotos, editar a descrição e aplicar preços com desconto antes de publicar na loja.
            </p>

            <form onSubmit={handleImportFromAliExpress} className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="flex-1 relative">
                <LinkIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
                <input
                  type="url"
                  required
                  placeholder="https://pt.aliexpress.com/item/100500..."
                  value={aliExpressUrl}
                  onChange={(e) => setAliExpressUrl(e.target.value)}
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 pl-9 pr-3 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="w-full sm:w-32">
                <input
                  type="number"
                  placeholder="Margem %"
                  value={importMargin}
                  onChange={(e) => setImportMargin(e.target.value)}
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={importing}
                className="rounded-xl bg-emerald-500 px-6 py-2.5 text-xs font-black text-black uppercase hover:bg-emerald-400 transition-all disabled:opacity-50"
              >
                {importing ? 'Importando...' : 'Importar para Curadoria'}
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* FORMULÁRIO DE CURADORIA E EDIÇÃO */}
            <div className="lg:col-span-6 rounded-3xl bg-zinc-900 border border-zinc-800 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-black uppercase text-white flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-emerald-400" />
                  {editingId ? 'Curadoria & Edição de Produto' : 'Cadastrar Produto Manual'}
                </h3>
                {editingId && (
                  <button onClick={resetForm} className="text-[10px] font-bold uppercase text-zinc-400 flex items-center gap-1">
                    <X className="w-3.5 h-3.5" /> Cancelar
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-zinc-400 uppercase">Título Comercial na Loja</label>
                  <input
                    required
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Nike Air Jordan 1 High OG Chicago"
                    className="w-full mt-1 rounded-xl bg-zinc-950 border border-zinc-800 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-zinc-400 uppercase">Marca</label>
                    <select
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full mt-1 rounded-xl bg-zinc-950 border border-zinc-800 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="JORDAN">Jordan</option>
                      <option value="NIKE">Nike</option>
                      <option value="ADIDAS">Adidas</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-zinc-400 uppercase">Preço Final  (R$)</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Ex: 799.90"
                      className="w-full mt-1 rounded-xl bg-zinc-950 border border-zinc-800 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* BLOCO DE PREÇO DE DESCONTO (DE / POR) */}
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isOnSale}
                      onChange={(e) => setIsOnSale(e.target.checked)}
                      className="rounded accent-emerald-500 h-4 w-4 cursor-pointer"
                    />
                    <Tag className="w-4 h-4 text-red-400" /> Aplicar Desconto (Preço "De / Por")
                  </label>

                  {isOnSale && (
                    <div className="pt-1 space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Preço Original sem Desconto (Preço "De")</label>
                      <input
                        required={isOnSale}
                        type="number"
                        step="0.01"
                        placeholder="Ex: 1199.90 (Aparecerá riscado na vitrine)"
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-2 text-white focus:border-red-500 focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* ADICIONAR FOTOS MANUALMENTE */}
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                  <label className="font-bold text-zinc-400 uppercase flex items-center gap-1.5 text-xs">
                    <ImagePlus className="w-4 h-4 text-emerald-400" /> Adicionar Foto (Cole a URL da Imagem)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://exemplo.com/foto-tenis.jpg"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      className="flex-1 rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="rounded-xl bg-zinc-800 hover:bg-zinc-700 px-3 py-2 text-xs font-bold text-white uppercase transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Incluir
                    </button>
                  </div>

                  {/* THUMBNAILS DAS FOTOS */}
                  {imageUrls.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold uppercase text-zinc-500">
                        {imageUrls.length} {imageUrls.length === 1 ? 'Foto carregada' : 'Fotos carregadas'} (A primeira é a capa):
                      </span>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {imageUrls.map((img, idx) => (
                          <div key={idx} className="relative group h-20 w-20 flex-shrink-0 rounded-xl bg-zinc-900 border border-zinc-800 p-1">
                            <img src={img} alt={`Foto ${idx}`} className="h-full w-full object-contain rounded-lg" />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-transform hover:scale-110"
                              title="Remover esta foto"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Descrição Personalizada */}
                <div>
                  <label className="font-bold text-zinc-400 uppercase">Descrição do Produto (Persuasiva / Lojas BR)</label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Escreva uma descrição atraente..."
                    className="w-full mt-1 rounded-xl bg-zinc-950 border border-zinc-800 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-400 uppercase">Tamanhos BR (separados por vírgula)</label>
                  <input
                    type="text"
                    value={sizes}
                    onChange={(e) => setSizes(e.target.value)}
                    className="w-full mt-1 rounded-xl bg-zinc-950 border border-zinc-800 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Status de Publicação */}
                <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isPublished ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-amber-400" />}
                    <span className="text-xs font-bold text-white uppercase">
                      {isPublished ? 'Visível na Loja (Publicado)' : 'Modo Rascunho (Oculto)'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="h-5 w-5 rounded accent-emerald-500 cursor-pointer"
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 ${
                    isPublished ? 'bg-emerald-500 text-black' : 'bg-amber-400 text-black'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  {isPublished ? 'Publicar Tênis na Loja' : 'Salvar como Rascunho'}
                </button>
              </form>
            </div>

            {/* LISTA DE ESTOQUE E RASCUNHOS */}
            <div className="lg:col-span-6 space-y-6">
              {/* Rascunhos Pendentes */}
              {draftSneakers.length > 0 && (
                <div className="rounded-3xl bg-amber-500/10 border border-amber-500/30 p-6 space-y-4">
                  <h3 className="text-sm font-black uppercase text-amber-400 flex items-center gap-2">
                    <EyeOff className="w-4 h-4" /> Importados Aguardando Curadoria ({draftSneakers.length})
                  </h3>

                  <div className="space-y-3 max-h-[260px] overflow-y-auto">
                    {draftSneakers.map((s) => (
                      <div key={s.id || s._id} className="flex items-center justify-between rounded-2xl bg-zinc-950 border border-amber-500/20 p-3">
                        <div className="flex items-center gap-3">
                          <img src={s.imageUrl} alt={s.title} className="h-12 w-12 object-contain bg-zinc-900 rounded-xl p-1" />
                          <div>
                            <p className="text-xs font-bold text-white line-clamp-1">{s.title}</p>
                            <p className="text-[10px] text-amber-400 font-bold uppercase">R$ {s.price} • Pendente</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleStartEdit(s)}
                          className="px-3 py-1.5 rounded-xl bg-amber-400 text-black text-[10px] font-black uppercase"
                        >
                          Revisar & Publicar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Publicados na Loja */}
              <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 space-y-4">
                <h3 className="text-sm font-black uppercase text-white">Produtos Publicados no Catálogo</h3>

                {loadingSneakers ? (
                  <p className="text-xs text-zinc-500">Sincronizando produtos...</p>
                ) : (
                  <div className="space-y-3 max-h-[420px] overflow-y-auto">
                    {publishedSneakers.map((s) => {
                      const productId = s.id || s._id;
                      return (
                        <div key={productId} className="flex items-center justify-between rounded-2xl bg-zinc-950 border border-zinc-800/80 p-3">
                          <div className="flex items-center gap-3">
                            <img src={s.imageUrl} alt={s.title} className="h-12 w-12 object-contain bg-zinc-900 rounded-xl p-1" />
                            <div>
                              <p className="text-xs font-bold text-white line-clamp-1">{s.title}</p>
                              <p className="text-[10px] text-zinc-500 font-bold uppercase">
                                {s.brand} • R$ {s.price} 
                                {s.originalPrice && <span className="text-red-400 font-bold ml-1 line-through">R$ {s.originalPrice}</span>}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleStartEdit(s)} className="p-2 rounded-xl text-zinc-500 hover:text-white">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteProduct(s)} className="p-2 rounded-xl text-zinc-500 hover:text-red-400">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: PEDIDOS */}
      {activeTab === 'orders' && (
        <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 space-y-6">
          <h3 className="text-sm font-black uppercase text-white">Gestão de Pedidos e Rastreio</h3>
          {orders.map((order) => (
            <div key={order.id || order._id} className="rounded-2xl bg-zinc-950 border border-zinc-800 p-4 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-white">{order.customerName}</p>
                <p className="text-[10px] text-zinc-500">Status: {order.paymentStatus}</p>
              </div>
              <button onClick={() => handleSendToSupplier(order.id || order._id)} className="px-3 py-1.5 bg-emerald-500 text-black text-xs font-bold rounded-xl uppercase">
                Enviar Fornecedor
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
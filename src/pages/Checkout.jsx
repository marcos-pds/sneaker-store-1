import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { QrCode, CreditCard, Copy, CheckCircle2, ShieldCheck, Check, MapPin, Phone } from 'lucide-react';

export function Checkout() {
  const cartContext = useCart();
  const items = cartContext.cartItems || cartContext.cart || cartContext.items || [];
  const clearCart = cartContext.clearCart || cartContext.clear;

  const calculatedTotal = items.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);
  const totalPrice = cartContext.totalPrice || calculatedTotal;

  // Método de pagamento: 'pix' ou 'card'
  const [paymentMethod, setPaymentMethod] = useState('pix');

  // Dados do comprador
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCpf, setCustomerCpf] = useState('');

  // Endereço detalhado
  const [zipCode, setZipCode] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  // Dados do Cartão
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [installments, setInstallments] = useState(1);

  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState(null);
  const [cardSuccess, setCardSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [paymentApproved, setPaymentApproved] = useState(false);

  const BASE_API_URL = 'https://localhost:7219';

  // Busca automática do CEP via ViaCEP
  const handleZipCodeBlur = async () => {
    const cleanCep = zipCode.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setStreet(data.logradouro || '');
          setNeighborhood(data.bairro || '');
          setCity(data.localidade || '');
          setState(data.uf || '');
        }
      } catch (e) {
        console.warn('Erro ao consultar ViaCEP');
      }
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!items || items.length === 0) return alert('Seu carrinho está vazio.');

    setLoading(true);

    try {
      let orderId = 'ORDER-' + Date.now();

      // 1. Grava o pedido completo com endereço e contato no MongoDB
      try {
        const orderPayload = {
          customerName: customerName || 'Marcos Santos',
          customerEmail: customerEmail || 'comprador.teste@email.com',
          customerPhone: customerPhone || '31999999999',
          customerCpf: customerCpf || '19100000000',
          shippingAddress: {
            zipCode,
            street,
            number,
            complement,
            neighborhood,
            city,
            state
          },
          items,
          totalAmount: totalPrice,
          paymentStatus: 'Pending'
        };

        const orderRes = await fetch(`${BASE_API_URL}/api/order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload)
        });

        if (orderRes.ok) {
          const order = await orderRes.json();
          orderId = order.id || order._id || orderId;
        }
      } catch (dbErr) {
        console.warn('MongoDB offline. Prosseguindo com ID temporário.');
      }

      // 2. Processa pagamento
      if (paymentMethod === 'pix') {
        const paymentPayload = {
          orderId,
          customerName,
          customerEmail,
          customerCpf,
          amount: totalPrice
        };

        const res = await fetch(`${BASE_API_URL}/api/payment/create-pix`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(paymentPayload)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Falha ao gerar PIX');

        setPixData(data);
        if (clearCart) clearCart();
      } else {
        const cleanCardNumber = cardNumber.replace(/\s/g, '');
        const parts = cardExpiry.split('/');
        const expMonth = (parts[0] || '').trim().padStart(2, '0');
        const yearRaw = (parts[1] || '').trim();
        const expYear = yearRaw.length === 2 ? '20' + yearRaw : yearRaw;
        const detectedMethodId = cleanCardNumber.startsWith('4') ? 'visa' : 'master';

        const cardPayload = {
          orderId,
          amount: totalPrice,
          cardNumber: cleanCardNumber,
          cardholderName: cardName || 'APRO SILVA',
          expirationMonth: expMonth,
          expirationYear: expYear,
          securityCode: cardCvc,
          paymentMethodId: detectedMethodId,
          installments: Number(installments),
          customerEmail: customerEmail || 'comprador.teste@email.com',
          customerName: customerName || 'APRO SILVA',
          customerCpf: customerCpf || '19100000000'
        };

        const res = await fetch(`${BASE_API_URL}/api/payment/create-card`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cardPayload)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || data.message || 'Falha ao processar cartão');

        if (data.status === 'approved') {
          setCardSuccess(true);
          if (clearCart) clearCart();
        } else {
          alert(`Status do Pagamento: ${data.status} (${data.statusDetail || 'Aguardando aprovação'})`);
        }
      }
    } catch (err) {
      console.error('[Checkout Error]:', err);
      alert(`Erro ao processar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPix = () => {
    if (pixData?.qrCodeCopyPaste) {
      navigator.clipboard.writeText(pixData.qrCodeCopyPaste);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSimulateApproval = async () => {
    if (!pixData?.paymentId) return;

    try {
      setLoading(true);
      await fetch(`${BASE_API_URL}/api/payment/webhook?type=payment&data.id=${pixData.paymentId}`, {
        method: 'POST'
      });
      setPaymentApproved(true);
    } catch (err) {
      alert('Erro ao simular aprovação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-3 sm:mx-6 md:mx-12 my-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl sm:text-3xl font-black uppercase text-white">
        Finalizar <span className="text-emerald-400">Pagamento</span>
      </h1>

      {!pixData && !cardSuccess ? (
        <form onSubmit={handleCheckout} className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-7 space-y-6">
            {/* Forma de Pagamento */}
            <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 space-y-4">
              <h3 className="text-xs font-black uppercase text-white tracking-wider">Forma de Pagamento</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  className={`p-4 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    paymentMethod === 'pix'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400'
                  }`}
                >
                  <QrCode className="w-4 h-4" /> PIX
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    paymentMethod === 'card'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400'
                  }`}
                >
                  <CreditCard className="w-4 h-4" /> Cartão de Crédito
                </button>
              </div>
            </div>

            {/* Dados do Comprador */}
            <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 space-y-4">
              <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Dados do Comprador
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-zinc-400 uppercase">Nome Completo</label>
                  <input
                    required
                    type="text"
                    placeholder="Ex: Marcos Santos"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full mt-1 rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-zinc-400 uppercase">E-mail</label>
                    <input
                      required
                      type="email"
                      placeholder="cliente@email.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full mt-1 rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-zinc-400 uppercase flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-400" /> Telefone / WhatsApp
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="(31) 99999-9999"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full mt-1 rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-zinc-400 uppercase">CPF</label>
                  <input
                    required
                    type="text"
                    placeholder="000.000.000-00"
                    value={customerCpf}
                    onChange={(e) => setCustomerCpf(e.target.value)}
                    className="w-full mt-1 rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Endereço de Entrega Detalhado */}
            <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 space-y-4">
              <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" /> Endereço de Entrega
              </h3>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="font-bold text-zinc-400 uppercase">CEP</label>
                    <input
                      required
                      type="text"
                      placeholder="30100-000"
                      value={zipCode}
                      onBlur={handleZipCodeBlur}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="w-full mt-1 rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="font-bold text-zinc-400 uppercase">Rua / Logradouro</label>
                    <input
                      required
                      type="text"
                      placeholder="Av. Principal"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full mt-1 rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-zinc-400 uppercase">Número</label>
                    <input
                      required
                      type="text"
                      placeholder="123"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      className="w-full mt-1 rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="font-bold text-zinc-400 uppercase">Complemento</label>
                    <input
                      type="text"
                      placeholder="Apto 101, Bloco B (Opcional)"
                      value={complement}
                      onChange={(e) => setComplement(e.target.value)}
                      className="w-full mt-1 rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-zinc-400 uppercase">Bairro</label>
                    <input
                      required
                      type="text"
                      placeholder="Centro"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      className="w-full mt-1 rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-zinc-400 uppercase">Cidade</label>
                    <input
                      required
                      type="text"
                      placeholder="Belo Horizonte"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full mt-1 rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-zinc-400 uppercase">UF</label>
                    <input
                      required
                      maxLength={2}
                      type="text"
                      placeholder="MG"
                      value={state}
                      onChange={(e) => setState(e.target.value.toUpperCase())}
                      className="w-full mt-1 rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-white focus:border-emerald-500 focus:outline-none text-center"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Cartão de Crédito */}
            {paymentMethod === 'card' && (
              <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 space-y-4">
                <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" /> Dados do Cartão
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-zinc-400 uppercase">Número do Cartão</label>
                    <input
                      required
                      type="text"
                      placeholder="4235 6477 2802 5682"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full mt-1 rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-zinc-400 uppercase">Nome Impresso no Cartão</label>
                    <input
                      required
                      type="text"
                      placeholder="APRO SILVA"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full mt-1 rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-zinc-400 uppercase">Validade</label>
                      <input
                        required
                        type="text"
                        placeholder="11/30"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full mt-1 rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-zinc-400 uppercase">CVC</label>
                      <input
                        required
                        type="text"
                        placeholder="123"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full mt-1 rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-zinc-400 uppercase">Parcelas</label>
                      <select
                        value={installments}
                        onChange={(e) => setInstallments(e.target.value)}
                        className="w-full mt-1 rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-white focus:border-emerald-500 focus:outline-none"
                      >
                        <option value={1}>1x sem juros</option>
                        <option value={2}>2x sem juros</option>
                        <option value={3}>3x sem juros</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Resumo da Compra */}
          <div className="md:col-span-5 rounded-3xl bg-zinc-900 border border-zinc-800 p-6 space-y-4">
            <h3 className="text-xs font-black uppercase text-white tracking-wider">Resumo da Compra</h3>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {items && items.length > 0 ? (
                items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="text-zinc-300 font-medium line-clamp-1">{item.title}</span>
                    <span className="text-white font-bold">R$ {(item.price || 0).toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-500">Nenhum item no carrinho.</p>
              )}
            </div>

            <div className="border-t border-zinc-800 pt-3 flex justify-between items-center">
              <span className="text-xs font-black text-white uppercase">Total a Pagar</span>
              <span className="text-xl font-black text-emerald-400">R$ {totalPrice.toFixed(2)}</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs tracking-wider transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {loading
                ? 'Processando...'
                : paymentMethod === 'pix'
                ? 'Gerar QR Code PIX'
                : 'Pagar com Cartão'}
            </button>
          </div>
        </form>
      ) : cardSuccess ? (
        <div className="max-w-md mx-auto rounded-3xl bg-zinc-900 border border-emerald-500/30 p-8 text-center space-y-4">
          <div className="inline-flex p-4 rounded-full bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-xl font-black uppercase text-white">Pagamento Aprovado!</h2>
          <p className="text-xs text-zinc-400">
            Seu pedido foi registrado com endereço completo e status <span className="text-emerald-400 font-bold">PAID</span>.
          </p>
        </div>
      ) : (
        <div className="max-w-md mx-auto rounded-3xl bg-zinc-900 border border-emerald-500/30 p-8 text-center space-y-6">
          {!paymentApproved ? (
            <>
              <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-400">
                <QrCode className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-lg font-black uppercase text-white">PIX Gerado com Sucesso!</h2>
                <p className="text-xs text-zinc-400 mt-1">Escaneie o QR Code abaixo com o app do seu banco ou use o Copia e Cola.</p>
                {pixData?.paymentId && (
                  <span className="inline-block mt-2 px-3 py-1 bg-zinc-950 rounded-lg text-[10px] text-zinc-500 font-mono">
                    ID PIX: {pixData.paymentId}
                  </span>
                )}
              </div>

              {pixData?.qrCodeBase64 && (
                <div className="bg-white p-4 rounded-2xl inline-block shadow-xl">
                  <img src={`data:image/jpeg;base64,${pixData.qrCodeBase64}`} alt="QR Code PIX" className="w-48 h-48 mx-auto" />
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={handleCopyPix}
                  className="w-full py-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-bold text-xs uppercase hover:border-emerald-500 transition-all flex items-center justify-center gap-2"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Código Copiado!' : 'Copiar Chave PIX (Copia e Cola)'}
                </button>

                <button
                  onClick={handleSimulateApproval}
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 font-black text-xs uppercase hover:bg-emerald-500 hover:text-black transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {loading ? 'Aprovando...' : 'Simular Pagamento Aprovado (Sandbox)'}
                </button>
              </div>
            </>
          ) : (
            <div className="py-6 space-y-4">
              <div className="inline-flex p-4 rounded-full bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h2 className="text-xl font-black uppercase text-white">Pagamento Confirmado!</h2>
              <p className="text-xs text-zinc-400">
                O status do seu pedido foi atualizado no banco de dados para <span className="text-emerald-400 font-bold">PAID (Pago)</span>.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
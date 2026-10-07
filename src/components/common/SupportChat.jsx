import React, { useState } from 'react';
import { MessageSquare, X, Send, ChevronRight, HelpCircle, PhoneCall } from 'lucide-react';

export function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  // Pergunta e respostas frequentes para conversão rápida
  const faqs = [
    {
      id: 1,
      question: 'Os produtos são 100% autênticos?',
      answer: 'Sim! Todos os sneakers passam por rigorosa verificação de autenticidade e procedência antes de serem enviados.'
    },
    {
      id: 2,
      question: 'Qual é o prazo de entrega?',
      answer: 'O envio via Dropshipping Direct leva em média de 5 a 10 dias úteis com código de rastreamento enviado via e-mail e WhatsApp.'
    },
    {
      id: 3,
      question: 'Como funciona a troca ou devolução?',
      answer: 'Você tem até 7 dias corridos após o recebimento para solicitar a troca do tamanho ou devolução gratuita.'
    },
    {
      id: 4,
      question: 'Quais as formas de pagamento aceitas?',
      answer: 'Aceitamos Pix (com aprovação instantânea e desconto de lançamento) e Cartão de Crédito em até 10x.'
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Janela de Chat Aberta */}
      {isOpen && (
        <div className="mb-4 w-[340px] sm:w-[380px] rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          
          {/* Header do Chat */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 flex items-center justify-between text-black">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-9 w-9 rounded-full bg-black text-emerald-400 font-black text-xs flex items-center justify-center border border-emerald-400">
                  FS
                </div>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-zinc-900" />
              </div>
              <div>
                <h4 className="font-black text-sm uppercase tracking-wide">Suporte Fluxo</h4>
                <p className="text-[10px] font-bold uppercase opacity-80">Atendimento Automático & FAQ</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl hover:bg-black/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Conteúdo do Chat */}
          <div className="p-4 space-y-4 max-h-[380px] overflow-y-auto">
            
            {/* Mensagem de Boas-Vindas */}
            <div className="bg-zinc-800/80 rounded-2xl p-3.5 text-xs text-zinc-300 border border-zinc-700/50 space-y-1">
              <p className="font-bold text-white">Olá! 👋 Seja bem-vindo à Fluxo Sneakers.</p>
              <p>Como podemos te ajudar no seu Drop hoje? Escolha uma dúvida abaixo ou fale com nossa equipe.</p>
            </div>

            {/* Lista de FAQs Interativas */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Dúvidas Frequentes</p>
              
              {faqs.map((faq) => (
                <div key={faq.id} className="rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden">
                  <button
                    onClick={() => setActiveFaq(activeFaq === faq.id ? null : faq.id)}
                    className="w-full text-left p-3 text-xs font-bold text-zinc-200 flex items-center justify-between hover:text-emerald-400 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      {faq.question}
                    </span>
                    <ChevronRight className={`w-4 h-4 text-zinc-500 transition-transform ${activeFaq === faq.id ? 'rotate-90 text-emerald-400' : ''}`} />
                  </button>

                  {/* Resposta Expansível */}
                  {activeFaq === faq.id && (
                    <div className="px-3 pb-3 pt-1 text-[11px] text-zinc-400 border-t border-zinc-900 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Botão de Direcionamento para WhatsApp */}
            <div className="pt-2 border-t border-zinc-800">
              <a
                href="https://wa.me/5531999999999?text=Olá,%20tenho%20dúvidas%20sobre%20os%20tênis%20na%20Fluxo%20Sneakers!"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-xs font-black text-emerald-400 uppercase hover:bg-emerald-500 hover:text-black transition-all"
              >
                <PhoneCall className="w-3.5 h-3.5" /> Falar com Atendente Humano
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Botão Flutuante Principal (Trigger) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center gap-2 rounded-full bg-emerald-500 p-4 text-black font-black shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 active:scale-95 transition-all"
        aria-label="Abrir suporte"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-300" />
          </span>
        )}
      </button>
    </div>
  );
}
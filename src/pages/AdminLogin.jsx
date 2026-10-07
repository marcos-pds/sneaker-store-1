import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldAlert } from 'lucide-react';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Credenciais administrativas padrão
    if (email === 'admin@fluxo.com' && password === 'admin123') {
      localStorage.setItem('adminToken', 'fluxo_authenticated_session');
      navigate('/admin/dashboard');
    } else {
      setError('E-mail ou senha inválidos.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center mx-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-2">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-white">Painel <span className="text-emerald-400">Admin</span></h1>
          <p className="text-xs text-zinc-400">Acesso restrito para gestão de catálogo e métricas.</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-zinc-400">E-mail Administrativo</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@fluxo.com"
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 py-2.5 pl-9 pr-4 text-xs font-medium text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-zinc-400">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 py-2.5 pl-9 pr-4 text-xs font-medium text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-black text-black uppercase tracking-wider hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
          >
            Acessar Painel <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
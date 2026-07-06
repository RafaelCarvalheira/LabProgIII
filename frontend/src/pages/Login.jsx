import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import RcpLogo from '../components/RcpLogo';

export default function Login() {
  const { login } = useAuth();
  const navigate   = useNavigate();

  const [email, setEmail]       = useState('');
  const [senha, setSenha]       = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [erro, setErro]         = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, senha });
      login(data.token, data.usuario);
      navigate('/', { replace: true });
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao conectar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: '#0B0F1A' }}
    >
      {/* Ambient orbs */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
          top: '-10%',
          left: '-10%',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%)',
          bottom: '-5%',
          right: '5%',
          filter: 'blur(40px)',
        }}
      />

      {/* Grid de fundo sutil */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full max-w-md mx-4"
      >
        {/* Card glass */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'rgba(17,24,39,0.85)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(24px)',
            boxShadow:
              '0 0 0 1px rgba(99,102,241,0.08), 0 24px 64px rgba(0,0,0,0.5)',
          }}
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.35 }}
            className="flex justify-center mb-8"
          >
            <RcpLogo size={52} showText subtitle />
          </motion.div>

          {/* Divider */}
          <div
            className="h-px w-full mb-7"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          />

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 font-body tracking-wide uppercase">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  strokeWidth={1.8}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none"
                />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-body text-slate-200
                             placeholder-slate-600 transition-all duration-150 outline-none"
                />
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 font-body tracking-wide uppercase">
                Senha
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  strokeWidth={1.8}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none"
                />
                <input
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-11 py-3 rounded-xl text-sm font-body text-slate-200
                             placeholder-slate-600 transition-all duration-150 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600
                             hover:text-slate-400 transition-colors"
                >
                  {showPass
                    ? <EyeOff size={15} strokeWidth={1.8} />
                    : <Eye    size={15} strokeWidth={1.8} />
                  }
                </button>
              </div>
            </div>

            {/* Erro */}
            {erro && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-body"
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  color: '#f87171',
                }}
              >
                <span className="text-xs">{erro}</span>
              </motion.div>
            )}

            {/* Botão */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl
                         text-sm font-body font-semibold text-white transition-all duration-150
                         disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              style={{
                background:
                  'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #14b8a6 100%)',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(99,102,241,0.35)',
              }}
            >
              {loading ? (
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  <LogIn size={16} strokeWidth={2} />
                  Entrar
                </>
              )}
            </motion.button>
          </form>

          {/* Rodapé */}
          <p className="text-center text-slate-700 text-[11px] mt-6 font-body">
            Acesso restrito · RCP Data Imob v1.0
          </p>
        </div>
      </motion.div>
    </div>
  );
}

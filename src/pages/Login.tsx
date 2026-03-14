import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import logo from '@/assets/logo-completa.png';
import { toast } from 'sonner';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loginInput, setLoginInput] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginInput || !senha) { toast.error('Preencha usuário e senha.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const ok = login(loginInput, senha);
    setLoading(false);
    if (ok) { navigate('/'); } else { toast.error('Usuário ou senha inválidos.'); }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: '#f5f0e8' }}>
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <img src={logo} alt="Cidade Mais Infância" className="h-24 w-auto" />
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Sistema Ágora</h1>
          <p className="text-gray-500 text-sm">Bem-vindo à Cidade Mais Infância</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Nome do usuário</label>
              <input
                type="text"
                value={loginInput}
                onChange={e => setLoginInput(e.target.value)}
                placeholder="Digite seu nome"
                disabled={loading}
                className="w-full h-11 px-4 rounded-xl border-0 bg-gray-100 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Senha</label>
              <div className="relative">
                <input
                  type={showSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="Digite sua senha"
                  disabled={loading}
                  className="w-full h-11 px-4 pr-11 rounded-xl border-0 bg-gray-100 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowSenha(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#f0a060' }}
            >
              <LogIn className="h-5 w-5" />
              {loading ? 'Verificando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400">
          Acesso restrito a colaboradores autorizados
        </p>
      </div>
    </div>
  );
}

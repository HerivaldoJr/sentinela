import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import logo from '@/assets/logo-completa.png';
import { LayoutDashboard, Upload, Users, Settings, ClipboardCheck, LogOut, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = {
  admin: [
    { label: 'Dashboard',     icon: LayoutDashboard, path: '/admin' },
    { label: 'Importar Dados',icon: Upload,           path: '/admin/importar' },
    { label: 'Usuários',      icon: Users,            path: '/admin/usuarios' },
    { label: 'Relatórios',    icon: Settings,         path: '/admin/relatorios' },
  ],
  coordenador: [
    { label: 'Painel em Tempo Real', icon: LayoutDashboard, path: '/coordenador' },
  ],
  recreador: [
    { label: 'Check-in', icon: ClipboardCheck, path: '/recreador' },
  ],
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;
  const navItems = NAV_ITEMS[user.role] || [];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="p-4 pb-3">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="h-10 w-10 object-contain rounded-lg" />
            <div>
              <p className="text-sm font-bold text-gray-900 leading-tight">Sentinela</p>
              <p className="text-[11px] text-gray-400">Cidade Mais Infância</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5">
          {navItems.map(item => {
            const active = location.pathname === item.path ||
              (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group',
                  active
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn('h-4 w-4', active ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600')} />
                  <span>{item.label}</span>
                </div>
                {active && <ChevronRight className="h-4 w-4 text-blue-400" />}
              </button>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-3 px-2 py-2 mb-1">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold flex-shrink-0">
              {user.nome.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.nome}</p>
              <p className="text-xs text-gray-400 capitalize">{
                user.role === 'admin' ? 'Admin' :
                user.role === 'coordenador' ? 'Coordenador' : `Recreador${user.guiche ? ` G${user.guiche}` : ''}`
              }</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center gap-3 px-2 py-2 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto min-h-screen bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}

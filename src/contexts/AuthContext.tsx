import { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'admin' | 'coordenador' | 'recreador';

export interface AuthUser {
  id: string;
  nome: string;
  login: string;
  senha: string;
  role: UserRole;
  guiche?: number;
}

// Usuários dinâmicos - começam com apenas admin, podem ser adicionados pela tela de Usuários
let USUARIOS_STORAGE: AuthUser[] = [
  { id: '1', nome: 'Administrador TI', login: 'admin', senha: 'admin123', role: 'admin' },
];

export function getUsuarios(): AuthUser[] {
  return USUARIOS_STORAGE;
}

export function addUsuario(u: AuthUser) {
  USUARIOS_STORAGE = [...USUARIOS_STORAGE, u];
}

export function updateUsuario(id: string, data: Partial<AuthUser>) {
  USUARIOS_STORAGE = USUARIOS_STORAGE.map(u => u.id === id ? { ...u, ...data } : u);
}

export function removeUsuario(id: string) {
  USUARIOS_STORAGE = USUARIOS_STORAGE.filter(u => u.id !== id);
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (login: string, senha: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = sessionStorage.getItem('sentinela_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const login = (loginInput: string, senha: string): boolean => {
    const found = getUsuarios().find(
      u => u.login === loginInput.trim().toLowerCase() && u.senha === senha
    );
    if (!found) return false;
    setUser(found);
    sessionStorage.setItem('sentinela_user', JSON.stringify(found));
    return true;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('sentinela_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

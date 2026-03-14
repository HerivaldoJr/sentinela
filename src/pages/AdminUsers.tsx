import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { getUsuarios, addUsuario, updateUsuario, removeUsuario, AuthUser } from '@/contexts/AuthContext';

const ROLE_LABEL: Record<string, string> = { admin: 'Administrador', coordenador: 'Coordenador', recreador: 'Recreador' };
const ROLE_BADGE: Record<string, string> = {
  admin: 'bg-gray-900 text-white',
  coordenador: 'bg-blue-500 text-white',
  recreador: 'bg-green-500 text-white',
};

export default function AdminUsers() {
  const [users, setUsers] = useState<AuthUser[]>(() => getUsuarios());
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [showSenha, setShowSenha] = useState(false);
  const [form, setForm] = useState({ nome: '', login: '', senha: '', role: 'recreador', guiche: '' });

  const refreshUsers = () => setUsers([...getUsuarios()]);

  const openNew = () => {
    setEditId(null);
    setForm({ nome: '', login: '', senha: '', role: 'recreador', guiche: '' });
    setShowSenha(false);
    setOpen(true);
  };

  const openEdit = (u: AuthUser) => {
    setEditId(u.id);
    setForm({ nome: u.nome, login: u.login, senha: u.senha, role: u.role, guiche: u.guiche?.toString() || '' });
    setShowSenha(false);
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.nome.trim() || !form.login.trim()) { toast.error('Nome e login são obrigatórios.'); return; }
    if (!editId && !form.senha.trim()) { toast.error('Senha é obrigatória.'); return; }
    const loginLower = form.login.trim().toLowerCase();
    if (!editId && getUsuarios().find(u => u.login === loginLower)) { toast.error('Login já existe.'); return; }

    if (editId) {
      updateUsuario(editId, {
        nome: form.nome.trim(), login: loginLower,
        senha: form.senha.trim() || getUsuarios().find(u => u.id === editId)?.senha || '',
        role: form.role as AuthUser['role'],
        guiche: form.role === 'recreador' && form.guiche ? parseInt(form.guiche) : undefined,
      });
      toast.success('Usuário atualizado.');
    } else {
      addUsuario({
        id: crypto.randomUUID(), nome: form.nome.trim(), login: loginLower,
        senha: form.senha.trim(), role: form.role as AuthUser['role'],
        guiche: form.role === 'recreador' && form.guiche ? parseInt(form.guiche) : undefined,
      });
      toast.success('Usuário criado com sucesso.');
    }
    refreshUsers();
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    removeUsuario(id);
    refreshUsers();
    toast.success('Usuário removido.');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Usuários</h1>
          <p className="text-sm text-gray-500 mt-0.5">Criar e gerenciar acessos ao sistema</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
          <Plus className="h-4 w-4" /> Novo Usuário
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['USUÁRIO', 'LOGIN', 'PERFIL', 'GUICHÊ', 'AÇÕES'].map((h, i) => (
                <th key={h} className={`px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider ${i === 4 ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                <td className="px-6 py-4 font-medium text-gray-900">{u.nome}</td>
                <td className="px-6 py-4">
                  <span className="font-mono text-sm text-blue-500">{u.login}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${ROLE_BADGE[u.role]}`}>
                    {ROLE_LABEL[u.role]}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {u.guiche ? `Guichê ${String(u.guiche).padStart(2, '0')}` : '—'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(u)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(u.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded hover:bg-red-50 transition-colors">
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">{editId ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Nome Completo</Label>
              <Input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="francisco" className="bg-gray-50 border-gray-200" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Login (usuário)</Label>
              <Input value={form.login} onChange={e => setForm(f => ({ ...f, login: e.target.value }))} placeholder="francisco" className="bg-gray-50 border-gray-200" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Senha</Label>
              <div className="relative">
                <Input
                  type={showSenha ? 'text' : 'password'}
                  value={form.senha}
                  onChange={e => setForm(f => ({ ...f, senha: e.target.value }))}
                  placeholder={editId ? '(deixe em branco para manter)' : '••••••••••••'}
                  className="bg-gray-50 border-gray-200 pr-10"
                />
                <button type="button" onClick={() => setShowSenha(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Perfil</Label>
              <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v }))}>
                <SelectTrigger className="bg-gray-50 border-gray-200"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="coordenador">Coordenador</SelectItem>
                  <SelectItem value="recreador">Recreador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.role === 'recreador' && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">Guichê (1-6)</Label>
                <Input type="number" min={1} max={6} value={form.guiche}
                  onChange={e => setForm(f => ({ ...f, guiche: e.target.value }))}
                  placeholder="" className="bg-gray-50 border-gray-200" />
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setOpen(false)}
                className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button onClick={handleSave}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors">
                {editId ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Search, UserPlus, Clock, Accessibility } from 'lucide-react';
import CordaoPopup from '@/components/CordaoPopup';
import CadastroManualDialog from '@/components/CadastroManualDialog';
import { GrupoVisita, CordaoColor } from '@/types';
import { toast } from 'sonner';

const CORDAO_BG: Record<string, string> = {
  rosa: 'bg-pink-500', azul: 'bg-blue-500', verde: 'bg-green-500',
  amarelo: 'bg-yellow-400', laranja: 'bg-orange-500', vermelho: 'bg-red-500',
};

function CordaoBadge({ cor }: { cor: CordaoColor }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-white ${CORDAO_BG[cor] || 'bg-gray-400'}`}>
      {cor.charAt(0).toUpperCase() + cor.slice(1)}
    </span>
  );
}

export default function RecreadorPanel() {
  const { user } = useAuth();
  const { grupos, realizarCheckin, checkins } = useData();
  const guiche = user?.guiche || 1;

  const [busca, setBusca] = useState('');
  const [grupoSelecionado, setGrupoSelecionado] = useState<GrupoVisita | null>(null);
  const [cadastroOpen, setCadastroOpen] = useState(false);

  const pendentes = grupos.filter(g => !g.checkinRealizado);
  const meuCheckins = checkins.filter(c => c.guiche === guiche);

  const filtered = pendentes.filter(g => {
    const q = busca.toLowerCase();
    return (
      g.responsavel.nome.toLowerCase().includes(q) ||
      g.responsavel.protocolo.toLowerCase().includes(q) ||
      g.responsavel.contato.includes(q) ||
      g.responsavel.criancas.some(c => c.nome.toLowerCase().includes(q))
    );
  });

  const handleConfirmarCheckin = () => {
    if (!grupoSelecionado) return;
    realizarCheckin(grupoSelecionado.id, guiche);
    const nome = grupoSelecionado.responsavel.nome.toLowerCase();
    const criancas = grupoSelecionado.responsavel.criancas.length;
    toast.success(`Check-in realizado com sucesso no Guichê ${String(guiche).padStart(2, '0')}.\n${nome} — ${criancas} criança(s)`);
    setGrupoSelecionado(null);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Check-in de Visitantes</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Guichê {String(guiche).padStart(2, '0')} — {user?.nome?.toLowerCase()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCadastroOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Cadastro Manual
          </button>
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-center min-w-[90px]">
            <div className="flex items-center justify-center gap-1.5 text-gray-400 mb-0.5">
              <Clock className="h-3.5 w-3.5" />
            </div>
            <p className="text-2xl font-bold text-gray-900 leading-none">{meuCheckins.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">atendidos hoje</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 pb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome do responsável, criança ou telefone..."
            className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
          />
        </div>
      </div>

      {/* Lista */}
      <div className="px-6 space-y-3 pb-6">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">{busca ? 'Nenhum resultado encontrado.' : 'Nenhum grupo pendente de check-in.'}</p>
          </div>
        )}
        {filtered.map(grupo => {
          const cores = grupo.responsavel.criancas.map(c => c.cordaoCor);
          // Adiciona "rosa" para o responsável
          const allCores: CordaoColor[] = ['rosa', ...cores];
          const uniqueCores = [...new Set(allCores)];

          return (
            <div key={grupo.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:border-blue-200 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900 text-sm">
                    {grupo.responsavel.nome}
                  </p>
                  {grupo.responsavel.criancas.some(c => c.pcd) && (
                    <Accessibility className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {grupo.responsavel.contato}
                  {grupo.responsavel.bairro && ` · ${grupo.responsavel.bairro}, ${grupo.responsavel.cidade}`}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {uniqueCores.map((cor, i) => (
                    <CordaoBadge key={i} cor={cor as CordaoColor} />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                <span className="text-xs text-gray-400">{grupo.responsavel.criancas.length} criança(s)</span>
                <button
                  onClick={() => setGrupoSelecionado(grupo)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Check-in
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <CordaoPopup
        grupo={grupoSelecionado}
        guiche={guiche}
        onConfirm={handleConfirmarCheckin}
        onClose={() => setGrupoSelecionado(null)}
      />
      <CadastroManualDialog open={cadastroOpen} onOpenChange={setCadastroOpen} />
    </div>
  );
}

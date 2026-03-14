import { useData } from '@/contexts/DataContext';
import MLInsightsPanel from '@/components/MLInsightsPanel';
import { Users, CheckCircle2, Clock, Accessibility, Activity, BarChart2 } from 'lucide-react';

const CORDOES_CONFIG = [
  { cor: 'azul',     hex: '#3b82f6', label: 'Azul (0-3 anos)' },
  { cor: 'verde',    hex: '#22c55e', label: 'Verde (4-6 anos)' },
  { cor: 'amarelo',  hex: '#eab308', label: 'Amarelo (7-9 anos)' },
  { cor: 'vermelho', hex: '#ef4444', label: 'Vermelho (10-12 an...)' },
  { cor: 'rosa',     hex: '#ec4899', label: 'Rosa (Adulto)' },
  { cor: 'cinza',    hex: '#6b7280', label: 'Cinza (Terceirizado)' },
  { cor: 'preto',    hex: '#111827', label: 'Preto (Serviço)' },
];

export default function CoordenadorPanel() {
  const { stats, checkins, grupos } = useData();

  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const totalNoParque = stats.totalCriancas + stats.totalResponsaveis;

  // Distribuição cordões
  const cordaoMap: Record<string, number> = {};
  CORDOES_CONFIG.forEach(c => { cordaoMap[c.cor] = 0; });
  grupos.forEach(g => g.responsavel.criancas.forEach(c => {
    if (cordaoMap[c.cordaoCor] !== undefined) cordaoMap[c.cordaoCor]++;
  }));
  const maxCordao = Math.max(...Object.values(cordaoMap), 1);

  // Guichês
  const guicheMap: Record<number, number> = {};
  checkins.forEach(c => { guicheMap[c.guiche] = (guicheMap[c.guiche] || 0) + 1; });
  const guiches = Array.from({ length: 6 }, (_, i) => i + 1);

  return (
    <div className="p-6 space-y-5 bg-gray-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Painel de Coordenação</h1>
        <div className="flex items-center gap-1.5 mt-1">
          <Activity className="h-3.5 w-3.5 text-blue-500" />
          <p className="text-sm text-gray-500">Tempo real — {today}</p>
        </div>
      </div>

      {/* Total no Parque - destaque */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">TOTAL NO PARQUE AGORA</p>
        <p className="text-8xl font-black text-gray-900 leading-none">{totalNoParque}</p>
        <p className="text-sm text-gray-400 mt-3">
          {stats.totalResponsaveis} responsáveis + {stats.totalCriancas} crianças
        </p>
      </div>

      {/* 4 mini cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'AGENDADOS',  value: stats.totalVisitantes, icon: Users },
          { label: 'CHECK-INS',  value: stats.checkinHoje,     icon: CheckCircle2 },
          { label: 'PENDENTES',  value: stats.pendentes,       icon: Clock },
          { label: 'PCD',        value: stats.totalPcd,        icon: Accessibility },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
            <Icon className="h-5 w-5 text-gray-400 mb-2" />
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Distribuição por Cor de Cordão */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
          <BarChart2 className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-700">Distribuição por Cor de Cordão</span>
        </div>
        <div className="divide-y divide-gray-50">
          {CORDOES_CONFIG.map(({ cor, hex, label }) => {
            const count = cordaoMap[cor] || 0;
            const pct = (count / maxCordao) * 100;
            return (
              <div key={cor} className="flex items-center gap-4 px-6 py-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: hex }} />
                <span className="text-sm text-gray-600 w-44 flex-shrink-0">{label}</span>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(pct, count > 0 ? 2 : 0)}%`, backgroundColor: hex + 'cc' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Performance por Guichê */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-700">Performance por Guichê</span>
        </div>
        <div className="p-6 grid grid-cols-6 gap-4">
          {guiches.map(g => (
            <div key={g} className="border border-gray-200 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-400 font-medium">Guichê</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{String(g).padStart(2, '0')}</p>
              <p className="text-2xl font-bold text-blue-500 mt-1">{guicheMap[g] || 0}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Distribuição Visual */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-700">Distribuição Visual</span>
        </div>
        <div className="p-6 min-h-[200px] flex items-center justify-center">
          {checkins.length === 0 ? (
            <p className="text-sm text-gray-400">Aguardando check-ins...</p>
          ) : (
            <div className="w-full space-y-2">
              {guiches.filter(g => guicheMap[g]).map(g => {
                const total = checkins.filter(c => c.guiche === g).reduce((a, c) => a + c.totalCriancas + 1, 0);
                const maxTotal = Math.max(...guiches.map(gg => checkins.filter(c => c.guiche === gg).reduce((a, c) => a + c.totalCriancas + 1, 0)), 1);
                return (
                  <div key={g} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-16 flex-shrink-0">Guichê {String(g).padStart(2,'0')}</span>
                    <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${(total / maxTotal) * 100}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 w-6">{total}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Inteligência Operacional ML */}
      <MLInsightsPanel />
    </div>
  );
}

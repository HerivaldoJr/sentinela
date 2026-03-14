import { useData } from '@/contexts/DataContext';
import MLInsightsPanel from '@/components/MLInsightsPanel';
import { Users, Baby, Accessibility, Clock, CheckCircle2, AlertCircle, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CordaoColor } from '@/types';

const CORDAO_COLORS: Record<string, string> = {
  rosa: '#ec4899', azul: '#3b82f6', verde: '#22c55e',
  amarelo: '#eab308', laranja: '#f97316', vermelho: '#ef4444',
};

export default function AdminDashboard() {
  const { stats, checkins, grupos } = useData();

  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  // Distribuição de cordões
  const cordaoMap: Record<string, number> = {};
  grupos.forEach(g => g.responsavel.criancas.forEach(c => {
    cordaoMap[c.cordaoCor] = (cordaoMap[c.cordaoCor] || 0) + 1;
  }));
  const cordaoData = Object.entries(cordaoMap).map(([name, value]) => ({ name, value }));

  // Performance por guichê
  const guicheMap: Record<number, number> = {};
  checkins.forEach(c => { guicheMap[c.guiche] = (guicheMap[c.guiche] || 0) + 1; });
  const guicheData = Object.entries(guicheMap)
    .map(([g, total]) => ({ guiche: `G${String(g).padStart(2, '0')}`, total }))
    .sort((a, b) => a.guiche.localeCompare(b.guiche));

  const ultimosCheckins = checkins.slice(0, 8);

  const topCards = [
    { label: 'TOTAL NO PARQUE', value: stats.totalVisitantes, icon: Users, color: 'text-blue-500' },
    { label: 'CRIANÇAS',        value: stats.totalCriancas,   icon: Baby, color: 'text-green-500' },
    { label: 'RESPONSÁVEIS',    value: stats.totalResponsaveis, icon: Users, color: 'text-pink-500' },
    { label: 'PCD ATENDIDOS',   value: stats.totalPcd,        icon: Accessibility, color: 'text-purple-500' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrativo</h1>
        <p className="text-sm text-gray-500 mt-0.5">Visão geral da operação — {today}</p>
      </div>

      {/* Top 4 cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {topCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Icon className={`h-5 w-5 ${color}`} />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-4xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Pendentes + Check-ins */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-5 w-5 text-orange-400" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">PENDENTES</span>
          </div>
          <p className="text-4xl font-bold text-gray-900">{stats.pendentes}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">CHECK-INS HOJE</span>
          </div>
          <p className="text-4xl font-bold text-gray-900">{stats.checkinHoje}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Distribuição cordões */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="h-4 w-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-700">Distribuição de Cordões</h2>
          </div>
          {cordaoData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-sm text-gray-400">Sem dados</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={cordaoData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" name="Quantidade" radius={[4, 4, 0, 0]}>
                  {cordaoData.map((entry, i) => (
                    <rect key={i} fill={CORDAO_COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Performance guichê */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="h-4 w-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-700">Performance por Guichê</h2>
          </div>
          {guicheData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-sm text-gray-400">Sem dados</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={guicheData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="guiche" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Check-ins" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Últimos check-ins */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Últimos Check-ins</h2>
        {ultimosCheckins.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Nenhum check-in registrado</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Responsável', 'Guichê', 'Crianças', 'PCD', 'Horário'].map(h => (
                    <th key={h} className="text-left pb-3 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ultimosCheckins.map(c => (
                  <tr key={c.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 pr-4 font-medium text-gray-900">{c.responsavelNome}</td>
                    <td className="py-3 pr-4 text-gray-500">Guichê {String(c.guiche).padStart(2, '0')}</td>
                    <td className="py-3 pr-4 text-gray-500">{c.totalCriancas}</td>
                    <td className="py-3 pr-4 text-gray-500">{c.totalPcd}</td>
                    <td className="py-3 text-gray-500">
                      {new Date(c.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ML Insights */}
      <MLInsightsPanel />
    </div>
  );
}

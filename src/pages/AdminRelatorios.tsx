import { useData } from '@/contexts/DataContext';
import { Download, FileText, Calendar } from 'lucide-react';
import { CordaoColor } from '@/types';

// Cordões conforme a tela original
const CORDOES_CONFIG = [
  { cor: 'azul' as CordaoColor,      hex: '#3b82f6', label: 'Azul (0-3 anos)' },
  { cor: 'verde' as CordaoColor,     hex: '#22c55e', label: 'Verde (4-6 anos)' },
  { cor: 'amarelo' as CordaoColor,   hex: '#eab308', label: 'Amarelo (7-9 anos)' },
  { cor: 'vermelho' as CordaoColor,  hex: '#ef4444', label: 'Vermelho (10-12 anos)' },
  { cor: 'rosa' as CordaoColor,      hex: '#ec4899', label: 'Rosa (Adulto)' },
  { cor: 'cinza' as CordaoColor,     hex: '#6b7280', label: 'Cinza (Terceirizado)' },
  { cor: 'preto' as CordaoColor,     hex: '#111827', label: 'Preto (Serviço)' },
] as const;

export default function AdminRelatorios() {
  const { grupos, checkins } = useData();

  const today = new Date().toLocaleDateString('pt-BR');

  // Contagem de cordões
  const cordaoCount: Record<string, number> = {};
  CORDOES_CONFIG.forEach(c => { cordaoCount[c.cor] = 0; });
  grupos.forEach(g => g.responsavel.criancas.forEach(c => {
    if (cordaoCount[c.cordaoCor] !== undefined) cordaoCount[c.cordaoCor]++;
  }));
  const totalVisitantes = Object.values(cordaoCount).reduce((a, b) => a + b, 0);
  const maxCordao = Math.max(...Object.values(cordaoCount), 1);

  // Atendimentos por guichê
  const guicheMap: Record<number, number> = {};
  checkins.forEach(c => { guicheMap[c.guiche] = (guicheMap[c.guiche] || 0) + 1; });
  const guiches = Array.from({ length: 6 }, (_, i) => i + 1);

  const exportCSV = () => {
    const rows = [
      ['Responsável', 'Protocolo', 'Bairro', 'Cidade', 'UF', 'Tipo', 'Total Crianças', 'PCD', 'Check-in', 'Guichê', 'Horário'].join(','),
      ...grupos.map(g => [
        `"${g.responsavel.nome}"`, g.responsavel.protocolo, `"${g.responsavel.bairro}"`,
        `"${g.responsavel.cidade}"`, g.responsavel.uf, g.responsavel.tipoAgendamento,
        g.responsavel.criancas.length, g.responsavel.criancas.filter(c => c.pcd).length,
        g.checkinRealizado ? 'SIM' : 'NÃO', g.guiche || '',
        g.checkinAt ? new Date(g.checkinAt).toLocaleString('pt-BR') : '',
      ].join(',')),
    ].join('\n');
    const blob = new Blob([rows], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `sentinela_relatorio_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-sm text-gray-500 mt-0.5">Exportar e analisar dados da operação</p>
        </div>
        <button
          onClick={exportCSV}
          disabled={grupos.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </button>
      </div>

      {/* Contagem de Cordões */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
          <FileText className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">Contagem de Cordões — {today}</span>
        </div>
        <div className="divide-y divide-gray-50">
          {CORDOES_CONFIG.map(({ cor, hex, label }) => {
            const count = cordaoCount[cor] || 0;
            const pct = maxCordao > 0 ? (count / maxCordao) * 100 : 0;
            return (
              <div key={cor} className="flex items-center gap-4 px-6 py-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: hex }} />
                <span className="text-sm text-gray-700 w-44 flex-shrink-0">{label}</span>
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: hex + '99' }}
                  />
                </div>
                <span className="text-sm font-bold text-gray-900 w-6 text-right">{count}</span>
              </div>
            );
          })}
          <div className="flex items-center justify-between px-6 py-4">
            <span className="text-sm font-semibold text-gray-900">Total de Visitantes</span>
            <span className="text-sm font-bold text-gray-900">{totalVisitantes}</span>
          </div>
        </div>
      </div>

      {/* Atendimentos por Guichê */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">Atendimentos por Guichê</span>
        </div>
        <div className="p-6 grid grid-cols-3 md:grid-cols-6 gap-4">
          {guiches.map(g => (
            <div key={g} className="border border-gray-200 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Guichê</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{String(g).padStart(2, '0')}</p>
              <p className="text-xl font-bold text-blue-600 mt-2">{guicheMap[g] || 0}</p>
              <p className="text-xs text-gray-400 mt-1">atendimentos</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

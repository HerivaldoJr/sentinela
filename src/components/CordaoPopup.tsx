import { GrupoVisita, getCordaoLabel, CordaoColor } from '@/types';
import { X, CheckCircle2 } from 'lucide-react';

interface CordaoPopupProps {
  grupo: GrupoVisita | null;
  guiche: number;
  onConfirm: () => void;
  onClose: () => void;
}

const CORDAO_BG: Record<string, string> = {
  rosa: '#ec4899', azul: '#3b82f6', verde: '#22c55e',
  amarelo: '#eab308', laranja: '#f97316', vermelho: '#ef4444',
  cinza: '#6b7280', preto: '#111827',
};

export default function CordaoPopup({ grupo, guiche, onConfirm, onClose }: CordaoPopupProps) {
  if (!grupo) return null;

  const membros: { nome: string; cor: CordaoColor; tipo: string; detalhe: string }[] = [
    { nome: grupo.responsavel.nome.toLowerCase(), cor: 'rosa', tipo: 'Responsável', detalhe: 'Rosa (Adulto)' },
    ...grupo.responsavel.criancas.map(c => ({
      nome: c.nome.toLowerCase(), cor: c.cordaoCor, tipo: `${c.idade} anos`,
      detalhe: getCordaoLabel(c.cordaoCor),
    })),
  ];

  const resumo = membros.reduce((acc, m) => {
    acc[m.cor] = (acc[m.cor] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Matriz de Entrega de Cordões</h2>
            <p className="text-sm text-gray-500 mt-1">
              Guichê {String(guiche).padStart(2, '0')} — Verifique as cores e entregue os cartões
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Grid de membros */}
        <div className="px-6 pb-4">
          <div className={`grid gap-4 ${membros.length <= 2 ? 'grid-cols-2' : membros.length <= 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-3'}`}>
            {membros.map((m, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-gray-200">
                {/* Faixa de cor */}
                <div className="py-5 flex items-center justify-center" style={{ backgroundColor: CORDAO_BG[m.cor] || '#94a3b8' }}>
                  <span className="text-xl font-black text-white uppercase tracking-widest">{m.cor}</span>
                </div>
                {/* Info */}
                <div className="p-4 bg-white">
                  <p className="text-base font-bold text-gray-900 leading-tight">{m.nome}</p>
                  <p className="text-sm text-gray-500 mt-1">{m.tipo}</p>
                  <p className="text-xs text-gray-400 mt-1">{m.detalhe}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Resumo */}
          <div className="mt-5 bg-gray-50 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Resumo de Cordões para Entregar:</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(resumo).map(([cor, qtd]) => (
                <span
                  key={cor}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: CORDAO_BG[cor] || '#94a3b8' }}
                >
                  {qtd}x {cor.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose}
            className="px-5 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button onClick={onConfirm}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors">
            <CheckCircle2 className="h-4 w-4" />
            Confirmar Entrega e Check-in
          </button>
        </div>
      </div>
    </div>
  );
}

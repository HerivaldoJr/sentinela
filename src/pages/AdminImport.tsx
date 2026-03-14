import { useState, useCallback } from 'react';
import { useData } from '@/contexts/DataContext';
import { Upload, FileText, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { GrupoVisita, Crianca, getCordaoCor } from '@/types';
import { toast } from 'sonner';
import Papa from 'papaparse';

export default function AdminImport() {
  const { importarGrupos, grupos, checkins, resetDados } = useData();
  const [dragging, setDragging] = useState(false);
  const [importResult, setImportResult] = useState<{ linhas: number; grupos: number } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const totalCriancas = grupos.reduce((a, g) => a + g.responsavel.criancas.length, 0);

  const processCSV = (file: File) => {
    setErrors([]);
    setImportResult(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const errs: string[] = [];
        const novos: GrupoVisita[] = [];
        const linhas = results.data.length;

        (results.data as any[]).forEach((row, idx) => {
          try {
            const nome = (row['nome_responsavel'] || row['nome'] || row['NOME'] || '').toString().trim().toUpperCase();
            if (!nome) { errs.push(`Linha ${idx + 2}: nome vazio`); return; }

            const criancasRaw = row['criancas'] || row['CRIANCAS'] || row['crianças'] || '';
            const criancas: Crianca[] = [];

            if (criancasRaw) {
              criancasRaw.toString().split(';').forEach((c: string) => {
                const [nomeC, idadeC, generoC, pcdC] = c.split(',').map((x: string) => x.trim());
                const idade = parseInt(idadeC) || 0;
                criancas.push({
                  id: crypto.randomUUID(), nome: (nomeC || '').toUpperCase(), idade,
                  genero: (generoC || 'MASCULINO').toUpperCase(),
                  pcd: pcdC === '1' || pcdC?.toLowerCase() === 'sim',
                  cordaoCor: getCordaoCor(idade),
                });
              });
            }

            novos.push({
              id: crypto.randomUUID(),
              responsavel: {
                id: crypto.randomUUID(),
                protocolo: row['protocolo'] || row['PROTOCOLO'] || `CSV-${Date.now()}-${idx}`,
                nome, contato: (row['contato'] || '').toString(),
                email: (row['email'] || '').toString(),
                bairro: (row['bairro'] || '').toString().toUpperCase(),
                cidade: (row['cidade'] || 'FORTALEZA').toString().toUpperCase(),
                uf: (row['uf'] || 'CE').toString().toUpperCase(),
                tipoAgendamento: (row['tipo'] || 'FAMILIAR').toString().toUpperCase(),
                criancas,
              },
              checkinRealizado: false,
            });
          } catch { errs.push(`Linha ${idx + 2}: erro`); }
        });

        importarGrupos(novos);
        setImportResult({ linhas, grupos: novos.length });
        setErrors(errs);
        toast.success(`Importação concluída! ${linhas} linhas processadas.`);
      },
      error: () => toast.error('Erro ao ler o arquivo CSV.'),
    });
  };

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv')) { toast.error('Apenas arquivos .csv são aceitos.'); return; }
    processCSV(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  return (
    <div className="p-6 space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Importar Dados</h1>
        <p className="text-sm text-gray-500 mt-0.5">Importe a planilha de agendamento exportada do sistema</p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('csv-input')?.click()}
        className={`border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-colors ${
          dragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 bg-white'
        }`}
      >
        <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
        <p className="text-base font-medium text-gray-700">Arraste o arquivo CSV aqui</p>
        <p className="text-sm text-blue-500 mt-1">ou clique para selecionar o arquivo</p>
        <p className="text-xs text-gray-400 mt-3">Formato esperado: relatório exportado do sistema de agendamento</p>
        <input id="csv-input" type="file" accept=".csv" className="hidden"
          onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
      </div>

      {/* Resultado da importação */}
      {importResult && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-900">Importação Concluída</p>
            <p className="text-sm text-gray-500 mt-0.5">
              {importResult.linhas} linha(s) processada(s), {importResult.grupos} novo(s) grupo(s) adicionado(s).
            </p>
          </div>
        </div>
      )}

      {errors.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-yellow-700 mb-1">
            <AlertTriangle className="h-4 w-4" />
            <p className="text-sm font-semibold">{errors.length} aviso(s)</p>
          </div>
          {errors.map((e, i) => <p key={i} className="text-xs text-yellow-600">{e}</p>)}
        </div>
      )}

      {/* Base Atual */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <FileText className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-700">Base Atual</span>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-4xl font-bold text-gray-900">{grupos.length}</p>
            <p className="text-sm text-gray-500 mt-1">Grupos</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-gray-900">{totalCriancas}</p>
            <p className="text-sm text-gray-500 mt-1">Crianças</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-gray-900">{checkins.length}</p>
            <p className="text-sm text-gray-500 mt-1">Check-ins</p>
          </div>
        </div>

        {grupos.length > 0 && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <button
              onClick={() => { resetDados(); setImportResult(null); toast.success('Base limpa.'); }}
              className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
            >
              <AlertCircle className="h-4 w-4" />
              Limpar Base
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

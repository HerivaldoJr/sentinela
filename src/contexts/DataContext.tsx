import { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { GrupoVisita, CheckinRecord, Stats, CordaoColor } from '@/types';

interface DataContextType {
  grupos: GrupoVisita[];
  setGrupos: React.Dispatch<React.SetStateAction<GrupoVisita[]>>;
  checkins: CheckinRecord[];
  stats: Stats;
  realizarCheckin: (grupoId: string, guiche: number) => void;
  importarGrupos: (novos: GrupoVisita[]) => void;
  resetDados: () => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [grupos, setGrupos] = useState<GrupoVisita[]>([]);
  const [checkins, setCheckins] = useState<CheckinRecord[]>([]);

  const realizarCheckin = useCallback((grupoId: string, guiche: number) => {
    const grupo = grupos.find(g => g.id === grupoId);
    if (!grupo || grupo.checkinRealizado) return;

    const cordoes: Record<CordaoColor, number> = {
      rosa: 0, azul: 0, verde: 0, amarelo: 0, laranja: 0, vermelho: 0,
    };
    grupo.responsavel.criancas.forEach(c => {
      cordoes[c.cordaoCor] = (cordoes[c.cordaoCor] || 0) + 1;
    });

    const record: CheckinRecord = {
      id: crypto.randomUUID(),
      grupoId,
      responsavelNome: grupo.responsavel.nome,
      guiche,
      totalCriancas: grupo.responsavel.criancas.length,
      totalPcd: grupo.responsavel.criancas.filter(c => c.pcd).length,
      timestamp: new Date().toISOString(),
      bairro: grupo.responsavel.bairro,
      cidade: grupo.responsavel.cidade,
      cordoes,
    };

    setCheckins(prev => [record, ...prev]);
    setGrupos(prev =>
      prev.map(g =>
        g.id === grupoId
          ? { ...g, checkinRealizado: true, checkinAt: record.timestamp, guiche }
          : g
      )
    );
  }, [grupos]);

  const importarGrupos = useCallback((novos: GrupoVisita[]) => {
    setGrupos(novos);
    setCheckins([]);
  }, []);

  const resetDados = useCallback(() => {
    setGrupos([]);
    setCheckins([]);
  }, []);

  const stats: Stats = useMemo(() => {
    const pendentes = grupos.filter(g => !g.checkinRealizado).length;
    const checkinHoje = checkins.filter(c => {
      const d = new Date(c.timestamp);
      const today = new Date();
      return d.toDateString() === today.toDateString();
    }).length;
    const totalCriancas = grupos.reduce((acc, g) => acc + g.responsavel.criancas.length, 0);
    const totalPcd = grupos.reduce(
      (acc, g) => acc + g.responsavel.criancas.filter(c => c.pcd).length, 0
    );

    return {
      totalVisitantes: grupos.length,
      totalCriancas,
      totalResponsaveis: grupos.length,
      totalPcd,
      pendentes,
      checkinHoje,
    };
  }, [grupos, checkins]);

  return (
    <DataContext.Provider value={{ grupos, setGrupos, checkins, stats, realizarCheckin, importarGrupos, resetDados }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

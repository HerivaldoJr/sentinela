import { CheckinRecord, GrupoVisita } from '@/types';

export interface HourlyData {
  hour: number;
  count: number;
  predicted: number;
}

export function analyzeHourlyPattern(checkins: CheckinRecord[]): HourlyData[] {
  const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 8h to 18h
  const counts: Record<number, number> = {};
  hours.forEach(h => (counts[h] = 0));

  checkins.forEach(c => {
    const h = new Date(c.timestamp).getHours();
    if (h >= 8 && h <= 18) counts[h] = (counts[h] || 0) + 1 + c.totalCriancas;
  });

  const values = hours.map(h => counts[h]);
  const max = Math.max(...values, 1);

  return hours.map((hour, i) => ({
    hour,
    count: counts[hour],
    predicted: Math.round((Math.sin((i / 10) * Math.PI) * max * 0.8) + max * 0.1),
  }));
}

export function getPeakHour(hourlyData: HourlyData[]): { hour: number; count: number } {
  const real = hourlyData.filter(d => d.count > 0);
  if (real.length === 0) return { hour: 0, count: 0 };
  return real.reduce((prev, curr) => (curr.count > prev.count ? curr : prev));
}

export interface TrendResult {
  direction: 'up' | 'down' | 'stable';
  percentChange: number;
  confidence: number;
  description: string;
  projectedTotal: number;
}

export function analyzeTrend(checkins: CheckinRecord[]): TrendResult {
  if (checkins.length < 2) {
    return {
      direction: 'stable',
      percentChange: 0,
      confidence: 0,
      description: 'Dados insuficientes para análise de tendência.',
      projectedTotal: 0,
    };
  }

  const mid = Math.floor(checkins.length / 2);
  const firstHalf = checkins.slice(0, mid).length;
  const secondHalf = checkins.slice(mid).length;

  const change = firstHalf === 0 ? 0 : ((secondHalf - firstHalf) / firstHalf) * 100;
  const direction = change > 5 ? 'up' : change < -5 ? 'down' : 'stable';
  const confidence = Math.min(checkins.length * 5, 95);

  return {
    direction,
    percentChange: parseFloat(change.toFixed(1)),
    confidence,
    description:
      direction === 'up'
        ? 'Tendência crescente de visitantes detectada.'
        : direction === 'down'
        ? 'Tendência de queda no fluxo de visitantes.'
        : 'Fluxo estável de visitantes.',
    projectedTotal: Math.round(checkins.length * 1.1),
  };
}

export interface AnomalyResult {
  isAnomaly: boolean;
  severity: 'low' | 'medium' | 'critical';
  message: string;
  zScore: number;
}

export function detectAnomaly(current: number, history: number[]): AnomalyResult {
  if (history.length < 3) return { isAnomaly: false, severity: 'low', message: '', zScore: 0 };

  const mean = history.reduce((a, b) => a + b, 0) / history.length;
  const std = Math.sqrt(history.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / history.length);
  const zScore = std === 0 ? 0 : Math.abs((current - mean) / std);

  if (zScore < 2) return { isAnomaly: false, severity: 'low', message: '', zScore };
  const severity = zScore > 3 ? 'critical' : 'medium';
  return {
    isAnomaly: true,
    severity,
    message: `Fluxo ${current > mean ? 'acima' : 'abaixo'} do padrão esperado (média: ${mean.toFixed(0)}).`,
    zScore,
  };
}

export interface VisitorCluster {
  label: string;
  count: number;
  avgCriancas: number;
  topBairros: string[];
}

export function clusterVisitors(checkins: CheckinRecord[], grupos: GrupoVisita[]): VisitorCluster[] {
  if (grupos.length === 0) return [];

  const familiar = grupos.filter(g => g.responsavel.tipoAgendamento === 'FAMILIAR');
  const institucional = grupos.filter(g => g.responsavel.tipoAgendamento === 'INSTITUCIONAL');
  const avulso = grupos.filter(g => g.responsavel.tipoAgendamento === 'AVULSO');

  const toCluster = (list: GrupoVisita[], label: string): VisitorCluster | null => {
    if (list.length === 0) return null;
    const avgCriancas = list.reduce((a, g) => a + g.responsavel.criancas.length, 0) / list.length;
    const bairroCount: Record<string, number> = {};
    list.forEach(g => {
      const b = g.responsavel.bairro;
      if (b) bairroCount[b] = (bairroCount[b] || 0) + 1;
    });
    const topBairros = Object.entries(bairroCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([b]) => b);
    return { label, count: list.length, avgCriancas: parseFloat(avgCriancas.toFixed(1)), topBairros };
  };

  return [
    toCluster(familiar, 'Familiar'),
    toCluster(institucional, 'Institucional'),
    toCluster(avulso, 'Avulso'),
  ].filter(Boolean) as VisitorCluster[];
}

export function calcAvgServiceTime(checkins: CheckinRecord[]): string {
  if (checkins.length < 2) return '';
  const times: number[] = [];
  for (let i = 1; i < checkins.length; i++) {
    const diff =
      (new Date(checkins[i].timestamp).getTime() - new Date(checkins[i - 1].timestamp).getTime()) / 60000;
    if (diff > 0 && diff < 30) times.push(diff);
  }
  if (times.length === 0) return '';
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  return avg.toFixed(1);
}

export interface CapacityForecast {
  currentOccupancy: number;
  maxCapacity: number;
  occupancyRate: number;
  estimatedFullAt: string | null;
  recommendation: string;
}

export function forecastCapacity(total: number, checkins: CheckinRecord[]): CapacityForecast {
  const maxCapacity = 500;
  const occupancyRate = Math.min(Math.round((total / maxCapacity) * 100), 100);

  let estimatedFullAt: string | null = null;
  if (checkins.length > 3) {
    const rate = checkins.length / Math.max(new Date().getHours() - 8, 1);
    const remaining = maxCapacity - total;
    if (rate > 0) {
      const hoursUntilFull = remaining / (rate * 10);
      const fullHour = new Date().getHours() + Math.ceil(hoursUntilFull);
      if (fullHour <= 18) estimatedFullAt = `${fullHour}h`;
    }
  }

  const recommendation =
    occupancyRate > 90
      ? 'Capacidade crítica. Acionar protocolo de controle de acesso.'
      : occupancyRate > 75
      ? 'Alta ocupação. Monitorar entradas e preparar equipe de reserva.'
      : occupancyRate > 50
      ? 'Ocupação moderada. Operação normal.'
      : 'Operação normal. Capacidade disponível.';

  return { currentOccupancy: total, maxCapacity, occupancyRate, estimatedFullAt, recommendation };
}

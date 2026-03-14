export type CordaoColor = 'rosa' | 'azul' | 'verde' | 'amarelo' | 'vermelho' | 'laranja';

export interface Crianca {
  id: string;
  nome: string;
  idade: number;
  genero: string;
  pcd: boolean;
  pcdDescricao?: string;
  cordaoCor: CordaoColor;
}

export interface Responsavel {
  id: string;
  protocolo: string;
  nome: string;
  contato: string;
  email: string;
  bairro: string;
  cidade: string;
  uf: string;
  tipoAgendamento: string;
  criancas: Crianca[];
}

export interface GrupoVisita {
  id: string;
  responsavel: Responsavel;
  checkinRealizado: boolean;
  checkinAt?: string;
  guiche?: number;
}

export interface CheckinRecord {
  id: string;
  grupoId: string;
  responsavelNome: string;
  guiche: number;
  totalCriancas: number;
  totalPcd: number;
  timestamp: string;
  bairro: string;
  cidade: string;
  cordoes: Record<CordaoColor, number>;
}

export interface Stats {
  totalVisitantes: number;
  totalCriancas: number;
  totalResponsaveis: number;
  totalPcd: number;
  pendentes: number;
  checkinHoje: number;
}

export function getCordaoCor(idade: number): CordaoColor {
  if (idade <= 2) return 'rosa';
  if (idade <= 5) return 'azul';
  if (idade <= 8) return 'verde';
  if (idade <= 11) return 'amarelo';
  if (idade <= 14) return 'laranja';
  return 'vermelho';
}

export function getCordaoLabel(cor: CordaoColor): string {
  const labels: Record<CordaoColor, string> = {
    rosa: '0–2 anos',
    azul: '3–5 anos',
    verde: '6–8 anos',
    amarelo: '9–11 anos',
    laranja: '12–14 anos',
    vermelho: '15–17 anos',
  };
  return labels[cor];
}

export function getCordaoTailwindBg(cor: CordaoColor): string {
  const map: Record<CordaoColor, string> = {
    rosa: 'bg-pink-100',
    azul: 'bg-blue-100',
    verde: 'bg-green-100',
    amarelo: 'bg-yellow-100',
    laranja: 'bg-orange-100',
    vermelho: 'bg-red-100',
  };
  return map[cor] || 'bg-gray-100';
}

export function getCordaoTailwindText(cor: CordaoColor): string {
  const map: Record<CordaoColor, string> = {
    rosa: 'text-pink-700',
    azul: 'text-blue-700',
    verde: 'text-green-700',
    amarelo: 'text-yellow-700',
    laranja: 'text-orange-700',
    vermelho: 'text-red-700',
  };
  return map[cor] || 'text-gray-700';
}

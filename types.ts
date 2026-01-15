export enum Difficulty {
  LOW = 'BAIXA',
  MEDIUM = 'MÉDIA',
  HIGH = 'ALTA'
}

export enum Status {
  NOT_STARTED = 'NÃO INICIADO',
  REQUEST_CALL = 'FNZ / SOLICITAR CHAMADO',
  IN_PROGRESS = 'EM EXECUÇÃO',
  COMPLETED = 'CONCLUÍDO'
}

export type UserRole = 'ADMIN' | 'VIEWER';

export interface Demand {
  id: string;
  openingDate: string; // ISO Date string (YYYY-MM-DD)
  createdAt: string; // ISO Timestamp string for "time ago" logic
  deadline: string; // ISO Date string
  difficulty: Difficulty;
  location: string;
  serviceOrder: string;
  description: string;
  status: Status;
  observation: string;
}

export interface DemandFilters {
  location: string;
  status: string;
  difficulty: string;
  searchTerm: string; // For Service Order search
}

export type ViewState = 'DASHBOARD' | 'LIST' | 'FORM' | 'SI_DASHBOARD' | 'SI_LIST' | 'SI_FORM';

export interface ChartDataPoint {
  name: string;
  value: number;
  color: string;
}

// SI - Solicitação de Intervenção Module Types

export enum SIStatus {
  VIGENTE = 'VIGENTE',
  EXPIRING = 'PRÓXIMA DO VENCIMENTO',
  EXPIRED = 'VENCIDA',
  EXTENDED = 'PRORROGADA',
  CLOSED = 'ENCERRADA'
}

export const LOCATIONS = [
  'UHE SOBRADINHO',
  'SE SOB', 'SE JGR', 'SE JZD', 'SE JZT', 'SE SNB',
  'SE CND', 'SE CFO', 'SE OUR', 'SE BMC', 'SE IRE', 'SE MPD',
  'SE IGD', 'SE IGT', 'SE BRA', 'SE BRD', 'SE TBV', 'SE BJS',
  'SE BJD', 'SE PND', 'SE GPX', 'SE FUT', 'CRESP'
];

export interface SI {
  id: string;
  number: string; // e.g., SI-2025-0145
  demandId: string; // Linked Demand ID
  location: string;
  description: string;
  issueDate: string;
  expirationDate: string;
  status: SIStatus;
  
  // Extension data
  extensionDate?: string;
  newExpirationDate?: string;
  extensionJustification?: string;

  responsible: string;
  responsibleArea: string;
  observations: string;
}

export interface SIFilters {
  status: string;
  location: string;
  search: string;
}
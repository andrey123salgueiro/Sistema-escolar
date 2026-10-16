export type UserRole = 'diretora' | 'professor';
export type ConceptRating = 'otimo' | 'bom' | 'regular' | 'ruim';

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  password?: string;
  role: UserRole;
  subject?: string; // Componente curricular principal
  classes?: string[]; // Turmas atribuídas
  createdAt: string;
}

export interface SchoolClass {
  id: string;
  name: string; // ex: '6º Ano A'
  shift?: 'Manhã' | 'Tarde' | 'Integral' | 'Noite';
  year?: string;
  description?: string;
}

export interface Student {
  id: string;
  name: string;
  rollNumber?: string; // Número de chamada ou matrícula
  classGroup: string; // Turma correspondente
  status?: 'ativo' | 'transferido' | 'atencao';
  notes?: string;
  createdAt?: string;
}

export interface ClassDimension {
  id: string;
  name: string;
  description: string;
}

export interface QuestionSection {
  id: string;
  title: string;
  order: number;
}

export interface Question {
  id: string;
  sectionId: string;
  prompt: string;
  placeholder?: string;
  required: boolean;
  order: number;
}

export interface SignatureStatus {
  signed: boolean;
  signedBy?: string;
  signedAt?: string;
  notes?: string;
}

export interface PreCouncilReport {
  id: string;
  schoolName: string;
  schoolSubtitle: string;
  title: string;
  teacherId: string;
  teacherName: string;
  component: string; // Componente Curricular (ex: Matemática)
  classGroup: string; // Turma (ex: 6º Ano A)
  date: string; // Formato YYYY-MM-DD
  bimester: string; // 1º Bimestre, 2º Bimestre, etc.
  answers: Record<string, string>; // questionId -> response
  // Formulário conceitual: Ruim, Regular, Bom, Ótimo
  dimensionRatings?: Record<string, ConceptRating>; // dimensionId -> rating
  studentRatings?: Record<string, { rating: ConceptRating; notes?: string }>; // studentId -> { rating, notes }
  status: 'pendente' | 'rascunho' | 'enviado' | 'visto';
  createdAt: string;
  updatedAt: string;
  pedagogaSignature: SignatureStatus;
  diretoraSignature: SignatureStatus;
}

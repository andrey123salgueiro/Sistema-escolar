export type UserRole = 'diretora' | 'professor';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  subject?: string; // Componente curricular principal
  classes?: string[]; // Turmas atribuídas
  createdAt: string;
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
  status: 'rascunho' | 'enviado' | 'visto';
  createdAt: string;
  updatedAt: string;
  pedagogaSignature: SignatureStatus;
  diretoraSignature: SignatureStatus;
}

import React, { useState, useEffect } from 'react';
import {
  User,
  Question,
  QuestionSection,
  PreCouncilReport,
} from './types';
import {
  getStoredUsers,
  saveStoredUsers,
  getStoredQuestions,
  saveStoredQuestions,
  getStoredSections,
  saveStoredSections,
  getStoredReports,
  saveStoredReports,
  getCurrentUser,
  setCurrentUser as persistCurrentUser,
  resetToFactoryData,
} from './utils/storage';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { ReportForm } from './components/ReportForm';
import { TeacherReportList } from './components/TeacherReportList';
import { DirectorDashboard } from './components/DirectorDashboard';
import { TeacherManagement } from './components/TeacherManagement';
import { QuestionManagement } from './components/QuestionManagement';
import { ReleaseReportManagement } from './components/ReleaseReportManagement';
import { ReportViewModal } from './components/ReportViewModal';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sections, setSections] = useState<QuestionSection[]>([]);
  const [reports, setReports] = useState<PreCouncilReport[]>([]);

  // Navigation tab:
  // For diretora: 'archive' | 'teachers' | 'questions'
  // For professor: 'new-form' | 'my-reports'
  const [activeTab, setActiveTab] = useState<string>('archive');

  // Selected report for viewing in modal / printing
  const [viewingReport, setViewingReport] = useState<PreCouncilReport | null>(null);

  // Selected report for editing (draft)
  const [editingReport, setEditingReport] = useState<PreCouncilReport | null>(null);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Initial load
  useEffect(() => {
    const loadedUsers = getStoredUsers();
    const loadedQuestions = getStoredQuestions();
    const loadedSections = getStoredSections();
    const loadedReports = getStoredReports();
    const activeUser = getCurrentUser();

    setUsers(loadedUsers);
    setQuestions(loadedQuestions);
    setSections(loadedSections);
    setReports(loadedReports);
    setCurrentUserState(activeUser);

    if (activeUser) {
      if (activeUser.role === 'diretora') {
        setActiveTab('archive');
      } else {
        setActiveTab('my-reports');
      }
    }
  }, []);

  // Handle successful login
  const handleLoginSuccess = (user: User) => {
    setCurrentUserState(user);
    persistCurrentUser(user);
    setEditingReport(null);

    if (user.role === 'diretora') {
      setActiveTab('archive');
      showToast(`Bem-vinda, ${user.name}! Painel da Diretoria acessado com sucesso.`);
    } else {
      setActiveTab('my-reports');
      showToast(`Bem-vindo(a), Prof. ${user.name}! Painel docente acessado.`);
    }
  };

  // Handle logout
  const handleLogout = () => {
    setCurrentUserState(null);
    persistCurrentUser(null);
    setEditingReport(null);
    setViewingReport(null);
    showToast('Você saiu com segurança. Faça login para acessar novamente.');
  };

  // Reset to default factory data
  const handleResetData = () => {
    resetToFactoryData();
    const loadedUsers = getStoredUsers();
    const loadedQuestions = getStoredQuestions();
    const loadedSections = getStoredSections();
    const loadedReports = getStoredReports();

    setUsers(loadedUsers);
    setQuestions(loadedQuestions);
    setSections(loadedSections);
    setReports(loadedReports);
    setCurrentUserState(null);
    setEditingReport(null);
    setViewingReport(null);
    showToast('Dados restaurados para o padrão original da escola! Efetue login novamente.');
  };

  // Save or submit report
  const handleSaveReport = (report: PreCouncilReport) => {
    const existingIndex = reports.findIndex((r) => r.id === report.id);
    let updatedReports: PreCouncilReport[];

    if (existingIndex >= 0) {
      updatedReports = [...reports];
      updatedReports[existingIndex] = report;
    } else {
      updatedReports = [report, ...reports];
    }

    setReports(updatedReports);
    saveStoredReports(updatedReports);
    setEditingReport(null);

    if (report.status === 'enviado') {
      showToast(
        `Ficha da turma "${report.classGroup}" enviada com sucesso para o arquivo da Diretora!`
      );
      setActiveTab('my-reports');
    }
  };

  // Delete report
  const handleDeleteReport = (reportId: string) => {
    const updated = reports.filter((r) => r.id !== reportId);
    setReports(updated);
    saveStoredReports(updated);
    if (viewingReport?.id === reportId) setViewingReport(null);
    if (editingReport?.id === reportId) setEditingReport(null);
    showToast('Ficha de pré-conselho excluída com sucesso.');
  };

  // Quick Sign by Director
  const handleQuickSign = (
    reportId: string,
    signatureType: 'diretora' | 'pedagoga'
  ) => {
    const updated = reports.map((r) => {
      if (r.id !== reportId) return r;
      if (signatureType === 'diretora') {
        return {
          ...r,
          status: 'visto' as const,
          diretoraSignature: {
            signed: true,
            signedBy: currentUser?.name || 'Diretora Geral',
            signedAt: new Date().toISOString(),
          },
        };
      } else {
        return {
          ...r,
          pedagogaSignature: {
            signed: true,
            signedBy: 'Coordenação Pedagógica',
            signedAt: new Date().toISOString(),
          },
        };
      }
    });

    setReports(updated);
    saveStoredReports(updated);
    showToast('Visto registrado com sucesso no relatório arquivado!');
  };

  // Sign report from inside modal
  const handleSignReportFromModal = (
    reportId: string,
    role: 'diretora' | 'pedagoga',
    notes?: string
  ) => {
    const updated = reports.map((r) => {
      if (r.id !== reportId) return r;
      if (role === 'diretora') {
        return {
          ...r,
          status: 'visto' as const,
          diretoraSignature: {
            signed: true,
            signedBy: currentUser?.name || 'Diretora Geral',
            signedAt: new Date().toISOString(),
            notes: notes || undefined,
          },
        };
      } else {
        return {
          ...r,
          pedagogaSignature: {
            signed: true,
            signedBy: 'Coordenação Pedagógica',
            signedAt: new Date().toISOString(),
            notes: notes || undefined,
          },
        };
      }
    });

    setReports(updated);
    saveStoredReports(updated);

    const updatedCurrent = updated.find((r) => r.id === reportId);
    if (updatedCurrent) setViewingReport(updatedCurrent);
    showToast('Visto oficial e anotações gravadas com sucesso!');
  };

  // Teacher management actions
  const handleAddTeacher = (newTeacher: User) => {
    const updated = [...users, newTeacher];
    setUsers(updated);
    saveStoredUsers(updated);
  };

  const handleUpdateTeacher = (teacher: User) => {
    const updated = users.map((u) => (u.id === teacher.id ? teacher : u));
    setUsers(updated);
    saveStoredUsers(updated);
    if (currentUser?.id === teacher.id) {
      setCurrentUserState(teacher);
      persistCurrentUser(teacher);
    }
  };

  const handleDeleteTeacher = (teacherId: string) => {
    const updated = users.filter((u) => u.id !== teacherId);
    setUsers(updated);
    saveStoredUsers(updated);
    showToast('Professor removido do quadro docente.');
  };

  // Question management actions
  const handleAddQuestion = (newQuestion: Question) => {
    const updated = [...questions, newQuestion];
    setQuestions(updated);
    saveStoredQuestions(updated);
  };

  const handleUpdateQuestion = (question: Question) => {
    const updated = questions.map((q) => (q.id === question.id ? question : q));
    setQuestions(updated);
    saveStoredQuestions(updated);
  };

  const handleDeleteQuestion = (questionId: string) => {
    const updated = questions.filter((q) => q.id !== questionId);
    setQuestions(updated);
    saveStoredQuestions(updated);
    showToast('Pergunta removida do questionário oficial.');
  };

  const handleAddSection = (title: string) => {
    const newSection: QuestionSection = {
      id: `sec-${Date.now()}`,
      title,
      order: sections.length + 1,
    };
    const updated = [...sections, newSection];
    setSections(updated);
    saveStoredSections(updated);
  };

  // Release and dispatch management actions
  const handleReleaseReports = (newReports: PreCouncilReport[]) => {
    const updated = [...newReports, ...reports];
    setReports(updated);
    saveStoredReports(updated);
    showToast(
      `${newReports.length} ${
        newReports.length === 1 ? 'ficha disponibilizada' : 'fichas disponibilizadas'
      } com sucesso para os professores!`
    );
  };

  const handleCancelRelease = (reportId: string) => {
    const updated = reports.filter((r) => r.id !== reportId);
    setReports(updated);
    saveStoredReports(updated);
    showToast('Liberação da ficha cancelada.');
  };

  // If user is not authenticated, show login screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col font-sans">
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 bg-stone-900 text-stone-50 border border-stone-700 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2.5 text-xs max-w-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
        <LoginScreen users={users} onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  const isDiretora = currentUser.role === 'diretora';
  const onlyTeachers = users.filter((u) => u.role === 'professor');

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans">
      {/* Toast notification banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-stone-900 text-stone-50 border border-stone-700 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2.5 text-xs max-w-md animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main App Header */}
      <Header
        currentUser={currentUser}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'new-form') {
            setEditingReport(null);
          }
        }}
        onLogout={handleLogout}
        onResetData={handleResetData}
      />

      {/* Main Content Body */}
      <main className="flex-1 pb-16">
        {isDiretora ? (
          /* DIREÇÃO / COORDENAÇÃO VIEWS */
          <>
            {activeTab === 'archive' && (
              <DirectorDashboard
                reports={reports}
                teachers={onlyTeachers}
                onOpenReport={(rep) => setViewingReport(rep)}
                onPrintReport={(rep) => {
                  setViewingReport(rep);
                  setTimeout(() => window.print(), 300);
                }}
                onDeleteReport={handleDeleteReport}
                onQuickSign={handleQuickSign}
              />
            )}

            {activeTab === 'release' && (
              <ReleaseReportManagement
                teachers={onlyTeachers}
                reports={reports}
                onReleaseReports={handleReleaseReports}
                onCancelRelease={handleCancelRelease}
                onOpenReport={(rep) => setViewingReport(rep)}
              />
            )}

            {activeTab === 'teachers' && (
              <TeacherManagement
                teachers={onlyTeachers}
                onAddTeacher={handleAddTeacher}
                onUpdateTeacher={handleUpdateTeacher}
                onDeleteTeacher={handleDeleteTeacher}
              />
            )}

            {activeTab === 'questions' && (
              <QuestionManagement
                questions={questions}
                sections={sections}
                onAddQuestion={handleAddQuestion}
                onUpdateQuestion={handleUpdateQuestion}
                onDeleteQuestion={handleDeleteQuestion}
                onAddSection={handleAddSection}
              />
            )}
          </>
        ) : (
          /* PROFESSOR VIEWS */
          <>
            {activeTab === 'new-form' && (
              <ReportForm
                currentUser={currentUser}
                questions={questions}
                sections={sections}
                existingReport={editingReport}
                onSaveReport={handleSaveReport}
                onCancel={() => {
                  setEditingReport(null);
                  setActiveTab('my-reports');
                }}
                onPreview={(rep) => setViewingReport(rep)}
              />
            )}

            {activeTab === 'my-reports' && (
              <TeacherReportList
                currentUser={currentUser}
                reports={reports}
                onOpenReport={(rep) => setViewingReport(rep)}
                onEditReport={(rep) => {
                  setEditingReport(rep);
                  setActiveTab('new-form');
                }}
                onPrintReport={(rep) => {
                  setViewingReport(rep);
                  setTimeout(() => window.print(), 300);
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Official Report View & Print Modal */}
      {viewingReport && (
        <ReportViewModal
          report={viewingReport}
          questions={questions}
          sections={sections}
          currentUser={currentUser}
          onClose={() => setViewingReport(null)}
          onSignReport={handleSignReportFromModal}
        />
      )}
    </div>
  );
}

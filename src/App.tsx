import React, { useState, useEffect } from 'react';
import {
  User,
  Question,
  QuestionSection,
  PreCouncilReport,
  SchoolClass,
  Student,
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
  getStoredClasses,
  saveStoredClasses,
  getStoredStudents,
  saveStoredStudents,
  getCurrentUser,
  setCurrentUser as persistCurrentUser,
  resetToFactoryData,
} from './utils/storage';
import {
  subscribeUsers,
  subscribeQuestions,
  subscribeSections,
  subscribeReports,
  subscribeClasses,
  subscribeStudents,
  saveUserDoc,
  deleteUserDoc,
  saveQuestionDoc,
  deleteQuestionDoc,
  saveSectionDoc,
  saveReportDoc,
  deleteReportDoc,
  saveClassDoc,
  deleteClassDoc,
  saveStudentDoc,
  batchSaveStudents,
  deleteStudentDoc,
} from './firebase';
import {
  INITIAL_USERS,
  INITIAL_QUESTIONS,
  INITIAL_SECTIONS,
  INITIAL_REPORTS,
  INITIAL_CLASSES,
  INITIAL_STUDENTS,
} from './data/initialData';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { ReportForm } from './components/ReportForm';
import { TeacherReportList } from './components/TeacherReportList';
import { DirectorDashboard } from './components/DirectorDashboard';
import { TeacherManagement } from './components/TeacherManagement';
import { QuestionManagement } from './components/QuestionManagement';
import { ReleaseReportManagement } from './components/ReleaseReportManagement';
import { ClassManagement } from './components/ClassManagement';
import { StudentManagement } from './components/StudentManagement';
import { ClassPanorama } from './components/ClassPanorama';
import { ClassPerformance } from './components/ClassPerformance';
import { ReportViewModal } from './components/ReportViewModal';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sections, setSections] = useState<QuestionSection[]>([]);
  const [reports, setReports] = useState<PreCouncilReport[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(true);

  // Navigation tab
  const [activeTab, setActiveTab] = useState<string>('archive');

  // Selected report for viewing in modal / printing
  const [viewingReport, setViewingReport] = useState<PreCouncilReport | null>(null);

  // Selected report for editing (draft)
  const [editingReport, setEditingReport] = useState<PreCouncilReport | null>(null);

  // Initial filter for student management tab
  const [studentInitialFilter, setStudentInitialFilter] = useState<string>('all');

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Initial load and Real-time Firestore Subscriptions
  useEffect(() => {
    // 1. Instant hydration from local storage cache
    const loadedUsers = getStoredUsers().map((u) => ({
      ...u,
      username: u.username || u.name,
      password: u.password || '123',
    }));
    const loadedQuestions = getStoredQuestions();
    const loadedSections = getStoredSections();
    const loadedReports = getStoredReports();
    const loadedClasses = getStoredClasses();
    const loadedStudents = getStoredStudents();
    const activeUser = getCurrentUser();

    setUsers(loadedUsers);
    setQuestions(loadedQuestions);
    setSections(loadedSections);
    setReports(loadedReports);
    setClasses(loadedClasses);
    setStudents(loadedStudents);
    setCurrentUserState(activeUser);

    if (activeUser) {
      if (activeUser.role === 'diretora') {
        setActiveTab('archive');
      } else {
        setActiveTab('my-reports');
      }
    }

    // 2. Real-time Firebase Firestore synchronization across all devices and browsers
    const unsubUsers = subscribeUsers((cloudUsers) => {
      const sanitizedUsers = cloudUsers.map((u) => ({
        ...u,
        username: u.username || u.name,
        password: u.password || '123',
      }));
      setUsers(sanitizedUsers);
      saveStoredUsers(sanitizedUsers);
      setIsCloudSynced(true);
    });

    const unsubQuestions = subscribeQuestions((cloudQuestions) => {
      setQuestions(cloudQuestions);
      saveStoredQuestions(cloudQuestions);
      setIsCloudSynced(true);
    });

    const unsubSections = subscribeSections((cloudSections) => {
      setSections(cloudSections);
      saveStoredSections(cloudSections);
      setIsCloudSynced(true);
    });

    const unsubReports = subscribeReports((cloudReports) => {
      setReports(cloudReports);
      saveStoredReports(cloudReports);
      setIsCloudSynced(true);
    });

    const unsubClasses = subscribeClasses((cloudClasses) => {
      setClasses(cloudClasses);
      saveStoredClasses(cloudClasses);
      setIsCloudSynced(true);
    });

    const unsubStudents = subscribeStudents((cloudStudents) => {
      setStudents(cloudStudents);
      saveStoredStudents(cloudStudents);
      setIsCloudSynced(true);
    });

    return () => {
      unsubUsers();
      unsubQuestions();
      unsubSections();
      unsubReports();
      unsubClasses();
      unsubStudents();
    };
  }, []);

  // Handle successful login
  const handleLoginSuccess = (user: User) => {
    setCurrentUserState(user);
    persistCurrentUser(user);
    setEditingReport(null);

    if (user.role === 'diretora') {
      setActiveTab('archive');
      showToast(`Bem-vinda, ${user.name}! Painel da Diretoria sincronizado em tempo real.`);
    } else {
      setActiveTab('my-reports');
      showToast(`Bem-vindo(a), Prof. ${user.name}! Painel docente conectado.`);
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

  // Reset to default factory data and reseed Firestore
  const handleResetData = async () => {
    resetToFactoryData();
    setUsers(INITIAL_USERS);
    setQuestions(INITIAL_QUESTIONS);
    setSections(INITIAL_SECTIONS);
    setReports(INITIAL_REPORTS);
    setClasses(INITIAL_CLASSES);
    setStudents(INITIAL_STUDENTS);
    setCurrentUserState(null);
    setEditingReport(null);
    setViewingReport(null);

    // Reseed cloud database
    for (const u of INITIAL_USERS) await saveUserDoc(u);
    for (const q of INITIAL_QUESTIONS) await saveQuestionDoc(q);
    for (const s of INITIAL_SECTIONS) await saveSectionDoc(s);
    for (const r of INITIAL_REPORTS) await saveReportDoc(r);
    for (const c of INITIAL_CLASSES) await saveClassDoc(c);
    for (const st of INITIAL_STUDENTS) await saveStudentDoc(st);

    showToast('Dados restaurados para o padrão original da escola e sincronizados na nuvem!');
  };

  // Save or submit report (Syncs instantly to Firestore)
  const handleSaveReport = async (report: PreCouncilReport) => {
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

    // Write to Firestore - broadcasts immediately to Director's browser
    await saveReportDoc(report);

    if (report.status === 'enviado') {
      showToast(
        `Ficha da turma "${report.classGroup}" enviada com sucesso! Visível instantaneamente no painel da Diretora.`
      );
      setActiveTab('my-reports');
    } else {
      showToast('Rascunho salvo e sincronizado na nuvem com sucesso!');
    }
  };

  // Delete report
  const handleDeleteReport = async (reportId: string) => {
    const updated = reports.filter((r) => r.id !== reportId);
    setReports(updated);
    saveStoredReports(updated);
    if (viewingReport?.id === reportId) setViewingReport(null);
    if (editingReport?.id === reportId) setEditingReport(null);

    await deleteReportDoc(reportId);
    showToast('Ficha de pré-conselho excluída com sucesso da nuvem.');
  };

  // Quick Sign by Director
  const handleQuickSign = async (
    reportId: string,
    signatureType: 'diretora' | 'pedagoga'
  ) => {
    const target = reports.find((r) => r.id === reportId);
    if (!target) return;

    let updatedReport: PreCouncilReport;
    if (signatureType === 'diretora') {
      updatedReport = {
        ...target,
        status: 'visto' as const,
        diretoraSignature: {
          signed: true,
          signedBy: currentUser?.name || 'Diretora Geral',
          signedAt: new Date().toISOString(),
        },
      };
    } else {
      updatedReport = {
        ...target,
        pedagogaSignature: {
          signed: true,
          signedBy: 'Coordenação Pedagógica',
          signedAt: new Date().toISOString(),
        },
      };
    }

    const updated = reports.map((r) => (r.id === reportId ? updatedReport : r));
    setReports(updated);
    saveStoredReports(updated);

    await saveReportDoc(updatedReport);
    showToast('Visto registrado e sincronizado em tempo real!');
  };

  // Sign report from inside modal
  const handleSignReportFromModal = async (
    reportId: string,
    role: 'diretora' | 'pedagoga',
    notes?: string
  ) => {
    const target = reports.find((r) => r.id === reportId);
    if (!target) return;

    let updatedReport: PreCouncilReport;
    if (role === 'diretora') {
      updatedReport = {
        ...target,
        status: 'visto' as const,
        diretoraSignature: {
          signed: true,
          signedBy: currentUser?.name || 'Diretora Geral',
          signedAt: new Date().toISOString(),
          notes: notes || undefined,
        },
      };
    } else {
      updatedReport = {
        ...target,
        pedagogaSignature: {
          signed: true,
          signedBy: 'Coordenação Pedagógica',
          signedAt: new Date().toISOString(),
          notes: notes || undefined,
        },
      };
    }

    const updated = reports.map((r) => (r.id === reportId ? updatedReport : r));
    setReports(updated);
    saveStoredReports(updated);
    setViewingReport(updatedReport);

    await saveReportDoc(updatedReport);
    showToast('Visto oficial e anotações gravadas na nuvem com sucesso!');
  };

  // Teacher management actions
  const handleAddTeacher = async (newTeacher: User) => {
    const updated = [...users, newTeacher];
    setUsers(updated);
    saveStoredUsers(updated);
    await saveUserDoc(newTeacher);
    showToast(`Professor(a) ${newTeacher.name} cadastrado(a) e salvo(a) na nuvem!`);
  };

  const handleUpdateTeacher = async (teacher: User) => {
    const updated = users.map((u) => (u.id === teacher.id ? teacher : u));
    setUsers(updated);
    saveStoredUsers(updated);
    if (currentUser?.id === teacher.id) {
      setCurrentUserState(teacher);
      persistCurrentUser(teacher);
    }
    await saveUserDoc(teacher);
    showToast('Dados do professor atualizados com sucesso.');
  };

  const handleDeleteTeacher = async (teacherId: string) => {
    const updated = users.filter((u) => u.id !== teacherId);
    setUsers(updated);
    saveStoredUsers(updated);
    await deleteUserDoc(teacherId);
    showToast('Professor removido do quadro docente.');
  };

  // Question management actions
  const handleAddQuestion = async (newQuestion: Question) => {
    const updated = [...questions, newQuestion];
    setQuestions(updated);
    saveStoredQuestions(updated);
    await saveQuestionDoc(newQuestion);
    showToast('Pergunta adicionada e sincronizada para todas as fichas!');
  };

  const handleUpdateQuestion = async (question: Question) => {
    const updated = questions.map((q) => (q.id === question.id ? question : q));
    setQuestions(updated);
    saveStoredQuestions(updated);
    await saveQuestionDoc(question);
    showToast('Pergunta atualizada com sucesso.');
  };

  const handleDeleteQuestion = async (questionId: string) => {
    const updated = questions.filter((q) => q.id !== questionId);
    setQuestions(updated);
    saveStoredQuestions(updated);
    await deleteQuestionDoc(questionId);
    showToast('Pergunta removida do questionário oficial.');
  };

  const handleAddSection = async (title: string) => {
    const newSection: QuestionSection = {
      id: `sec-${Date.now()}`,
      title,
      order: sections.length + 1,
    };
    const updated = [...sections, newSection];
    setSections(updated);
    saveStoredSections(updated);
    await saveSectionDoc(newSection);
    showToast(`Seção "${title}" criada com sucesso!`);
  };

  // Class Management actions
  const handleAddClass = async (newCls: SchoolClass) => {
    const updated = [...classes, newCls];
    setClasses(updated);
    saveStoredClasses(updated);
    await saveClassDoc(newCls);
    showToast(`Turma ${newCls.name} cadastrada e salva na nuvem!`);
  };

  const handleUpdateClass = async (cls: SchoolClass) => {
    const updated = classes.map((c) => (c.id === cls.id ? cls : c));
    setClasses(updated);
    saveStoredClasses(updated);
    await saveClassDoc(cls);
    showToast('Turma atualizada com sucesso.');
  };

  const handleDeleteClass = async (classId: string) => {
    const updated = classes.filter((c) => c.id !== classId);
    setClasses(updated);
    saveStoredClasses(updated);
    await deleteClassDoc(classId);
    showToast('Turma removida com sucesso.');
  };

  // Student Management actions
  const handleAddStudent = async (newStudent: Student) => {
    const updated = [newStudent, ...students];
    setStudents(updated);
    saveStoredStudents(updated);
    await saveStudentDoc(newStudent);
    showToast(`Aluno ${newStudent.name} registrado e salvo na nuvem!`);
  };

  const handleAddMultipleStudents = async (newStudents: Student[]) => {
    const updated = [...newStudents, ...students];
    setStudents(updated);
    saveStoredStudents(updated);
    await batchSaveStudents(newStudents);
    showToast(`${newStudents.length} alunos importados e sincronizados em nuvem!`);
  };

  const handleUpdateStudent = async (std: Student) => {
    const updated = students.map((s) => (s.id === std.id ? std : s));
    setStudents(updated);
    saveStoredStudents(updated);
    await saveStudentDoc(std);
    showToast('Dados do estudante atualizados na nuvem.');
  };

  const handleDeleteStudent = async (studentId: string) => {
    const updated = students.filter((s) => s.id !== studentId);
    setStudents(updated);
    saveStoredStudents(updated);
    await deleteStudentDoc(studentId);
    showToast('Estudante removido com sucesso.');
  };

  // Release and dispatch management actions (Disponibilizar Fichas)
  const handleReleaseReports = async (newReports: PreCouncilReport[]) => {
    const updated = [...newReports, ...reports];
    setReports(updated);
    saveStoredReports(updated);

    // Save to Firestore in real time - instantly shows up on teachers' browsers!
    for (const r of newReports) {
      await saveReportDoc(r);
    }

    showToast(
      `${newReports.length} ${
        newReports.length === 1 ? 'ficha disponibilizada' : 'fichas disponibilizadas'
      } e sincronizadas instantaneamente para os professores!`
    );
  };

  const handleCancelRelease = async (reportId: string) => {
    const updated = reports.filter((r) => r.id !== reportId);
    setReports(updated);
    saveStoredReports(updated);
    await deleteReportDoc(reportId);
    showToast('Liberação da ficha cancelada com sucesso.');
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
        isCloudSynced={isCloudSynced}
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

            {activeTab === 'performance' && (
              <ClassPerformance
                classes={classes}
                students={students}
                reports={reports}
                teachers={onlyTeachers}
                currentUser={currentUser}
              />
            )}

            {activeTab === 'panorama' && (
              <ClassPanorama
                classes={classes}
                students={students}
                reports={reports}
                teachers={onlyTeachers}
                questions={questions}
                sections={sections}
                currentUser={currentUser}
              />
            )}

            {activeTab === 'students' && (
              <StudentManagement
                classes={classes}
                students={students}
                initialFilterClass={studentInitialFilter}
                onAddStudent={handleAddStudent}
                onAddMultipleStudents={handleAddMultipleStudents}
                onUpdateStudent={handleUpdateStudent}
                onDeleteStudent={handleDeleteStudent}
              />
            )}

            {activeTab === 'classes' && (
              <ClassManagement
                classes={classes}
                students={students}
                teachers={onlyTeachers}
                onAddClass={handleAddClass}
                onUpdateClass={handleUpdateClass}
                onDeleteClass={handleDeleteClass}
                onViewStudents={(className) => {
                  setStudentInitialFilter(className);
                  setActiveTab('students');
                }}
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
            {activeTab === 'my-reports' && (
              <TeacherReportList
                currentUser={currentUser}
                reports={reports}
                onEditReport={(rep) => {
                  setEditingReport(rep);
                  setActiveTab('new-form');
                }}
                onFillReport={(rep) => {
                  setEditingReport(rep);
                  setActiveTab('new-form');
                }}
                onOpenReport={(rep) => setViewingReport(rep)}
                onPrintReport={(rep) => setViewingReport(rep)}
                onDeleteReport={handleDeleteReport}
                onStartNewReport={() => {
                  setEditingReport(null);
                  setActiveTab('new-form');
                }}
              />
            )}

            {activeTab === 'new-form' && (
              <div className="max-w-5xl mx-auto px-4 py-8">
                <ReportForm
                  currentUser={currentUser}
                  questions={questions}
                  sections={sections}
                  students={students}
                  classes={classes}
                  existingReport={editingReport}
                  editingReport={editingReport}
                  onSaveReport={handleSaveReport}
                  onCancel={() => {
                    setEditingReport(null);
                    setActiveTab('my-reports');
                  }}
                />
              </div>
            )}

            {activeTab === 'panorama' && (
              <ClassPanorama
                classes={classes}
                students={students}
                reports={reports}
                teachers={onlyTeachers}
                questions={questions}
                sections={sections}
                currentUser={currentUser}
              />
            )}

            {activeTab === 'performance' && (
              <ClassPerformance
                classes={classes}
                students={students}
                reports={reports}
                teachers={onlyTeachers}
                currentUser={currentUser}
              />
            )}
          </>
        )}
      </main>

      {/* Official Report Inspection & Print Modal */}
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

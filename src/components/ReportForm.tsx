import React, { useState, useEffect } from 'react';
import {
  User,
  Question,
  QuestionSection,
  PreCouncilReport,
} from '../types';
import {
  AVAILABLE_CLASSES,
  AVAILABLE_SUBJECTS,
  SCHOOL_NAME,
  SCHOOL_SUBTITLE,
  REPORT_TITLE,
} from '../data/initialData';
import {
  Save,
  Send,
  CheckCircle2,
  Calendar,
  BookOpen,
  Users2,
  AlertCircle,
  FileCheck,
  Printer,
  Sparkles,
  Layers,
  ArrowLeft,
  Lock,
} from 'lucide-react';

interface ReportFormProps {
  currentUser: User;
  questions: Question[];
  sections: QuestionSection[];
  existingReport?: PreCouncilReport | null;
  onSaveReport: (report: PreCouncilReport) => void;
  onCancel?: () => void;
  onPreview?: (report: PreCouncilReport) => void;
}

export const ReportForm: React.FC<ReportFormProps> = ({
  currentUser,
  questions,
  sections,
  existingReport,
  onSaveReport,
  onCancel,
  onPreview,
}) => {
  // Form fields
  const [component, setComponent] = useState(
    existingReport?.component || currentUser.subject || 'Matemática'
  );
  const [classGroup, setClassGroup] = useState(
    existingReport?.classGroup || currentUser.classes?.[0] || '6º Ano A'
  );
  const [date, setDate] = useState(
    existingReport?.date || new Date().toISOString().split('T')[0]
  );
  const [bimester, setBimester] = useState(
    existingReport?.bimester || '3º Bimestre'
  );
  const [answers, setAnswers] = useState<Record<string, string>>(
    existingReport?.answers || {}
  );
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (existingReport) {
      setComponent(existingReport.component);
      setClassGroup(existingReport.classGroup);
      setDate(existingReport.date || new Date().toISOString().split('T')[0]);
      setBimester(existingReport.bimester);
      setAnswers(existingReport.answers || {});
    }
  }, [existingReport]);

  // Calculate completion percentage
  const totalQuestions = questions.length;
  const answeredCount = questions.filter(
    (q) => answers[q.id] && answers[q.id].trim().length > 0
  ).length;
  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const handleAnswerChange = (questionId: string, val: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: val,
    }));
  };

  const handleQuickDraftSave = () => {
    const reportToSave: PreCouncilReport = {
      id: existingReport?.id || `rep-${Date.now()}`,
      schoolName: SCHOOL_NAME,
      schoolSubtitle: SCHOOL_SUBTITLE,
      title: REPORT_TITLE,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      component,
      classGroup,
      date,
      bimester,
      answers,
      status: 'rascunho',
      createdAt: existingReport?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pedagogaSignature: existingReport?.pedagogaSignature || { signed: false },
      diretoraSignature: existingReport?.diretoraSignature || { signed: false },
    };

    onSaveReport(reportToSave);
    setSaveSuccessMsg('Rascunho salvo com sucesso! Você pode continuar preenchendo quando quiser.');
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  const handleSubmitFinal = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];

    // Verify required questions
    questions.forEach((q) => {
      if (q.required && (!answers[q.id] || answers[q.id].trim().length === 0)) {
        errors.push(`A pergunta "${q.prompt.slice(0, 50)}..." é obrigatória.`);
      }
    });

    if (errors.length > 0) {
      setValidationErrors(errors);
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }

    setValidationErrors([]);

    const reportToSave: PreCouncilReport = {
      id: existingReport?.id || `rep-${Date.now()}`,
      schoolName: SCHOOL_NAME,
      schoolSubtitle: SCHOOL_SUBTITLE,
      title: REPORT_TITLE,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      component,
      classGroup,
      date,
      bimester,
      answers,
      status: 'enviado',
      createdAt: existingReport?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pedagogaSignature: existingReport?.pedagogaSignature || { signed: false },
      diretoraSignature: existingReport?.diretoraSignature || { signed: false },
    };

    onSaveReport(reportToSave);
  };

  // Helper to pre-fill a demo response to assist rapid testing
  const handleFillDemoAnswers = () => {
    const demo: Record<string, string> = {};
    questions.forEach((q, idx) => {
      if (q.id === 'q-1') {
        demo[q.id] = 'A turma demonstra bom rendimento e assimilação dos conteúdos planejados. Aproximadamente 80% atingiram o nível esperado de aprendizagem.';
      } else if (q.id === 'q-2') {
        demo[q.id] = 'Participação muito ativa e respeitosa. Há bom engajamento nas dinâmicas em grupo e nas atividades individuais.';
      } else if (q.id === 'q-3') {
        demo[q.id] = 'Algumas dificuldades pontuais na interpretação de textos complexos e cálculos contextualizados de fixação.';
      } else if (q.id === 'q-4') {
        demo[q.id] = 'Dois estudantes tiveram faltas reincidentes por motivos de saúde da família; coordenação já orientada.';
      } else if (q.id === 'q-5') {
        demo[q.id] = 'Alunos destaque: Gustavo Henrique e Mariana Santos, pela dedicação constante e solidariedade acadêmica com a turma.';
      } else if (q.id === 'q-6') {
        demo[q.id] = 'Aluno Pedro necessita de encaminhamento para acompanhamento no contraturno de reforço.';
      } else if (q.id === 'q-7') {
        demo[q.id] = 'Aulas práticas com jogos pedagógicos e mapas mentais. Planejamos simulado diagnóstico no início do próximo ciclo.';
      } else if (q.id === 'q-8') {
        demo[q.id] = 'Recomenda-se reunião de alinhamento com os pais sobre o cumprimento dos prazos de tarefas.';
      } else if (q.id === 'q-9') {
        demo[q.id] = 'Turma harmoniosa e com forte potencial para os próximos bimestres com o suporte da equipe pedagógica.';
      } else {
        demo[q.id] = `Observações detalhadas sobre ${q.prompt.slice(0, 30)}...`;
      }
    });
    setAnswers(demo);
    setSaveSuccessMsg('Campos preenchidos automaticamente para teste rápido!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Sort sections and questions
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Back to list navigation */}
      <div className="mb-4 flex items-center justify-between">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-100 border border-stone-200 px-3.5 py-2 rounded-xl transition-colors shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar para Minhas Fichas</span>
          </button>
        )}

        {existingReport && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-semibold">
            <Lock className="w-3.5 h-3.5 text-amber-700" />
            <span>Ficha autorizada pela Direção: {classGroup} • {component}</span>
          </div>
        )}
      </div>

      {/* Top Banner Alert for teacher */}
      <div className="mb-6 bg-amber-50/80 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-xs">
        <div className="flex items-center gap-2.5">
          <FileCheck className="w-5 h-5 text-amber-700 shrink-0" />
          <div>
            <span className="font-bold">Formulário Digital Oficial:</span> Preencha
            diretamente no computador ou celular. Seus dados são salvos
            automaticamente e arquivados no painel da diretora.
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleFillDemoAnswers}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg font-medium transition-colors text-xs"
            title="Preencher com texto exemplo para teste rápido"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Preenchimento Rápido (Exemplo)</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-xs shadow-xs">
          <div className="flex items-center gap-2 font-bold mb-1 text-red-900">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>Por favor, preencha os campos obrigatórios antes de enviar:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-stone-700 pl-1">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Official Document Sheet Paper */}
      <form onSubmit={handleSubmitFinal} className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        {/* Paper Document Header (Matches physical sheet layout) */}
        <div className="p-6 sm:p-8 bg-stone-50 border-b border-stone-200 text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-200/60 rounded-full text-[11px] font-semibold text-stone-700 mb-3 uppercase tracking-wider">
            Documento Pedagógico Oficial
          </div>

          <h2 className="text-base sm:text-lg font-extrabold text-stone-900 tracking-wide uppercase font-serif">
            {SCHOOL_NAME}
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-stone-600 tracking-wider uppercase mt-0.5">
            {SCHOOL_SUBTITLE}
          </p>

          <div className="my-3 mx-auto w-24 h-0.5 bg-amber-600/40 rounded-full" />

          <h3 className="text-sm sm:text-base font-bold text-stone-900 uppercase tracking-widest text-amber-800">
            {REPORT_TITLE}
          </h3>

          {/* Header Metadata Grid */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left pt-4 border-t border-stone-200/80">
            {/* Componente Curricular */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-stone-500" />
                Componente:
              </label>
              <select
                value={component}
                onChange={(e) => setComponent(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                {AVAILABLE_SUBJECTS.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* Professor(a) */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                <Users2 className="w-3.5 h-3.5 text-stone-500" />
                Professor(a):
              </label>
              <input
                type="text"
                value={currentUser.name}
                readOnly
                className="w-full bg-stone-100 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-800 font-medium cursor-not-allowed"
              />
            </div>

            {/* Turma */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-stone-500" />
                Turma:
              </label>
              <select
                value={classGroup}
                onChange={(e) => setClassGroup(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium"
              >
                {AVAILABLE_CLASSES.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            {/* Data & Bimestre */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-500" />
                Data & Período:
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-lg px-2 py-2 text-xs text-stone-900 focus:ring-2 focus:ring-amber-500"
                />
                <select
                  value={bimester}
                  onChange={(e) => setBimester(e.target.value)}
                  className="bg-white border border-stone-300 rounded-lg px-2 py-2 text-xs text-stone-900 focus:ring-2 focus:ring-amber-500 font-medium"
                >
                  <option value="1º Bimestre">1º Bim</option>
                  <option value="2º Bimestre">2º Bim</option>
                  <option value="3º Bimestre">3º Bim</option>
                  <option value="4º Bimestre">4º Bim</option>
                </select>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 pt-3 border-t border-stone-200/80 flex items-center justify-between text-xs text-stone-500">
            <span>
              Progresso do preenchimento: <strong>{answeredCount}</strong> de{' '}
              <strong>{totalQuestions}</strong> questões respondidas
            </span>
            <div className="w-32 bg-stone-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Dynamic Sections and Questions */}
        <div className="p-6 sm:p-8 space-y-8">
          {sortedSections.map((sec) => {
            const sectionQuestions = questions
              .filter((q) => q.sectionId === sec.id)
              .sort((a, b) => a.order - b.order);

            if (sectionQuestions.length === 0) return null;

            return (
              <div
                key={sec.id}
                className="bg-white rounded-xl border border-stone-200 p-5 sm:p-6 shadow-xs hover:border-amber-200 transition-colors"
              >
                {/* Section Header */}
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-100">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                  <h4 className="text-sm sm:text-base font-bold text-stone-900 tracking-wide uppercase font-serif">
                    {sec.title}
                  </h4>
                </div>

                {/* Question items */}
                <div className="space-y-6">
                  {sectionQuestions.map((q) => {
                    const currentVal = answers[q.id] || '';
                    const isAnswered = currentVal.trim().length > 0;

                    return (
                      <div key={q.id} className="group">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <label
                            htmlFor={`q-${q.id}`}
                            className="text-xs sm:text-sm font-semibold text-stone-800 leading-snug cursor-pointer"
                          >
                            {q.prompt}
                            {q.required && (
                              <span
                                className="text-red-600 ml-1 font-bold"
                                title="Campo obrigatório"
                              >
                                *
                              </span>
                            )}
                          </label>

                          {isAnswered && (
                            <span className="shrink-0 flex items-center gap-1 text-[11px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" />
                              Preenchido
                            </span>
                          )}
                        </div>

                        <div className="relative">
                          <textarea
                            id={`q-${q.id}`}
                            rows={3}
                            value={currentVal}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            placeholder={q.placeholder || 'Digite sua resposta detalhada aqui...'}
                            className={`w-full text-xs sm:text-sm text-stone-800 bg-stone-50/50 hover:bg-white focus:bg-white border rounded-xl p-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all leading-relaxed ${
                              !isAnswered && q.required && validationErrors.length > 0
                                ? 'border-red-400 bg-red-50/30'
                                : 'border-stone-300'
                            }`}
                          />
                          <div className="flex justify-between items-center text-[10px] text-stone-600 px-1 mt-1">
                            <span>
                              {q.required ? 'Resposta obrigatória' : 'Opcional'}
                            </span>
                            <span>{currentVal.length} caracteres</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Document Footer & Actions */}
        <div className="p-6 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-stone-700">
            Status atual:{' '}
            <span className="font-semibold text-stone-800 uppercase">
              {existingReport?.status === 'visto'
                ? 'Homologado com Visto'
                : existingReport?.status === 'enviado'
                ? 'Enviado para a Direção'
                : 'Em Edição (Rascunho)'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white border border-stone-300 hover:bg-stone-100 rounded-xl transition-colors"
              >
                Voltar / Cancelar
              </button>
            )}

            <button
              type="button"
              id="btn-save-draft"
              onClick={handleQuickDraftSave}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300 hover:bg-stone-100 rounded-xl transition-colors shadow-xs"
            >
              <Save className="w-4 h-4 text-stone-500" />
              <span>Salvar Rascunho</span>
            </button>

            <button
              type="submit"
              id="btn-submit-final"
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 rounded-xl transition-all shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>Enviar à Direção</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

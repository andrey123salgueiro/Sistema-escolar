import React, { useState } from 'react';
import { Question, QuestionSection } from '../types';
import {
  HelpCircle,
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle,
  Layers,
  Sparkles,
  ArrowDown,
  ArrowUp,
} from 'lucide-react';

interface QuestionManagementProps {
  questions: Question[];
  sections: QuestionSection[];
  onAddQuestion: (newQuestion: Question) => void;
  onUpdateQuestion: (question: Question) => void;
  onDeleteQuestion: (questionId: string) => void;
  onAddSection: (title: string) => void;
}

export const QuestionManagement: React.FC<QuestionManagementProps> = ({
  questions,
  sections,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onAddSection,
}) => {
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Form states for question
  const [targetSectionId, setTargetSectionId] = useState<string>(
    sections[0]?.id || 'sec-1'
  );
  const [promptText, setPromptText] = useState('');
  const [placeholderText, setPlaceholderText] = useState('');
  const [isRequired, setIsRequired] = useState(true);

  // Form state for new section
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const resetQuestionForm = () => {
    setPromptText('');
    setPlaceholderText('');
    setIsRequired(true);
    setEditingQuestionId(null);
    setShowAddQuestion(false);
  };

  const handleEditClick = (q: Question) => {
    setTargetSectionId(q.sectionId);
    setPromptText(q.prompt);
    setPlaceholderText(q.placeholder || '');
    setIsRequired(q.required);
    setEditingQuestionId(q.id);
    setShowAddQuestion(true);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) {
      alert('Por favor, digite o enunciado da pergunta.');
      return;
    }

    if (editingQuestionId) {
      const existing = questions.find((q) => q.id === editingQuestionId);
      if (existing) {
        onUpdateQuestion({
          ...existing,
          sectionId: targetSectionId,
          prompt: promptText.trim(),
          placeholder: placeholderText.trim() || undefined,
          required: isRequired,
        });
        setFeedback('Pergunta atualizada com sucesso!');
      }
    } else {
      const sectionQuestions = questions.filter((q) => q.sectionId === targetSectionId);
      const newQuestion: Question = {
        id: `q-${Date.now()}`,
        sectionId: targetSectionId,
        prompt: promptText.trim(),
        placeholder: placeholderText.trim() || undefined,
        required: isRequired,
        order: sectionQuestions.length + 1,
      };
      onAddQuestion(newQuestion);
      setFeedback('Nova pergunta cadastrada no questionário oficial!');
    }

    setTimeout(() => setFeedback(null), 3500);
    resetQuestionForm();
  };

  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionTitle.trim()) return;
    onAddSection(newSectionTitle.trim());
    setFeedback(`Nova seção "${newSectionTitle}" criada!`);
    setNewSectionTitle('');
    setShowAddSection(false);
    setTimeout(() => setFeedback(null), 3500);
  };

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-700" />
            <h2 className="text-xl font-bold text-stone-900">
              Gerenciar Perguntas da Ficha de Pré-Conselho
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Cadastre ou altere as perguntas preparadas pela diretora para os professores responderem no site.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setShowAddSection(!showAddSection);
              setShowAddQuestion(false);
            }}
            className="px-3 py-2 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-xl transition-colors shadow-xs"
          >
            + Nova Seção
          </button>

          <button
            id="btn-add-question"
            onClick={() => {
              resetQuestionForm();
              setShowAddQuestion(true);
              setShowAddSection(false);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Cadastrar Pergunta</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* New Section Modal / Bar */}
      {showAddSection && (
        <form
          onSubmit={handleCreateSection}
          className="bg-white rounded-xl border border-stone-300 p-4 mb-6 shadow-xs flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Título da Nova Seção do Questionário:
            </label>
            <input
              type="text"
              required
              placeholder="Ex: 6. PROJETOS INTERDISCIPLINARES E CONVIVÊNCIA"
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto pt-4">
            <button
              type="button"
              onClick={() => setShowAddSection(false)}
              className="px-3 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg shadow-xs"
            >
              Criar Seção
            </button>
          </div>
        </form>
      )}

      {/* Question Form */}
      {showAddQuestion && (
        <div className="bg-white rounded-2xl border-2 border-amber-300 p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-200">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-amber-700" />
              {editingQuestionId ? 'Editar Pergunta Oficial' : 'Cadastrar Nova Pergunta na Ficha'}
            </h3>
            <button
              onClick={resetQuestionForm}
              className="text-stone-400 hover:text-stone-600 text-xs font-medium"
            >
              Fechar
            </button>
          </div>

          <form onSubmit={handleSaveQuestion} className="space-y-4">
            {/* Escolher Seção */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Seção onde a pergunta será exibida:
              </label>
              <select
                value={targetSectionId}
                onChange={(e) => setTargetSectionId(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500 font-medium"
              >
                {sortedSections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Enunciado da Pergunta */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Enunciado da Pergunta (Texto que o professor lerá) *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Ex: Como foi a participação e pontualidade da turma na entrega das tarefas e trabalhos individuais?"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-3 text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500 leading-relaxed"
              />
            </div>

            {/* Placeholder orientativo */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Texto de exemplo/orientação para o professor (Placeholder opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: Cite exemplos concretos de postura ou projetos realizados no período..."
                value={placeholderText}
                onChange={(e) => setPlaceholderText(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Obrigatório toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="req-checkbox"
                checked={isRequired}
                onChange={(e) => setIsRequired(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
              />
              <label
                htmlFor="req-checkbox"
                className="text-xs font-medium text-stone-700 cursor-pointer"
              >
                Resposta obrigatória para envio da ficha
              </label>
            </div>

            {/* Buttons */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-stone-100">
              <button
                type="button"
                onClick={resetQuestionForm}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                id="btn-save-question-submit"
                className="px-5 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl shadow-xs"
              >
                {editingQuestionId ? 'Salvar Edição' : 'Cadastrar Pergunta'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sections and Questions Hierarchy Display */}
      <div className="space-y-6">
        {sortedSections.map((sec) => {
          const secQuestions = questions
            .filter((q) => q.sectionId === sec.id)
            .sort((a, b) => a.order - b.order);

          return (
            <div
              key={sec.id}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs"
            >
              {/* Section Header */}
              <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                  <h3 className="text-sm font-bold text-stone-900 tracking-wide font-serif uppercase">
                    {sec.title}
                  </h3>
                  <span className="text-[11px] text-stone-500 font-sans ml-2">
                    ({secQuestions.length} {secQuestions.length === 1 ? 'pergunta' : 'perguntas'})
                  </span>
                </div>

                <button
                  onClick={() => {
                    setTargetSectionId(sec.id);
                    setEditingQuestionId(null);
                    setPromptText('');
                    setPlaceholderText('');
                    setShowAddQuestion(true);
                  }}
                  className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Adicionar nesta seção</span>
                </button>
              </div>

              {/* Questions in Section */}
              <div className="divide-y divide-stone-100">
                {secQuestions.length === 0 ? (
                  <div className="p-6 text-center text-xs text-stone-400">
                    Nenhuma pergunta cadastrada nesta seção ainda.
                  </div>
                ) : (
                  secQuestions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-4 hover:bg-stone-50/70 transition-colors flex items-start justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>

                        <div>
                          <p className="text-xs sm:text-sm font-semibold text-stone-800 leading-snug">
                            {q.prompt}
                            {q.required && (
                              <span
                                className="text-red-600 ml-1 font-bold"
                                title="Resposta obrigatória"
                              >
                                *
                              </span>
                            )}
                          </p>

                          {q.placeholder && (
                            <p className="text-[11px] text-stone-600 mt-1 italic">
                              Orientação: "{q.placeholder}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleEditClick(q)}
                          className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors"
                          title="Editar enunciado"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                'Deseja realmente excluir esta pergunta do questionário?'
                              )
                            ) {
                              onDeleteQuestion(q.id);
                            }
                          }}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir pergunta"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

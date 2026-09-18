import React, { useState } from 'react';
import { PreCouncilReport, User } from '../types';
import {
  Send,
  CheckCircle,
  Clock,
  FileText,
  AlertCircle,
  Users,
  Layers,
  Sparkles,
  Trash2,
  Filter,
  Search,
  Calendar,
  Eye,
  ShieldAlert,
} from 'lucide-react';
import {
  SCHOOL_NAME,
  SCHOOL_SUBTITLE,
  REPORT_TITLE,
  AVAILABLE_CLASSES,
} from '../data/initialData';

interface ReleaseReportManagementProps {
  teachers: User[];
  reports: PreCouncilReport[];
  onReleaseReports: (newReports: PreCouncilReport[]) => void;
  onCancelRelease: (reportId: string) => void;
  onOpenReport: (report: PreCouncilReport) => void;
}

export const ReleaseReportManagement: React.FC<ReleaseReportManagementProps> = ({
  teachers,
  reports,
  onReleaseReports,
  onCancelRelease,
  onOpenReport,
}) => {
  const [bimester, setBimester] = useState('3º Bimestre');
  const [releaseMode, setReleaseMode] = useState<'all' | 'specific'>('all');
  const [selectedTeacherId, setSelectedTeacherId] = useState(
    teachers[0]?.id || ''
  );
  const [selectedClass, setSelectedClass] = useState(AVAILABLE_CLASSES[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [feedbackMessage, setFeedbackMessage] = useState<{
    text: string;
    type: 'success' | 'info' | 'warning';
  } | null>(null);

  const showFeedback = (
    text: string,
    type: 'success' | 'info' | 'warning' = 'success'
  ) => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  const handleRelease = (e: React.FormEvent) => {
    e.preventDefault();

    const todayStr = new Date().toISOString().split('T')[0];
    const created: PreCouncilReport[] = [];
    let skippedCount = 0;

    if (releaseMode === 'all') {
      // Release for all teachers based on their assigned classes & subjects
      teachers.forEach((teacher) => {
        const classes = teacher.classes && teacher.classes.length > 0 ? teacher.classes : ['6º Ano A'];
        const component = teacher.subject || 'Componente Curricular';

        classes.forEach((cls) => {
          // Check if already released for this teacher, class and bimester
          const alreadyExists = reports.some(
            (r) =>
              r.teacherId === teacher.id &&
              r.classGroup === cls &&
              r.bimester === bimester
          );

          if (alreadyExists) {
            skippedCount++;
          } else {
            created.push({
              id: `rep-rel-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
              schoolName: SCHOOL_NAME,
              schoolSubtitle: SCHOOL_SUBTITLE,
              title: REPORT_TITLE,
              teacherId: teacher.id,
              teacherName: teacher.name,
              component,
              classGroup: cls,
              date: todayStr,
              bimester,
              answers: {},
              status: 'pendente',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              pedagogaSignature: { signed: false },
              diretoraSignature: { signed: false },
            });
          }
        });
      });

      if (created.length === 0) {
        showFeedback(
          `Todas as fichas de ${bimester} para os professores cadastrados já haviam sido liberadas anteriormente. Nenhuma ficha duplicada foi gerada.`,
          'info'
        );
        return;
      }

      onReleaseReports(created);
      showFeedback(
        `Sucesso! ${created.length} fichas foram disponibilizadas para os professores no ${bimester}.${
          skippedCount > 0 ? ` (${skippedCount} já existentes foram preservadas).` : ''
        }`,
        'success'
      );
    } else {
      // Release for specific teacher & class
      const teacher = teachers.find((t) => t.id === selectedTeacherId);
      if (!teacher) {
        showFeedback('Selecione um professor válido.', 'warning');
        return;
      }

      const alreadyExists = reports.some(
        (r) =>
          r.teacherId === teacher.id &&
          r.classGroup === selectedClass &&
          r.bimester === bimester
      );

      if (alreadyExists) {
        showFeedback(
          `A ficha de ${teacher.name} para a turma "${selectedClass}" no ${bimester} já existe! Não é possível gerar fichas duplicadas.`,
          'warning'
        );
        return;
      }

      const newReport: PreCouncilReport = {
        id: `rep-rel-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        schoolName: SCHOOL_NAME,
        schoolSubtitle: SCHOOL_SUBTITLE,
        title: REPORT_TITLE,
        teacherId: teacher.id,
        teacherName: teacher.name,
        component: teacher.subject || 'Componente Curricular',
        classGroup: selectedClass,
        date: todayStr,
        bimester,
        answers: {},
        status: 'pendente',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pedagogaSignature: { signed: false },
        diretoraSignature: { signed: false },
      };

      onReleaseReports([newReport]);
      showFeedback(
        `Ficha disponibilizada para ${teacher.name} na turma "${selectedClass}" (${bimester})!`,
        'success'
      );
    }
  };

  // Metrics
  const totalReports = reports.length;
  const pendingCount = reports.filter((r) => r.status === 'pendente').length;
  const draftCount = reports.filter((r) => r.status === 'rascunho').length;
  const submittedCount = reports.filter((r) => r.status === 'enviado').length;
  const signedCount = reports.filter((r) => r.status === 'visto').length;

  // Filter list
  const filteredReports = reports.filter((r) => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match =
        r.teacherName.toLowerCase().includes(q) ||
        r.classGroup.toLowerCase().includes(q) ||
        r.component.toLowerCase().includes(q) ||
        r.bimester.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Title & Explanation */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                <Send className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-stone-900">
                  Liberação e Gestão de Fichas de Pré-Conselho
                </h2>
                <p className="text-xs text-stone-600 mt-0.5">
                  Controle oficial da Direção: apenas fichas liberadas por você ficam disponíveis para os professores preencherem.
                </p>
              </div>
            </div>
          </div>

          <div className="text-xs bg-amber-50 text-amber-900 border border-amber-200/80 px-3.5 py-2 rounded-xl flex items-center gap-2 shrink-0">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Evita preenchimentos acidentais e fichas duplicadas</span>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackMessage && (
          <div
            className={`mt-4 p-3.5 rounded-xl border text-xs flex items-center gap-2.5 animate-fade-in ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : feedbackMessage.type === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-medium">{feedbackMessage.text}</span>
          </div>
        )}

        {/* Action: Form to release sheets */}
        <div className="mt-6 pt-5 border-t border-stone-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            Disponibilizar Novas Fichas para Preenchimento
          </h3>

          <form onSubmit={handleRelease} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Bimestre */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Bimestre de Referência
                </label>
                <select
                  value={bimester}
                  onChange={(e) => setBimester(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500 font-medium"
                >
                  <option value="1º Bimestre">1º Bimestre</option>
                  <option value="2º Bimestre">2º Bimestre</option>
                  <option value="3º Bimestre">3º Bimestre</option>
                  <option value="4º Bimestre">4º Bimestre</option>
                </select>
              </div>

              {/* Mode Selection */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Modo de Liberação
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                      releaseMode === 'all'
                        ? 'bg-amber-50 border-amber-300 font-semibold text-amber-900'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="releaseMode"
                      checked={releaseMode === 'all'}
                      onChange={() => setReleaseMode('all')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span>Para TODOS os Professores (Lote Geral)</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                      releaseMode === 'specific'
                        ? 'bg-amber-50 border-amber-300 font-semibold text-amber-900'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="releaseMode"
                      checked={releaseMode === 'specific'}
                      onChange={() => setReleaseMode('specific')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span>Apenas para um Professor / Turma Específico</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Specific inputs if specific mode is selected */}
            {releaseMode === 'specific' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-stone-50 rounded-xl border border-stone-200 animate-fade-in">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Selecionar Professor
                  </label>
                  <select
                    value={selectedTeacherId}
                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900 focus:ring-2 focus:ring-amber-500"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.subject || 'Docente'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Selecionar Turma
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900 focus:ring-2 focus:ring-amber-500"
                  >
                    {AVAILABLE_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-2">
              <p className="text-[11px] text-stone-500">
                {releaseMode === 'all'
                  ? `Gerará automaticamente as fichas para os ${teachers.length} professores em suas turmas atribuídas.`
                  : 'Liberará uma única ficha específica para o docente selecionado.'}
              </p>

              <button
                type="submit"
                id="btn-release-reports"
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Disponibilizar Fichas para os Professores</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-stone-500">Total Fichas</p>
          <p className="text-xl font-extrabold text-stone-900 mt-1">{totalReports}</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-amber-700">Aguardando Início</p>
          <p className="text-xl font-extrabold text-amber-800 mt-1">{pendingCount}</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-blue-200 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-blue-700">Em Rascunho</p>
          <p className="text-xl font-extrabold text-blue-800 mt-1">{draftCount}</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-emerald-700">Enviadas</p>
          <p className="text-xl font-extrabold text-emerald-800 mt-1">{submittedCount}</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-purple-200 shadow-xs col-span-2 sm:col-span-1">
          <p className="text-[10px] uppercase font-bold text-purple-700">Com Visto</p>
          <p className="text-xl font-extrabold text-purple-800 mt-1">{signedCount}</p>
        </div>
      </div>

      {/* List of Dispatched Reports with Management & Status */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {/* Header & Filters */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50/70">
          <div>
            <h3 className="text-sm font-bold text-stone-900">
              Fichas Disponibilizadas no Sistema
            </h3>
            <p className="text-xs text-stone-500">
              Acompanhe em tempo real quais professores já preencheram e quais ainda estão pendentes
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar professor, turma..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs text-stone-800 focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">Todos os Status</option>
              <option value="pendente">Pendente (Não iniciada)</option>
              <option value="rascunho">Em Rascunho</option>
              <option value="enviado">Enviada pelo Professor</option>
              <option value="visto">Homologada com Visto</option>
            </select>
          </div>
        </div>

        {/* Table / List */}
        {filteredReports.length === 0 ? (
          <div className="p-12 text-center text-stone-500">
            <FileText className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-stone-700">Nenhuma ficha encontrada</p>
            <p className="text-xs text-stone-400 mt-1">
              Utilize o formulário acima para disponibilizar fichas aos professores.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {filteredReports.map((report) => {
              const isPendente = report.status === 'pendente';
              const isRascunho = report.status === 'rascunho';
              const isEnviado = report.status === 'enviado';
              const isVisto = report.status === 'visto';

              return (
                <div
                  key={report.id}
                  className="p-4 hover:bg-stone-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-xs text-stone-900">
                        {report.classGroup}
                      </span>
                      <span className="text-stone-300">•</span>
                      <span className="text-xs font-semibold text-stone-700">
                        {report.component}
                      </span>
                      <span className="text-stone-300">•</span>
                      <span className="text-xs text-stone-500">
                        {report.bimester}
                      </span>

                      {/* Status Tag */}
                      {isPendente && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Pendente (Aguardando Professor)
                        </span>
                      )}
                      {isRascunho && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                          <FileText className="w-3 h-3 text-blue-600" />
                          Rascunho em Andamento
                        </span>
                      )}
                      {isEnviado && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          Enviada pelo Docente
                        </span>
                      )}
                      {isVisto && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-purple-600" />
                          Homologada com Visto
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-stone-600">
                      Professor(a): <strong>{report.teacherName}</strong>
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {/* View Report if submitted or in progress */}
                    {!isPendente && (
                      <button
                        onClick={() => onOpenReport(report)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Respostas</span>
                      </button>
                    )}

                    {/* Cancel Release if still pending (not filled yet) */}
                    {isPendente && (
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `Deseja cancelar a liberação da ficha de "${report.classGroup} - ${report.component}" para ${report.teacherName}?`
                            )
                          ) {
                            onCancelRelease(report.id);
                          }
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-stone-500 hover:text-red-700 hover:bg-red-50 text-xs font-semibold rounded-lg transition-colors"
                        title="Cancelar liberação desta ficha"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Cancelar Liberação</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

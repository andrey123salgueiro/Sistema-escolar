import React, { useState } from 'react';
import { PreCouncilReport, User } from '../types';
import {
  FileText,
  Eye,
  Edit,
  Calendar,
  Layers,
  BookOpen,
  CheckCircle,
  Clock,
  Printer,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Send,
  Lock,
} from 'lucide-react';

interface TeacherReportListProps {
  currentUser: User;
  reports: PreCouncilReport[];
  onOpenReport: (report: PreCouncilReport) => void;
  onEditReport: (report: PreCouncilReport) => void;
  onPrintReport: (report: PreCouncilReport) => void;
}

export const TeacherReportList: React.FC<TeacherReportListProps> = ({
  currentUser,
  reports,
  onOpenReport,
  onEditReport,
  onPrintReport,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedBimester, setSelectedBimester] = useState<string>('all');

  // Filter reports only for this teacher
  const teacherReports = reports.filter((r) => r.teacherId === currentUser.id);

  const filtered = teacherReports.filter((r) => {
    if (selectedClass !== 'all' && r.classGroup !== selectedClass) return false;
    if (selectedBimester !== 'all' && r.bimester !== selectedBimester) return false;
    return true;
  });

  // Split into pending/draft vs submitted/signed
  const pendingReports = filtered.filter(
    (r) => r.status === 'pendente' || r.status === 'rascunho'
  );
  const submittedReports = filtered.filter(
    (r) => r.status === 'enviado' || r.status === 'visto'
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-stone-900">
              Minhas Fichas de Pré-Conselho
            </h2>
            <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Docente: {currentUser.name}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            As fichas oficiais são disponibilizadas diretamente pela <strong>Diretoria</strong> para cada turma e bimestre em que você leciona.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-stone-600 bg-stone-50 border border-stone-200 px-3 py-2 rounded-xl shrink-0">
          <Lock className="w-3.5 h-3.5 text-stone-400" />
          <span>Controle centralizado pela Direção</span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-3.5 rounded-xl border border-stone-200 flex flex-wrap items-center gap-3 text-xs shadow-xs">
        <span className="font-semibold text-stone-700">Filtrar por:</span>

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-800 focus:ring-2 focus:ring-amber-500 font-medium"
        >
          <option value="all">Todas as Turmas</option>
          {Array.from(new Set(teacherReports.map((r) => r.classGroup))).map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={selectedBimester}
          onChange={(e) => setSelectedBimester(e.target.value)}
          className="bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-800 focus:ring-2 focus:ring-amber-500 font-medium"
        >
          <option value="all">Todos os Bimestres</option>
          <option value="1º Bimestre">1º Bimestre</option>
          <option value="2º Bimestre">2º Bimestre</option>
          <option value="3º Bimestre">3º Bimestre</option>
          <option value="4º Bimestre">4º Bimestre</option>
        </select>

        <span className="ml-auto text-stone-600 font-medium text-[11px]">
          Total: {filtered.length} {filtered.length === 1 ? 'ficha atribuída' : 'fichas atribuídas'}
        </span>
      </div>

      {/* SECTION 1: PENDING / AVAILABLE FOR FILLING */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider text-[11px]">
              Fichas Liberadas para Preenchimento ({pendingReports.length})
            </h3>
          </div>
          <span className="text-[11px] text-stone-500">
            Aguardando suas respostas
          </span>
        </div>

        {pendingReports.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-8 text-center shadow-xs">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center mb-2">
              <CheckCircle className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-stone-800 mb-1">
              Nenhuma ficha pendente no momento!
            </h4>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Todas as fichas liberadas pela Direção para suas turmas já foram preenchidas e enviadas, ou a Diretora ainda não abriu uma nova rodada.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingReports.map((report) => {
              const isPendente = report.status === 'pendente';
              const isDraft = report.status === 'rascunho';

              return (
                <div
                  key={report.id}
                  className="bg-white rounded-2xl border-2 border-amber-300 hover:border-amber-400 p-5 shadow-xs transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                        <Layers className="w-3.5 h-3.5 text-amber-700" />
                        {report.classGroup}
                      </span>

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border flex items-center gap-1 ${
                          isDraft
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {isDraft ? 'Rascunho em Andamento' : 'Disponibilizada pela Direção'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-stone-900 mb-1 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-amber-700" />
                      {report.component}
                    </h4>

                    <div className="text-xs text-stone-600 space-y-1 my-3 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500">Bimestre:</span>
                        <span className="font-bold text-stone-800">{report.bimester}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500">Data de Liberação:</span>
                        <span className="font-medium text-stone-700">
                          {report.date.split('-').reverse().join('/')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Primary Call to Action */}
                  <div className="pt-3 border-t border-stone-100 mt-2">
                    <button
                      onClick={() => onEditReport(report)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span>
                        {isDraft ? 'Continuar Preenchimento da Ficha' : 'Preencher Ficha Agora'}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: SUBMITTED / HOMOLOGATED REPORTS */}
      <div className="space-y-3 pt-4 border-t border-stone-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider text-[11px]">
              Fichas Enviadas à Direção ({submittedReports.length})
            </h3>
          </div>
          <span className="text-[11px] text-stone-500">
            Arquivadas para o Conselho de Classe
          </span>
        </div>

        {submittedReports.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 text-center text-xs text-stone-500 shadow-xs">
            Nenhuma ficha foi enviada ainda. Preencha e envie suas fichas pendentes acima.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {submittedReports.map((report) => {
              const hasVisto =
                report.diretoraSignature?.signed || report.pedagogaSignature?.signed;

              return (
                <div
                  key={report.id}
                  className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-stone-100 text-stone-800 border border-stone-200">
                        <Layers className="w-3 h-3 text-stone-500" />
                        {report.classGroup}
                      </span>

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                          hasVisto
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        <CheckCircle className="w-3 h-3" />
                        {hasVisto ? 'Homologada / Com Visto' : 'Enviada à Direção'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-stone-900 mb-1 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-stone-400" />
                      {report.component}
                    </h4>

                    <div className="text-xs text-stone-600 space-y-1 my-3 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500">Bimestre:</span>
                        <span className="font-semibold text-stone-800">{report.bimester}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500">Data de Envio:</span>
                        <span className="font-medium text-stone-700">
                          {report.date.split('-').reverse().join('/')}
                        </span>
                      </div>
                      {report.diretoraSignature?.signed && (
                        <div className="text-[11px] text-purple-800 pt-1 border-t border-stone-200 font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                          Visto da Diretora registrado
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-stone-100 mt-2">
                    <button
                      onClick={() => onOpenReport(report)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg transition-colors"
                      title="Visualizar documento oficial"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Visualizar Ficha</span>
                    </button>

                    <button
                      onClick={() => onPrintReport(report)}
                      className="flex items-center gap-1 px-3 py-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg text-xs font-medium transition-colors"
                      title="Imprimir / Exportar PDF"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Imprimir</span>
                    </button>
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

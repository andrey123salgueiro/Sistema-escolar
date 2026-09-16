import React, { useState } from 'react';
import { PreCouncilReport, User } from '../types';
import {
  FileText,
  PlusCircle,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Layers,
  BookOpen,
  CheckCircle,
  Clock,
  Printer,
} from 'lucide-react';

interface TeacherReportListProps {
  currentUser: User;
  reports: PreCouncilReport[];
  onOpenReport: (report: PreCouncilReport) => void;
  onEditReport: (report: PreCouncilReport) => void;
  onDeleteReport: (reportId: string) => void;
  onNewReport: () => void;
  onPrintReport: (report: PreCouncilReport) => void;
}

export const TeacherReportList: React.FC<TeacherReportListProps> = ({
  currentUser,
  reports,
  onOpenReport,
  onEditReport,
  onDeleteReport,
  onNewReport,
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header & New Report Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-stone-900">
            Minhas Fichas de Pré-Conselho
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Gerencie e acompanhe todos os relatórios digitais enviados para a coordenação e direção.
          </p>
        </div>

        <button
          onClick={onNewReport}
          id="btn-create-new-report"
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Preencher Nova Ficha</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 mb-6 flex flex-wrap items-center gap-3 text-xs shadow-xs">
        <span className="font-semibold text-stone-700">Filtrar por:</span>

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-800 focus:ring-2 focus:ring-amber-500"
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
          className="bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-800 focus:ring-2 focus:ring-amber-500"
        >
          <option value="all">Todos os Bimestres</option>
          <option value="1º Bimestre">1º Bimestre</option>
          <option value="2º Bimestre">2º Bimestre</option>
          <option value="3º Bimestre">3º Bimestre</option>
          <option value="4º Bimestre">4º Bimestre</option>
        </select>

        <span className="ml-auto text-stone-600 font-medium">
          {filtered.length} {filtered.length === 1 ? 'ficha encontrada' : 'fichas encontradas'}
        </span>
      </div>

      {/* Reports Grid / Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-stone-800 mb-1">
            Nenhuma ficha encontrada
          </h3>
          <p className="text-xs text-stone-600 max-w-sm mx-auto mb-4">
            Você ainda não preencheu nenhuma ficha de pré-conselho com os filtros selecionados.
          </p>
          <button
            onClick={onNewReport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Preencher Primeira Ficha Agora</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((report) => {
            const hasVisto = report.diretoraSignature?.signed || report.pedagogaSignature?.signed;
            const isDraft = report.status === 'rascunho';

            return (
              <div
                key={report.id}
                className="bg-white rounded-xl border border-stone-200 hover:border-amber-400 p-5 transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                      <Layers className="w-3 h-3 text-amber-700" />
                      {report.classGroup}
                    </span>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                        hasVisto
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isDraft
                          ? 'bg-stone-100 text-stone-600 border-stone-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {hasVisto ? 'Homologado / Visto' : isDraft ? 'Rascunho' : 'Enviado à Direção'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-stone-900 mb-1 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-stone-400" />
                    {report.component}
                  </h3>

                  <div className="text-xs text-stone-700 space-y-1 my-3 bg-stone-50 p-2.5 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        Data da Ficha:
                      </span>
                      <span className="font-semibold text-stone-700">
                        {report.date.split('-').reverse().join('/')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        Bimestre:
                      </span>
                      <span className="font-semibold text-stone-700">{report.bimester}</span>
                    </div>

                    {report.diretoraSignature?.signed && (
                      <div className="flex items-center gap-1 text-[11px] text-emerald-700 pt-1 border-t border-stone-200 font-medium">
                        <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                        Visto da Direção homologado
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-stone-100 mt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenReport(report)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg transition-colors"
                      title="Ler relatório em formato oficial"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Visualizar</span>
                    </button>

                    <button
                      onClick={() => onPrintReport(report)}
                      className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
                      title="Imprimir / Salvar em PDF"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {isDraft && (
                      <button
                        onClick={() => onEditReport(report)}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-amber-700 hover:bg-amber-50 rounded-lg text-xs font-semibold transition-colors"
                        title="Editar rascunho"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (window.confirm('Tem certeza que deseja excluir esta ficha?')) {
                          onDeleteReport(report.id);
                        }
                      }}
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir ficha"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

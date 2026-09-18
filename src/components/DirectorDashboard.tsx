import React, { useState } from 'react';
import { PreCouncilReport, User } from '../types';
import {
  Archive,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  Eye,
  Trash2,
  FileCheck,
  Building,
  GraduationCap,
  Sparkles,
  Download,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

interface DirectorDashboardProps {
  reports: PreCouncilReport[];
  teachers: User[];
  onOpenReport: (report: PreCouncilReport) => void;
  onPrintReport: (report: PreCouncilReport) => void;
  onDeleteReport: (reportId: string) => void;
  onQuickSign: (reportId: string, signatureType: 'diretora' | 'pedagoga') => void;
}

export const DirectorDashboard: React.FC<DirectorDashboardProps> = ({
  reports,
  teachers,
  onOpenReport,
  onPrintReport,
  onDeleteReport,
  onQuickSign,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedTeacher, setSelectedTeacher] = useState('all');
  const [selectedBimester, setSelectedBimester] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'signed'>('all');

  // Only consider reports that have been submitted or signed for the digital archive
  const archivedReports = reports.filter((r) => r.status === 'enviado' || r.status === 'visto');

  // Statistics
  const totalReports = archivedReports.length;
  const pendingDirectorReview = archivedReports.filter((r) => !r.diretoraSignature?.signed).length;
  const fullySigned = archivedReports.filter((r) => r.diretoraSignature?.signed).length;

  // Unique lists for filters
  const classesList = Array.from(new Set(archivedReports.map((r) => r.classGroup))).sort();
  const bimestersList = Array.from(new Set(archivedReports.map((r) => r.bimester))).sort();

  // Filtered reports
  const filteredReports = archivedReports.filter((r) => {
    if (selectedClass !== 'all' && r.classGroup !== selectedClass) return false;
    if (selectedTeacher !== 'all' && r.teacherId !== selectedTeacher) return false;
    if (selectedBimester !== 'all' && r.bimester !== selectedBimester) return false;

    if (statusFilter === 'pending' && r.diretoraSignature?.signed) return false;
    if (statusFilter === 'signed' && !r.diretoraSignature?.signed) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchMeta =
        r.teacherName.toLowerCase().includes(q) ||
        r.classGroup.toLowerCase().includes(q) ||
        r.component.toLowerCase().includes(q) ||
        r.bimester.toLowerCase().includes(q);

      // Also search through the teacher's answers (e.g., student names mentioned)
      const matchAnswers = Object.values(r.answers).some(
        (ans) => typeof ans === 'string' && ans.toLowerCase().includes(q)
      );

      if (!matchMeta && !matchAnswers) return false;
    }

    return true;
  });

  // Export summary to CSV
  const handleExportCSV = () => {
    const headers = ['Turma', 'Componente', 'Professor', 'Data', 'Bimestre', 'Status', 'Visto Diretoria'];
    const rows = filteredReports.map((r) => [
      `"${r.classGroup}"`,
      `"${r.component}"`,
      `"${r.teacherName}"`,
      `"${r.date}"`,
      `"${r.bimester}"`,
      `"${r.status}"`,
      `"${r.diretoraSignature?.signed ? 'Homologado' : 'Pendente'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorios_pre_conselho_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Title & Institutional Intro */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Archive className="w-5 h-5 text-amber-700" />
            <h2 className="text-xl font-bold text-stone-900">
              Arquivo Digital & Organização de Pré-Conselho
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Centralização automática das fichas preenchidas pelos professores da Escola Estadual do Campo Frei Graciano Droessler.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-xl transition-colors shadow-xs"
            title="Exportar listagem em planilha CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Exportar Planilha (CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
              Total de Fichas Arquivadas
            </p>
            <p className="text-2xl font-black text-stone-900">{totalReports}</p>
            <p className="text-[11px] text-stone-600">
              {classesList.length} turmas com registros
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
              Aguardando Visto da Direção
            </p>
            <p className="text-2xl font-black text-amber-800">{pendingDirectorReview}</p>
            <p className="text-[11px] text-amber-700 font-medium">
              Necessitam leitura e homologação
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
              Homologadas com Visto
            </p>
            <p className="text-2xl font-black text-emerald-700">{fullySigned}</p>
            <p className="text-[11px] text-emerald-600">Prontas para o Conselho de Classe</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 mb-6 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por professor, aluno citado, conteúdo ou turma..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Turma Filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-800 focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">Todas as Turmas</option>
            {classesList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Professor Filter */}
          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            className="bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-800 focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">Todos os Professores</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.subject || 'Docente'})
              </option>
            ))}
          </select>

          {/* Bimestre Filter */}
          <select
            value={selectedBimester}
            onChange={(e) => setSelectedBimester(e.target.value)}
            className="bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-800 focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">Todos os Bimestres</option>
            <option value="1º Bimestre">1º Bimestre</option>
            <option value="2º Bimestre">2º Bimestre</option>
            <option value="3º Bimestre">3º Bimestre</option>
            <option value="4º Bimestre">4º Bimestre</option>
          </select>

          {/* Status buttons */}
          <div className="flex rounded-lg border border-stone-200 p-0.5 bg-stone-100 text-xs font-medium text-stone-600">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1.5 rounded-md transition-all ${
                statusFilter === 'all' ? 'bg-white text-stone-900 shadow-xs font-semibold' : ''
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-2.5 py-1.5 rounded-md transition-all ${
                statusFilter === 'pending' ? 'bg-white text-stone-900 shadow-xs font-semibold' : ''
              }`}
            >
              Sem Visto
            </button>
            <button
              onClick={() => setStatusFilter('signed')}
              className={`px-2.5 py-1.5 rounded-md transition-all ${
                statusFilter === 'signed' ? 'bg-white text-stone-900 shadow-xs font-semibold' : ''
              }`}
            >
              Homologados
            </button>
          </div>
        </div>

        {/* Active search summary */}
        <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
          <span>
            Exibindo <strong>{filteredReports.length}</strong> de {totalReports} relatórios
          </span>
          {(searchTerm || selectedClass !== 'all' || selectedTeacher !== 'all' || selectedBimester !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedClass('all');
                setSelectedTeacher('all');
                setSelectedBimester('all');
                setStatusFilter('all');
              }}
              className="text-amber-700 hover:text-amber-800 text-[11px] font-semibold underline"
            >
              Limpar todos os filtros
            </button>
          )}
        </div>
      </div>

      {/* Reports Table / List */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-12 text-center">
          <Archive className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-stone-800">
            Nenhuma ficha encontrada no arquivo
          </h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Verifique os filtros selecionados ou aguarde o envio das fichas digitais pelos professores cadastrados.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200 text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Turma / Período</th>
                  <th className="py-3.5 px-4">Componente Curricular</th>
                  <th className="py-3.5 px-4">Professor(a)</th>
                  <th className="py-3.5 px-4">Data de Envio</th>
                  <th className="py-3.5 px-4">Visto da Direção</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredReports.map((report) => {
                  const isSigned = report.diretoraSignature?.signed;
                  const isPedagogaSigned = report.pedagogaSignature?.signed;

                  return (
                    <tr
                      key={report.id}
                      className="hover:bg-amber-50/40 transition-colors group cursor-pointer"
                      onClick={() => onOpenReport(report)}
                    >
                      {/* Turma & Bimestre */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          {report.classGroup}
                        </div>
                        <div className="text-[11px] text-stone-500 font-medium">
                          {report.bimester}
                        </div>
                      </td>

                      {/* Componente */}
                      <td className="py-3 px-4 font-semibold text-stone-800">
                        {report.component}
                      </td>

                      {/* Professor */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-stone-900">{report.teacherName}</div>
                        <div className="text-[10px] text-stone-400">ID: {report.teacherId}</div>
                      </td>

                      {/* Data */}
                      <td className="py-3 px-4 text-stone-600">
                        {report.date.split('-').reverse().join('/')}
                      </td>

                      {/* Visto Status */}
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        {isSigned ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            Visto Registrado
                          </span>
                        ) : (
                          <button
                            onClick={() => onQuickSign(report.id, 'diretora')}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg transition-colors"
                            title="Aprovar e homologar visto da direção rapidamente"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>Assinar Visto</span>
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3 px-4 text-right space-x-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => onOpenReport(report)}
                          className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-lg text-xs transition-colors inline-flex items-center gap-1"
                          title="Ler ficha detalhada"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ler</span>
                        </button>

                        <button
                          onClick={() => onPrintReport(report)}
                          className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors inline-flex"
                          title="Imprimir formato oficial da folha"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm('Excluir permanentemente este relatório do arquivo?')) {
                              onDeleteReport(report.id);
                            }
                          }}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex"
                          title="Excluir relatório"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  PreCouncilReport,
  SchoolClass,
  Student,
  User,
  ConceptRating,
} from '../types';
import { EVALUATION_DIMENSIONS, SCHOOL_NAME, SCHOOL_SUBTITLE } from '../data/initialData';
import {
  TrendingUp,
  Printer,
  Award,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Users,
  Layers,
  School,
  Sparkles,
  BookOpen,
  PieChart,
} from 'lucide-react';

interface ClassPerformanceProps {
  classes: SchoolClass[];
  students: Student[];
  reports: PreCouncilReport[];
  teachers: User[];
  currentUser: User;
}

export const ClassPerformance: React.FC<ClassPerformanceProps> = ({
  classes,
  students,
  reports,
  teachers,
  currentUser,
}) => {
  const isDiretora = currentUser.role === 'diretora';
  const defaultClass = isDiretora
    ? 'all'
    : currentUser.classes?.[0] || 'all';

  const [selectedClass, setSelectedClass] = useState<string>(defaultClass);
  const [selectedBimester, setSelectedBimester] = useState<string>('all');

  // Filter archived reports (enviado or visto)
  const activeReports = reports.filter((r) => {
    if (r.status !== 'enviado' && r.status !== 'visto') return false;
    if (selectedClass !== 'all' && r.classGroup !== selectedClass) return false;
    if (selectedBimester !== 'all' && r.bimester !== selectedBimester) return false;
    if (!isDiretora && currentUser.classes && currentUser.classes.length > 0) {
      if (selectedClass === 'all' && !currentUser.classes.includes(r.classGroup)) {
        return false;
      }
    }
    return true;
  });

  // Consolidate rating stats
  let countOtimo = 0;
  let countBom = 0;
  let countRegular = 0;
  let countRuim = 0;

  const dimensionStats: Record<
    string,
    { otimo: number; bom: number; regular: number; ruim: number; total: number }
  > = {};

  EVALUATION_DIMENSIONS.forEach((dim) => {
    dimensionStats[dim.id] = { otimo: 0, bom: 0, regular: 0, ruim: 0, total: 0 };
  });

  // Also collect student ratings
  const studentMap: Record<
    string,
    { name: string; classGroup: string; otimo: number; bom: number; regular: number; ruim: number; notes: string[] }
  > = {};

  activeReports.forEach((rep) => {
    if (rep.dimensionRatings) {
      Object.entries(rep.dimensionRatings).forEach(([dimId, val]) => {
        const rating = val as ConceptRating;
        if (dimensionStats[dimId]) {
          dimensionStats[dimId][rating]++;
          dimensionStats[dimId].total++;
        }
        if (rating === 'otimo') countOtimo++;
        if (rating === 'bom') countBom++;
        if (rating === 'regular') countRegular++;
        if (rating === 'ruim') countRuim++;
      });
    }

    if (rep.studentRatings) {
      Object.entries(rep.studentRatings).forEach(([stdId, val]) => {
        const data = val as { rating: ConceptRating; notes?: string };
        if (!data || !data.rating) return;
        if (!studentMap[stdId]) {
          const found = students.find((s) => s.id === stdId);
          studentMap[stdId] = {
            name: found?.name || `Estudante #${stdId.slice(-4)}`,
            classGroup: rep.classGroup,
            otimo: 0,
            bom: 0,
            regular: 0,
            ruim: 0,
            notes: [],
          };
        }
        studentMap[stdId][data.rating]++;
        if (data.notes) studentMap[stdId].notes.push(`${rep.component}: ${data.notes}`);
      });
    }
  });

  const totalRatings = countOtimo + countBom + countRegular + countRuim;
  const pctOtimo = totalRatings > 0 ? Math.round((countOtimo / totalRatings) * 100) : 0;
  const pctBom = totalRatings > 0 ? Math.round((countBom / totalRatings) * 100) : 0;
  const pctRegular = totalRatings > 0 ? Math.round((countRegular / totalRatings) * 100) : 0;
  const pctRuim = totalRatings > 0 ? Math.round((countRuim / totalRatings) * 100) : 0;

  // Students requiring pedagogical attention
  const studentsNeedingAttention = Object.values(studentMap)
    .filter((s) => s.ruim > 0 || s.regular > 1)
    .sort((a, b) => b.ruim - a.ruim || b.regular - a.regular);

  // Top performing students
  const standoutStudents = Object.values(studentMap)
    .filter((s) => s.otimo > 0 && s.ruim === 0)
    .sort((a, b) => b.otimo - a.otimo);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Control Header & Filters (Hidden on print) */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-700" />
            <h2 className="text-xl font-bold text-stone-900">
              {isDiretora ? 'Relatório de Desempenho Geral da Escola' : 'Desempenho da Turma'}
            </h2>
            <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Estatísticas de Conceitos (Ótimo, Bom, Regular, Ruim)
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Análise consolidada do rendimento, participação e indicadores pedagógicos para o Conselho de Classe.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Turma filter */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-stone-500 mb-0.5">
              Turma
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500 font-bold"
            >
              <option value="all">Todas as Turmas</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.name}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Bimestre filter */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-stone-500 mb-0.5">
              Bimestre
            </label>
            <select
              value={selectedBimester}
              onChange={(e) => setSelectedBimester(e.target.value)}
              className="bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500 font-semibold"
            >
              <option value="all">Todos os Bimestres</option>
              <option value="1º Bimestre">1º Bimestre</option>
              <option value="2º Bimestre">2º Bimestre</option>
              <option value="3º Bimestre">3º Bimestre</option>
              <option value="4º Bimestre">4º Bimestre</option>
            </select>
          </div>

          {/* Print button */}
          <div className="pt-4 sm:pt-0">
            <button
              onClick={handlePrint}
              id="btn-print-performance"
              className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Imprimir Desempenho</span>
            </button>
          </div>
        </div>
      </div>

      {/* PRINTABLE OFFICIAL PERFORMANCE REPORT */}
      <div id="printable-performance" className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs print:p-0 print:border-none print:shadow-none space-y-6">
        {/* Document Header */}
        <div className="border-b-2 border-stone-800 pb-5 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <School className="w-6 h-6 text-stone-800" />
            <span className="font-extrabold text-sm sm:text-base uppercase tracking-wide font-serif text-stone-900">
              {SCHOOL_NAME}
            </span>
          </div>
          <p className="text-xs uppercase tracking-wider text-stone-600 font-semibold">
            {SCHOOL_SUBTITLE}
          </p>
          <div className="my-2 mx-auto w-24 h-0.5 bg-amber-600" />
          <h1 className="text-base sm:text-lg font-black uppercase tracking-widest text-stone-900">
            RELATÓRIO CONSOLIDADO DE DESEMPENHO E AVALIAÇÃO CONCEITUAL
          </h1>

          <div className="mt-4 pt-3 border-t border-stone-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left text-xs">
            <div>
              <span className="text-stone-500 font-medium">Turma(s):</span>{' '}
              <strong className="text-stone-900">
                {selectedClass === 'all' ? 'Todas as Turmas da Escola' : selectedClass}
              </strong>
            </div>
            <div>
              <span className="text-stone-500 font-medium">Período:</span>{' '}
              <strong className="text-stone-900">
                {selectedBimester === 'all' ? 'Todos os Bimestres' : selectedBimester}
              </strong>
            </div>
            <div>
              <span className="text-stone-500 font-medium">Fichas Analisadas:</span>{' '}
              <strong className="text-stone-900">{activeReports.length} relatórios</strong>
            </div>
            <div>
              <span className="text-stone-500 font-medium">Data de Emissão:</span>{' '}
              <strong className="text-stone-900">{new Date().toLocaleDateString('pt-BR')}</strong>
            </div>
          </div>
        </div>

        {/* Global Concept Distribution (Ótimo, Bom, Regular, Ruim) */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3 flex items-center gap-2 font-serif">
            <PieChart className="w-4 h-4 text-amber-700" />
            <span>Distribuição Geral dos Conceitos Pedagógicos</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Ótimo */}
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wide">
                  Ótimo
                </span>
                <span className="text-xs font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                  {pctOtimo}%
                </span>
              </div>
              <p className="text-3xl font-black text-emerald-700 mt-2">{countOtimo}</p>
              <p className="text-[11px] text-emerald-700 mt-1">Desenvolvimento pleno</p>
            </div>

            {/* Bom */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-blue-800 uppercase tracking-wide">
                  Bom
                </span>
                <span className="text-xs font-bold bg-blue-200 text-blue-900 px-2 py-0.5 rounded-full">
                  {pctBom}%
                </span>
              </div>
              <p className="text-3xl font-black text-blue-700 mt-2">{countBom}</p>
              <p className="text-[11px] text-blue-700 mt-1">Atinge as metas propostas</p>
            </div>

            {/* Regular */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-amber-800 uppercase tracking-wide">
                  Regular
                </span>
                <span className="text-xs font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                  {pctRegular}%
                </span>
              </div>
              <p className="text-3xl font-black text-amber-700 mt-2">{countRegular}</p>
              <p className="text-[11px] text-amber-700 mt-1">Necessita intervenção e apoio</p>
            </div>

            {/* Ruim */}
            <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-rose-800 uppercase tracking-wide">
                  Ruim / Crítico
                </span>
                <span className="text-xs font-bold bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full">
                  {pctRuim}%
                </span>
              </div>
              <p className="text-3xl font-black text-rose-700 mt-2">{countRuim}</p>
              <p className="text-[11px] text-rose-700 mt-1">Atenção urgente no Conselho</p>
            </div>
          </div>

          {/* Visual Percentage Progress Bar */}
          <div className="mt-4 bg-stone-100 p-3 rounded-xl border border-stone-200">
            <div className="flex items-center justify-between text-[11px] font-bold text-stone-600 mb-1.5">
              <span>Proporção Geral:</span>
              <span>Total de {totalRatings} avaliações conceituais registradas</span>
            </div>
            <div className="w-full h-3 rounded-full overflow-hidden flex bg-stone-200">
              <div
                style={{ width: `${pctOtimo}%` }}
                className="bg-emerald-600 h-full transition-all"
                title={`Ótimo: ${pctOtimo}%`}
              />
              <div
                style={{ width: `${pctBom}%` }}
                className="bg-blue-600 h-full transition-all"
                title={`Bom: ${pctBom}%`}
              />
              <div
                style={{ width: `${pctRegular}%` }}
                className="bg-amber-500 h-full transition-all"
                title={`Regular: ${pctRegular}%`}
              />
              <div
                style={{ width: `${pctRuim}%` }}
                className="bg-rose-600 h-full transition-all"
                title={`Ruim: ${pctRuim}%`}
              />
            </div>
          </div>
        </div>

        {/* Dimension Breakdown Performance */}
        <div className="pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3 flex items-center gap-2 font-serif">
            <BarChart3 className="w-4 h-4 text-amber-700" />
            <span>Desempenho por Critério Pedagógico Avaliado</span>
          </h3>

          <div className="border border-stone-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px] font-semibold">
                <tr>
                  <th className="py-3 px-4">Critério Pedagógico</th>
                  <th className="py-3 px-3 text-center">Ótimo</th>
                  <th className="py-3 px-3 text-center">Bom</th>
                  <th className="py-3 px-3 text-center">Regular</th>
                  <th className="py-3 px-3 text-center">Ruim</th>
                  <th className="py-3 px-4 text-right">Diagnóstico</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {EVALUATION_DIMENSIONS.map((dim) => {
                  const stat = dimensionStats[dim.id];
                  const total = stat.total;
                  const regularRuimSum = stat.regular + stat.ruim;
                  const isCritical = total > 0 && regularRuimSum / total > 0.4;
                  const isExcellent = total > 0 && stat.otimo / total > 0.5;

                  return (
                    <tr key={dim.id} className="hover:bg-stone-50/50">
                      <td className="py-3 px-4">
                        <p className="font-bold text-stone-900">{dim.name}</p>
                        <p className="text-[11px] text-stone-500">{dim.description}</p>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-700 bg-emerald-50/40">
                        {stat.otimo}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-blue-700 bg-blue-50/40">
                        {stat.bom}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-amber-700 bg-amber-50/40">
                        {stat.regular}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-rose-700 bg-rose-50/40">
                        {stat.ruim}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isCritical ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            Atenção Especial
                          </span>
                        ) : isExcellent ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <Award className="w-3 h-3 text-emerald-600" />
                            Destaque Positivo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-stone-700 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full">
                            Satisfatório
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Student Lists: Highlights vs Interventions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 page-break-inside-avoid">
          {/* Attention list */}
          <div className="border border-rose-200 bg-rose-50/30 rounded-xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900 mb-2 flex items-center gap-1.5 font-serif">
              <AlertTriangle className="w-4 h-4 text-rose-700" />
              <span>Estudantes que Demandam Intervenção Pedagógica ({studentsNeedingAttention.length})</span>
            </h4>
            <p className="text-[11px] text-stone-600 mb-3">
              Alunos avaliados com conceitos Regular ou Ruim em um ou mais componentes curriculares.
            </p>

            {studentsNeedingAttention.length === 0 ? (
              <p className="text-xs text-stone-500 italic py-2">
                Nenhum estudante com conceito crítico registrado no período.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {studentsNeedingAttention.map((s, idx) => (
                  <div key={idx} className="bg-white border border-rose-200 rounded-lg p-2.5 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-stone-900">{s.name}</span>
                      <span className="text-[10px] font-bold text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded">
                        {s.classGroup}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] mb-1">
                      {s.ruim > 0 && (
                        <span className="font-bold text-rose-800 bg-rose-100 px-1.5 py-0.5 rounded">
                          {s.ruim} Ruim
                        </span>
                      )}
                      {s.regular > 0 && (
                        <span className="font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                          {s.regular} Regular
                        </span>
                      )}
                    </div>
                    {s.notes.length > 0 && (
                      <p className="text-[10px] text-stone-500 italic">
                        {s.notes.join(' ; ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Standouts list */}
          <div className="border border-emerald-200 bg-emerald-50/30 rounded-xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-2 flex items-center gap-1.5 font-serif">
              <Award className="w-4 h-4 text-emerald-700" />
              <span>Estudantes Destaque em Aprendizagem e Postura ({standoutStudents.length})</span>
            </h4>
            <p className="text-[11px] text-stone-600 mb-3">
              Alunos com histórico exemplar de avaliações Ótimo e protagonismo escolar.
            </p>

            {standoutStudents.length === 0 ? (
              <p className="text-xs text-stone-500 italic py-2">
                Nenhum estudante destaque isolado no filtro selecionado.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {standoutStudents.slice(0, 10).map((s, idx) => (
                  <div key={idx} className="bg-white border border-emerald-200 rounded-lg p-2.5 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-stone-900">{s.name}</span>
                      <span className="text-[10px] font-bold text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded">
                        {s.classGroup}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                        {s.otimo} Ótimo
                      </span>
                      {s.bom > 0 && (
                        <span className="font-bold text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded">
                          {s.bom} Bom
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Official Signatures for Council Minutes */}
        <div className="mt-8 pt-6 border-t-2 border-stone-800 page-break-inside-avoid">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-center text-xs font-serif">
            <div>
              <div className="border-b border-stone-400 pb-1 mb-1 font-sans font-semibold text-stone-900">
                Coordenação Pedagógica
              </div>
              <p className="text-[11px] text-stone-600">Assinatura do(a) Pedagogo(a)</p>
            </div>

            <div>
              <div className="border-b border-stone-400 pb-1 mb-1 font-sans font-semibold text-stone-900">
                Diretora Escolar
              </div>
              <p className="text-[11px] text-stone-600">Assinatura da Direção</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

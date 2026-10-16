import React, { useState, useEffect, useMemo } from 'react';
import {
  PreCouncilReport,
  Question,
  QuestionSection,
  SchoolClass,
  Student,
  User,
  ConceptRating,
} from '../types';
import { EVALUATION_DIMENSIONS, SCHOOL_NAME, SCHOOL_SUBTITLE } from '../data/initialData';
import {
  Printer,
  Layers,
  Award,
  AlertTriangle,
  CheckCircle2,
  Filter,
  FileText,
  School,
  Clock,
  Sparkles,
  Calendar,
  Users,
} from 'lucide-react';

interface ClassPanoramaProps {
  classes: SchoolClass[];
  students: Student[];
  reports: PreCouncilReport[];
  teachers: User[];
  questions: Question[];
  sections: QuestionSection[];
  currentUser?: User;
}

export const ClassPanorama: React.FC<ClassPanoramaProps> = ({
  classes = [],
  students = [],
  reports = [],
  teachers = [],
  questions = [],
  sections = [],
  currentUser,
}) => {
  const isTeacher = currentUser?.role === 'professor';

  // Determine initial class safely
  const initialClass = useMemo(() => {
    if (isTeacher && currentUser?.classes && currentUser.classes.length > 0) {
      const match = classes.find((c) => currentUser.classes?.includes(c.name));
      if (match) return match.name;
    }
    return classes[0]?.name || '6º Ano A';
  }, [classes, isTeacher, currentUser]);

  const [selectedClass, setSelectedClass] = useState<string>(initialClass);
  const [selectedBimester, setSelectedBimester] = useState<string>('Todos');

  // Keep selectedClass synchronized if classes list changes or loads
  useEffect(() => {
    if (classes.length > 0 && (!selectedClass || !classes.some((c) => c.name === selectedClass))) {
      setSelectedClass(initialClass);
    }
  }, [classes, initialClass, selectedClass]);

  // Filter completed/submitted reports for this class and bimester
  const classReports = useMemo(() => {
    return reports.filter((r) => {
      if (r.classGroup !== selectedClass) return false;
      if (selectedBimester !== 'Todos' && r.bimester !== selectedBimester) return false;
      return r.status === 'enviado' || r.status === 'visto';
    });
  }, [reports, selectedClass, selectedBimester]);

  // Filter pending reports for this class and bimester
  const pendingReports = useMemo(() => {
    return reports.filter((r) => {
      if (r.classGroup !== selectedClass) return false;
      if (selectedBimester !== 'Todos' && r.bimester !== selectedBimester) return false;
      return r.status === 'pendente' || r.status === 'rascunho';
    });
  }, [reports, selectedClass, selectedBimester]);

  // Filter students for this class
  const classStudents = useMemo(() => {
    return students.filter((s) => s.classGroup === selectedClass);
  }, [students, selectedClass]);

  // Consolidate dimension ratings
  const { dimensionCounts, totalDimensionRatings, totalOtimo, totalBom, totalRegular, totalRuim } =
    useMemo(() => {
      const counts: Record<
        string,
        { otimo: number; bom: number; regular: number; ruim: number }
      > = {};

      EVALUATION_DIMENSIONS.forEach((dim) => {
        counts[dim.id] = { otimo: 0, bom: 0, regular: 0, ruim: 0 };
      });

      let totalDim = 0;
      let otimo = 0;
      let bom = 0;
      let regular = 0;
      let ruim = 0;

      classReports.forEach((rep) => {
        if (rep.dimensionRatings) {
          Object.entries(rep.dimensionRatings).forEach(([dimId, rating]) => {
            if (counts[dimId] && rating) {
              counts[dimId][rating as ConceptRating] =
                (counts[dimId][rating as ConceptRating] || 0) + 1;
              totalDim++;
              if (rating === 'otimo') otimo++;
              if (rating === 'bom') bom++;
              if (rating === 'regular') regular++;
              if (rating === 'ruim') ruim++;
            }
          });
        }
      });

      return {
        dimensionCounts: counts,
        totalDimensionRatings: totalDim,
        totalOtimo: otimo,
        totalBom: bom,
        totalRegular: regular,
        totalRuim: ruim,
      };
    }, [classReports]);

  // Sort sections and map questions
  const sortedSections = useMemo(() => {
    return [...sections].sort((a, b) => a.order - b.order);
  }, [sections]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Top Filter and Actions Bar (Hidden on print) */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-700" />
            <h2 className="text-xl font-bold text-stone-900">
              Panorama Integrado da Turma
            </h2>
            <span className="text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded-full">
              Visão Consolidada
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Consolidação das avaliações, respostas e conceitos enviados pelos professores.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Select Turma */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-stone-500 mb-0.5">
              Turma
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500 font-bold"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.name}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Select Bimestre */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-stone-500 mb-0.5">
              Bimestre
            </label>
            <select
              value={selectedBimester}
              onChange={(e) => setSelectedBimester(e.target.value)}
              className="bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500 font-semibold"
            >
              <option value="Todos">Todos os Bimestres</option>
              <option value="1º Bimestre">1º Bimestre</option>
              <option value="2º Bimestre">2º Bimestre</option>
              <option value="3º Bimestre">3º Bimestre</option>
              <option value="4º Bimestre">4º Bimestre</option>
            </select>
          </div>

          {/* Print Button */}
          <div className="pt-4 sm:pt-0">
            <button
              onClick={handlePrint}
              id="btn-print-panorama"
              className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Imprimir Panorama</span>
            </button>
          </div>
        </div>
      </div>

      {/* PRINTABLE OFFICIAL PANORAMA SHEET */}
      <div
        id="printable-panorama"
        className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs print:p-0 print:border-none print:shadow-none space-y-6"
      >
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
            PANORAMA GERAL DA TURMA / PRÉ-CONSELHO DE CLASSE
          </h1>

          <div className="mt-4 pt-3 border-t border-stone-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left text-xs">
            <div>
              <span className="text-stone-500 font-medium">Turma:</span>{' '}
              <strong className="text-stone-900">{selectedClass}</strong>
            </div>
            <div>
              <span className="text-stone-500 font-medium">Período:</span>{' '}
              <strong className="text-stone-900">{selectedBimester}</strong>
            </div>
            <div>
              <span className="text-stone-500 font-medium">Total de Alunos:</span>{' '}
              <strong className="text-stone-900">{classStudents.length} matriculados</strong>
            </div>
            <div>
              <span className="text-stone-500 font-medium">Fichas Respondidas:</span>{' '}
              <strong className="text-stone-900">
                {classReports.length} {classReports.length === 1 ? 'componente' : 'componentes'}
              </strong>
            </div>
          </div>
        </div>

        {/* Fichas Status Overview: Respondidas vs Pendentes */}
        {(classReports.length > 0 || pendingReports.length > 0) && (
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-stone-200">
              <span className="font-bold text-stone-800 uppercase tracking-wide text-[11px]">
                Status do Envio de Fichas por Disciplina ({selectedClass})
              </span>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {classReports.length} Respondida{classReports.length === 1 ? '' : 's'}
                </span>
                {pendingReports.length > 0 && (
                  <span className="text-amber-700 font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    {pendingReports.length} Aguardando preenchimento
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {classReports.map((r) => (
                <span
                  key={r.id}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 font-medium text-[11px]"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <strong>{r.component}</strong> ({r.teacherName})
                </span>
              ))}

              {pendingReports.map((r) => (
                <span
                  key={r.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-[11px]"
                >
                  <Clock className="w-3 h-3 text-amber-600" />
                  <span className="font-semibold">{r.component}</span>
                  <span className="text-amber-700">({r.teacherName})</span>
                  <span className="text-amber-600 text-[10px] font-bold uppercase tracking-wider bg-amber-100/80 px-1 py-0.2 rounded">Pendente</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Alert if no completed reports yet */}
        {classReports.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center text-xs text-amber-900 space-y-3">
            <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto" />
            <h4 className="font-bold text-sm">
              Nenhuma ficha docente respondida e enviada para {selectedClass}{' '}
              {selectedBimester !== 'Todos' ? `no ${selectedBimester}` : ''}
            </h4>
            <p className="text-amber-800 max-w-lg mx-auto">
              {pendingReports.length > 0
                ? `Existem ${pendingReports.length} fichas liberadas pela Direção para esta turma aguardando envio pelos professores. Quando preenchidas, seus conceitos e respostas aparecerão aqui automaticamente em tempo real.`
                : 'Quando os professores preencherem suas fichas de pré-conselho, esta página consolidará instantaneamente os conceitos gerais, as respostas de cada questão e a avaliação nominal de cada aluno.'}
            </p>
            {selectedBimester !== 'Todos' && (
              <button
                type="button"
                onClick={() => setSelectedBimester('Todos')}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Ver Todos os Bimestres</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Conceito Ótimo
                </span>
                <p className="text-2xl font-black text-emerald-700 mt-0.5">{totalOtimo}</p>
                <span className="text-[10px] text-emerald-800">
                  {totalDimensionRatings > 0
                    ? Math.round((totalOtimo / totalDimensionRatings) * 100)
                    : 0}
                  % das avaliações
                </span>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">
                  Conceito Bom
                </span>
                <p className="text-2xl font-black text-blue-700 mt-0.5">{totalBom}</p>
                <span className="text-[10px] text-blue-800">
                  {totalDimensionRatings > 0
                    ? Math.round((totalBom / totalDimensionRatings) * 100)
                    : 0}
                  % das avaliações
                </span>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                  Conceito Regular
                </span>
                <p className="text-2xl font-black text-amber-700 mt-0.5">{totalRegular}</p>
                <span className="text-[10px] text-amber-800">
                  {totalDimensionRatings > 0
                    ? Math.round((totalRegular / totalDimensionRatings) * 100)
                    : 0}
                  % das avaliações
                </span>
              </div>

              <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
                  Conceito Ruim / Crítico
                </span>
                <p className="text-2xl font-black text-rose-700 mt-0.5">{totalRuim}</p>
                <span className="text-[10px] text-rose-800">
                  {totalDimensionRatings > 0
                    ? Math.round((totalRuim / totalDimensionRatings) * 100)
                    : 0}
                  % das avaliações
                </span>
              </div>
            </div>

            {/* Dimension Breakdown Table */}
            <div className="border border-stone-200 rounded-xl overflow-hidden shadow-xs">
              <div className="bg-stone-50 px-4 py-2.5 border-b border-stone-200 font-bold text-xs text-stone-800 uppercase tracking-wide font-serif">
                Avaliação dos Critérios Pedagógicos da Turma por Nível de Desempenho
              </div>
              <div className="divide-y divide-stone-100 text-xs">
                {EVALUATION_DIMENSIONS.map((dim) => {
                  const counts = dimensionCounts[dim.id] || {
                    otimo: 0,
                    bom: 0,
                    regular: 0,
                    ruim: 0,
                  };

                  return (
                    <div
                      key={dim.id}
                      className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="sm:w-1/2">
                        <p className="font-bold text-stone-900">{dim.name}</p>
                        <p className="text-[11px] text-stone-500">{dim.description}</p>
                      </div>

                      <div className="flex items-center gap-2 sm:justify-end flex-wrap">
                        <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200">
                          Ótimo: {counts.otimo}
                        </span>
                        <span className="px-2 py-1 rounded bg-blue-50 text-blue-800 font-bold text-[11px] border border-blue-200">
                          Bom: {counts.bom}
                        </span>
                        <span className="px-2 py-1 rounded bg-amber-50 text-amber-800 font-bold text-[11px] border border-amber-200">
                          Regular: {counts.regular}
                        </span>
                        <span className="px-2 py-1 rounded bg-rose-50 text-rose-800 font-bold text-[11px] border border-rose-200">
                          Ruim: {counts.ruim}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Qualitative Synthesis by Sections / Questions */}
            <div className="space-y-6 pt-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 border-b border-stone-300 pb-1 font-serif flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-700" />
                <span>Síntese das Respostas por Questão Pedagógica</span>
              </h3>

              {questions.map((q, idx) => {
                // Collect answers for this question across all reports of this class
                const questionAnswers = classReports
                  .map((r) => ({
                    teacherName: r.teacherName,
                    component: r.component,
                    answer: r.answers ? r.answers[q.id] : '',
                  }))
                  .filter((item) => item.answer && item.answer.trim().length > 0);

                if (questionAnswers.length === 0) return null;

                return (
                  <div
                    key={q.id}
                    className="border border-stone-200 rounded-xl p-4 bg-stone-50/40 page-break-inside-avoid"
                  >
                    <div className="flex items-start gap-2 mb-3">
                      <span className="px-2 py-0.5 rounded bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs shrink-0 font-sans">
                        Questão {idx + 1}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-stone-900 leading-snug">
                        {q.prompt}
                      </h4>
                    </div>

                    <div className="space-y-2.5">
                      {questionAnswers.map((item, ansIdx) => (
                        <div
                          key={ansIdx}
                          className="bg-white border border-stone-200 rounded-lg p-3 text-xs"
                        >
                          <div className="flex items-center justify-between mb-1 text-[11px]">
                            <span className="font-bold text-stone-900">
                              {item.component} / <span className="font-semibold text-stone-700">{item.teacherName}</span>
                            </span>
                          </div>
                          <p className="text-stone-800 leading-relaxed whitespace-pre-wrap">
                            {item.answer}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Students of the Class */}
            {classStudents.length > 0 && (
              <div className="border border-stone-200 rounded-xl overflow-hidden page-break-inside-avoid mt-6">
                <div className="bg-stone-50 px-4 py-2.5 border-b border-stone-200 font-bold text-xs text-stone-800 uppercase tracking-wide font-serif flex items-center justify-between">
                  <span>Quadro de Alunos da Turma ({classStudents.length})</span>
                  <span className="text-[11px] text-stone-500 font-sans font-normal">
                    Conceitos e anotações dos professores
                  </span>
                </div>

                <div className="divide-y divide-stone-100 text-xs">
                  {classStudents.map((std) => {
                    // Collect teacher ratings for this student
                    const teacherRatings: {
                      teacher: string;
                      component: string;
                      rating: ConceptRating;
                      notes?: string;
                    }[] = [];

                    classReports.forEach((rep) => {
                      if (rep.studentRatings && rep.studentRatings[std.id]?.rating) {
                        teacherRatings.push({
                          teacher: rep.teacherName,
                          component: rep.component,
                          rating: rep.studentRatings[std.id].rating,
                          notes: rep.studentRatings[std.id].notes,
                        });
                      }
                    });

                    return (
                      <div
                        key={std.id}
                        className="p-3 hover:bg-stone-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 font-mono text-[11px] text-stone-400 font-bold">
                            {std.rollNumber || '-'}
                          </span>
                          <span className="font-bold text-stone-900">{std.name}</span>
                          {std.status === 'atencao' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              Atenção
                            </span>
                          )}
                          {std.notes && (
                            <span className="text-[11px] text-stone-500 italic hidden sm:inline">
                              ({std.notes})
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          {teacherRatings.length > 0 ? (
                            teacherRatings.map((tr, trIdx) => (
                              <span
                                key={trIdx}
                                title={`${tr.component} (${tr.teacher}): ${tr.rating.toUpperCase()} ${
                                  tr.notes ? `[${tr.notes}]` : ''
                                }`}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                                  tr.rating === 'otimo'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : tr.rating === 'bom'
                                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                                    : tr.rating === 'regular'
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : 'bg-rose-50 text-rose-800 border-rose-200'
                                }`}
                              >
                                {tr.component.slice(0, 4)}: {tr.rating}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-stone-400">Sem avaliações</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

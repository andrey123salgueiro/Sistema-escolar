import React, { useState } from 'react';
import { PreCouncilReport, Question, QuestionSection, User } from '../types';
import {
  Printer,
  X,
  CheckCircle2,
  FileCheck,
  Building,
  School,
  Calendar,
  Layers,
  BookOpen,
  UserCheck,
  Clock,
  Send,
} from 'lucide-react';

interface ReportViewModalProps {
  report: PreCouncilReport;
  questions: Question[];
  sections: QuestionSection[];
  currentUser: User;
  onClose: () => void;
  onSignReport: (
    reportId: string,
    role: 'diretora' | 'pedagoga',
    notes?: string
  ) => void;
}

export const ReportViewModal: React.FC<ReportViewModalProps> = ({
  report,
  questions,
  sections,
  currentUser,
  onClose,
  onSignReport,
}) => {
  const [pedagogaNotes, setPedagogaNotes] = useState(
    report.pedagogaSignature?.notes || ''
  );
  const [diretoraNotes, setDiretoraNotes] = useState(
    report.diretoraSignature?.notes || ''
  );
  const [showNotesForm, setShowNotesForm] = useState(false);

  const isDiretora = currentUser.role === 'diretora';

  const handlePrint = () => {
    window.print();
  };

  const handleConfirmDirectorSign = () => {
    onSignReport(report.id, 'diretora', diretoraNotes);
    setShowNotesForm(false);
  };

  const handleConfirmPedagogaSign = () => {
    onSignReport(report.id, 'pedagoga', pedagogaNotes);
    setShowNotesForm(false);
  };

  // Group questions by section
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      {/* Container */}
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-6 print:m-0 print:border-none print:shadow-none print:rounded-none">
        {/* Modal Top Bar (Hidden on print) */}
        <div className="bg-stone-900 text-stone-100 px-6 py-3 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-amber-400">
              Visualização Oficial do Documento
            </span>
            <span className="text-stone-500">•</span>
            <span className="text-stone-300">
              {report.classGroup} - {report.component} ({report.bimester})
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              id="btn-print-modal"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Imprimir / Salvar PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 text-stone-400 hover:text-white rounded-lg transition-colors"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action ribbon for Director if not yet signed (Hidden on print) */}
        {isDiretora && (!report.diretoraSignature?.signed || !report.pedagogaSignature?.signed) && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
            <div className="flex items-center gap-2 text-amber-900">
              <FileCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>Painel de Vistos da Direção:</strong> Você pode homologar este relatório para a ata do Conselho de Classe.
              </span>
            </div>

            <div className="flex items-center gap-2">
              {!report.pedagogaSignature?.signed && (
                <button
                  onClick={handleConfirmPedagogaSign}
                  className="px-3 py-1.5 bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 rounded-lg font-semibold transition-colors shadow-xs"
                >
                  Assinar Visto Pedagógico
                </button>
              )}

              {!report.diretoraSignature?.signed && (
                <button
                  onClick={handleConfirmDirectorSign}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold transition-colors shadow-xs"
                >
                  Homologar Visto da Diretoria
                </button>
              )}
            </div>
          </div>
        )}

        {/* Printable Official Paper Layout */}
        <div id="printable-report-sheet" className="p-6 sm:p-10 text-stone-900 bg-white">
          {/* Official Header */}
          <div className="border-2 border-stone-800 rounded-xl p-6 sm:p-8 text-center relative mb-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              <School className="w-8 h-8 text-stone-800" />
              <div>
                <h1 className="text-base sm:text-lg font-extrabold uppercase tracking-wide font-serif text-stone-900">
                  {report.schoolName}
                </h1>
                <p className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-stone-700">
                  {report.schoolSubtitle}
                </p>
              </div>
            </div>

            <div className="my-3 mx-auto w-40 h-0.5 bg-stone-800" />

            <h2 className="text-sm sm:text-base font-black uppercase tracking-widest text-stone-900">
              {report.title}
            </h2>

            {/* Metadata Fields Line (Matches exact lines from the physical photo) */}
            <div className="mt-6 pt-4 border-t border-stone-300 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-left text-xs font-serif">
              <div className="flex items-baseline gap-2">
                <span className="font-bold uppercase text-stone-800">Componente:</span>
                <span className="border-b border-stone-400 flex-1 pb-0.5 font-sans font-semibold text-stone-900">
                  {report.component}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-bold uppercase text-stone-800">Data:</span>
                <span className="border-b border-stone-400 flex-1 pb-0.5 font-sans text-stone-900">
                  {report.date.split('-').reverse().join('/')} ({report.bimester})
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-bold uppercase text-stone-800">Professor(a):</span>
                <span className="border-b border-stone-400 flex-1 pb-0.5 font-sans font-semibold text-stone-900">
                  {report.teacherName}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-bold uppercase text-stone-800">Turma:</span>
                <span className="border-b border-stone-400 flex-1 pb-0.5 font-sans font-bold text-stone-900">
                  {report.classGroup}
                </span>
              </div>
            </div>
          </div>

          {/* Sections & Answers Content */}
          <div className="space-y-6">
            {sortedSections.map((sec) => {
              const secQuestions = questions
                .filter((q) => q.sectionId === sec.id)
                .sort((a, b) => a.order - b.order);

              if (secQuestions.length === 0) return null;

              return (
                <div
                  key={sec.id}
                  className="border border-stone-300 rounded-xl p-5 bg-stone-50/40 page-break-inside-avoid"
                >
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-2 mb-4 font-serif flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-stone-700 print:bg-black" />
                    {sec.title}
                  </h3>

                  <div className="space-y-4">
                    {secQuestions.map((q) => {
                      const ans = report.answers[q.id];
                      return (
                        <div key={q.id} className="text-xs leading-relaxed">
                          <p className="font-semibold text-stone-800 mb-1.5">
                            {q.prompt}
                          </p>
                          <div className="bg-white border border-stone-200 rounded-lg p-3 text-stone-900 font-sans min-h-[48px] whitespace-pre-wrap">
                            {ans && ans.trim().length > 0 ? (
                              ans
                            ) : (
                              <span className="text-stone-400 italic">
                                Não informado ou sem observações registradas.
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Official Signatures Block (Matches exact lines from the 2nd photo) */}
          <div className="mt-10 pt-8 border-t-2 border-stone-300 page-break-inside-avoid">
            <h4 className="text-xs font-bold uppercase tracking-widest text-stone-600 mb-6 text-center">
              Registros e Vistos Oficiais de Validação
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs">
              {/* Professor Signature */}
              <div className="flex flex-col items-center">
                <div className="w-full border-b border-stone-400 pb-1 mb-1 font-semibold text-stone-900">
                  {report.teacherName}
                </div>
                <p className="text-[11px] text-stone-600 font-serif">
                  Assinatura do(a) professor(a)
                </p>
                <p className="text-[10px] text-stone-400 mt-0.5">
                  Registrado digitalmente em {new Date(report.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>

              {/* Pedagoga Signature */}
              <div className="flex flex-col items-center">
                <div className="w-full border-b border-stone-400 pb-1 mb-1 font-semibold text-stone-900">
                  {report.pedagogaSignature?.signed
                    ? report.pedagogaSignature.signedBy || 'Coordenação Pedagógica'
                    : '___________________________'}
                </div>
                <p className="text-[11px] text-stone-600 font-serif">
                  Assinatura da pedagoga
                </p>
                {report.pedagogaSignature?.signed ? (
                  <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                    ✓ Visto Validado
                  </p>
                ) : (
                  <p className="text-[10px] text-stone-400 mt-0.5">Pendente de visto</p>
                )}
              </div>

              {/* Diretora Signature */}
              <div className="flex flex-col items-center">
                <div className="w-full border-b border-stone-400 pb-1 mb-1 font-semibold text-stone-900">
                  {report.diretoraSignature?.signed
                    ? report.diretoraSignature.signedBy || 'Diretora Geral'
                    : '___________________________'}
                </div>
                <p className="text-[11px] text-stone-600 font-serif">
                  Assinatura da diretora
                </p>
                {report.diretoraSignature?.signed ? (
                  <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                    ✓ Visto Homologado
                  </p>
                ) : (
                  <p className="text-[10px] text-stone-400 mt-0.5">Pendente de visto</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer (Hidden on print) */}
        <div className="bg-stone-100 border-t border-stone-200 px-6 py-4 flex items-center justify-between print:hidden">
          <span className="text-xs text-stone-500">
            Documento digital com arquivamento centralizado
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Imprimir / Salvar PDF</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

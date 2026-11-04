import React, { useState } from 'react';
import {
  Mail,
  X,
  Send,
  CheckCircle,
  Copy,
  ExternalLink,
  ShieldCheck,
  User as UserIcon,
  HelpCircle,
  Sparkles,
  Check,
  MessageSquare,
  Phone,
} from 'lucide-react';
import {
  DEVELOPER_NAME,
  DEVELOPER_MENTOR,
  DEVELOPER_CLASS,
  DEVELOPER_EMAIL,
  DEVELOPER_WHATSAPP,
  DEVELOPER_WHATSAPP_DISPLAY,
  SCHOOL_NAME,
  SYSTEM_VERSION,
} from '../data/initialData';
import { User } from '../types';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: User | null;
  currentLogoUrl?: string;
  onUpdateLogoUrl?: (url: string) => void;
}

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.79 14.15c-.24.68-1.4 1.25-1.92 1.32-.49.07-1.12.1-3.26-.78-2.73-1.13-4.49-3.9-4.63-4.08-.14-.19-1.11-1.48-1.11-2.82s.7-2 1-2.27c.24-.22.52-.28.7-.28.18 0 .35 0 .5.01.16.01.38-.06.59.45.22.53.75 1.83.82 1.96.07.14.12.3.02.49-.09.19-.15.3-.3.47-.14.17-.3.38-.43.51-.14.14-.29.29-.12.58.17.29.75 1.24 1.61 2 1.11.99 2.05 1.29 2.34 1.44.29.14.46.12.63-.07.18-.2.75-.87.95-1.17.2-.3.4-.25.68-.15.27.1 1.74.82 2.04.97.3.15.5.22.57.34.07.12.07.72-.17 1.4z" />
  </svg>
);

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentLogoUrl = '',
  onUpdateLogoUrl,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedWhatsapp, setCopiedWhatsapp] = useState(false);
  const [category, setCategory] = useState('duvida');
  const [senderName, setSenderName] = useState(currentUser?.name || '');
  const [senderContact, setSenderContact] = useState(currentUser?.email || '');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  if (!isOpen) return null;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(DEVELOPER_EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyWhatsapp = () => {
    navigator.clipboard.writeText(DEVELOPER_WHATSAPP_DISPLAY || DEVELOPER_WHATSAPP);
    setCopiedWhatsapp(true);
    setTimeout(() => setCopiedWhatsapp(false), 2500);
  };

  const handleSendViaWhatsapp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const categoryLabels: Record<string, string> = {
      duvida: 'Dúvida Pedagógica',
      turma: 'Cadastro de Turma / Professor',
      sugestao: 'Sugestão de Melhoria',
      problema: 'Problema Técnico',
    };
    const catLabel = categoryLabels[category] || 'Contato';
    const msgText = message.trim() || 'Olá Andrey! Gostaria de falar sobre o sistema Pré-Conselho Escolar Digital.';
    const text = encodeURIComponent(
      `Olá Andrey! Meu nome é ${senderName || 'Professor(a) / Equipe Escolar'} (${SCHOOL_NAME}).\n\n*Assunto:* ${catLabel}\n*Contato:* ${senderContact || 'Não informado'}\n\n*Mensagem:*\n${msgText}`
    );
    window.open(`https://wa.me/${DEVELOPER_WHATSAPP}?text=${text}`, '_blank');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Build mailto link for direct sending
    const subjectPrefix = {
      duvida: '[Dúvida Pedagógica]',
      turma: '[Cadastro de Turma / Professor]',
      sugestao: '[Sugestão de Melhoria]',
      problema: '[Problema Técnico]',
    }[category] || '[Contato]';

    const subject = encodeURIComponent(`${subjectPrefix} Pré-Conselho Digital - ${senderName}`);
    const body = encodeURIComponent(
      `Remetente: ${senderName}\nContato: ${senderContact}\nEscola: ${SCHOOL_NAME}\nCategoria: ${category}\n\n${message}`
    );

    // Open mailto client in background or window
    const mailtoUrl = `mailto:${DEVELOPER_EMAIL}?subject=${subject}&body=${body}`;
    const link = document.createElement('a');
    link.href = mailtoUrl;
    link.click();

    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      setMessage('');
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Top Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-extrabold text-xl flex items-center justify-center shadow-lg shrink-0">
              AS
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Desenvolvedor do Sistema
                </span>
                <span className="text-xs text-slate-400">· {SYSTEM_VERSION}</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {DEVELOPER_NAME}
              </h2>
              <p className="text-xs text-amber-300 font-medium">
                {DEVELOPER_MENTOR} · {DEVELOPER_CLASS}
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                Desenvolvedor responsável pelo sistema <strong className="text-white">Pré-Conselho Escolar Digital</strong> da{' '}
                <span className="text-amber-300">{SCHOOL_NAME}</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* WhatsApp Direct Card (Primary Support Channel) */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50/50 to-emerald-50 border-2 border-emerald-300 rounded-2xl p-4.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <WhatsAppIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-200">
                    WhatsApp Direto (Recomendado)
                  </span>
                  <span className="text-[11px] text-emerald-700 font-medium">Resposta Rápida</span>
                </div>
                <div className="text-base font-extrabold text-slate-900 font-mono mt-0.5 tracking-tight">
                  {DEVELOPER_WHATSAPP_DISPLAY}
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Fale diretamente com Andrey Salgueiro no WhatsApp para dúvidas, suporte ou ajustes no sistema.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={handleCopyWhatsapp}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-800 transition-colors shadow-xs cursor-pointer"
              >
                {copiedWhatsapp ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copiar Número</span>
                  </>
                )}
              </button>

              <a
                href={`https://wa.me/${DEVELOPER_WHATSAPP}?text=${encodeURIComponent(`Olá Andrey! Sou da equipe da ${SCHOOL_NAME} e estou entrando em contato sobre o Pré-Conselho Escolar Digital.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white transition-colors shadow-xs cursor-pointer"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>Conversar no WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Quick Contact & Developer Email Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Canal Alternativo: E-mail
              </span>
              <span className="text-sm font-bold text-slate-900 font-mono">
                {DEVELOPER_EMAIL}
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                Atendimento formal para a equipe de professores e direção escolar.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyEmail}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 transition-colors shadow-xs cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copiar E-mail</span>
                  </>
                )}
              </button>

              <a
                href={`mailto:${DEVELOPER_EMAIL}?subject=Contato%20Pre-Conselho%20Escolar`}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-xs cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Enviar E-mail</span>
              </a>
            </div>
          </div>

          {/* Direct Support & Feedback Form */}
          <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <MessageSquare className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Enviar Mensagem ou Solicitação Direta
              </h3>
            </div>

            {isSent ? (
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-900">
                  Mensagem encaminhada!
                </h4>
                <p className="text-xs text-emerald-700 max-w-md mx-auto">
                  Seu programa de e-mail foi aberto para envio direto a <strong>{DEVELOPER_EMAIL}</strong>. Andrey Salgueiro responderá o mais breve possível.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Seu Nome / Cargo
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Prof. Carlos Eduardo / Diretoria"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Seu E-mail ou Telefone (para retorno)
                    </label>
                    <input
                      type="text"
                      placeholder="seu.email@escola.gov.br ou WhatsApp"
                      value={senderContact}
                      onChange={(e) => setSenderContact(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Assunto do Contato
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 font-medium"
                  >
                    <option value="duvida">Dúvida sobre preenchimento das fichas</option>
                    <option value="turma">Cadastro ou alteração de turma / professor</option>
                    <option value="sugestao">Sugestão de melhoria para o sistema</option>
                    <option value="problema">Relato de instabilidade ou problema técnico</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Mensagem Detalhada
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Descreva aqui sua dúvida, sugestão ou informação para o desenvolvedor..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 resize-none"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleSendViaWhatsapp}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                    <span>Enviar via WhatsApp</span>
                  </button>

                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Enviar via E-mail</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <span>Sistema Homologado para Uso Escolar Real</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
};

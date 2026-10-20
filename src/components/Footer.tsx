import React from 'react';
import { Logo } from './Logo';
import {
  Mail,
  ShieldCheck,
  Award,
  Lock,
  Cloud,
  UserCheck,
} from 'lucide-react';
import {
  SCHOOL_NAME,
  SCHOOL_SUBTITLE,
  DEVELOPER_NAME,
  SYSTEM_VERSION,
  SYSTEM_YEAR,
} from '../data/initialData';

interface FooterProps {
  onOpenContact: () => void;
  schoolLogoUrl?: string;
  variant?: 'light' | 'dark';
}

export const Footer: React.FC<FooterProps> = ({
  onOpenContact,
  schoolLogoUrl,
}) => {
  return (
    <footer className="mt-8 bg-slate-950 text-slate-300 border-t border-slate-800 font-sans">
      {/* Top Accent Ribbon */}
      <div className="h-0.5 bg-gradient-to-r from-amber-500 via-blue-600 to-amber-500" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Column 1: Institutional & School Identity (5 cols) */}
          <div className="md:col-span-5 space-y-2">
            <Logo
              size="sm"
              variant="light"
              showSubtitle={true}
              schoolLogoUrl={schoolLogoUrl}
            />

            <div className="pt-1">
              <h3 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider font-mono">
                {SCHOOL_NAME}
              </h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                {SCHOOL_SUBTITLE}
              </p>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed max-w-md">
              Plataforma oficial de pré-conselho de classe digital desenvolvida para registro de avaliações diagnósticas, acompanhamento e homologação colegiada de desempenho dos alunos.
            </p>
          </div>

          {/* Column 2: Developer & Authorship Credits (4 cols) */}
          <div className="md:col-span-4 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-200">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Desenvolvimento & Autoria</span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                  AS
                </div>
                <div>
                  <div className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                    Desenvolvido por
                  </div>
                  <h4 className="text-xs font-bold text-white tracking-tight">
                    {DEVELOPER_NAME}
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Criador e Administrador Técnico do Sistema
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-slate-300 text-[10px] pt-1.5 border-t border-slate-800/80">
                <UserCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="font-medium">
                  Sistema homologado para uso real no colégio
                </span>
              </div>
            </div>
          </div>

          {/* Column 3: Security & Official Guidelines (3 cols) */}
          <div className="md:col-span-3 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Segurança & Diretrizes</span>
            </div>

            <ul className="text-[11px] text-slate-400 space-y-1.5">
              <li className="flex items-start gap-1.5">
                <Lock className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-300">Sigilo Pedagógico:</strong> Exclusivo do conselho de classe.
                </span>
              </li>

              <li className="flex items-start gap-1.5">
                <ShieldCheck className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-300">LGPD Escolar:</strong> Proteção e privacidade de dados.
                </span>
              </li>

              <li className="flex items-start gap-1.5">
                <Cloud className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-300">Nuvem Oficial:</strong> Sincronização em tempo real.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Horizontal Bar */}
        <div className="mt-5 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            <span>
              © {SYSTEM_YEAR} <strong className="text-slate-400">Pré-Conselho Escolar Digital</strong>.
            </span>
            <span className="hidden sm:inline mx-1.5">·</span>
            <span className="text-slate-400">
              Desenvolvido com excelência por <strong className="text-slate-200">{DEVELOPER_NAME}</strong>.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-[10px] text-slate-400">
              Versão {SYSTEM_VERSION}
            </span>
            <button
              type="button"
              onClick={onOpenContact}
              className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-semibold transition-colors cursor-pointer"
            >
              <Mail className="w-3 h-3" />
              <span>Fale Conosco</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

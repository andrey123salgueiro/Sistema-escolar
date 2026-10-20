import React from 'react';
import { User } from '../types';
import { Logo } from './Logo';
import {
  FileText,
  Users,
  HelpCircle,
  LogOut,
  Archive,
  RefreshCw,
  Send,
  Edit3,
  TrendingUp,
  Layers,
  FileSpreadsheet,
  Eye,
  Cloud,
  CheckCircle2,
} from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';

interface HeaderProps {
  currentUser: User;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onLogout: () => void;
  onResetData: () => void;
  isCloudSynced?: boolean;
  schoolLogoUrl?: string;
  onOpenContact?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeTab,
  onSelectTab,
  onLogout,
  onResetData,
  isCloudSynced = true,
  schoolLogoUrl,
  onOpenContact,
}) => {
  const isDiretora = currentUser.role === 'diretora';
  const [showResetConfirm, setShowResetConfirm] = React.useState(false);

  return (
    <header className="bg-white border-b border-slate-200/90 sticky top-0 z-40 shadow-xs">
      {/* Top Institutional Ribbon */}
      <div className="bg-slate-950 text-slate-300 px-4 py-1.5 text-xs font-sans border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Institutional Breadcrumb */}
          <div className="flex items-center gap-2 text-[11px] tracking-wide">
            <span className="font-bold text-white uppercase">
              Escola Estadual do Campo Frei Graciano Droessler
            </span>
            <span className="text-slate-600 hidden sm:inline" aria-hidden="true">/</span>
            <span className="text-slate-400 hidden sm:inline font-medium">
              Ensino Fundamental em Tempo Integral
            </span>
          </div>

          {/* System Telemetry & Utilities */}
          <div className="flex items-center gap-3 text-[11px]">
            <div
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border ${
                isCloudSynced
                  ? 'bg-slate-900 border-emerald-500/30 text-emerald-300'
                  : 'bg-slate-900 border-amber-500/30 text-amber-300'
              }`}
              title={
                isCloudSynced
                  ? 'Sincronização em nuvem ativa em tempo real'
                  : 'Conectando ao banco de dados...'
              }
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isCloudSynced ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="font-mono text-[10px] tracking-tight">
                {isCloudSynced ? 'Nuvem Conectada' : 'Sincronizando'}
              </span>
            </div>

            {onOpenContact && (
              <button
                type="button"
                onClick={onOpenContact}
                title="Abrir canal de Fale Conosco"
                className="text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors text-[11px] font-semibold"
              >
                <span>Fale Conosco</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              title="Restaurar dados padrão"
              className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors text-[11px] cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Restaurar Padrão</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Bar: Logo, Navigation Tabs, and User Action */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left: Custom High-End Logo */}
          <div className="flex items-center justify-between">
            <Logo size="md" variant="dark" schoolLogoUrl={schoolLogoUrl} />

            {/* Mobile User/Logout Quick Action */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={onLogout}
                className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                title="Sair do sistema"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Center: Navigation Tabs */}
          <nav
            aria-label="Navegação Principal"
            className="flex items-center overflow-x-auto p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 gap-1 text-xs font-medium"
          >
            {isDiretora ? (
              <>
                <button
                  id="tab-diretora-archive"
                  onClick={() => onSelectTab('archive')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                    activeTab === 'archive'
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>Fichas Arquivadas</span>
                </button>

                <button
                  id="tab-diretora-performance"
                  onClick={() => onSelectTab('performance')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                    activeTab === 'performance'
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Desempenho Geral</span>
                </button>

                <button
                  id="tab-diretora-panorama"
                  onClick={() => onSelectTab('panorama')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                    activeTab === 'panorama'
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Panorama da Turma</span>
                </button>

                <button
                  id="tab-diretora-students"
                  onClick={() => onSelectTab('students')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                    activeTab === 'students'
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Alunos e Turmas</span>
                </button>

                <button
                  id="tab-diretora-classes"
                  onClick={() => onSelectTab('classes')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                    activeTab === 'classes'
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Turmas</span>
                </button>

                <button
                  id="tab-diretora-release"
                  onClick={() => onSelectTab('release')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                    activeTab === 'release'
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Liberar Fichas</span>
                </button>

                <button
                  id="tab-diretora-teachers"
                  onClick={() => onSelectTab('teachers')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                    activeTab === 'teachers'
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Professores</span>
                </button>

                <button
                  id="tab-diretora-questions"
                  onClick={() => onSelectTab('questions')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                    activeTab === 'questions'
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Perguntas</span>
                </button>
              </>
            ) : (
              <>
                {activeTab === 'new-form' && (
                  <button
                    id="tab-teacher-editing"
                    onClick={() => onSelectTab('new-form')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 text-white font-semibold shadow-xs whitespace-nowrap"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Preenchendo Ficha</span>
                  </button>
                )}

                <button
                  id="tab-teacher-my-reports"
                  onClick={() => onSelectTab('my-reports')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                    activeTab === 'my-reports'
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Minhas Fichas</span>
                </button>

                <button
                  id="tab-teacher-panorama"
                  onClick={() => onSelectTab('panorama')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                    activeTab === 'panorama'
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Panorama da Turma</span>
                </button>

                <button
                  id="tab-teacher-performance"
                  onClick={() => onSelectTab('performance')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                    activeTab === 'performance'
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Desempenho da Turma</span>
                </button>
              </>
            )}
          </nav>

          {/* Right: User Identity & Sign Out */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs font-mono shadow-xs border border-slate-800">
                {currentUser.name.charAt(0)}
              </div>
              <div className="text-left text-xs leading-tight">
                <p className="font-semibold text-slate-900 truncate max-w-[140px]">
                  {currentUser.name}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  {isDiretora ? 'Diretoria Escolar' : currentUser.subject || 'Docente'}
                </p>
              </div>
            </div>

            <button
              onClick={onLogout}
              id="btn-logout"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-700 bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition-colors cursor-pointer"
              title="Sair do sistema"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Resetting Initial Data */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Restaurar Dados Padrão"
        message="Deseja restaurar as perguntas e professores para os dados iniciais padrão do sistema escolar? Alterações locais serão redefinidas."
        confirmText="Sim, Restaurar Padrão"
        cancelText="Cancelar"
        variant="warning"
        onConfirm={() => {
          onResetData();
          setShowResetConfirm(false);
        }}
        onCancel={() => setShowResetConfirm(false)}
      />
    </header>
  );
};

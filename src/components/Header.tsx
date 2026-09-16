import React from 'react';
import { User } from '../types';
import {
  GraduationCap,
  FileText,
  Users,
  HelpCircle,
  LogOut,
  School,
  PlusCircle,
  Archive,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onLogout: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeTab,
  onSelectTab,
  onLogout,
  onResetData,
}) => {
  const isDiretora = currentUser.role === 'diretora';

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-xs">
      {/* Top institution bar */}
      <div className="bg-stone-900 text-stone-100 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <School className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-semibold tracking-wide">
              ESCOLA ESTADUAL DO CAMPO FREI GRACIANO DROESSLER
            </span>
            <span className="text-stone-400 hidden sm:inline">•</span>
            <span className="text-stone-300 hidden sm:inline">
              Ensino Fundamental em Tempo Integral
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (
                  window.confirm(
                    'Deseja restaurar as perguntas e professores para os dados iniciais padrão?'
                  )
                ) {
                  onResetData();
                }
              }}
              title="Restaurar dados padrão do sistema"
              className="text-stone-400 hover:text-stone-200 flex items-center gap-1 transition-colors text-[11px]"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Restaurar Padrão</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                isDiretora
                  ? 'bg-purple-50 border border-purple-200 text-purple-700'
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              }`}
            >
              {isDiretora ? (
                <ShieldCheck className="w-6 h-6" />
              ) : (
                <GraduationCap className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-stone-900 leading-tight">
                  Pré-Conselho Escolar Digital
                </h1>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                    isDiretora
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {isDiretora ? 'Ambiente da Diretora' : 'Ambiente do Professor'}
                </span>
              </div>
              <p className="text-xs text-stone-700">
                {isDiretora
                  ? 'Gestão de professores, perguntas e homologação de relatórios'
                  : `Docente: ${currentUser.name} (${currentUser.subject || 'Geral'})`}
              </p>
            </div>
          </div>

          {/* Navigation tabs & Logout button */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Nav tabs depending strictly on role */}
            <div className="flex items-center bg-stone-100 p-1 rounded-lg border border-stone-200 text-xs font-medium text-stone-600">
              {isDiretora ? (
                <>
                  <button
                    id="tab-diretora-archive"
                    onClick={() => onSelectTab('archive')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                      activeTab === 'archive'
                        ? 'bg-white text-stone-900 shadow-xs font-semibold'
                        : 'hover:text-stone-900'
                    }`}
                  >
                    <Archive className="w-3.5 h-3.5 text-purple-600" />
                    <span>Relatórios Arquivados</span>
                  </button>
                  <button
                    id="tab-diretora-teachers"
                    onClick={() => onSelectTab('teachers')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                      activeTab === 'teachers'
                        ? 'bg-white text-stone-900 shadow-xs font-semibold'
                        : 'hover:text-stone-900'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 text-purple-600" />
                    <span>Cadastrar Professores</span>
                  </button>
                  <button
                    id="tab-diretora-questions"
                    onClick={() => onSelectTab('questions')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                      activeTab === 'questions'
                        ? 'bg-white text-stone-900 shadow-xs font-semibold'
                        : 'hover:text-stone-900'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
                    <span>Gerenciar Perguntas</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    id="tab-teacher-new"
                    onClick={() => onSelectTab('new-form')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                      activeTab === 'new-form'
                        ? 'bg-white text-stone-900 shadow-xs font-semibold'
                        : 'hover:text-stone-900'
                    }`}
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Preencher Nova Ficha</span>
                  </button>
                  <button
                    id="tab-teacher-my-reports"
                    onClick={() => onSelectTab('my-reports')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                      activeTab === 'my-reports'
                        ? 'bg-white text-stone-900 shadow-xs font-semibold'
                        : 'hover:text-stone-900'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Minhas Fichas</span>
                  </button>
                </>
              )}
            </div>

            {/* User identification badge & Logout */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] text-white ${
                    isDiretora ? 'bg-purple-700' : 'bg-emerald-700'
                  }`}
                >
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-left max-w-[130px] truncate">
                  <p className="font-semibold leading-tight truncate text-stone-900">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-stone-700 truncate">
                    {isDiretora ? 'Diretora' : currentUser.subject || 'Professor(a)'}
                  </p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                id="btn-logout"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors shadow-xs"
                title="Sair da conta e voltar para a tela de login"
              >
                <LogOut className="w-3.5 h-3.5 text-red-600" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

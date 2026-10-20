import React, { useState } from 'react';
import { User } from '../types';
import { Logo } from './Logo';
import {
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  LogIn,
  GraduationCap,
  ShieldCheck,
  User as UserIcon,
  CheckCircle2,
} from 'lucide-react';
import {
  SCHOOL_NAME,
  SCHOOL_SUBTITLE,
  DEVELOPER_NAME,
  DEVELOPER_EMAIL,
  SYSTEM_VERSION,
} from '../data/initialData';

interface LoginScreenProps {
  users: User[];
  onLoginSuccess: (user: User) => void;
  schoolLogoUrl?: string;
  onOpenContact?: () => void;
}

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  users,
  onLoginSuccess,
  schoolLogoUrl,
  onOpenContact,
}) => {
  // Tabs: 'professor' | 'diretora'
  const [activeTab, setActiveTab] = useState<'professor' | 'diretora'>('professor');

  // Fields for Teacher Login
  const [teacherInput, setTeacherInput] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [showTeacherPassword, setShowTeacherPassword] = useState(false);

  // Fields for Director Login
  const [diretoraInput, setDiretoraInput] = useState('admin');
  const [diretoraPassword, setDiretoraPassword] = useState('');
  const [showDiretoraPassword, setShowDiretoraPassword] = useState(false);

  // Error feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const diretoraUser = users.find((u) => u.role === 'diretora');
  const teacherUsers = users.filter((u) => u.role === 'professor');

  // Handle Teacher Submit
  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const rawInput = teacherInput.trim();
    const cleanPass = teacherPassword.trim();

    if (!rawInput) {
      setErrorMessage('Por favor, informe o seu nome de professor cadastrado.');
      return;
    }

    if (!cleanPass) {
      setErrorMessage('Por favor, digite a sua senha de acesso (padrão: 123).');
      return;
    }

    const normInput = normalize(rawInput);

    if (normInput === 'admin' || normInput === 'diretoria@escola.gov.br') {
      setErrorMessage(
        'Este usuário pertence à Direção. Por favor, acesse através da aba Acesso da Diretoria.'
      );
      return;
    }

    // Search by full name, username or email (case & accent insensitive)
    let foundTeacher = teacherUsers.find((t) => {
      const normName = normalize(t.name);
      const normUsername = normalize(t.username || t.name);
      const normEmail = normalize(t.email);
      return (
        normName === normInput ||
        normUsername === normInput ||
        normEmail === normInput
      );
    });

    // If not found by exact match, try partial match
    if (!foundTeacher) {
      const candidates = teacherUsers.filter((t) => {
        const normName = normalize(t.name);
        return normName.includes(normInput) || normInput.includes(normName);
      });

      if (candidates.length === 1) {
        foundTeacher = candidates[0];
      }
    }

    if (!foundTeacher) {
      setErrorMessage(
        `Professor(a) "${rawInput}" não encontrado(a). Verifique a grafia ou consulte a Direção.`
      );
      return;
    }

    // All teachers have password 123
    const expectedPass = foundTeacher.password || '123';
    if (cleanPass !== '123' && cleanPass !== expectedPass) {
      setErrorMessage('Senha incorreta. A senha padrão de todos os professores é 123.');
      return;
    }

    onLoginSuccess(foundTeacher);
  };

  // Handle Director Submit
  const handleDiretoraSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanInput = diretoraInput.trim().toLowerCase();
    const cleanPass = diretoraPassword.trim();

    if (!cleanInput) {
      setErrorMessage('Por favor, informe o usuário da Diretora (padrão: admin).');
      return;
    }

    if (!cleanPass) {
      setErrorMessage('Por favor, digite a senha da Diretora (padrão: 123).');
      return;
    }

    const isTeacher = teacherUsers.some(
      (t) => normalize(t.name) === normalize(cleanInput)
    );

    if (isTeacher) {
      setErrorMessage(
        'Este usuário pertence a um professor. Por favor, utilize a aba Acesso do Professor.'
      );
      return;
    }

    if (
      cleanInput !== 'admin' &&
      cleanInput !== 'diretoria@escola.gov.br' &&
      diretoraUser &&
      diretoraUser.email.toLowerCase() !== cleanInput &&
      normalize(diretoraUser.name) !== normalize(cleanInput)
    ) {
      setErrorMessage(
        'Usuário da Diretoria inválido. O usuário oficial da Diretora é "admin".'
      );
      return;
    }

    const expectedPass = diretoraUser?.password || '123';
    if (cleanPass !== expectedPass && cleanPass !== '123') {
      setErrorMessage('Senha incorreta para a Diretora. A senha padrão é 123.');
      return;
    }

    if (diretoraUser) {
      onLoginSuccess(diretoraUser);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle geometric institutional backdrop */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-amber-400 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-600 blur-3xl" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Institutional Branding Block */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <Logo
              size="lg"
              variant="light"
              showSubtitle={false}
              schoolLogoUrl={schoolLogoUrl}
            />
          </div>

          <p className="text-xs font-bold tracking-wider text-amber-400 uppercase font-sans mt-3">
            {SCHOOL_NAME}
          </p>
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mt-0.5">
            {SCHOOL_SUBTITLE}
          </p>
        </div>

        {/* Main Authentication Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
          {/* Top Segmented Selector */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100/90 border-b border-slate-200/80">
            <button
              type="button"
              id="tab-login-professor"
              onClick={() => {
                setActiveTab('professor');
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'professor'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-slate-700" />
              <span>Acesso do Professor</span>
            </button>

            <button
              type="button"
              id="tab-login-diretora"
              onClick={() => {
                setActiveTab('diretora');
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'diretora'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-slate-700" />
              <span>Acesso da Diretoria</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* Error Message Box */}
            {errorMessage && (
              <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-800 px-3.5 py-3 rounded-xl text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* TAB 1: PROFESSOR LOGIN */}
            {activeTab === 'professor' && (
              <div>
                <div className="mb-5 pb-3 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Portal do Docente
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Preenchimento das fichas pedagógicas
                    </p>
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    Senha: 123
                  </span>
                </div>

                <form onSubmit={handleTeacherSubmit} className="space-y-4">
                  {/* Teacher Name Input (Username) */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Nome do Professor (Usuário)
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        id="input-teacher-name"
                        placeholder="Digite seu nome (ex: Carlos Eduardo Souza)"
                        value={teacherInput}
                        onChange={(e) => setTeacherInput(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all font-medium"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Seu usuário de acesso é o seu nome completo cadastrado pela Direção.
                    </p>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-medium text-slate-700">
                        Senha de Acesso
                      </label>
                      <span className="text-[10px] text-slate-400">
                        Padrão: 123
                      </span>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showTeacherPassword ? 'text' : 'password'}
                        required
                        id="input-teacher-password"
                        placeholder="Senha (123)"
                        value={teacherPassword}
                        onChange={(e) => setTeacherPassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2.5 bg-slate-50/50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowTeacherPassword(!showTeacherPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        title={showTeacherPassword ? 'Ocultar senha' : 'Ver senha'}
                      >
                        {showTeacherPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      id="btn-login-teacher"
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Entrar no Sistema</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 2: DIRETORA LOGIN */}
            {activeTab === 'diretora' && (
              <div>
                <div className="mb-5 pb-3 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Painel da Direção Escolar
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Liberação de fichas e homologação
                    </p>
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    Acesso Restrito
                  </span>
                </div>

                <div className="mb-4 bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 text-xs">
                  <div className="flex items-center gap-2 font-medium mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-800 shrink-0" />
                    <span>Credenciais da Direção:</span>
                  </div>
                  <p className="text-[11px] text-slate-600 ml-5 font-mono">
                    Usuário: <strong>admin</strong> | Senha: <strong>123</strong>
                  </p>
                </div>

                <form onSubmit={handleDiretoraSubmit} className="space-y-4">
                  {/* Director Username */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Usuário da Diretora
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        id="input-diretora-user"
                        placeholder="admin"
                        value={diretoraInput}
                        onChange={(e) => setDiretoraInput(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all font-mono font-medium"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Senha de Acesso
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showDiretoraPassword ? 'text' : 'password'}
                        required
                        id="input-diretora-password"
                        placeholder="123"
                        value={diretoraPassword}
                        onChange={(e) => setDiretoraPassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2.5 bg-slate-50/50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowDiretoraPassword(!showDiretoraPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        title={showDiretoraPassword ? 'Ocultar senha' : 'Ver senha'}
                      >
                        {showDiretoraPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      id="btn-login-diretora"
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Entrar como Diretora</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Footer info & Developer Credits */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center space-y-3">
          <p className="text-xs text-slate-400 font-medium">
            Plataforma Institucional de Avaliação Pedagógica · {SCHOOL_NAME}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
            <span>
              Desenvolvido por <strong className="text-amber-400">{DEVELOPER_NAME}</strong>
            </span>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <span className="text-slate-500">Versão {SYSTEM_VERSION}</span>
            {onOpenContact && (
              <>
                <span className="text-slate-600" aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={onOpenContact}
                  className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2 transition-colors cursor-pointer"
                >
                  Fale Conosco
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { User } from '../types';
import {
  School,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  LogIn,
  KeyRound,
  GraduationCap,
  ShieldCheck,
  User as UserIcon,
  CheckCircle2,
} from 'lucide-react';
import { SCHOOL_NAME, SCHOOL_SUBTITLE } from '../data/initialData';

interface LoginScreenProps {
  users: User[];
  onLoginSuccess: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  users,
  onLoginSuccess,
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

    const cleanInput = teacherInput.trim().toLowerCase();
    const cleanPass = teacherPassword.trim();

    if (!cleanInput) {
      setErrorMessage('Por favor, informe seu e-mail institucional ou selecione seu nome.');
      return;
    }

    if (cleanInput === 'admin' || cleanInput === 'diretoria@escola.gov.br') {
      setErrorMessage(
        'Este usuário pertence à Direção da escola. Por favor, acesse através da aba "Acesso da Diretoria".'
      );
      return;
    }

    // Find in teachers list
    const foundTeacher = teacherUsers.find(
      (t) =>
        t.email.toLowerCase() === cleanInput ||
        t.name.toLowerCase() === cleanInput ||
        (t.username && t.username.toLowerCase() === cleanInput)
    );

    if (!foundTeacher) {
      setErrorMessage(
        'Professor(a) não encontrado(a). Verifique o e-mail ou selecione seu nome na lista.'
      );
      return;
    }

    const expectedPass = foundTeacher.password || '123';
    if (cleanPass !== expectedPass && cleanPass !== '123') {
      setErrorMessage('Senha incorreta para este professor. A senha padrão do sistema é 123.');
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

    // Check if a teacher tried to login on director tab
    const isTeacher = teacherUsers.some(
      (t) =>
        t.email.toLowerCase() === cleanInput ||
        t.name.toLowerCase() === cleanInput
    );

    if (isTeacher) {
      setErrorMessage(
        'Este usuário pertence a um professor. Por favor, utilize a aba "Acesso do Professor".'
      );
      return;
    }

    if (
      cleanInput !== 'admin' &&
      cleanInput !== 'diretoria@escola.gov.br' &&
      diretoraUser &&
      diretoraUser.email.toLowerCase() !== cleanInput &&
      diretoraUser.name.toLowerCase() !== cleanInput
    ) {
      setErrorMessage(
        'Usuário da Diretoria inválido. O login oficial da Diretora é "admin".'
      );
      return;
    }

    const expectedPass = diretoraUser?.password || '123';
    if (cleanPass !== expectedPass && cleanPass !== '123') {
      setErrorMessage('Senha incorreta para a Diretora. A senha padrão do sistema é 123.');
      return;
    }

    if (diretoraUser) {
      onLoginSuccess(diretoraUser);
    }
  };

  // Quick helper to fill teacher
  const handleSelectTeacher = (teacher: User) => {
    setTeacherInput(teacher.email);
    setTeacherPassword('123');
    setErrorMessage(null);
  };

  // Quick helper to fill director
  const handleFillDiretoraDemo = () => {
    setDiretoraInput('admin');
    setDiretoraPassword('123');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* School Crest / Header */}
        <div className="text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-700 text-white flex items-center justify-center shadow-md mb-3">
            <School className="w-8 h-8 text-amber-100" />
          </div>

          <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-stone-900 font-serif">
            {SCHOOL_NAME}
          </h2>
          <p className="text-xs font-semibold text-stone-600 uppercase tracking-wider mt-0.5">
            {SCHOOL_SUBTITLE}
          </p>

          <div className="my-2 mx-auto w-16 h-0.5 bg-amber-600/40 rounded-full" />

          <h3 className="text-base font-bold text-stone-800">
            Acesso ao Pré-Conselho de Classe
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Selecione seu perfil de acesso abaixo para entrar
          </p>
        </div>

        {/* Card Form */}
        <div className="mt-6 bg-white shadow-sm border border-stone-200 rounded-2xl overflow-hidden">
          {/* Top Role Selector Tabs */}
          <div className="grid grid-cols-2 p-1.5 bg-stone-100 border-b border-stone-200">
            <button
              type="button"
              id="tab-login-professor"
              onClick={() => {
                setActiveTab('professor');
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'professor'
                  ? 'bg-white text-emerald-800 shadow-xs border border-stone-200/80'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              <GraduationCap
                className={`w-4 h-4 ${
                  activeTab === 'professor' ? 'text-emerald-700' : 'text-stone-500'
                }`}
              />
              <span>Acesso do Professor</span>
            </button>

            <button
              type="button"
              id="tab-login-diretora"
              onClick={() => {
                setActiveTab('diretora');
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'diretora'
                  ? 'bg-white text-purple-900 shadow-xs border border-stone-200/80'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              <ShieldCheck
                className={`w-4 h-4 ${
                  activeTab === 'diretora' ? 'text-purple-700' : 'text-stone-500'
                }`}
              />
              <span>Acesso da Diretoria</span>
            </button>
          </div>

          <div className="py-6 px-6 sm:px-8">
            {/* Error Message Box */}
            {errorMessage && (
              <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-3.5 py-3 rounded-xl text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* TAB 1: PROFESSOR LOGIN */}
            {activeTab === 'professor' && (
              <div>
                <div className="mb-4 pb-3 border-b border-stone-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-emerald-700" />
                      <span>Portal Docente</span>
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Preenchimento das fichas oficiais autorizadas pela Direção
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Senha: 123
                  </span>
                </div>

                <form onSubmit={handleTeacherSubmit} className="space-y-4">
                  {/* Quick Teacher Selector Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Selecione seu Nome ou Digite seu E-mail
                    </label>
                    <select
                      value={teacherInput}
                      onChange={(e) => {
                        setTeacherInput(e.target.value);
                        if (!teacherPassword) setTeacherPassword('123');
                        setErrorMessage(null);
                      }}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 mb-2"
                    >
                      <option value="">-- Selecione seu nome na lista de professores --</option>
                      {teacherUsers.map((teacher) => (
                        <option key={teacher.id} value={teacher.email}>
                          Prof. {teacher.name} ({teacher.subject || 'Docente'})
                        </option>
                      ))}
                    </select>

                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        id="input-teacher-email"
                        placeholder="Ou digite seu e-mail institucional"
                        value={teacherInput}
                        onChange={(e) => setTeacherInput(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Senha de Acesso
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showTeacherPassword ? 'text' : 'password'}
                        required
                        id="input-teacher-password"
                        placeholder="Senha (padrão: 123)"
                        value={teacherPassword}
                        onChange={(e) => setTeacherPassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowTeacherPassword(!showTeacherPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
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
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Entrar como Professor</span>
                    </button>
                  </div>
                </form>

                {/* Quick teacher buttons */}
                <div className="mt-5 pt-4 border-t border-stone-100">
                  <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <KeyRound className="w-3 h-3 text-emerald-700" />
                    <span>Acesso Rápido de Teste (Senha: 123):</span>
                  </p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {teacherUsers.map((teacher) => (
                      <button
                        key={teacher.id}
                        type="button"
                        onClick={() => handleSelectTeacher(teacher)}
                        className="text-left px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-emerald-50 hover:border-emerald-300 transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <p className="text-xs font-bold text-stone-800 group-hover:text-emerald-900 leading-tight">
                            Prof. {teacher.name}
                          </p>
                          <p className="text-[10px] text-stone-500 group-hover:text-emerald-700">
                            {teacher.subject} • {teacher.email}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold text-stone-500 group-hover:text-emerald-800 bg-stone-200/60 group-hover:bg-emerald-200/80 px-2 py-0.5 rounded-md transition-colors">
                          Selecionar
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: DIRETORA LOGIN */}
            {activeTab === 'diretora' && (
              <div>
                <div className="mb-4 pb-3 border-b border-stone-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-purple-700" />
                      <span>Painel da Direção Escolar</span>
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Liberação de fichas, homologação e arquivo geral
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200">
                    Restrito
                  </span>
                </div>

                <div className="mb-4 bg-purple-50/80 border border-purple-200 rounded-xl p-3 text-purple-950 text-xs">
                  <div className="flex items-center gap-2 font-bold mb-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                    <span>Credenciais Oficiais da Diretoria:</span>
                  </div>
                  <p className="text-[11px] text-purple-800 ml-5">
                    Usuário: <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-purple-200">admin</span> • Senha: <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-purple-200">123</span>
                  </p>
                </div>

                <form onSubmit={handleDiretoraSubmit} className="space-y-4">
                  {/* Director Username */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Usuário da Diretora
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        id="input-diretora-user"
                        placeholder="admin"
                        value={diretoraInput}
                        onChange={(e) => setDiretoraInput(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Senha de Acesso
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showDiretoraPassword ? 'text' : 'password'}
                        required
                        id="input-diretora-password"
                        placeholder="Senha (padrão: 123)"
                        value={diretoraPassword}
                        onChange={(e) => setDiretoraPassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowDiretoraPassword(!showDiretoraPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
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
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-purple-800 hover:bg-purple-900 active:bg-purple-950 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Entrar como Diretora</span>
                    </button>
                  </div>
                </form>

                {/* Quick Auto-fill button for director */}
                <div className="mt-5 pt-4 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={handleFillDiretoraDemo}
                    className="w-full py-2 px-3 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100/70 transition-colors flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 text-purple-900">
                      <KeyRound className="w-3.5 h-3.5 text-purple-700" />
                      <span className="font-semibold">Preencher automaticamente (admin / 123)</span>
                    </div>
                    <span className="text-[10px] font-bold bg-purple-200 text-purple-900 px-2 py-0.5 rounded-md">
                      Preencher
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-stone-600 mt-4">
          Sistema Oficial de Gestão Pedagógica Digital • 2026
        </p>
      </div>
    </div>
  );
};

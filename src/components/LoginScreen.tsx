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
  Sparkles,
  GraduationCap,
  ShieldCheck,
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Find user by email (or user name for flexibility)
    const found = users.find(
      (u) =>
        u.email.toLowerCase() === cleanEmail ||
        u.name.toLowerCase() === cleanEmail
    );

    if (!found) {
      setErrorMessage('Usuário ou e-mail institucional não encontrado no sistema.');
      return;
    }

    // Verify password
    const userPassword = found.password || '123';
    if (userPassword !== cleanPassword) {
      setErrorMessage('Senha incorreta para este usuário. Verifique e tente novamente.');
      return;
    }

    // Success
    onLoginSuccess(found);
  };

  const handleFillDemo = (user: User) => {
    setEmail(user.email);
    setPassword(user.password || '123');
    setErrorMessage(null);
  };

  const diretoraUser = users.find((u) => u.role === 'diretora');
  const teacherUsers = users.filter((u) => u.role === 'professor');

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
            Entre com suas credenciais institucionais para continuar
          </p>
        </div>

        {/* Card Form */}
        <div className="mt-6 bg-white py-8 px-6 sm:px-10 shadow-sm border border-stone-200 rounded-2xl">
          {errorMessage && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-3.5 py-3 rounded-xl text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* E-mail */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                E-mail Institucional ou Usuário
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  id="input-login-email"
                  placeholder="ex: diretoria@escola.gov.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-stone-700">
                  Senha de Acesso
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  id="input-login-password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                >
                  {showPassword ? (
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
                id="btn-login-submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-800 hover:bg-amber-900 active:bg-amber-950 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Entrar no Sistema</span>
              </button>
            </div>
          </form>

          {/* Quick Credential Pre-fill Helpers for convenient testing */}
          <div className="mt-6 pt-5 border-t border-stone-200">
            <div className="flex items-center gap-1.5 text-stone-600 mb-2">
              <KeyRound className="w-3.5 h-3.5 text-amber-700" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Acesso de Teste Rápido:
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mb-3">
              Clique em um dos botões abaixo para preencher os dados automaticamente e testar os diferentes acessos:
            </p>

            <div className="space-y-2">
              {diretoraUser && (
                <button
                  type="button"
                  onClick={() => handleFillDemo(diretoraUser)}
                  className="w-full text-left p-2.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100/80 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-purple-900 leading-tight">
                        {diretoraUser.name} (Diretoria)
                      </p>
                      <p className="text-[10px] text-purple-700">
                        Login: {diretoraUser.email} • Senha: <span className="font-mono font-bold">{diretoraUser.password || 'admin'}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold bg-purple-200/80 text-purple-900 px-2 py-0.5 rounded-md">
                    Preencher
                  </span>
                </button>
              )}

              {teacherUsers.slice(0, 2).map((teacher) => (
                <button
                  key={teacher.id}
                  type="button"
                  onClick={() => handleFillDemo(teacher)}
                  className="w-full text-left p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100/80 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-emerald-700 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-emerald-900 leading-tight">
                        Prof. {teacher.name} ({teacher.subject || 'Docente'})
                      </p>
                      <p className="text-[10px] text-emerald-700">
                        Login: {teacher.email} • Senha: <span className="font-mono font-bold">{teacher.password || '123'}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-md">
                    Preencher
                  </span>
                </button>
              ))}
            </div>
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

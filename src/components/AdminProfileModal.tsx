import React, { useState, useEffect } from 'react';
import { User } from '../types';
import {
  X,
  ShieldCheck,
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
  KeyRound,
} from 'lucide-react';

interface AdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  allUsers: User[];
  onSaveProfile: (updatedUser: User) => Promise<void> | void;
}

export const AdminProfileModal: React.FC<AdminProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allUsers,
  onSaveProfile,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [username, setUsername] = useState(currentUser.username || 'admin');
  const [email, setEmail] = useState(currentUser.email);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(currentUser.name);
      setUsername(currentUser.username || 'admin');
      setEmail(currentUser.email);
      setNewPassword('');
      setConfirmPassword('');
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setError(null);
      setIsSaving(false);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();
    const cleanUsername = username.trim();
    const cleanEmail = email.trim();
    const cleanNewPass = newPassword.trim();
    const cleanConfirmPass = confirmPassword.trim();

    if (!cleanName) {
      setError('Por favor, informe o seu nome completo.');
      return;
    }

    if (!cleanUsername) {
      setError('Por favor, informe o usuário de acesso para login.');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Por favor, informe um e-mail institucional válido.');
      return;
    }

    const otherUsers = allUsers.filter((u) => u.id !== currentUser.id);

    const duplicateUsername = otherUsers.some(
      (u) =>
        (u.username || '').trim().toLowerCase() === cleanUsername.toLowerCase() ||
        u.name.trim().toLowerCase() === cleanUsername.toLowerCase()
    );
    if (duplicateUsername) {
      setError('Este usuário de acesso já está em uso por outro cadastro. Escolha outro.');
      return;
    }

    const duplicateEmail = otherUsers.some(
      (u) => u.email.trim().toLowerCase() === cleanEmail.toLowerCase()
    );
    if (duplicateEmail) {
      setError('Este e-mail já está vinculado a outro usuário do sistema.');
      return;
    }

    if (cleanNewPass || cleanConfirmPass) {
      if (cleanNewPass.length < 3) {
        setError('A nova senha deve ter pelo menos 3 caracteres.');
        return;
      }
      if (cleanNewPass !== cleanConfirmPass) {
        setError('A confirmação de senha não confere com a nova senha digitada.');
        return;
      }
    }

    const finalPassword = cleanNewPass || currentUser.password || '123';

    setIsSaving(true);
    try {
      await onSaveProfile({
        ...currentUser,
        name: cleanName,
        username: cleanUsername,
        email: cleanEmail,
        password: finalPassword,
      });
      onClose();
    } catch (err) {
      console.error('Erro ao atualizar perfil do administrador:', err);
      setError('Não foi possível salvar suas alterações. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-profile-title"
      >
        {/* Top Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 text-amber-300 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 id="admin-profile-title" className="text-base font-bold text-white">
                Meu Perfil — Administração
              </h2>
              <p className="text-xs text-slate-300">
                Edite seu nome, usuário de login, e-mail e senha de acesso
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 px-3.5 py-3 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nome Completo / Nome de Exibição *
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                id="input-admin-profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Maria Aparecida (Diretora)"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-semibold"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Este nome aparece no topo do sistema e nos vistos das fichas homologadas.
            </p>
          </div>

          {/* Username & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Usuário de Login *
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  id="input-admin-profile-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                E-mail Institucional *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  id="input-admin-profile-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="diretoria@escola.gov.br"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div>
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                <span>Alterar Senha de Acesso (Opcional)</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Preencha os campos abaixo apenas se desejar definir uma nova senha.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nova Senha
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    id="input-admin-profile-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Manter senha atual"
                    className="w-full pl-8 pr-9 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    title={showNewPassword ? 'Ocultar senha' : 'Ver senha'}
                  >
                    {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="input-admin-profile-password-confirm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full pl-8 pr-9 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    title={showConfirmPassword ? 'Ocultar senha' : 'Ver senha'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-save-admin-profile"
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 disabled:opacity-60 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

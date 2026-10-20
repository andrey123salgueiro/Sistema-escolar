import React, { useState } from 'react';
import { User } from '../types';
import {
  AVAILABLE_CLASSES,
  AVAILABLE_SUBJECTS,
} from '../data/initialData';
import {
  Users,
  UserPlus,
  Trash2,
  Edit,
  Mail,
  BookOpen,
  Layers,
  CheckCircle,
  LogIn,
  Search,
  KeyRound,
  Lock,
} from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';

interface TeacherManagementProps {
  teachers: User[];
  onAddTeacher: (newTeacher: User) => void;
  onUpdateTeacher: (teacher: User) => void;
  onDeleteTeacher: (teacherId: string) => void;
}

export const TeacherManagement: React.FC<TeacherManagementProps> = ({
  teachers,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('123');
  const [subject, setSubject] = useState(AVAILABLE_SUBJECTS[0]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>(['6º Ano A']);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<User | null>(null);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('123');
    setSubject(AVAILABLE_SUBJECTS[0]);
    setSelectedClasses(['6º Ano A']);
    setEditingTeacherId(null);
    setShowForm(false);
  };

  const handleOpenEdit = (teacher: User) => {
    setName(teacher.name);
    setEmail(teacher.email);
    setPassword(teacher.password || '123');
    setSubject(teacher.subject || AVAILABLE_SUBJECTS[0]);
    setSelectedClasses(teacher.classes || []);
    setEditingTeacherId(teacher.id);
    setShowForm(true);
  };

  const handleToggleClass = (cls: string) => {
    setSelectedClasses((prev) =>
      prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFeedbackMsg('Por favor, preencha o nome do professor.');
      setTimeout(() => setFeedbackMsg(null), 4000);
      return;
    }

    const cleanName = name.trim();
    const cleanEmail =
      email.trim() ||
      `${cleanName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '.')}@escola.gov.br`;
    const cleanPass = password.trim() || '123';

    if (editingTeacherId) {
      const existing = teachers.find((t) => t.id === editingTeacherId);
      if (existing) {
        onUpdateTeacher({
          ...existing,
          name: cleanName,
          username: cleanName,
          email: cleanEmail,
          password: cleanPass,
          subject,
          classes: selectedClasses,
        });
        setFeedbackMsg(`Dados do professor(a) "${cleanName}" atualizados com sucesso!`);
      }
    } else {
      const newTeacher: User = {
        id: `prof-${Date.now()}`,
        name: cleanName,
        username: cleanName,
        email: cleanEmail,
        password: cleanPass,
        role: 'professor',
        subject,
        classes: selectedClasses,
        createdAt: new Date().toISOString().split('T')[0],
      };
      onAddTeacher(newTeacher);
      setFeedbackMsg(`Professor(a) "${cleanName}" cadastrado com sucesso! Usuário: "${cleanName}" | Senha: "123".`);
    }

    setTimeout(() => setFeedbackMsg(null), 4000);
    resetForm();
  };

  const filteredTeachers = teachers.filter((t) => {
    const q = searchTerm.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      (t.subject && t.subject.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-700" />
            <h2 className="text-xl font-bold text-stone-900">
              Cadastro e Gestão de Professores
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Cadastre os docentes que lecionam na escola para que possam preencher e enviar suas fichas de pré-conselho.
          </p>
        </div>

        {!showForm && (
          <button
            id="btn-add-teacher"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Cadastrar Novo Professor</span>
          </button>
        )}
      </div>

      {feedbackMsg && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Teacher Form (Add or Edit) */}
      {showForm && (
        <div className="bg-white rounded-2xl border-2 border-amber-300 p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-200">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-amber-700" />
              {editingTeacherId ? 'Editar Professor' : 'Cadastrar Novo Professor'}
            </h3>
            <button
              onClick={resetForm}
              className="text-stone-400 hover:text-stone-600 text-xs font-medium"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Nome */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nome do(a) Professor(a) (Usuário de Acesso) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Eduardo Souza"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500 font-medium"
                />
                <p className="text-[11px] text-stone-500 mt-0.5">
                  O professor utilizará este nome para entrar no sistema.
                </p>
              </div>

              {/* Email / Login */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  E-mail Institucional (Opcional)
                </label>
                <input
                  type="email"
                  placeholder="Deixe vazio para gerar automaticamente"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Senha */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Senha de Acesso (Padrão: 123) *
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500 font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Disciplina */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Componente Curricular Principal
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
              >
                {AVAILABLE_SUBJECTS.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* Turmas */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Turmas em que o docente leciona:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
                {AVAILABLE_CLASSES.map((cls) => {
                  const isChecked = selectedClasses.includes(cls);
                  return (
                    <label
                      key={cls}
                      className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer border transition-colors ${
                        isChecked
                          ? 'bg-amber-100/70 border-amber-300 text-amber-950 font-semibold'
                          : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleClass(cls)}
                        className="rounded text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
                      />
                      <span className="truncate">{cls}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Submit & Cancel */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-stone-100">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white border border-stone-300 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                id="btn-save-teacher"
                className="px-5 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl transition-colors shadow-xs"
              >
                {editingTeacherId ? 'Salvar Alterações' : 'Concluir Cadastro'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Teachers List */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {/* Search header */}
        <div className="p-4 border-b border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-50/50">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar professor por nome ou disciplina..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs text-stone-800 placeholder:text-stone-400 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <span className="text-xs text-stone-500">
            Total: <strong>{filteredTeachers.length}</strong> professores ativos
          </span>
        </div>

        {/* Teachers Table */}
        <div className="divide-y divide-stone-100">
          {filteredTeachers.map((teacher) => (
            <div
              key={teacher.id}
              className="p-4 hover:bg-stone-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm shrink-0">
                  {teacher.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900">{teacher.name}</h4>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500 mt-0.5">
                    <span className="flex items-center gap-1 text-stone-700 font-medium">
                      <BookOpen className="w-3.5 h-3.5 text-stone-400" />
                      {teacher.subject || 'Geral'}
                    </span>
                    <span className="flex items-center gap-1 text-stone-500">
                      <Mail className="w-3.5 h-3.5 text-stone-400" />
                      {teacher.email}
                    </span>
                    <span className="flex items-center gap-1 text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[11px] font-mono">
                      <KeyRound className="w-3 h-3 text-amber-600" />
                      Senha: <strong>{teacher.password || '123'}</strong>
                    </span>
                  </div>

                  {/* Turmas Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <Layers className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    {teacher.classes && teacher.classes.length > 0 ? (
                      teacher.classes.map((cls) => (
                        <span
                          key={cls}
                          className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded-md text-[10px] font-semibold"
                        >
                          {cls}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-stone-400">Nenhuma turma atribuída</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => handleOpenEdit(teacher)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg text-xs font-semibold transition-colors"
                  title="Editar cadastro do professor"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTeacherToDelete(teacher)}
                  className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Excluir professor"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal for Teacher Deletion */}
      <ConfirmDialog
        isOpen={!!teacherToDelete}
        title="Remover Professor(a)"
        message={`Deseja realmente remover o cadastro de "${teacherToDelete?.name}"? Esta ação removerá o acesso do docente às turmas e fichas do sistema.`}
        confirmText="Sim, Remover Professor"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={() => {
          if (teacherToDelete) {
            onDeleteTeacher(teacherToDelete.id);
            setTeacherToDelete(null);
          }
        }}
        onCancel={() => setTeacherToDelete(null)}
      />
    </div>
  );
};

import React, { useState } from 'react';
import { SchoolClass, Student, User } from '../types';
import {
  Layers,
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle,
  GraduationCap,
  Users,
  Search,
  School,
  Clock,
  Calendar,
  X,
  AlertCircle,
} from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';

interface ClassManagementProps {
  classes: SchoolClass[];
  students: Student[];
  teachers: User[];
  onAddClass: (newClass: SchoolClass) => void;
  onUpdateClass: (cls: SchoolClass) => void;
  onDeleteClass: (classId: string) => void;
  onSelectClassForStudents?: (className: string) => void;
}

export const ClassManagement: React.FC<ClassManagementProps> = ({
  classes,
  students,
  teachers,
  onAddClass,
  onUpdateClass,
  onDeleteClass,
  onSelectClassForStudents,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [shift, setShift] = useState<'Integral' | 'Manhã' | 'Tarde' | 'Noite'>('Integral');
  const [year, setYear] = useState('2026');
  const [description, setDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [classToDelete, setClassToDelete] = useState<SchoolClass | null>(null);

  const resetForm = () => {
    setName('');
    setShift('Integral');
    setYear('2026');
    setDescription('');
    setEditingClassId(null);
    setFormError(null);
    setShowForm(false);
  };

  const handleEdit = (cls: SchoolClass) => {
    setName(cls.name);
    setShift(cls.shift || 'Integral');
    setYear(cls.year || '2026');
    setDescription(cls.description || '');
    setEditingClassId(cls.id);
    setFormError(null);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Por favor, informe a identificação da turma (ex: 6º Ano A).');
      return;
    }

    if (editingClassId) {
      const existing = classes.find((c) => c.id === editingClassId);
      if (existing) {
        onUpdateClass({
          ...existing,
          name: name.trim(),
          shift,
          year: year.trim() || '2026',
          description: description.trim() || undefined,
        });
        setFeedback(`Turma "${name}" atualizada com sucesso!`);
      }
    } else {
      // Check duplicate name
      if (classes.some((c) => c.name.toLowerCase() === name.trim().toLowerCase())) {
        setFormError(`A turma "${name.trim()}" já está cadastrada no sistema!`);
        return;
      }

      const newCls: SchoolClass = {
        id: `cls-${Date.now()}`,
        name: name.trim(),
        shift,
        year: year.trim() || '2026',
        description: description.trim() || undefined,
      };
      onAddClass(newCls);
      setFeedback(`Turma "${name}" cadastrada com sucesso no sistema da escola!`);
    }

    setTimeout(() => setFeedback(null), 3500);
    resetForm();
  };

  const filteredClasses = classes.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q)) ||
      (c.shift && c.shift.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-700" />
            <h2 className="text-xl font-bold text-stone-900">
              Cadastro e Gestão de Turmas
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Cadastre as turmas do ano letivo para vincular professores, alunos e fichas de pré-conselho.
          </p>
        </div>

        {!showForm && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            id="btn-add-class"
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Cadastrar Nova Turma</span>
          </button>
        )}
      </div>

      {feedback && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Class Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xl max-w-lg w-full animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-200">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-700" />
                <span>{editingClassId ? 'Editar Dados da Turma' : 'Cadastrar Nova Turma'}</span>
              </h3>
              <button
                type="button"
                onClick={resetForm}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nome / Identificação da Turma *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 6º Ano A, 9º Ano B, 1º Ano EM"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Turno de Funcionamento
                  </label>
                  <select
                    value={shift}
                    onChange={(e) => setShift(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500 font-medium"
                  >
                    <option value="Integral">Tempo Integral</option>
                    <option value="Manhã">Matutino (Manhã)</option>
                    <option value="Tarde">Vespertino (Tarde)</option>
                    <option value="Noite">Noturno</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Ano Letivo
                  </label>
                  <input
                    type="text"
                    placeholder="2026"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Descrição ou Observações Pedagógicas (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Ensino Fundamental II - Sala 04 - Bloco Pedagógico"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white border border-stone-300 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="btn-save-class"
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl shadow-xs cursor-pointer"
                >
                  {editingClassId ? 'Salvar Alterações' : 'Cadastrar Turma'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Class List */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {/* Search header */}
        <div className="p-4 border-b border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-50/50">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar turma por nome ou turno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs text-stone-800 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <span className="text-xs text-stone-500">
            Total: <strong>{filteredClasses.length}</strong> turmas ativas
          </span>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {filteredClasses.map((cls) => {
            const classStudents = students.filter((s) => s.classGroup === cls.name);
            const classTeachers = teachers.filter((t) => t.classes?.includes(cls.name));

            return (
              <div
                key={cls.id}
                className="bg-white rounded-xl border border-stone-200 hover:border-amber-300 p-4 transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-base font-extrabold text-stone-900 tracking-tight flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      {cls.name}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                      {cls.shift || 'Integral'}
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-500 mb-3 min-h-[18px]">
                    {cls.description || `Ano Letivo ${cls.year || '2026'}`}
                  </p>

                  <div className="bg-stone-50 rounded-lg p-2.5 space-y-1.5 border border-stone-100 text-xs">
                    <div className="flex items-center justify-between text-stone-600">
                      <span className="flex items-center gap-1.5 text-stone-500">
                        <Users className="w-3.5 h-3.5 text-stone-400" />
                        Alunos Matriculados:
                      </span>
                      <span className="font-bold text-stone-900">
                        {classStudents.length} {classStudents.length === 1 ? 'aluno' : 'alunos'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-stone-600">
                      <span className="flex items-center gap-1.5 text-stone-500">
                        <GraduationCap className="w-3.5 h-3.5 text-stone-400" />
                        Professores Atribuídos:
                      </span>
                      <span className="font-semibold text-stone-800">
                        {classTeachers.length} {classTeachers.length === 1 ? 'docente' : 'docentes'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 mt-3 flex items-center justify-between gap-2">
                  {onSelectClassForStudents && (
                    <button
                      onClick={() => onSelectClassForStudents(cls.name)}
                      className="text-[11px] font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1"
                    >
                      <span>Ver Alunos ({classStudents.length})</span>
                    </button>
                  )}

                  <div className="flex items-center gap-1 ml-auto">
                    <button
                      type="button"
                      onClick={() => handleEdit(cls)}
                      className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                      title="Editar turma"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setClassToDelete(cls)}
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Excluir turma"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Modal for Class Deletion */}
      <ConfirmDialog
        isOpen={!!classToDelete}
        title="Remover Turma"
        message={`Deseja realmente remover a turma "${classToDelete?.name}"? Esta ação removerá a turma da lista escolar (os alunos cadastrados não serão apagados).`}
        confirmText="Sim, Remover Turma"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={() => {
          if (classToDelete) {
            onDeleteClass(classToDelete.id);
            setClassToDelete(null);
          }
        }}
        onCancel={() => setClassToDelete(null)}
      />
    </div>
  );
};

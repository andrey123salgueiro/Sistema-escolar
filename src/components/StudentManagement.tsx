import React, { useState, useRef } from 'react';
import { Student, SchoolClass } from '../types';
import * as XLSX from 'xlsx';
import {
  Users,
  UserPlus,
  Upload,
  Download,
  FileSpreadsheet,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Layers,
  FileText,
  Check,
  X,
} from 'lucide-react';

interface StudentManagementProps {
  students: Student[];
  classes: SchoolClass[];
  onAddStudent: (newStudent: Student) => void;
  onAddMultipleStudents: (newStudents: Student[]) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  initialClassFilter?: string;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  students,
  classes,
  onAddStudent,
  onAddMultipleStudents,
  onUpdateStudent,
  onDeleteStudent,
  initialClassFilter,
}) => {
  const [showManualForm, setShowManualForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

  // Manual Form States
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [classGroup, setClassGroup] = useState(
    initialClassFilter || classes[0]?.name || '6º Ano A'
  );
  const [status, setStatus] = useState<'ativo' | 'atencao' | 'transferido'>('ativo');
  const [notes, setNotes] = useState('');

  // Filters
  const [selectedClass, setSelectedClass] = useState<string>(
    initialClassFilter || 'all'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Excel Import States
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importedPreview, setImportedPreview] = useState<
    { name: string; rollNumber?: string; classGroup: string; notes?: string }[]
  >([]);
  const [importTargetClass, setImportTargetClass] = useState<string>(
    classes[0]?.name || '6º Ano A'
  );
  const [useSheetClass, setUseSheetClass] = useState(true);
  const [importFileName, setImportFileName] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const resetManualForm = () => {
    setName('');
    setRollNumber('');
    setClassGroup(selectedClass !== 'all' ? selectedClass : classes[0]?.name || '6º Ano A');
    setStatus('ativo');
    setNotes('');
    setEditingStudentId(null);
    setShowManualForm(false);
  };

  const handleOpenEdit = (std: Student) => {
    setName(std.name);
    setRollNumber(std.rollNumber || '');
    setClassGroup(std.classGroup);
    setStatus(std.status || 'ativo');
    setNotes(std.notes || '');
    setEditingStudentId(std.id);
    setShowManualForm(true);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Informe o nome do aluno.');
      return;
    }

    if (editingStudentId) {
      const existing = students.find((s) => s.id === editingStudentId);
      if (existing) {
        onUpdateStudent({
          ...existing,
          name: name.trim(),
          rollNumber: rollNumber.trim() || undefined,
          classGroup,
          status,
          notes: notes.trim() || undefined,
        });
        setFeedback(`Estudante "${name}" atualizado(a) com sucesso!`);
      }
    } else {
      const newStd: Student = {
        id: `std-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: name.trim(),
        rollNumber: rollNumber.trim() || undefined,
        classGroup,
        status,
        notes: notes.trim() || undefined,
        createdAt: new Date().toISOString(),
      };
      onAddStudent(newStd);
      setFeedback(`Estudante "${name}" cadastrado(a) na turma ${classGroup}!`);
    }

    setTimeout(() => setFeedback(null), 3500);
    resetManualForm();
  };

  // Handle Excel / CSV File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (rawJson.length < 2) {
          setImportError('A planilha parece vazia ou sem linhas de dados.');
          return;
        }

        // Find header row
        const headers: string[] = rawJson[0].map((h: any) =>
          String(h || '').trim().toLowerCase()
        );

        let nameIdx = headers.findIndex(
          (h) =>
            h.includes('nome') ||
            h.includes('aluno') ||
            h.includes('estudante') ||
            h === 'name'
        );
        let rollIdx = headers.findIndex(
          (h) =>
            h.includes('num') ||
            h.includes('nº') ||
            h.includes('chamada') ||
            h.includes('matricula') ||
            h.includes('matrícula')
        );
        let classIdx = headers.findIndex(
          (h) =>
            h.includes('turma') ||
            h.includes('classe') ||
            h.includes('serie') ||
            h.includes('série')
        );
        let obsIdx = headers.findIndex(
          (h) =>
            h.includes('obs') ||
            h.includes('observ') ||
            h.includes('nota') ||
            h.includes('situacao')
        );

        // Fallback: if header name index wasn't identified by column names, check first column
        if (nameIdx === -1) {
          nameIdx = 0; // Assume 1st column is name if not named
        }

        const parsedList: {
          name: string;
          rollNumber?: string;
          classGroup: string;
          notes?: string;
        }[] = [];

        for (let i = 1; i < rawJson.length; i++) {
          const row = rawJson[i];
          if (!row || row.length === 0) continue;

          const rawName = row[nameIdx] ? String(row[nameIdx]).trim() : '';
          if (!rawName) continue;

          const rawRoll =
            rollIdx >= 0 && row[rollIdx] ? String(row[rollIdx]).trim() : '';
          const rawClass =
            classIdx >= 0 && row[classIdx] ? String(row[classIdx]).trim() : '';
          const rawObs =
            obsIdx >= 0 && row[obsIdx] ? String(row[obsIdx]).trim() : '';

          parsedList.push({
            name: rawName,
            rollNumber: rawRoll || undefined,
            classGroup: rawClass || importTargetClass,
            notes: rawObs || undefined,
          });
        }

        if (parsedList.length === 0) {
          setImportError('Nenhum nome de estudante foi localizado na planilha informada.');
          return;
        }

        setImportedPreview(parsedList);
      } catch (err: any) {
        console.error('Error reading excel file', err);
        setImportError(
          'Falha ao ler arquivo. Verifique se o arquivo está no formato Excel (.xlsx, .xls) ou CSV válido.'
        );
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleConfirmImport = () => {
    if (importedPreview.length === 0) return;

    const newStudents: Student[] = importedPreview.map((item, idx) => ({
      id: `std-imp-${Date.now()}-${idx}`,
      name: item.name,
      rollNumber: item.rollNumber,
      classGroup: useSheetClass && item.classGroup ? item.classGroup : importTargetClass,
      status: 'ativo',
      notes: item.notes,
      createdAt: new Date().toISOString(),
    }));

    onAddMultipleStudents(newStudents);
    setFeedback(`${newStudents.length} estudantes importados com sucesso a partir da planilha!`);
    setTimeout(() => setFeedback(null), 4000);

    // Reset import modal
    setImportedPreview([]);
    setImportFileName(null);
    setShowImportModal(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Generate and download template Excel
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Nº de Chamada': '01',
        'Nome do Estudante': 'Beatriz Silva Lima',
        'Turma': '6º Ano A',
        'Observações': 'Destaque em participação',
      },
      {
        'Nº de Chamada': '02',
        'Nome do Estudante': 'Carlos Miguel Albuquerque',
        'Turma': '6º Ano A',
        'Observações': '',
      },
      {
        'Nº de Chamada': '03',
        'Nome do Estudante': 'Daniela Santos Ferreira',
        'Turma': '6º Ano A',
        'Observações': '',
      },
      {
        'Nº de Chamada': '04',
        'Nome do Estudante': 'Eduardo Henrique Dias',
        'Turma': '6º Ano A',
        'Observações': '',
      },
      {
        'Nº de Chamada': '05',
        'Nome do Estudante': 'Guilherme Henrique Ribeiro',
        'Turma': '6º Ano A',
        'Observações': 'Necessita apoio pedagógico',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Alunos_Modelo');
    XLSX.writeFile(workbook, 'modelo_cadastro_alunos.xlsx');
  };

  // Export current students to Excel
  const handleExportStudents = () => {
    const listToExport = filteredStudents.map((s) => ({
      'Nº de Chamada': s.rollNumber || '',
      'Nome do Estudante': s.name,
      'Turma': s.classGroup,
      'Status': s.status === 'atencao' ? 'Atenção' : s.status === 'transferido' ? 'Transferido' : 'Ativo',
      'Observações': s.notes || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(listToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Estudantes');
    XLSX.writeFile(workbook, `alunos_${selectedClass}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const filteredStudents = students.filter((s) => {
    if (selectedClass !== 'all' && s.classGroup !== selectedClass) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match =
        s.name.toLowerCase().includes(q) ||
        (s.rollNumber && s.rollNumber.toLowerCase().includes(q)) ||
        (s.classGroup && s.classGroup.toLowerCase().includes(q)) ||
        (s.notes && s.notes.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Top Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-700" />
            <h2 className="text-xl font-bold text-stone-900">
              Cadastro de Alunos & Importação Excel
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Cadastre os estudantes individualmente ou importe listas completas a partir de planilhas Excel (.xlsx) e CSV.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-xl shadow-xs transition-colors"
            title="Baixar planilha padrão do Excel para preenchimento"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            <span>Baixar Modelo Excel</span>
          </button>

          <button
            onClick={() => {
              setImportError(null);
              setImportedPreview([]);
              setImportFileName(null);
              setShowImportModal(true);
            }}
            id="btn-open-excel-import"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Importar Arquivo Excel / CSV</span>
          </button>

          <button
            onClick={() => {
              resetManualForm();
              setShowManualForm(true);
            }}
            id="btn-add-student-manual"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Cadastrar Aluno</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Manual Student Form (Add or Edit) */}
      {showManualForm && (
        <div className="bg-white rounded-2xl border-2 border-amber-300 p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-200">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-amber-700" />
              {editingStudentId ? 'Editar Estudante' : 'Cadastrar Estudante'}
            </h3>
            <button
              onClick={resetManualForm}
              className="text-stone-400 hover:text-stone-600 text-xs font-medium"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nome Completo do Estudante *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Beatriz Silva Lima"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nº Chamada / Matrícula
                </label>
                <input
                  type="text"
                  placeholder="Ex: 01, 15..."
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Turma *
                </label>
                <select
                  value={classGroup}
                  onChange={(e) => setClassGroup(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500 font-semibold"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Situação Escolar
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
                >
                  <option value="ativo">Regular / Ativo</option>
                  <option value="atencao">Merece Atenção Pedagógica</option>
                  <option value="transferido">Transferido</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Observações Iniciais / Histórico (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Aluno transferido de outra escola; necessita apoio em leitura..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-stone-100">
              <button
                type="button"
                onClick={resetManualForm}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white border border-stone-300 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                id="btn-save-student"
                className="px-5 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl shadow-xs"
              >
                {editingStudentId ? 'Salvar Alterações' : 'Concluir Cadastro'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EXCEL IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
            <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold">
                  Importar Lista de Alunos via Arquivo Excel ou CSV
                </h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-stone-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {importError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {/* Upload Drop Zone */}
              <div className="border-2 border-dashed border-stone-300 hover:border-emerald-500 rounded-2xl p-6 text-center bg-stone-50/50 transition-colors">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="excel-file-upload-input"
                />
                <label
                  htmlFor="excel-file-upload-input"
                  className="cursor-pointer flex flex-col items-center justify-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-stone-800">
                    {importFileName
                      ? `Arquivo selecionado: ${importFileName}`
                      : 'Clique para escolher ou arraste a planilha Excel (.xlsx, .xls) ou CSV'}
                  </span>
                  <span className="text-[11px] text-stone-500 mt-1">
                    Detecta automaticamente colunas com nomes dos alunos, turmas e números de chamada
                  </span>
                </label>
              </div>

              {/* Destination Class Settings */}
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
                <h4 className="text-xs font-bold text-stone-800">
                  Configuração da Turma de Destino:
                </h4>

                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="classConfig"
                      checked={useSheetClass}
                      onChange={() => setUseSheetClass(true)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Utilizar a turma informada na própria planilha</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="classConfig"
                      checked={!useSheetClass}
                      onChange={() => setUseSheetClass(false)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Atribuir todos os alunos a uma turma específica:</span>
                  </label>
                </div>

                {!useSheetClass && (
                  <div className="pt-2">
                    <select
                      value={importTargetClass}
                      onChange={(e) => setImportTargetClass(e.target.value)}
                      className="w-full sm:w-60 bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-xs text-stone-800"
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Preview Table */}
              {importedPreview.length > 0 && (
                <div className="border border-stone-200 rounded-xl overflow-hidden">
                  <div className="bg-stone-100 px-4 py-2 border-b border-stone-200 flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-800">
                      Prévia dos Alunos Identificados ({importedPreview.length}):
                    </span>
                    <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Pronto para gravar</span>
                    </span>
                  </div>

                  <div className="max-h-56 overflow-y-auto divide-y divide-stone-100 text-xs">
                    {importedPreview.map((item, idx) => (
                      <div key={idx} className="px-4 py-2 flex items-center justify-between hover:bg-stone-50">
                        <div className="flex items-center gap-2">
                          <span className="w-5 text-stone-400 font-mono text-[10px]">
                            {item.rollNumber || idx + 1}
                          </span>
                          <span className="font-semibold text-stone-900">{item.name}</span>
                        </div>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-stone-100 font-medium text-stone-700">
                          {useSheetClass && item.classGroup ? item.classGroup : importTargetClass}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-stone-100 px-6 py-3 border-t border-stone-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 bg-white border border-stone-300 hover:bg-stone-50 rounded-xl text-xs font-semibold text-stone-700"
              >
                Cancelar
              </button>

              <button
                type="button"
                id="btn-confirm-import-excel"
                disabled={importedPreview.length === 0}
                onClick={handleConfirmImport}
                className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                  importedPreview.length > 0
                    ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                    : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Confirmar Importação de {importedPreview.length} Alunos</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 mb-6 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar aluno por nome, número de chamada..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-800 focus:bg-white focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-800 focus:ring-2 focus:ring-amber-500 font-semibold"
          >
            <option value="all">Todas as Turmas ({students.length})</option>
            {classes.map((c) => {
              const count = students.filter((s) => s.classGroup === c.name).length;
              return (
                <option key={c.id} value={c.name}>
                  {c.name} ({count})
                </option>
              );
            })}
          </select>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleExportStudents}
            className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition-colors"
            title="Exportar alunos filtrados para arquivo Excel"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            <span>Exportar Lista (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-stone-50/70 border-b border-stone-200 flex items-center justify-between text-xs text-stone-600">
          <span>
            Exibindo <strong>{filteredStudents.length}</strong> de {students.length} estudantes cadastrados
          </span>
          {selectedClass !== 'all' && (
            <span className="font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Turma: {selectedClass}
            </span>
          )}
        </div>

        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-stone-500">
            <Users className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-stone-700">Nenhum estudante encontrado</p>
            <p className="text-xs text-stone-400 mt-1">
              Cadastre novos alunos pelo formulário ou utilize a importação de planilhas Excel acima.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200 text-[10px]">
                <tr>
                  <th className="py-3 px-4 w-16">Nº</th>
                  <th className="py-3 px-4">Nome do Estudante</th>
                  <th className="py-3 px-4">Turma</th>
                  <th className="py-3 px-4">Situação</th>
                  <th className="py-3 px-4">Observações</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredStudents.map((std) => (
                  <tr key={std.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-stone-600">
                      {std.rollNumber || '-'}
                    </td>
                    <td className="py-3 px-4 font-bold text-stone-900">
                      {std.name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200 font-semibold text-stone-800 text-[11px]">
                        {std.classGroup}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {std.status === 'atencao' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          Atenção Pedagógica
                        </span>
                      ) : std.status === 'transferido' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-stone-500 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full">
                          Transferido
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          Regular
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-stone-500 text-[11px] max-w-xs truncate">
                      {std.notes || '-'}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(std)}
                        className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors inline-flex"
                        title="Editar aluno"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `Deseja realmente remover o estudante "${std.name}"?`
                            )
                          ) {
                            onDeleteStudent(std.id);
                          }
                        }}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex"
                        title="Excluir aluno"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

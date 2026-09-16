import { QuestionSection, Question, User, PreCouncilReport } from '../types';

export const SCHOOL_NAME = 'ESCOLA ESTADUAL DO CAMPO FREI GRACIANO DROESSLER';
export const SCHOOL_SUBTITLE = 'ENSINO FUNDAMENTAL EM TEMPO INTEGRAL';
export const REPORT_TITLE = 'FICHA INDIVIDUAL – PRÉ-CONSELHO DE CLASSE';

export const INITIAL_SECTIONS: QuestionSection[] = [
  { id: 'sec-1', title: '1. PANORAMA DA TURMA', order: 1 },
  { id: 'sec-2', title: '2. APRENDIZAGEM E FREQUÊNCIA', order: 2 },
  { id: 'sec-3', title: '3. DESTAQUES E SITUAÇÕES QUE MERECEM ATENÇÃO', order: 3 },
  { id: 'sec-4', title: '4. ENCAMINHAMENTOS', order: 4 },
  { id: 'sec-5', title: '5. SÍNTESE DO PROFESSOR', order: 5 },
];

export const INITIAL_QUESTIONS: Question[] = [
  // 1. PANORAMA DA TURMA
  {
    id: 'q-1',
    sectionId: 'sec-1',
    prompt: 'Como você avalia o desenvolvimento geral da turma em relação à aprendizagem?',
    placeholder: 'Ex: A turma demonstra bom ritmo nas explicações iniciais, porém apresenta heterogeneidade na consolidação dos conceitos...',
    required: true,
    order: 1,
  },
  {
    id: 'q-2',
    sectionId: 'sec-1',
    prompt: 'Como está a participação, o envolvimento e a postura dos estudantes nas aulas?',
    placeholder: 'Ex: Boa participação oral nos debates coletivos, com momentos de dispersão no final do período vespertino...',
    required: true,
    order: 2,
  },
  // 2. APRENDIZAGEM E FREQUÊNCIA
  {
    id: 'q-3',
    sectionId: 'sec-2',
    prompt: 'Quais habilidades/conteúdos apresentam maior dificuldade para a turma?',
    placeholder: 'Ex: Interpretação de problemas contextualizados e operações com frações/geometria plana...',
    required: true,
    order: 1,
  },
  {
    id: 'q-4',
    sectionId: 'sec-2',
    prompt: 'Há estudantes com baixa frequência ou que necessitam de acompanhamento mais próximo? Quais e por quê?',
    placeholder: 'Ex: Aluno Marcos Vinicius (faltas frequentes às terças-feiras); Aluna Júlia (dificuldade motora/leitura)...',
    required: true,
    order: 2,
  },
  // 3. DESTAQUES E SITUAÇÕES QUE MERECEM ATENÇÃO
  {
    id: 'q-5',
    sectionId: 'sec-3',
    prompt: 'Estudantes que se destacaram positivamente (aprendizagem, participação e responsabilidade ou protagonismo):',
    placeholder: 'Ex: Lucas Gabriel (liderança nos trabalhos em grupo), Beatriz Silva (compromisso exemplar com as entregas de tarefas)...',
    required: true,
    order: 1,
  },
  {
    id: 'q-6',
    sectionId: 'sec-3',
    prompt: 'Estudantes que apresentam dificuldades significativas ou necessitam de intervenção/encaminhamento:',
    placeholder: 'Ex: Rafael Costa (necessita reforço pedagógico urgente em leitura/interpretação), Matheus Lima (questão de convivência em equipe)...',
    required: true,
    order: 2,
  },
  // 4. ENCAMINHAMENTOS
  {
    id: 'q-7',
    sectionId: 'sec-4',
    prompt: 'Quais estratégias já foram realizadas e quais ações você sugere para o próximo período?',
    placeholder: 'Ex: Realizada monitoria entre pares e listas graduadas de exercícios. Sugiro oficinas práticas no contraturno...',
    required: true,
    order: 1,
  },
  {
    id: 'q-8',
    sectionId: 'sec-4',
    prompt: 'Há alguma observação importante que deve ser registrada no Pré-Conselho?',
    placeholder: 'Ex: Solicitar conversa com os responsáveis da turma sobre a assiduidade no contraturno...',
    required: false,
    order: 2,
  },
  // 5. SÍNTESE DO PROFESSOR
  {
    id: 'q-9',
    sectionId: 'sec-5',
    prompt: 'Deixe aqui uma observação geral sobre a turma e/ou sobre algum estudante que considere relevante para o Conselho de Classe:',
    placeholder: 'Ex: Turma com alto potencial cognitivo que responde muito bem a projetos práticos. Se mantido o alinhamento com a equipe pedagógica, teremos avanços significativos...',
    required: true,
    order: 1,
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-diretora',
    name: 'Prof.ª Maria Helena (Direção)',
    email: 'diretoria@escola.gov.br',
    password: 'admin',
    role: 'diretora',
    createdAt: '2026-02-01',
  },
  {
    id: 'prof-carlos',
    name: 'Carlos Eduardo Souza',
    email: 'carlos.matematica@escola.gov.br',
    password: '123',
    role: 'professor',
    subject: 'Matemática',
    classes: ['6º Ano A', '7º Ano B', '8º Ano A', '9º Ano A'],
    createdAt: '2026-02-05',
  },
  {
    id: 'prof-ana',
    name: 'Ana Paula Oliveira',
    email: 'ana.portugues@escola.gov.br',
    password: '123',
    role: 'professor',
    subject: 'Língua Portuguesa',
    classes: ['6º Ano A', '7º Ano B', '8º Ano A'],
    createdAt: '2026-02-05',
  },
  {
    id: 'prof-roberto',
    name: 'Roberto Silva Lima',
    email: 'roberto.ciencias@escola.gov.br',
    password: '123',
    role: 'professor',
    subject: 'Ciências da Natureza',
    classes: ['6º Ano A', '7º Ano B'],
    createdAt: '2026-02-10',
  },
];

export const AVAILABLE_CLASSES = [
  '6º Ano A',
  '6º Ano B',
  '7º Ano A',
  '7º Ano B',
  '8º Ano A',
  '8º Ano B',
  '9º Ano A',
  '9º Ano B',
  '1º Ano EM',
  '2º Ano EM',
  '3º Ano EM',
];

export const AVAILABLE_SUBJECTS = [
  'Língua Portuguesa',
  'Matemática',
  'Ciências da Natureza',
  'História',
  'Geografia',
  'Arte',
  'Educação Física',
  'Língua Inglesa',
  'Ensino Religioso',
  'Projeto de Vida',
  'Tecnologia e Inovação',
];

export const INITIAL_REPORTS: PreCouncilReport[] = [
  {
    id: 'rep-sample-1',
    schoolName: SCHOOL_NAME,
    schoolSubtitle: SCHOOL_SUBTITLE,
    title: REPORT_TITLE,
    teacherId: 'prof-carlos',
    teacherName: 'Carlos Eduardo Souza',
    component: 'Matemática',
    classGroup: '6º Ano A',
    date: '2026-09-14',
    bimester: '3º Bimestre',
    status: 'visto',
    createdAt: '2026-09-14T10:30:00Z',
    updatedAt: '2026-09-15T14:20:00Z',
    answers: {
      'q-1': 'O desenvolvimento geral é satisfatório. Cerca de 75% dos estudantes atingiram os objetivos de aprendizagem propostos para cálculo mental e resolução de situações-problema.',
      'q-2': 'Turma muito participativa e interessada, com boa postura na realização das atividades individuais e colaborativas.',
      'q-3': 'Maior dificuldade no conteúdo de frações equivalentes e raciocínio lógico envolvendo grandezas proporcionais.',
      'q-4': 'O estudante Marcos Vinicius apresentou 8 faltas no bimestre sem justificativa formal. Família já notificada.',
      'q-5': 'Beatriz Silva e Lucas Gabriel destacaram-se pelo protagonismo e auxílio aos colegas nas atividades em duplas.',
      'q-6': 'Guilherme Henrique e Larissa necessitam de apoio pedagógico contínuo nas operações fundamentais.',
      'q-7': 'Foram aplicados jogos didáticos e listas de revisão contextualizadas. Sugiro oficinas de reforço com a equipe pedagógica.',
      'q-8': 'Reunião prévia com a professora de Língua Portuguesa para integrar atividades interdisciplinares.',
      'q-9': 'A turma do 6º Ano A tem excelente entrosamento e responde prontamente a incentivos metodológicos diversificados.',
    },
    pedagogaSignature: {
      signed: true,
      signedBy: 'Coord. Pedagógica Sandra Rocha',
      signedAt: '2026-09-15T11:00:00Z',
      notes: 'Ciente e de acordo com o plano de reforço sugerido.',
    },
    diretoraSignature: {
      signed: true,
      signedBy: 'Diretora Maria Helena Silva',
      signedAt: '2026-09-15T14:20:00Z',
      notes: 'Homologado para o Conselho de Classe.',
    },
  },
  {
    id: 'rep-sample-2',
    schoolName: SCHOOL_NAME,
    schoolSubtitle: SCHOOL_SUBTITLE,
    title: REPORT_TITLE,
    teacherId: 'prof-ana',
    teacherName: 'Ana Paula Oliveira',
    component: 'Língua Portuguesa',
    classGroup: '6º Ano A',
    date: '2026-09-15',
    bimester: '3º Bimestre',
    status: 'enviado',
    createdAt: '2026-09-15T09:15:00Z',
    updatedAt: '2026-09-15T09:15:00Z',
    answers: {
      'q-1': 'Turma com boa compreensão leitora em textos narrativos curtos, evoluindo bem na produção textual.',
      'q-2': 'Ambiente de aula colaborativo. Houve melhora sensível no respeito ao turno de fala durante os debates.',
      'q-3': 'Dificuldades na concordância verbal e pontuação em parágrafos argumentativos.',
      'q-4': 'Gabriel Alves com frequência irregular nas sextas-feiras.',
      'q-5': 'Isabela e Kauã destacaram-se com produções poéticas premiadas no sarau da escola.',
      'q-6': 'Felipe Martins apresenta bloqueio na escrita espontânea; necessita avaliação com apoio da sala de recursos.',
      'q-7': 'Trabalhamos oficinas de reescrita em pequenos grupos. Para o 4º bimestre, propomos clube de leitura semanal.',
      'q-8': 'Articular com a direção a reposição de livros didáticos faltantes.',
      'q-9': 'Excelente perspectiva de fechamento anual se mantida a parceria com os responsáveis.',
    },
    pedagogaSignature: {
      signed: false,
    },
    diretoraSignature: {
      signed: false,
    },
  },
];

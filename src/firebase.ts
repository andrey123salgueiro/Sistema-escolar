import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  collection,
  getDoc,
  getDocs,
  query,
  limit,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocFromServer,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import {
  User,
  Question,
  QuestionSection,
  PreCouncilReport,
  SchoolClass,
  Student,
} from './types';
import {
  INITIAL_USERS,
  INITIAL_QUESTIONS,
  INITIAL_SECTIONS,
  INITIAL_REPORTS,
  INITIAL_CLASSES,
  INITIAL_STUDENTS,
} from './data/initialData';

// 1. Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);

// 2. Error Handling as required by Firebase Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 3. Test Connection
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or starting up...');
    }
    return false;
  }
}

// Auto-run test connection on load
testConnection().catch(() => {});

// 4. One-Time Seeding Guard (prevents deleted empty collections from resurrecting INITIAL_* data)

export type SeedCollectionKey =
  | 'users'
  | 'sections'
  | 'questions'
  | 'reports'
  | 'classes'
  | 'students';

const SEED_STATE_LOCAL_KEY = 'pre_conselho_seed_state';
const SEED_STATE_DOC = doc(db, 'test', 'seed_state');

const seededMemory: Partial<Record<SeedCollectionKey, boolean>> = {};
const inFlightSeeding: Partial<Record<SeedCollectionKey, boolean>> = {};

function readLocalSeedState(): Partial<Record<SeedCollectionKey, boolean>> {
  try {
    const raw = localStorage.getItem(SEED_STATE_LOCAL_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<Record<SeedCollectionKey, boolean>>;
  } catch {
    return {};
  }
}

function writeLocalSeedState(updates: Partial<Record<SeedCollectionKey, boolean>>) {
  try {
    const current = readLocalSeedState();
    localStorage.setItem(
      SEED_STATE_LOCAL_KEY,
      JSON.stringify({ ...current, ...updates })
    );
  } catch {
    // Ignore storage errors
  }
}

export async function markCollectionSeeded(key: SeedCollectionKey): Promise<void> {
  if (seededMemory[key] && readLocalSeedState()[key] === true) {
    return;
  }
  seededMemory[key] = true;
  writeLocalSeedState({ [key]: true });
  try {
    await setDoc(SEED_STATE_DOC, { [key]: true }, { merge: true });
  } catch (error) {
    console.warn(`Could not persist seed flag for ${key}:`, error);
  }
}

export async function markAllCollectionsSeeded(): Promise<void> {
  const allFlags: Record<SeedCollectionKey, boolean> = {
    users: true,
    sections: true,
    questions: true,
    reports: true,
    classes: true,
    students: true,
  };
  Object.assign(seededMemory, allFlags);
  writeLocalSeedState(allFlags);
  try {
    await setDoc(SEED_STATE_DOC, allFlags, { merge: true });
  } catch (error) {
    console.warn('Could not persist seed flags for all collections:', error);
  }
}

async function isCollectionAlreadySeeded(key: SeedCollectionKey): Promise<boolean> {
  if (seededMemory[key]) return true;

  const localState = readLocalSeedState();
  if (localState[key] === true || (key !== 'users' && localState.users === true)) {
    seededMemory[key] = true;
    return true;
  }

  try {
    const snap = await getDoc(SEED_STATE_DOC);
    const data = snap.exists() ? snap.data() : undefined;
    if (data && (data[key] === true || (key !== 'users' && data.users === true))) {
      seededMemory[key] = true;
      writeLocalSeedState({ [key]: true });
      return true;
    }
  } catch (error) {
    console.warn(`Could not read seed state for ${key}:`, error);
  }

  // If the school database already has users, never auto-reseed emptied collections
  if (key !== 'users') {
    try {
      const usersSnap = await getDocs(query(collection(db, 'users'), limit(1)));
      if (!usersSnap.empty) {
        await markCollectionSeeded(key);
        return true;
      }
    } catch (error) {
      console.warn(`Could not verify users existence for ${key}:`, error);
    }
  }

  return false;
}

async function handleEmptyCollectionSnapshot<T extends { id: string }>(
  key: SeedCollectionKey,
  path: string,
  initialItems: T[],
  callback: (items: T[]) => void
): Promise<void> {
  // Fast synchronous check so already-seeded empty collections resolve immediately without flicker
  const localState = readLocalSeedState();
  if (
    seededMemory[key] ||
    localState[key] === true ||
    (key !== 'users' && localState.users === true)
  ) {
    seededMemory[key] = true;
    callback([]);
    return;
  }

  const alreadySeeded = await isCollectionAlreadySeeded(key);
  if (alreadySeeded) {
    callback([]);
    return;
  }

  if (inFlightSeeding[key]) {
    return;
  }

  inFlightSeeding[key] = true;
  try {
    await markCollectionSeeded(key);
    for (const item of initialItems) {
      await setDoc(doc(db, path, item.id), item).catch((err) =>
        handleFirestoreError(err, OperationType.WRITE, `${path}/${item.id}`)
      );
    }
    callback(initialItems);
  } finally {
    inFlightSeeding[key] = false;
  }
}

// 5. Real-time Subscriptions with One-Time Auto-Seeding

export function subscribeUsers(callback: (users: User[]) => void): Unsubscribe {
  const path = 'users';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      if (snapshot.empty) {
        void handleEmptyCollectionSnapshot('users', path, INITIAL_USERS, callback);
      } else {
        void markCollectionSeeded('users');
        const users = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as User));
        callback(users);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeSections(callback: (sections: QuestionSection[]) => void): Unsubscribe {
  const path = 'sections';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      if (snapshot.empty) {
        void handleEmptyCollectionSnapshot('sections', path, INITIAL_SECTIONS, callback);
      } else {
        void markCollectionSeeded('sections');
        const sections = snapshot.docs
          .map((d) => ({ ...d.data(), id: d.id } as QuestionSection))
          .sort((a, b) => a.order - b.order);
        callback(sections);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeQuestions(callback: (questions: Question[]) => void): Unsubscribe {
  const path = 'questions';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      if (snapshot.empty) {
        void handleEmptyCollectionSnapshot('questions', path, INITIAL_QUESTIONS, callback);
      } else {
        void markCollectionSeeded('questions');
        const questions = snapshot.docs
          .map((d) => ({ ...d.data(), id: d.id } as Question))
          .sort((a, b) => a.order - b.order);
        callback(questions);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

function normalizeTrimesterLabel(val?: string): string {
  if (val === '1º Bimestre') return '1º Trimestre';
  if (val === '2º Bimestre') return '2º Trimestre';
  if (val === '3º Bimestre') return '3º Trimestre';
  return val || '1º Trimestre';
}

export function subscribeReports(callback: (reports: PreCouncilReport[]) => void): Unsubscribe {
  const path = 'reports';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      if (snapshot.empty) {
        void handleEmptyCollectionSnapshot('reports', path, INITIAL_REPORTS, callback);
      } else {
        void markCollectionSeeded('reports');
        const reports = snapshot.docs.map((d) => {
          const data = d.data() as PreCouncilReport;
          return {
            ...data,
            id: d.id,
            bimester: normalizeTrimesterLabel(data.bimester),
          };
        });
        callback(reports);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeClasses(callback: (classes: SchoolClass[]) => void): Unsubscribe {
  const path = 'classes';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      if (snapshot.empty) {
        void handleEmptyCollectionSnapshot('classes', path, INITIAL_CLASSES, callback);
      } else {
        void markCollectionSeeded('classes');
        const classes = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as SchoolClass));
        callback(classes);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeStudents(callback: (students: Student[]) => void): Unsubscribe {
  const path = 'students';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      if (snapshot.empty) {
        void handleEmptyCollectionSnapshot('students', path, INITIAL_STUDENTS, callback);
      } else {
        void markCollectionSeeded('students');
        const students = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Student));
        callback(students);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// Helper: Recursively clean undefined values before sending to Firestore
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  if (typeof data === 'object') {
    const clean: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        clean[key] = sanitizeForFirestore(value);
      }
    }
    return clean as T;
  }
  return data;
}

// 6. Database Mutation Helpers

export async function saveUserDoc(user: User): Promise<void> {
  const path = `users/${user.id}`;
  try {
    await markCollectionSeeded('users');
    await setDoc(doc(db, 'users', user.id), sanitizeForFirestore(user));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteUserDoc(userId: string): Promise<void> {
  const path = `users/${userId}`;
  try {
    await markCollectionSeeded('users');
    await deleteDoc(doc(db, 'users', userId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveQuestionDoc(question: Question): Promise<void> {
  const path = `questions/${question.id}`;
  try {
    await markCollectionSeeded('questions');
    await setDoc(doc(db, 'questions', question.id), sanitizeForFirestore(question));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteQuestionDoc(questionId: string): Promise<void> {
  const path = `questions/${questionId}`;
  try {
    await markCollectionSeeded('questions');
    await deleteDoc(doc(db, 'questions', questionId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveSectionDoc(section: QuestionSection): Promise<void> {
  const path = `sections/${section.id}`;
  try {
    await markCollectionSeeded('sections');
    await setDoc(doc(db, 'sections', section.id), sanitizeForFirestore(section));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteSectionDoc(sectionId: string): Promise<void> {
  const path = `sections/${sectionId}`;
  try {
    await markCollectionSeeded('sections');
    await deleteDoc(doc(db, 'sections', sectionId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveReportDoc(report: PreCouncilReport): Promise<void> {
  const path = `reports/${report.id}`;
  try {
    await markCollectionSeeded('reports');
    await setDoc(doc(db, 'reports', report.id), sanitizeForFirestore(report));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteReportDoc(reportId: string): Promise<void> {
  const path = `reports/${reportId}`;
  try {
    await markCollectionSeeded('reports');
    await deleteDoc(doc(db, 'reports', reportId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveClassDoc(cls: SchoolClass): Promise<void> {
  const path = `classes/${cls.id}`;
  try {
    await markCollectionSeeded('classes');
    const cleanCls = sanitizeForFirestore(cls);
    await setDoc(doc(db, 'classes', cls.id), cleanCls);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteClassDoc(classId: string): Promise<void> {
  const path = `classes/${classId}`;
  try {
    await markCollectionSeeded('classes');
    await deleteDoc(doc(db, 'classes', classId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveStudentDoc(student: Student): Promise<void> {
  const path = `students/${student.id}`;
  try {
    await markCollectionSeeded('students');
    await setDoc(doc(db, 'students', student.id), sanitizeForFirestore(student));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function batchSaveStudents(students: Student[]): Promise<void> {
  const path = 'students';
  try {
    await markCollectionSeeded('students');
    const batch = writeBatch(db);
    students.forEach((student) => {
      batch.set(doc(db, 'students', student.id), sanitizeForFirestore(student));
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteStudentDoc(studentId: string): Promise<void> {
  const path = `students/${studentId}`;
  try {
    await markCollectionSeeded('students');
    await deleteDoc(doc(db, 'students', studentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

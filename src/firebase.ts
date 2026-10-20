import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  collection,
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

// 4. Real-time Subscriptions with Auto-Seeding

export function subscribeUsers(callback: (users: User[]) => void): Unsubscribe {
  const path = 'users';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      if (snapshot.empty) {
        // Seed initial users into Firestore
        INITIAL_USERS.forEach((user) => {
          setDoc(doc(db, path, user.id), user).catch((err) =>
            handleFirestoreError(err, OperationType.WRITE, `${path}/${user.id}`)
          );
        });
        callback(INITIAL_USERS);
      } else {
        const users = snapshot.docs.map((d) => d.data() as User);
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
        INITIAL_SECTIONS.forEach((sec) => {
          setDoc(doc(db, path, sec.id), sec).catch((err) =>
            handleFirestoreError(err, OperationType.WRITE, `${path}/${sec.id}`)
          );
        });
        callback(INITIAL_SECTIONS);
      } else {
        const sections = snapshot.docs
          .map((d) => d.data() as QuestionSection)
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
        INITIAL_QUESTIONS.forEach((q) => {
          setDoc(doc(db, path, q.id), q).catch((err) =>
            handleFirestoreError(err, OperationType.WRITE, `${path}/${q.id}`)
          );
        });
        callback(INITIAL_QUESTIONS);
      } else {
        const questions = snapshot.docs
          .map((d) => d.data() as Question)
          .sort((a, b) => a.order - b.order);
        callback(questions);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeReports(callback: (reports: PreCouncilReport[]) => void): Unsubscribe {
  const path = 'reports';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      if (snapshot.empty) {
        INITIAL_REPORTS.forEach((rep) => {
          setDoc(doc(db, path, rep.id), rep).catch((err) =>
            handleFirestoreError(err, OperationType.WRITE, `${path}/${rep.id}`)
          );
        });
        callback(INITIAL_REPORTS);
      } else {
        const reports = snapshot.docs.map((d) => d.data() as PreCouncilReport);
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
        INITIAL_CLASSES.forEach((cls) => {
          setDoc(doc(db, path, cls.id), cls).catch((err) =>
            handleFirestoreError(err, OperationType.WRITE, `${path}/${cls.id}`)
          );
        });
        callback(INITIAL_CLASSES);
      } else {
        const classes = snapshot.docs.map((d) => d.data() as SchoolClass);
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
        INITIAL_STUDENTS.forEach((std) => {
          setDoc(doc(db, path, std.id), std).catch((err) =>
            handleFirestoreError(err, OperationType.WRITE, `${path}/${std.id}`)
          );
        });
        callback(INITIAL_STUDENTS);
      } else {
        const students = snapshot.docs.map((d) => d.data() as Student);
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

// 5. Database Mutation Helpers

export async function saveUserDoc(user: User): Promise<void> {
  const path = `users/${user.id}`;
  try {
    await setDoc(doc(db, 'users', user.id), sanitizeForFirestore(user));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteUserDoc(userId: string): Promise<void> {
  const path = `users/${userId}`;
  try {
    await deleteDoc(doc(db, 'users', userId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveQuestionDoc(question: Question): Promise<void> {
  const path = `questions/${question.id}`;
  try {
    await setDoc(doc(db, 'questions', question.id), sanitizeForFirestore(question));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteQuestionDoc(questionId: string): Promise<void> {
  const path = `questions/${questionId}`;
  try {
    await deleteDoc(doc(db, 'questions', questionId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveSectionDoc(section: QuestionSection): Promise<void> {
  const path = `sections/${section.id}`;
  try {
    await setDoc(doc(db, 'sections', section.id), sanitizeForFirestore(section));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveReportDoc(report: PreCouncilReport): Promise<void> {
  const path = `reports/${report.id}`;
  try {
    await setDoc(doc(db, 'reports', report.id), sanitizeForFirestore(report));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteReportDoc(reportId: string): Promise<void> {
  const path = `reports/${reportId}`;
  try {
    await deleteDoc(doc(db, 'reports', reportId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveClassDoc(cls: SchoolClass): Promise<void> {
  const path = `classes/${cls.id}`;
  try {
    const cleanCls = sanitizeForFirestore(cls);
    await setDoc(doc(db, 'classes', cls.id), cleanCls);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteClassDoc(classId: string): Promise<void> {
  const path = `classes/${classId}`;
  try {
    await deleteDoc(doc(db, 'classes', classId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveStudentDoc(student: Student): Promise<void> {
  const path = `students/${student.id}`;
  try {
    await setDoc(doc(db, 'students', student.id), sanitizeForFirestore(student));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function batchSaveStudents(students: Student[]): Promise<void> {
  const path = 'students';
  try {
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
    await deleteDoc(doc(db, 'students', studentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

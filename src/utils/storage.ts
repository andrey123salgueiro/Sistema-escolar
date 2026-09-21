import { User, Question, QuestionSection, PreCouncilReport } from '../types';
import {
  INITIAL_USERS,
  INITIAL_QUESTIONS,
  INITIAL_SECTIONS,
  INITIAL_REPORTS,
} from '../data/initialData';

const USERS_KEY = 'pre_conselho_users';
const QUESTIONS_KEY = 'pre_conselho_questions';
const SECTIONS_KEY = 'pre_conselho_sections';
const REPORTS_KEY = 'pre_conselho_reports';
const CURRENT_USER_KEY = 'pre_conselho_current_user';

export function getStoredUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    const parsed: User[] = JSON.parse(raw);
    let hasChanges = false;
    // Ensure all users have passwords populated and diretora has username admin
    const fixed = parsed.map((u) => {
      let updatedUser = { ...u };
      if (u.role === 'diretora') {
        if (updatedUser.username !== 'admin') {
          updatedUser.username = 'admin';
          hasChanges = true;
        }
        if (updatedUser.password !== '123') {
          updatedUser.password = '123';
          hasChanges = true;
        }
      } else {
        if (!updatedUser.password) {
          updatedUser.password = '123';
          hasChanges = true;
        }
      }
      return updatedUser;
    });

    if (hasChanges) {
      localStorage.setItem(USERS_KEY, JSON.stringify(fixed));
    }
    return fixed;
  } catch (e) {
    console.error('Failed to parse stored users', e);
    return INITIAL_USERS;
  }
}

export function saveStoredUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getStoredSections(): QuestionSection[] {
  try {
    const raw = localStorage.getItem(SECTIONS_KEY);
    if (!raw) {
      localStorage.setItem(SECTIONS_KEY, JSON.stringify(INITIAL_SECTIONS));
      return INITIAL_SECTIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse stored sections', e);
    return INITIAL_SECTIONS;
  }
}

export function saveStoredSections(sections: QuestionSection[]) {
  localStorage.setItem(SECTIONS_KEY, JSON.stringify(sections));
}

export function getStoredQuestions(): Question[] {
  try {
    const raw = localStorage.getItem(QUESTIONS_KEY);
    if (!raw) {
      localStorage.setItem(QUESTIONS_KEY, JSON.stringify(INITIAL_QUESTIONS));
      return INITIAL_QUESTIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse stored questions', e);
    return INITIAL_QUESTIONS;
  }
}

export function saveStoredQuestions(questions: Question[]) {
  localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
}

export function getStoredReports(): PreCouncilReport[] {
  try {
    const raw = localStorage.getItem(REPORTS_KEY);
    if (!raw) {
      localStorage.setItem(REPORTS_KEY, JSON.stringify(INITIAL_REPORTS));
      return INITIAL_REPORTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse stored reports', e);
    return INITIAL_REPORTS;
  }
}

export function saveStoredReports(reports: PreCouncilReport[]) {
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
}

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed;
    }
  } catch (e) {
    console.error('Failed to get current user', e);
  }
  return null;
}

export function setCurrentUser(user: User | null) {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

export function resetToFactoryData() {
  localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(QUESTIONS_KEY, JSON.stringify(INITIAL_QUESTIONS));
  localStorage.setItem(SECTIONS_KEY, JSON.stringify(INITIAL_SECTIONS));
  localStorage.setItem(REPORTS_KEY, JSON.stringify(INITIAL_REPORTS));
  localStorage.removeItem(CURRENT_USER_KEY);
}

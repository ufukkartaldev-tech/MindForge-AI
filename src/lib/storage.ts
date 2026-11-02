"use client";

import { Course, GamificationState, QuizAttempt, ExamSimulationResult, StudyPlanTask, TutorMessage, MasteryStatus } from "./types";
import { INITIAL_COURSES } from "@/data/initial-courses";
import { INITIAL_BADGES } from "@/data/badges";

const STORAGE_KEYS = {
  COURSES: "mindforge_courses",
  GAMIFICATION: "mindforge_gamification",
  QUIZ_ATTEMPTS: "mindforge_quiz_attempts",
  EXAM_RESULTS: "mindforge_exam_results",
  STUDY_TASKS: "mindforge_study_tasks",
  TUTOR_MESSAGES: "mindforge_tutor_messages",
  API_KEY: "mindforge_gemini_api_key"
};

function safeGetItem<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return defaultValue;
  }
}

function safeSetItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage:`, e);
  }
}

// ----------------- Courses -----------------

export function getStoredCourses(): Course[] {
  return safeGetItem<Course[]>(STORAGE_KEYS.COURSES, INITIAL_COURSES);
}

export function saveCourses(courses: Course[]): void {
  safeSetItem(STORAGE_KEYS.COURSES, courses);
}

export function getCourseById(courseId: string): Course | undefined {
  const courses = getStoredCourses();
  return courses.find(c => c.id === courseId);
}

export function saveCourse(updatedCourse: Course): void {
  const courses = getStoredCourses();
  const index = courses.findIndex(c => c.id === updatedCourse.id);
  if (index >= 0) {
    courses[index] = updatedCourse;
  } else {
    courses.push(updatedCourse);
  }
  saveCourses(courses);
}

export function deleteCourse(courseId: string): void {
  const courses = getStoredCourses().filter(c => c.id !== courseId);
  saveCourses(courses);
}

export function updateTopicMastery(
  courseId: string,
  topicId: string,
  status: MasteryStatus,
  score: number,
  timeSpentMinutes: number = 0
): void {
  const courses = getStoredCourses();
  const course = courses.find(c => c.id === courseId);
  if (!course) return;

  for (const module of course.modules) {
    const topic = module.topics.find(t => t.id === topicId);
    if (topic) {
      topic.masteryStatus = status;
      topic.masteryScore = Math.max(topic.masteryScore, score);
      topic.timeSpentMinutes = (topic.timeSpentMinutes || 0) + timeSpentMinutes;
      topic.lastStudiedAt = new Date().toISOString();
      break;
    }
  }

  saveCourses(courses);
  addXP(30 + Math.floor(score / 2));
}

// ----------------- Gamification -----------------

const INITIAL_GAMIFICATION: GamificationState = {
  xp: 1420,
  level: 4,
  streakDays: 7,
  lastActiveDate: new Date().toISOString().split("T")[0],
  dailyTargetMinutes: 60,
  todayStudiedMinutes: 45,
  completedTopicsCount: 8,
  badges: INITIAL_BADGES
};

export function getGamificationState(): GamificationState {
  return safeGetItem<GamificationState>(STORAGE_KEYS.GAMIFICATION, INITIAL_GAMIFICATION);
}

export function addXP(amount: number): GamificationState {
  const state = getGamificationState();
  state.xp += amount;
  state.level = Math.floor(state.xp / 400) + 1;
  safeSetItem(STORAGE_KEYS.GAMIFICATION, state);
  return state;
}

export function updateStudyTime(minutes: number): void {
  const state = getGamificationState();
  state.todayStudiedMinutes += minutes;
  addXP(minutes * 2);
  safeSetItem(STORAGE_KEYS.GAMIFICATION, state);
}

// ----------------- Quiz Attempts -----------------

export function getStoredQuizAttempts(): QuizAttempt[] {
  return safeGetItem<QuizAttempt[]>(STORAGE_KEYS.QUIZ_ATTEMPTS, []);
}

export function saveQuizAttempt(attempt: QuizAttempt): void {
  const attempts = getStoredQuizAttempts();
  attempts.unshift(attempt);
  safeSetItem(STORAGE_KEYS.QUIZ_ATTEMPTS, attempts);

  // Gamification reward
  addXP(attempt.score * 2);

  // If topicId provided, update mastery
  if (attempt.topicId && attempt.courseId) {
    let status: MasteryStatus = "developing";
    if (attempt.score >= 80) status = "mastered";
    else if (attempt.score >= 50) status = "in_progress";
    else status = "needs_review";

    updateTopicMastery(attempt.courseId, attempt.topicId, status, attempt.score, 15);
  }
}

// ----------------- Exam Results -----------------

export function getStoredExamResults(): ExamSimulationResult[] {
  return safeGetItem<ExamSimulationResult[]>(STORAGE_KEYS.EXAM_RESULTS, []);
}

export function saveExamResult(result: ExamSimulationResult): void {
  const results = getStoredExamResults();
  results.unshift(result);
  safeSetItem(STORAGE_KEYS.EXAM_RESULTS, results);
  addXP(result.score * 5);
}

// ----------------- Study Planner -----------------

const DEFAULT_STUDY_TASKS: StudyPlanTask[] = [
  {
    id: "task-1",
    courseId: "cpp-intro",
    courseTitle: "C++ Programlamaya Giriş",
    topicId: "cpp-t5",
    topicTitle: "İşaretçi (Pointer) Mantığı ve Adres Operatörü",
    date: new Date().toISOString().split("T")[0],
    durationMinutes: 45,
    completed: false,
    priority: "Yüksek"
  },
  {
    id: "task-2",
    courseId: "oop-cpp",
    courseTitle: "OOP (C++ ile)",
    topicId: "oop-t3",
    topicTitle: "Kalıtım (Inheritance) & Taban Sınıf Başlatıcıları",
    date: new Date().toISOString().split("T")[0],
    durationMinutes: 40,
    completed: true,
    priority: "Yüksek"
  },
  {
    id: "task-3",
    courseId: "math-1",
    courseTitle: "Matematik 1",
    topicId: "math1-t2",
    topicTitle: "Türev Kuralları ve Zincir Kuralı",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    durationMinutes: 30,
    completed: false,
    priority: "Orta"
  },
  {
    id: "task-4",
    courseId: "algorithms",
    courseTitle: "Algoritmalar",
    topicId: "algo-t1",
    topicTitle: "Sıralama Algoritmaları ve Big-O Analizi",
    date: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    durationMinutes: 50,
    completed: false,
    priority: "Orta"
  }
];

export function getStoredStudyTasks(): StudyPlanTask[] {
  return safeGetItem<StudyPlanTask[]>(STORAGE_KEYS.STUDY_TASKS, DEFAULT_STUDY_TASKS);
}

export function saveStudyTasks(tasks: StudyPlanTask[]): void {
  safeSetItem(STORAGE_KEYS.STUDY_TASKS, tasks);
}

export function toggleTaskCompleted(taskId: string): void {
  const tasks = getStoredStudyTasks();
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    if (task.completed) {
      addXP(40);
      updateStudyTime(task.durationMinutes);
    }
    saveStudyTasks(tasks);
  }
}

// ----------------- AI Tutor Messages -----------------

export function getStoredTutorMessages(topicOrCourseId?: string): TutorMessage[] {
  const messages = safeGetItem<TutorMessage[]>(STORAGE_KEYS.TUTOR_MESSAGES, [
    {
      id: "msg-welcome",
      sender: "assistant",
      content: "Merhaba! Ben senin yapay zekâ ders danışmanınım. Hangi konuda kafana takılan bir yer var? Formülleri basitleştirebilir, C++ kodlarını adım adım açıklayabilir veya pratik örnekler üretebilirim.",
      timestamp: new Date().toISOString()
    }
  ]);
  if (!topicOrCourseId) return messages;
  return messages.filter(m => !m.topicId || m.topicId === topicOrCourseId || m.courseId === topicOrCourseId);
}

export function saveTutorMessage(message: TutorMessage): void {
  const messages = safeGetItem<TutorMessage[]>(STORAGE_KEYS.TUTOR_MESSAGES, []);
  messages.push(message);
  safeSetItem(STORAGE_KEYS.TUTOR_MESSAGES, messages);
}

// ----------------- API Key -----------------

export function getStoredApiKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(STORAGE_KEYS.API_KEY) || "";
}

export function saveApiKey(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.API_KEY, key);
}

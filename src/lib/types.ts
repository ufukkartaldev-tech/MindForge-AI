export type MasteryStatus = 'unstarted' | 'in_progress' | 'developing' | 'mastered' | 'needs_review';

export interface Topic {
  id: string;
  moduleId: string;
  courseId: string;
  title: string;
  summary: string;
  orderIndex: number;
  difficulty: 'Başlangıç' | 'Orta' | 'İleri';
  prerequisites?: string[];
  learningObjectives: string[];
  masteryStatus: MasteryStatus;
  masteryScore: number; // 0 - 100
  timeSpentMinutes: number;
  lastStudiedAt?: string;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  orderIndex: number;
  topics: Topic[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
  category: string;
  difficulty: 'Başlangıç' | 'Orta' | 'İleri';
  dayOfWeek: 'Pazartesi' | 'Salı' | 'Çarşamba' | 'Perşembe' | 'Cuma' | 'Cumartesi' | 'Pazar';
  timeSlot: string; // e.g. "09.30–11.00"
  examDate?: string;
  examLocation?: string;
  modules: Module[];
  createdAt: string;
}

export type LessonSectionType = 
  | 'intro'
  | 'prereq'
  | 'concept'
  | 'detail'
  | 'real_world'
  | 'applied'
  | 'common_mistakes'
  | 'summary'
  | 'mini_eval';

export interface InteractiveActivity {
  type: 'code_prediction' | 'code_fix' | 'math_step' | 'os_scheduling' | 'algo_trace' | 'matching';
  title: string;
  prompt: string;
  codeSnippet?: string;
  language?: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  hints: string[];
}

export interface LessonSection {
  type: LessonSectionType;
  title: string;
  content: string;
  mathLatex?: string;
  interactiveActivity?: InteractiveActivity;
}

export interface LessonContent {
  topicId: string;
  topicTitle: string;
  courseId: string;
  sections: LessonSection[];
}

export type QuestionType =
  | 'multiple_choice'
  | 'true_false'
  | 'fill_in_the_blank'
  | 'code_prediction'
  | 'matching';

export interface QuizQuestion {
  id: string;
  topicId?: string;
  courseId?: string;
  type: QuestionType;
  question: string;
  code?: string;
  math?: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  hint: string;
  difficulty: 'Kolay' | 'Orta' | 'Zor';
}

export interface QuizAttempt {
  id: string;
  topicId?: string;
  topicTitle?: string;
  courseId: string;
  courseTitle: string;
  score: number;
  totalQuestions: number;
  answers: Record<string, string>; // questionId -> selected answer
  wrongQuestions: QuizQuestion[];
  createdAt: string;
}

export interface ExamSimulationConfig {
  courseId: string;
  selectedTopicIds: string[];
  durationMinutes: number;
  questionCount: number;
  difficulty: 'Kolay' | 'Orta' | 'Zor' | 'Karma';
}

export interface ExamSimulationResult {
  id: string;
  courseId: string;
  courseTitle: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  emptyCount: number;
  durationMinutes: number;
  timeSpentSeconds: number;
  topicBreakdown: {
    topicId: string;
    topicTitle: string;
    score: number;
    total: number;
  }[];
  strongTopics: string[];
  weakTopics: string[];
  recommendations: string[];
  completedAt: string;
  questions: QuizQuestion[];
  answers: Record<string, string>;
}

export interface StudyPlanTask {
  id: string;
  courseId: string;
  courseTitle: string;
  topicId?: string;
  topicTitle?: string;
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  completed: boolean;
  priority: 'Yüksek' | 'Orta' | 'Düşük';
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'quiz' | 'study' | 'streak' | 'course';
  unlockedAt?: string;
}

export interface GamificationState {
  xp: number;
  level: number;
  streakDays: number;
  lastActiveDate: string;
  dailyTargetMinutes: number;
  todayStudiedMinutes: number;
  completedTopicsCount: number;
  badges: Badge[];
}

export interface TutorMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  topicId?: string;
  courseId?: string;
}

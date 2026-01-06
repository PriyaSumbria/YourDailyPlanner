
export type TaskCategory = 'Work' | 'Personal' | 'Health' | 'Leisure' | 'Other';
export type TaskPriority = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'Pending' | 'In-Progress' | 'Completed' | 'Missed';
export type RingtoneType = 'Classic' | 'Pulse' | 'Echo' | 'Digital';

export interface Task {
  id: string;
  title: string;
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  notified?: boolean;
  reminderMinutes?: number; // Minutes before start to notify
  reminderFired?: boolean;
  order?: number; // Manual sort order
}

export interface DayStats {
  date: string; // ISO date string (YYYY-MM-DD)
  completed: number;
  pending: number;
  missed: number;
  total: number;
  userNotes?: string;
}

export interface DayReview {
  summary: string;
  accomplishments: string[];
  missedOpportunities: string[];
  productivityScore: number;
  tipsForTomorrow: string;
}

export type AppView = 'Setup' | 'Active' | 'Dashboard';

export const CATEGORIES: TaskCategory[] = ['Work', 'Personal', 'Health', 'Leisure', 'Other'];
export const PRIORITIES: TaskPriority[] = ['High', 'Medium', 'Low'];
export const RINGTONES: RingtoneType[] = ['Classic', 'Pulse', 'Echo', 'Digital'];

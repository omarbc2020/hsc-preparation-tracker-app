import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  name: string;
  unique_id: string;
  full_name?: string;
  institution?: string;
  hsc_batch?: string;
}

interface Subject {
  id: string;
  name: string;
  user_id: string;
}

interface Chapter {
  id: string;
  subject_id: string;
  name: string;
  online_class: boolean;
  offline_class: boolean;
  textbook_reading: boolean;
  concept_clear: boolean;
  textbook_solve: boolean;
  board_solve: boolean;
  engineering_solve: boolean;
  medical_solve: boolean;
  varsity_solve: boolean;
}

interface Exam {
  id: string;
  date: string;
  subject_id: string;
  chapter_id: string;
  total_marks: number;
  marks_obtained: number;
}

interface StudyHour {
  id: string;
  date: string;
  hours: number;
}

interface AppState {
  user: UserProfile | null;
  subjects: Subject[];
  chapters: Record<string, Chapter[]>; // subject_id -> chapters
  exams: Exam[];
  studyHours: StudyHour[];
  isLoading: boolean;
  
  setUser: (user: UserProfile | null) => void;
  fetchData: () => Promise<void>;
  addSubject: (name: string) => Promise<void>;
  updateChapter: (chapterId: string, updates: Partial<Chapter>) => Promise<void>;
  addExam: (exam: Omit<Exam, 'id'>) => Promise<void>;
  addStudyHours: (date: string, hours: number) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  subjects: [],
  chapters: {},
  exams: [],
  studyHours: [],
  isLoading: false,

  setUser: (user) => set({ user }),

  fetchData: async () => {
    const { user } = get();
    if (!user) return;

    set({ isLoading: true });
    try {
      const [subjectsRes, chaptersRes, examsRes, studyRes] = await Promise.all([
        supabase.from('subjects').select('*').eq('user_id', user.id),
        supabase.from('chapters').select('*').eq('user_id', user.id),
        supabase.from('exams').select('*').eq('user_id', user.id).order('date', { ascending: false }),
        supabase.from('study_hours').select('*').eq('user_id', user.id).order('date', { ascending: false }),
      ]);

      const chaptersMap: Record<string, Chapter[]> = {};
      chaptersRes.data?.forEach((ch: any) => {
        if (!chaptersMap[ch.subject_id]) chaptersMap[ch.subject_id] = [];
        chaptersMap[ch.subject_id].push(ch);
      });

      set({
        subjects: subjectsRes.data || [],
        chapters: chaptersMap,
        exams: examsRes.data || [],
        studyHours: studyRes.data || [],
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addSubject: async (name) => {
    const { user } = get();
    if (!user) return;

    const { data, error } = await supabase
      .from('subjects')
      .insert([{ name, user_id: user.id }])
      .select();

    if (data) {
      set((state) => ({ subjects: [...state.subjects, data[0]] }));
    }
  },

  updateChapter: async (chapterId, updates) => {
    const { error } = await supabase
      .from('chapters')
      .update(updates)
      .eq('id', chapterId);

    if (!error) {
      set((state) => {
        const newChapters = { ...state.chapters };
        for (const subId in newChapters) {
          newChapters[subId] = newChapters[subId].map((ch) =>
            ch.id === chapterId ? { ...ch, ...updates } : ch
          );
        }
        return { chapters: newChapters };
      });
    }
  },

  addExam: async (exam) => {
    const { user } = get();
    if (!user) return;

    const { data, error } = await supabase
      .from('exams')
      .insert([{ ...exam, user_id: user.id }])
      .select();

    if (data) {
      set((state) => ({ exams: [data[0], ...state.exams] }));
    }
  },

  addStudyHours: async (date, hours) => {
    const { user } = get();
    if (!user) return;

    const { data, error } = await supabase
      .from('study_hours')
      .insert([{ date, hours, user_id: user.id }])
      .select();

    if (data) {
      set((state) => ({ studyHours: [data[0], ...state.studyHours] }));
    }
  },

  updateProfile: async (updates) => {
    const { user } = get();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (!error) {
      set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      }));
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, subjects: [], chapters: {}, exams: [], studyHours: [] });
  },
}));

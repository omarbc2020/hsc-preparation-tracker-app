import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Plus, ChevronRight, ChevronDown, CheckCircle2, Circle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const DEFAULT_SUBJECTS = [
  'Bangla 1st', 'Bangla 2nd', 'English 1st', 'English 2nd', 'ICT', 
  'Physics 1st', 'Physics 2nd', 'Chemistry 1st', 'Chemistry 2nd', 
  'Higher Math 1st', 'Higher Math 2nd'
];

export default function Subjects() {
  const { subjects, chapters, user, addSubject, updateChapter, fetchData } = useStore();
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [newChapterName, setNewChapterName] = useState('');
  const [addingChapterTo, setAddingChapterTo] = useState<string | null>(null);

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    await addSubject(newSubjectName);
    setNewSubjectName('');
    setIsAddingSubject(false);
  };

  const handleAddDefaultSubjects = async () => {
    if (!user) return;
    const existingNames = subjects.map(s => s.name);
    const toAdd = DEFAULT_SUBJECTS.filter(name => !existingNames.includes(name));
    
    if (toAdd.length === 0) return;

    const { error } = await supabase.from('subjects').insert(
      toAdd.map(name => ({ name, user_id: user.id }))
    );

    if (!error) fetchData();
  };

  const handleAddChapter = async (subjectId: string) => {
    if (!newChapterName.trim() || !user) return;
    
    const { error } = await supabase.from('chapters').insert([{
      subject_id: subjectId,
      user_id: user.id,
      name: newChapterName,
      online_class: false,
      offline_class: false,
      textbook_reading: false,
      concept_clear: false,
      textbook_solve: false,
      board_solve: false,
      engineering_solve: false,
      medical_solve: false,
      varsity_solve: false
    }]);

    if (!error) {
      setNewChapterName('');
      setAddingChapterTo(null);
      fetchData();
    }
  };

  const calculateProgress = (ch: any) => {
    const steps = [
      ch.online_class, ch.offline_class, ch.textbook_reading, ch.concept_clear,
      ch.textbook_solve, ch.board_solve, ch.engineering_solve, ch.medical_solve, ch.varsity_solve
    ];
    return Math.round((steps.filter(Boolean).length / steps.length) * 100);
  };

  const steps = [
    { key: 'online_class', label: 'Online Class' },
    { key: 'offline_class', label: 'Offline Class' },
    { key: 'textbook_reading', label: 'Textbook Reading + Notes' },
    { key: 'concept_clear', label: 'Concept Clear' },
    { key: 'textbook_solve', label: 'Textbook Question Solve' },
    { key: 'board_solve', label: 'Board + Test Paper Solve' },
    { key: 'engineering_solve', label: 'Engineering Q Bank Solve' },
    { key: 'medical_solve', label: 'Medical Q Bank Solve' },
    { key: 'varsity_solve', label: 'Varsity Q Bank Solve' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Subjects & Chapters</h2>
          <p className="text-zinc-500">Track your progress for each chapter.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleAddDefaultSubjects}
            className="px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            Add Default Subjects
          </button>
          <button 
            onClick={() => setIsAddingSubject(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Subject
          </button>
        </div>
      </div>

      {isAddingSubject && (
        <form onSubmit={handleAddSubject} className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex gap-2">
          <input
            type="text"
            required
            autoFocus
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
            placeholder="Subject Name (e.g. Physics 1st)"
            className="flex-1 px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg">Add</button>
          <button type="button" onClick={() => setIsAddingSubject(false)} className="px-4 py-2 text-zinc-500">Cancel</button>
        </form>
      )}

      <div className="space-y-4">
        {subjects.map((subject) => {
          const subChapters = chapters[subject.id] || [];
          const isExpanded = expandedSubject === subject.id;
          const overallProgress = subChapters.length > 0
            ? Math.round(subChapters.reduce((acc, ch) => acc + calculateProgress(ch), 0) / subChapters.length)
            : 0;

          return (
            <div key={subject.id} className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
              <button
                onClick={() => setExpandedSubject(isExpanded ? null : subject.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-zinc-50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  {isExpanded ? <ChevronDown className="w-5 h-5 text-zinc-400" /> : <ChevronRight className="w-5 h-5 text-zinc-400" />}
                  <div className="text-left">
                    <h3 className="font-semibold text-zinc-900">{subject.name}</h3>
                    <p className="text-xs text-zinc-500">{subChapters.length} Chapters</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${overallProgress}%` }} />
                  </div>
                  <span className="text-sm font-bold text-emerald-600 w-10">{overallProgress}%</span>
                </div>
              </button>

              {isExpanded && (
                <div className="px-6 pb-6 border-t border-zinc-100 bg-zinc-50/30">
                  <div className="mt-4 space-y-4">
                    {subChapters.map((chapter) => {
                      const progress = calculateProgress(chapter);
                      return (
                        <div key={chapter.id} className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium text-zinc-900">{chapter.name}</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-zinc-500">{progress}%</span>
                              <div className="w-20 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: `${progress}%` }} />
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            {steps.map((step) => (
                              <button
                                key={step.key}
                                onClick={() => updateChapter(chapter.id, { [step.key]: !chapter[step.key as keyof typeof chapter] })}
                                className={`flex items-center gap-2 p-2 rounded-lg border text-xs transition-all ${
                                  chapter[step.key as keyof typeof chapter]
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                    : 'bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300'
                                }`}
                              >
                                {chapter[step.key as keyof typeof chapter] ? (
                                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                                ) : (
                                  <Circle className="w-4 h-4 shrink-0" />
                                )}
                                <span className="truncate">{step.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    {addingChapterTo === subject.id ? (
                      <div className="flex gap-2 mt-4">
                        <input
                          type="text"
                          autoFocus
                          value={newChapterName}
                          onChange={(e) => setNewChapterName(e.target.value)}
                          placeholder="Chapter Name"
                          className="flex-1 px-4 py-2 bg-white border border-zinc-200 rounded-lg outline-none"
                        />
                        <button onClick={() => handleAddChapter(subject.id)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg">Add</button>
                        <button onClick={() => setAddingChapterTo(null)} className="px-4 py-2 text-zinc-500">Cancel</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingChapterTo(subject.id)}
                        className="w-full py-3 border-2 border-dashed border-zinc-200 rounded-xl text-zinc-400 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 mt-4"
                      >
                        <Plus className="w-4 h-4" />
                        Add Chapter
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

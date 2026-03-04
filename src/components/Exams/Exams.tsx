import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Plus, GraduationCap, Calendar, BookOpen, Target, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Exams() {
  const { exams, subjects, chapters, addExam } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    subject_id: '',
    chapter_id: '',
    total_marks: 100,
    marks_obtained: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addExam(formData);
    setIsAdding(false);
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      subject_id: '',
      chapter_id: '',
      total_marks: 100,
      marks_obtained: 0
    });
  };

  const selectedSubjectChapters = chapters[formData.subject_id] || [];

  const chartData = [...exams].reverse().map(ex => ({
    date: ex.date,
    score: Math.round((ex.marks_obtained / ex.total_marks) * 100)
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Exam Records</h2>
          <p className="text-zinc-500">Log your exam scores and track performance.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Log Exam
        </button>
      </div>

      {exams.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-zinc-900">Performance Trend</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} unit="%" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {isAdding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-6">Log New Exam</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Subject</label>
                <select
                  required
                  value={formData.subject_id}
                  onChange={(e) => setFormData({ ...formData, subject_id: e.target.value, chapter_id: '' })}
                  className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select Subject</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Chapter (Optional)</label>
                <select
                  value={formData.chapter_id}
                  onChange={(e) => setFormData({ ...formData, chapter_id: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select Chapter</option>
                  {selectedSubjectChapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Total Marks</label>
                  <input
                    type="number"
                    required
                    value={formData.total_marks}
                    onChange={(e) => setFormData({ ...formData, total_marks: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Marks Obtained</label>
                  <input
                    type="number"
                    required
                    value={formData.marks_obtained}
                    onChange={(e) => setFormData({ ...formData, marks_obtained: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 py-2 bg-emerald-600 text-white rounded-lg font-semibold">Save Record</button>
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-2 bg-zinc-100 text-zinc-600 rounded-lg font-semibold">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {exams.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-zinc-200 text-center">
            <GraduationCap className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <p className="text-zinc-500">No exams logged yet. Start tracking your performance!</p>
          </div>
        ) : (
          exams.map((exam) => {
            const subject = subjects.find(s => s.id === exam.subject_id);
            const percentage = Math.round((exam.marks_obtained / exam.total_marks) * 100);
            return (
              <div key={exam.id} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg ${
                    percentage >= 80 ? 'bg-emerald-50 text-emerald-600' :
                    percentage >= 60 ? 'bg-blue-50 text-blue-600' :
                    'bg-orange-50 text-orange-600'
                  }`}>
                    {percentage}%
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 text-lg">{subject?.name || 'Unknown Subject'}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-zinc-500">
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {exam.date}</span>
                      <span className="flex items-center gap-1"><Target className="w-4 h-4" /> {exam.marks_obtained} / {exam.total_marks}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    percentage >= 80 ? 'bg-emerald-100 text-emerald-700' :
                    percentage >= 60 ? 'bg-blue-100 text-blue-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {percentage >= 80 ? 'Excellent' : percentage >= 60 ? 'Good' : 'Needs Work'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

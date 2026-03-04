import React from 'react';
import { useStore } from '../../store/useStore';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Cell, PieChart, Pie
} from 'recharts';
import { CheckCircle2, BookOpen, GraduationCap, Clock } from 'lucide-react';

export default function Dashboard() {
  const { user, subjects, chapters, exams, studyHours } = useStore();

  // Calculate stats
  const allChapters = Object.values(chapters).flat();
  const totalChapters = allChapters.length;
  
  const calculateProgress = (ch: any) => {
    const steps = [
      ch.online_class, ch.offline_class, ch.textbook_reading, ch.concept_clear,
      ch.textbook_solve, ch.board_solve, ch.engineering_solve, ch.medical_solve, ch.varsity_solve
    ];
    return (steps.filter(Boolean).length / steps.length) * 100;
  };

  const overallProgress = totalChapters > 0 
    ? allChapters.reduce((acc, ch) => acc + calculateProgress(ch), 0) / totalChapters
    : 0;

  const completedChaptersCount = allChapters.filter(ch => calculateProgress(ch) === 100).length;

  // Admission stats
  const admissionStats = [
    { name: 'HSC', value: overallProgress },
    { name: 'Engineering', value: totalChapters > 0 ? allChapters.reduce((acc, ch) => acc + (ch.engineering_solve ? 100 : 0), 0) / totalChapters : 0 },
    { name: 'Medical', value: totalChapters > 0 ? allChapters.reduce((acc, ch) => acc + (ch.medical_solve ? 100 : 0), 0) / totalChapters : 0 },
    { name: 'Varsity', value: totalChapters > 0 ? allChapters.reduce((acc, ch) => acc + (ch.varsity_solve ? 100 : 0), 0) / totalChapters : 0 },
  ];

  // Subject-wise progress data
  const subjectProgressData = subjects.map(sub => {
    const subChapters = chapters[sub.id] || [];
    const progress = subChapters.length > 0
      ? subChapters.reduce((acc, ch) => acc + calculateProgress(ch), 0) / subChapters.length
      : 0;
    return { name: sub.name, progress: Math.round(progress) };
  });

  // Exam performance data
  const examPerformanceData = exams.slice(0, 10).reverse().map(ex => ({
    name: ex.date,
    score: (ex.marks_obtained / ex.total_marks) * 100
  }));

  // Study hours data (last 7 days)
  const studyData = studyHours.slice(0, 7).reverse().map(s => ({
    date: s.date,
    hours: s.hours
  }));

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-bold text-zinc-900">Welcome back, {user?.full_name || user?.name}!</h2>
        <p className="text-zinc-500">Here's your preparation overview.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Overall Progress', value: `${Math.round(overallProgress)}%`, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Chapters Done', value: `${completedChaptersCount}/${totalChapters}`, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Exams Taken', value: exams.length, icon: GraduationCap, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Total Study Hours', value: studyHours.reduce((acc, s) => acc + s.hours, 0), icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <div className={`${stat.bg} ${stat.color} w-10 h-10 rounded-lg flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-sm text-zinc-500 font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-zinc-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Preparation Progress */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Admission Preparation</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={admissionStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} unit="%" />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {admissionStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#ef4444', '#f59e0b'][index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Progress */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Subject-wise Progress</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectProgressData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="progress" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Exam Performance Trend */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Exam Performance Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={examPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} unit="%" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Study Hours Trend */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Study Hours (Last 7 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} unit="h" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="hours" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

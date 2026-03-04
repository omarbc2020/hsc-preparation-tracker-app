import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Plus, Clock, Calendar, TrendingUp, BarChart as BarChartIcon } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function StudyHours() {
  const { studyHours, addStudyHours } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [hours, setHours] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addStudyHours(date, hours);
    setIsAdding(false);
    setHours(0);
  };

  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const weeklyTotal = studyHours
    .filter(s => isWithinInterval(parseISO(s.date), { start: weekStart, end: weekEnd }))
    .reduce((acc, s) => acc + s.hours, 0);

  const monthlyTotal = studyHours
    .filter(s => isWithinInterval(parseISO(s.date), { start: monthStart, end: monthEnd }))
    .reduce((acc, s) => acc + s.hours, 0);

  const chartData = [...studyHours].reverse().slice(-14).map(s => ({
    date: s.date,
    hours: s.hours
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Study Hours</h2>
          <p className="text-zinc-500">Log your daily study time and stay consistent.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Log Hours
        </button>
      </div>

      {studyHours.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <BarChartIcon className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-zinc-900">Study Trend (Last 14 Days)</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} unit="h" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="hours" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-zinc-900">This Week</h3>
          </div>
          <p className="text-3xl font-bold text-zinc-900">{weeklyTotal} Hours</p>
          <p className="text-sm text-zinc-500 mt-1">Total study time this week</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-50 text-purple-600 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-zinc-900">This Month</h3>
          </div>
          <p className="text-3xl font-bold text-zinc-900">{monthlyTotal} Hours</p>
          <p className="text-sm text-zinc-500 mt-1">Total study time this month</p>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-zinc-700 mb-1">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-zinc-700 mb-1">Hours</label>
            <input
              type="number"
              step="0.5"
              required
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button type="submit" className="flex-1 md:flex-none px-6 py-2 bg-emerald-600 text-white rounded-lg font-semibold">Save</button>
            <button type="button" onClick={() => setIsAdding(false)} className="flex-1 md:flex-none px-6 py-2 text-zinc-500">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-zinc-900">Date</th>
              <th className="px-6 py-4 text-sm font-semibold text-zinc-900 text-right">Hours</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {studyHours.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-6 py-12 text-center text-zinc-500">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  No study hours logged yet.
                </td>
              </tr>
            ) : (
              studyHours.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-zinc-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-zinc-400" />
                    {log.date}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-zinc-900 text-right">{log.hours}h</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

'use client';
import { signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import DTRCalendar from '@/components/DTRCalendar';

export default function InternDashboard({ user }: any) {
  const [status, setStatus] = useState('out');
  const [logs, setLogs] = useState<any[]>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const fetchLogs = async () => {
    try {
      const res = await axios.get('/api/logs');
      setLogs(res.data.logs);
      setTotalHours(res.data.totalHours);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const openLog = res.data.logs.find((log: any) => {
        const logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === today.getTime() &&!log.timeOut;
      });
      setStatus(openLog? 'in' : 'out');
    } catch (e) {
      console.log('Failed to fetch logs', e);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleTimeIn = async () => {
    setLoading(true);
    try {
      await axios.post('/api/timein');
      setStatus('in');
      setMsg('Timed in successfully');
      await fetchLogs();
      setTimeout(() => setMsg(''), 3000);
    } catch (e: any) {
      setMsg(e.response?.data?.error || 'Time in failed');
    }
    setLoading(false);
  };

  const handleTimeOut = async () => {
    setLoading(true);
    try {
      await axios.post('/api/timeout');
      setStatus('out');
      setMsg('Timed out successfully');
      await fetchLogs();
      setTimeout(() => setMsg(''), 3000);
    } catch (e: any) {
      setMsg(e.response?.data?.error || 'Time out failed');
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this log? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await axios.delete(`/api/logs/${id}`);
      setMsg('Log deleted');
      await fetchLogs();
      setTimeout(() => setMsg(''), 3000);
    } catch (e: any) {
      setMsg(e.response?.data?.error || 'Delete failed');
    }
    setDeletingId('');
  };

  // Convert logs to calendar format
const calendarData = logs.map((log: any) => ({
  date: new Date(log.date).toISOString().split('T')[0],
  status: log.status === 'rejected'
   ? 'absent' as const
    : log.isLate
   ? 'late' as const
    : 'present' as const,
  timeIn: log.timeIn,
  timeOut: log.timeOut,
  hours: log.hours,
}));

  const selectedLog = selectedDate
   ? logs.find((log: any) => {
        const logDate = new Date(log.date).toISOString().split('T')[0];
        const selected = selectedDate.toISOString().split('T')[0];
        return logDate === selected;
      })
    : null;

  const completion = (totalHours / user.requiredHours) * 100;

  return (
    <main className="p-8 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Intern Dashboard</h1>
          <p className="text-gray-600 mt-1">{user.name} • {user.company}</p>
        </div>
        <button
          onClick={() => signOut()}
          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
        >
          Logout
        </button>
      </div>

      {msg && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
          {msg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Hours</p>
          <p className="text-4xl font-bold text-gray-900">{totalHours.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">of {user.requiredHours} required</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${Math.min(completion, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">{completion.toFixed(1)}% Complete</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <p className="text-sm font-medium text-gray-500 mb-1">Current Status</p>
          <div className="flex items-center gap-3 mt-2">
            <div
              className={`w-3 h-3 rounded-full animate-pulse ${
                status === 'in'? 'bg-green-500' : 'bg-gray-400'
              }`}
            />
            <p className="text-3xl font-bold text-gray-900">
              {status === 'in'? 'Timed In' : 'Timed Out'}
            </p>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {status === 'in'? 'You are currently clocked in' : 'Clock in to start tracking'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
        <div className="flex gap-3">
          <button
            onClick={handleTimeIn}
            disabled={status === 'in' || loading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed active:scale-95 disabled:active:scale-100"
          >
            {loading && status === 'out'? 'Processing...' : 'Time In'}
          </button>
          <button
            onClick={handleTimeOut}
            disabled={status === 'out' || loading}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-6 py-4 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed active:scale-95 disabled:active:scale-100"
          >
            {loading && status === 'in'? 'Processing...' : 'Time Out'}
          </button>
        </div>
      </div>

      {/* Calendar View */}
      <div className="mb-6">
        <DTRCalendar dtrData={calendarData} onDateClick={setSelectedDate} />
      </div>

      {/* Selected Date Details */}
      {selectedLog && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <h3 className="font-bold text-blue-900 mb-2">
            Details for {new Date(selectedLog.date).toLocaleDateString()}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-blue-600">Time In</p>
              <p className="font-semibold text-blue-900">
                {new Date(selectedLog.timeIn).toLocaleTimeString()}
              </p>
            </div>
            <div>
              <p className="text-blue-600">Time Out</p>
              <p className="font-semibold text-blue-900">
                {selectedLog.timeOut
                 ? new Date(selectedLog.timeOut).toLocaleTimeString()
                  : 'Still In'}
              </p>
            </div>
            <div>
              <p className="text-blue-600">Hours</p>
              <p className="font-semibold text-blue-900">{selectedLog.hours?.toFixed(2) || '-'}</p>
            </div>
            <div>
              <p className="text-blue-600">Status</p>
              <p className="font-semibold text-blue-900 capitalize">{selectedLog.status}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Recent Logs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Time In</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Time Out</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Hours</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Approval</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.map((log: any) => (
                <tr
                  key={log._id}
                  className={`transition-colors duration-200 ${
                    log.status === 'approved'
                     ? 'bg-green-50/50'
                      : log.status === 'rejected'
                     ? 'bg-red-50/50'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="px-4 py-3 text-gray-900">
                    {new Date(log.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {new Date(log.timeIn).toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {log.timeOut? new Date(log.timeOut).toLocaleTimeString() : '-'}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {log.hours?.toFixed(2) || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        log.isLate
                         ? 'bg-orange-100 text-orange-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {log.isLate? 'Late' : 'On Time'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                        log.status === 'approved'
                         ? 'bg-green-100 text-green-700'
                          : log.status === 'rejected'
                         ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {log.status || 'pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(log._id)}
                      disabled={deletingId === log._id}
                      className="text-red-600 hover:text-red-700 font-medium text-sm transition-colors duration-200 disabled:opacity-50"
                    >
                      {deletingId === log._id? '...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {logs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No logs yet. Clock in to start tracking your hours
          </div>
        )}
      </div>
    </main>
  );
}
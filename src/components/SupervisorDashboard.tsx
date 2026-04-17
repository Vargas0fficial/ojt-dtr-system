'use client';
import { signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function SupervisorDashboard({ user }: any) {
  const [interns, setInterns] = useState([]);
  const [selectedIntern, setSelectedIntern] = useState('');
  const [logs, setLogs] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [msg, setMsg] = useState('');
  const [editHours, setEditHours] = useState(0);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState('');

  useEffect(() => {
    fetchInterns();
  }, []);

  useEffect(() => {
    if (selectedIntern) {
      fetchLogs(selectedIntern);
      const intern = interns.find((i: any) => i._id === selectedIntern) as any;
      if (intern) setEditHours(intern.requiredHours);
    }
  }, [selectedIntern, interns]);

  const fetchInterns = async () => {
    setLoading(true);
    const res = await axios.get('/api/supervisor/interns');
    setInterns(res.data.interns);
    if (res.data.interns.length > 0 &&!selectedIntern) {
      setSelectedIntern(res.data.interns[0]._id);
    }
    setLoading(false);
  };

  const fetchLogs = async (internId: string) => {
    const res = await axios.get(`/api/supervisor/logs/${internId}`);
    setLogs(res.data.logs);
    setTotalHours(res.data.totalHours);
  };

  const handleStatus = async (logId: string, status: 'approved' | 'rejected') => {
    setUpdatingId(logId);
    try {
      await axios.patch(`/api/supervisor/logs/${logId}`, { status });
      setMsg(`Log ${status}`);
      await fetchLogs(selectedIntern);
      setTimeout(() => setMsg(''), 3000);
    } catch (e: any) {
      setMsg(e.response?.data?.error || 'Update failed');
    }
    setUpdatingId('');
  };

  const handleUpdateHours = async () => {
    setLoading(true);
    try {
      await axios.patch(`/api/supervisor/interns/${selectedIntern}`, {
        requiredHours: editHours
      });
      setMsg('Required hours updated');
      await fetchInterns();
      setTimeout(() => setMsg(''), 3000);
    } catch (e: any) {
      setMsg(e.response?.data?.error || 'Update failed');
    }
    setLoading(false);
  };

  const handleExport = () => {
    const selectedInternData = interns.find((i: any) => i._id === selectedIntern) as any;
    const headers = ['Date', 'Time In', 'Time Out', 'Hours', 'Status', 'Approval'];
    const rows = logs.map((log: any) => [
      new Date(log.date).toLocaleDateString(),
      new Date(log.timeIn).toLocaleTimeString(),
      log.timeOut? new Date(log.timeOut).toLocaleTimeString() : '',
      log.hours?.toFixed(2) || '0',
      log.isLate? 'Late' : 'On Time',
      log.status || 'pending'
    ]);

    const csv = [headers,...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DTR_${selectedInternData?.name}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const selectedInternData = interns.find((i: any) => i._id === selectedIntern) as any;
  const completion = selectedInternData? (totalHours / selectedInternData.requiredHours) * 100 : 0;

  return (
    <main className="p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Supervisor Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user.name}</p>
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

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Intern</label>
            <select
              value={selectedIntern}
              onChange={(e) => setSelectedIntern(e.target.value)}
              disabled={loading}
              className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100"
            >
              {interns.map((intern: any) => (
                <option key={intern._id} value={intern._id}>
                  {intern.name} - {intern.company}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleExport}
            disabled={logs.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed active:scale-95"
          >
            Export CSV
          </button>
        </div>
      </div>

      {selectedInternData && (
        <>
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Required Hours for {selectedInternData.name}
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="number"
                value={editHours}
                onChange={(e) => setEditHours(Number(e.target.value))}
                className="border border-gray-300 p-2.5 rounded-lg w-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                min="1"
              />
              <button
                onClick={handleUpdateHours}
                disabled={loading}
                className="bg-gray-800 hover:bg-gray-900 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:bg-gray-400 active:scale-95"
              >
                {loading? 'Updating...' : 'Update Hours'}
              </button>
              <span className="text-sm text-gray-500 ml-2">
                Common: 240, 300, 486, 600 hours
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <p className="text-sm font-medium text-gray-500 mb-1">Total Hours</p>
              <p className="text-3xl font-bold text-gray-900">{totalHours.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">of {selectedInternData.requiredHours}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <p className="text-sm font-medium text-gray-500 mb-1">Completion</p>
              <p className="text-3xl font-bold text-gray-900">{completion.toFixed(1)}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(completion, 100)}%` }}
                />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <p className="text-sm font-medium text-gray-500 mb-1">Late Count</p>
              <p className="text-3xl font-bold text-orange-600">{logs.filter((l: any) => l.isLate).length}</p>
              <p className="text-sm text-gray-500 mt-1">instances</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <p className="text-sm font-medium text-gray-500 mb-1">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{logs.filter((l: any) => l.status === 'pending').length}</p>
              <p className="text-sm text-gray-500 mt-1">needs review</p>
            </div>
          </div>
        </>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">DTR Logs</h2>
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
                    log.status === 'approved'? 'bg-green-50/50' :
                    log.status === 'rejected'? 'bg-red-50/50' :
                    'hover:bg-gray-50'
                  }`}
                >
                  <td className="px-4 py-3 text-gray-900">{new Date(log.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-gray-900">{new Date(log.timeIn).toLocaleTimeString()}</td>
                  <td className="px-4 py-3 text-gray-900">{log.timeOut? new Date(log.timeOut).toLocaleTimeString() : '-'}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{log.hours?.toFixed(2) || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      log.isLate? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {log.isLate? 'Late' : 'On Time'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                      log.status === 'approved'? 'bg-green-100 text-green-700' :
                      log.status === 'rejected'? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {log.status || 'pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {log.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatus(log._id, 'approved')}
                          disabled={updatingId === log._id}
                          className="text-green-600 hover:text-green-700 font-medium text-sm transition-colors duration-200 disabled:opacity-50"
                        >
                          {updatingId === log._id? '...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleStatus(log._id, 'rejected')}
                          disabled={updatingId === log._id}
                          className="text-red-600 hover:text-red-700 font-medium text-sm transition-colors duration-200 disabled:opacity-50"
                        >
                          {updatingId === log._id? '...' : 'Reject'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {logs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No logs yet for this intern
          </div>
        )}
      </div>
    </main>
  );
}
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client'

const socket = io(process.env.REACT_APP_SERVER_URL);

const Dashboard = () => {
  // --- MODEL (State Management) ---
  const [errors, setErrors] = useState([]);
  const [stats, setStats] = useState({ critical: 0, medium: 0, low: 0 });
  const [filter, setFilter] = useState('all');

  // --- CONTROLLER (Logic & Data Fetching) ---
  useEffect(() => {
    socket.on('new_error', (data) => {
      console.log("data", data)
      // add the new error to the top of the list
      setErrors((prev) => [data, ...prev]);

      // update the stats
      setStats((prev) => ({
        critical: data.severity === 'CRITICAL' ? prev.critical + 1 : prev.critical,
        medium: data.severity === 'MEDIUM' ? prev.medium + 1 : prev.medium,
        low: data.severity === 'LOW' ? prev.low + 1 : prev.low,
      }))
    })

    return () => socket.off('new_error')
  }, []);

  const filteredLogs = errors.filter(log => 
    filter === 'all' ? true : log.severity.toLowerCase() === filter
  );

  // --- VIEW (UI Rendering) ---
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8 font-sans">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Monitor</h1>
          <p className="text-gray-400 mt-1">Real-time log aggregation and error tracking</p>
        </div>
        <div className="flex gap-2">
          {['all', 'critical', 'medium', 'low'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilter(lvl)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                filter === lvl 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {lvl.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid (Model Representation) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
          <p className="text-sm text-gray-400 font-medium">Total Errors</p>
          <p className="text-3xl font-bold mt-2 font-mono text-indigo-400">{stats.total}</p>
        </div> */}
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
          <p className="text-sm text-gray-400 font-medium">Critical</p>
          <p className="text-3xl font-bold mt-2 font-mono text-red-500">{stats.critical}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
          <p className="text-sm text-gray-400 font-medium">Medium</p>
          <p className="text-3xl font-bold mt-2 font-mono text-orange-500">{stats.medium}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
          <p className="text-sm text-gray-400 font-medium">Low</p>
          <p className="text-3xl font-bold mt-2 font-mono text-yellow-500">{stats.low}</p>
        </div>
      </div>

      {/* Log Table (The View) */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-800/50 text-gray-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Severity</th>
                <th className="px-6 py-4 font-semibold">Endpoint</th>
                <th className="px-6 py-4 font-semibold">Message</th>
                <th className="px-6 py-4 font-semibold">Location</th>
                <th className="px-6 py-4 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-gray-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        log.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-500' :
                        log.severity === 'MEDIUM' ? 'bg-orange-500/10 text-orange-500' :
                        log.severity === 'LOW' ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-blue-500/10 text-blue-500'
                      }`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-gray-300">
                      {log.endpoint}
                    </td>
                    <td className="px-6 py-4 text-gray-300 text-sm italic">
                      {log.message}
                    </td>
                    <td className="px-6 py-4 text-gray-300 text-sm italic">
                      {log.location}
                    </td>
                    <td className="px-6 py-4 text-gray-300 text-xs font-mono">
                      {log.error_time}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center text-gray-600 italic">
                    Waiting for incoming logs...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
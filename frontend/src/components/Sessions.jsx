import { useState, useEffect } from 'react';
import { fetchSessions, actionSession } from '../services/api';

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [modal, setModal] = useState({ isOpen: false, type: '', pid: null });

  const loadData = async () => {
    try {
      const data = await fetchSessions();
      setSessions(data || []);
    } catch (e) { console.error("Session fetch error:", e); }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const confirmAction = async () => {
    try {
      await actionSession(modal.type, modal.pid);
      setModal({ isOpen: false, type: '', pid: null });
      loadData();
    } catch (e) { 
      alert('Error: ' + e.message); 
      setModal({ isOpen: false, type: '', pid: null });
    }
  };

  return (
    <div className="glass-panel p-8 flex flex-col h-full animate-fade-in relative">
      <h2 className="text-2xl font-medium mb-8 text-[#f0f6fc] tracking-wide">Active Connections</h2>
      
      {/* CUSTOM CONFIRMATION MODAL INSTEAD OF WINDOW.CONFIRM */}
      {modal.isOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-[24px]">
          <div className="bg-[#15161c] border border-white/10 p-8 rounded-2xl shadow-2xl w-96 transform transition-all">
            <h3 className="text-xl font-bold text-white mb-2 uppercase text-rose-500">Confirm Action</h3>
            <p className="text-[#8b949e] mb-6">Are you sure you want to <strong>{modal.type}</strong> session with PID <strong className="text-white">{modal.pid}</strong>?</p>
            <div className="flex justify-end gap-4">
              <button onClick={() => setModal({ isOpen: false, type: '', pid: null })} className="px-4 py-2 rounded bg-white/5 hover:bg-white/10 text-white font-medium transition-colors">Abort</button>
              <button onClick={confirmAction} className="px-4 py-2 rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white font-bold transition-colors uppercase">Proceed</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto pr-4 scrollbar-thin">
        <table className="pg-table">
          <thead>
            <tr>
              <th>PID</th><th>User</th><th>Database</th><th>State</th><th>Wait Event</th><th>Query</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 ? <tr><td colSpan="7" className="text-center text-[#8b949e]">No active sessions</td></tr> : null}
            {sessions.map(s => {
              const isActive = s.state?.includes('active');
              return (
                <tr key={s.pid} className="group">
                  <td className="text-[#8b949e] font-mono">{s.pid}</td>
                  <td className="font-medium">{s.usename} {s.is_blocking && <span className="ml-2 text-red-500 animate-pulse">⚠️</span>}</td>
                  <td className="text-[#8b949e]">{s.datname}</td>
                  <td>
                    <span className={`px-2.5 py-1 rounded-md text-[13px] font-medium border uppercase tracking-wider ${
                      isActive
                        ? 'bg-pg-accent/10 border-pg-accent/30 text-pg-accent shadow-[0_0_10px_rgba(227,179,65,0.1)]'
                        : 'bg-white/5 border-white/10 text-[#8b949e]'
                    }`}>
                      {s.state}
                    </span>
                  </td>
                  <td className="text-sm">{s.wait_event || '-'}</td>
                  <td className="max-w-[250px] truncate font-mono text-[13px] text-[#8b949e] group-hover:text-[#f0f6fc] transition-colors" title={s.query}>
                    {s.query}
                  </td>
                  <td>
                    <button
                      onClick={() => setModal({ isOpen: true, type: 'cancel', pid: s.pid })}
                      className="px-4 py-1.5 rounded-lg border border-white/10 text-sm font-medium hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/10 transition-all active:scale-95"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

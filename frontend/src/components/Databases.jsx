import { useState, useEffect } from 'react';
import { fetchDatabases } from '../services/api';

export default function Databases() {
  const [dbs, setDbs] = useState([]);

  useEffect(() => {
    const load = async () => {
      try { const data = await fetchDatabases(); setDbs(data || []); } 
      catch (e) { console.error(e); }
    };
    load();
    const int = setInterval(load, 5000);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="glass-panel p-8 flex flex-col h-full animate-fade-in">
      <h2 className="text-2xl font-medium mb-8 text-[#f0f6fc] tracking-wide">Databases Overview</h2>
      <div className="flex-1 overflow-auto pr-4">
        <table className="pg-table">
          <thead><tr><th>Name</th><th>Owner</th><th>Size</th><th>Usage (Connections)</th></tr></thead>
          <tbody>
            {dbs.map((db, i) => {
              // Tushunarsiz ∞ o'rniga aniq so'zlar
              const limitStr = db.conn_limit <= 0 ? 'Unlimited' : db.conn_limit;
              const pct = db.conn_limit <= 0 ? 0 : Math.min((db.active_connections / db.conn_limit) * 100, 100);
              let barColor = 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]';
              if (pct > 70) barColor = 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]';
              if (pct > 90) barColor = 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]';

              return (
                <tr key={i} className="group">
                  <td className="font-medium text-sky-400 tracking-wide">{db.datname || db.db_name || '-'}</td>
                  <td className="text-[#8b949e]">{db.owner}</td>
                  <td>
                    <span className="bg-white/5 border border-white/10 text-[#f0f6fc] px-3 py-1 rounded-md text-sm tracking-wider">
                      {db.size_pretty}
                    </span>
                  </td>
                  <td className="w-[35%]">
                    {/* Yangi UX dizayn */}
                    <div className="flex flex-col gap-2 mt-1">
                      <div className="flex justify-between items-center text-[13px] font-medium text-[#8b949e]">
                        <span><strong className="text-[#f0f6fc] text-[16px] mr-1">{db.active_connections}</strong> active</span>
                        <span className="bg-white/5 px-2 py-0.5 rounded text-xs border border-white/5">Max: {limitStr}</span>
                      </div>
                      <div className="w-full h-2 bg-[#08090a] rounded-full overflow-hidden border border-white/5 shadow-inner">
                        <div className={`h-full ${barColor} transition-all duration-500 ease-out`} style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
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

import { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';

export default function Bloat() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/bloat')
      .then(res => res.json())
      .then(data => {
        setStats(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("API Error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10 text-pg-accent animate-pulse font-bold text-xl">Scanning tables for bloat...</div>;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Database Maintenance & Bloat</h2>
          <p className="text-[#4a4b53] mt-1 italic text-sm">Top 10 tables sorted by dead tuples (Unified View) <ShieldAlert size={14} className="inline ml-1" /></p>
        </div>
      </div>

      {/* BITTA YAGONA VA MUKAMMAL JADVAL */}
      <div className="luxury-card !p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="text-[#8b949e] font-bold text-[11px] uppercase tracking-widest border-b border-white/[0.05] bg-white/[0.01]">
              <th className="p-5">Relation Name</th>
              <th className="p-5 text-right">Size (MB)</th>
              <th className="p-5 text-right text-rose-400">Dead Tuples</th>
              <th className="p-5 text-center">Bloat %</th>
              <th className="p-5 text-center">Vacuums<br/><span className="text-[9px] text-[#4a4b53]">(Auto / Manual)</span></th>
              <th className="p-5 text-center">Analyzes</th>
              <th className="p-5">Last Auto-Vac</th>
              <th className="p-5">Last Manual-Vac</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.02]">
            {stats.map((table, i) => (
              <tr key={i} className="hover:bg-white/[0.03] transition-colors">
                
                {/* 1. Jadval nomi */}
                <td className="p-5 font-mono text-pg-accent font-bold text-sm">{table.table_name}</td>
                
                {/* 2. Hajmi */}
                <td className="p-5 text-right font-mono font-bold text-white/90">{table.table_size_mb}</td>
                
                {/* 3. O'lik qatorlar */}
                <td className="p-5 text-right font-mono font-bold text-rose-400">{table.dead_tuples.toLocaleString()}</td>
                
                {/* 4. Bloat foizi */}
                <td className="p-5">
                  <div className="flex items-center justify-center gap-2">
                    <span className={`w-8 text-right font-bold text-xs ${(table.bloat_percent || 0) > 25 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {Math.round(table.bloat_percent || 0)}%
                    </span>
                    <div className="w-12 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${(table.bloat_percent || 0) > 25 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min((table.bloat_percent || 0), 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                
                {/* 5. Vacuum Sanoqlari (Auto va Manual bittada) */}
                <td className="p-5 text-center font-mono font-bold text-sm">
                  <span className="text-pg-accent">{table.autovacuum_count}</span>
                  <span className="text-[#4a4b53] mx-1">/</span>
                  <span className="text-emerald-400">{table.vacuum_count}</span>
                </td>
                
                {/* 6. Analyze sanoqlari */}
                <td className="p-5 text-center font-mono font-bold text-blue-400">{table.analyze_count}</td>
                
                {/* 7. Oxirgi Auto Vacuum vaqti */}
                <td className="p-5 text-xs text-[#8b949e]">
                  {table.last_autovacuum === 'Never' ? <span className="italic opacity-30">Never</span> : table.last_autovacuum.substring(0, 19)}
                </td>
                
                {/* 8. Oxirgi Manual Vacuum vaqti */}
                <td className="p-5 text-xs text-[#8b949e]">
                  {table.last_vacuum === 'Never' ? <span className="italic opacity-30">Never</span> : table.last_vacuum.substring(0, 19)}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

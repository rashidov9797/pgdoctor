import { useState, useEffect } from 'react';
import { Timer, AlertTriangle } from 'lucide-react';

export default function SlowQueries() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/queries/slow')
      .then(res => res.json())
      .then(data => {
        setQueries(data || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10 text-pg-accent font-bold animate-pulse">Scanning pg_stat_statements...</div>;

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Top 10 Slow Queries</h2>
          <p className="text-[var(--pg-muted)] mt-1 italic text-sm">Based on Mean Execution Time <Timer size={14} className="inline ml-1 mb-0.5" /></p>
        </div>
      </div>
      
      <div className="luxury-card !p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[var(--pg-muted)] font-bold text-[11px] uppercase tracking-widest border-b border-[var(--pg-border)] bg-[var(--pg-hover)]">
              <th className="p-5">User</th>
              <th className="p-5 text-right">Executions</th>
              <th className="p-5 text-right text-rose-500">Mean Time (ms)</th>
              <th className="p-5 text-right">Total Time (ms)</th>
              <th className="p-5 text-center">I/O Blks Read</th>
              <th className="p-5">Query Snippet</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--pg-border)]">
            {queries.map((q, i) => (
              <tr key={i} className="hover:bg-[var(--pg-hover)] transition-colors">
                <td className="p-5 font-bold text-[var(--pg-text)]">{q.username}</td>
                <td className="p-5 text-right font-mono text-[var(--pg-muted)]">{q.calls.toLocaleString()}</td>
                <td className="p-5 text-right font-mono text-rose-500 font-bold">
                  {q.mean_exec_time > 1000 ? <AlertTriangle size={12} className="inline mr-1 text-rose-500" /> : null}
                  {q.mean_exec_time.toFixed(2)}
                </td>
                <td className="p-5 text-right font-mono text-[var(--pg-muted)]">{q.total_exec_time.toFixed(2)}</td>
                <td className="p-5 text-center font-mono text-amber-500">{q.shared_blks_read}</td>
                <td className="p-5 font-mono text-xs max-w-xl truncate text-[var(--pg-text)]" title={q.query}>
                  {q.query}
                </td>
              </tr>
            ))}
            {queries.length === 0 && (
              <tr><td colSpan="6" className="p-10 text-center text-[var(--pg-muted)]">No slow queries found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

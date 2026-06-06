import { useState, useEffect, useRef } from 'react';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const scrollRef = useRef(null);

  // Rangli loglar uchun formatter
  const formatLog = (line) => {
    if (line.includes('ERROR')) return <span className="text-red-400">{line}</span>;
    if (line.includes('WARNING')) return <span className="text-orange-400">{line}</span>;
    if (line.includes('LOG') || line.includes('INFO')) return <span className="text-emerald-400">{line}</span>;
    return <span className="text-[#8b949e]">{line}</span>;
  };

  useEffect(() => {
    // WebSocket ulanishi (Hali backendda ochmadik, lekin frontni tayyorlab qo'yamiz)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/api/ws/logs`);

    ws.onmessage = (event) => {
      setLogs((prev) => [...prev.slice(-100), event.data]); // Oxirgi 100 ta qatorni saqlaymiz
    };

    return () => ws.close();
  }, []);

  // Har doim pastga avtomatik tushish
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="glass-panel flex flex-col h-full overflow-hidden animate-fade-in border-none shadow-2xl bg-black/40">
      <div className="px-8 py-6 border-b border-white/[0.03] flex justify-between items-center bg-white/[0.01]">
        <div>
          <h2 className="text-2xl font-medium text-[#f0f6fc] tracking-wide">PostgreSQL Logs</h2>
          <p className="text-[#8b949e] text-sm mt-1">Real-time stream from server log file</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
          <span className="text-xs uppercase tracking-widest text-emerald-500 font-bold">Live Stream</span>
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 p-8 font-mono text-[14px] leading-relaxed overflow-y-auto bg-black/20"
        style={{ scrollBehavior: 'smooth' }}
      >
        {logs.length === 0 ? (
          <div className="text-[#30363d] italic">Waiting for logs... (Backend WebSocket connection needed)</div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="mb-1 border-l-2 border-transparent hover:border-white/10 pl-4 transition-colors">
              <span className="text-[#30363d] mr-4 select-none">{i + 1}</span>
              {formatLog(log)}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

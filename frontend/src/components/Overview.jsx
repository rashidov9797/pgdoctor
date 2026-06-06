import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchSessions } from '../services/api';

export default function Overview() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({ active: 0, total: 0 });
  const [sysMetrics, setSysMetrics] = useState({ cpu: '0.0', ram: '0.0' });
  const [timeRange, setTimeRange] = useState('realtime');

  const ranges = [
    { id: 'realtime', label: 'Real-time' },
    { id: '5m', label: '5 Min' },
    { id: '15m', label: '15 Min' },
    { id: '1h', label: '1 Hour' }
  ];

  const formatTime = (ts) => {
    // Koreyscha yoki boshqa tillar chiqib qolmasligi uchun qat'iy "en-GB" (24 soatlik) format
    return new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sysRes = await fetch('/api/system/metrics');
        if (sysRes.ok) {
          const sysData = await sysRes.json();
          setSysMetrics({ cpu: sysData.cpu, ram: sysData.ram });
        }

        if (timeRange === 'realtime') {
          const sessions = await fetchSessions();
          const active = sessions.filter(s => s.state === 'active').length;
          const total = sessions.length;

          setStats({ active, total });

          const now = Date.now();
          setData(prev => {
            let updated = [...prev, { time: now, timeStr: formatTime(now), active }];
            return updated.slice(-30);
          });
        } else {
          const mins = timeRange === '5m' ? 5 : timeRange === '15m' ? 15 : 60;
          const res = await fetch(`/api/history?minutes=${mins}`);
          if (res.ok) {
            let hist = await res.json();
            if (hist && hist.length > 0) {
              const formatted = hist.map(h => ({ ...h, timeStr: formatTime(h.time) }));
              setData(formatted);
              const last = formatted[formatted.length - 1];
              setStats({ active: last.active, total: last.total });
            }
          }
        }
      } catch (e) { console.error(e); }
    };

    fetchData();
    const interval = setInterval(fetchData, timeRange === 'realtime' ? 3000 : 5000);
    return () => clearInterval(interval);
  }, [timeRange]);

  return (
    <div className="flex flex-col gap-10">
      {/* TEPADAGI 3 TA KARTA */}
      <div className="grid grid-cols-3 gap-8">
        <div className="luxury-card flex flex-col justify-between">
          <span className="text-[var(--pg-muted)] font-bold text-[12px] tracking-[0.15em] uppercase mb-4">CPU Usage</span>
          <div className="flex items-end justify-between gap-4">
            <span className="text-5xl font-bold tracking-tight text-[var(--pg-text)]">{sysMetrics.cpu}%</span>
            <span className="status-badge mb-1">Live</span>
          </div>
        </div>
        
        <div className="luxury-card flex flex-col justify-between">
          <span className="text-[var(--pg-muted)] font-bold text-[12px] tracking-[0.15em] uppercase mb-4">RAM Usage</span>
          <div className="flex items-end justify-between gap-4">
            <span className="text-4xl font-bold tracking-tight text-[var(--pg-text)]">{sysMetrics.ram}</span>
            <span className="status-badge !text-emerald-400 mb-1">Live</span>
          </div>
        </div>
        
        {/* SYSTEM ACTIVITY KARTASI - DIZAYN TO'G'RILANDI */}
        <div className="luxury-card flex flex-col justify-between">
          <span className="text-[var(--pg-muted)] font-bold text-[12px] tracking-[0.15em] uppercase mb-4">System Activity</span>
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
               <span className="text-6xl font-black tracking-tighter font-mono text-pg-accent leading-none drop-shadow-md">{stats.active}</span>
               <span className="text-sm font-semibold text-[var(--pg-muted)] mt-2 uppercase tracking-wider">Active Queries</span>
            </div>
            <div className="flex flex-col items-end border-l border-[var(--pg-border)] pl-6">
               <span className="text-3xl font-bold tracking-tight font-mono text-[var(--pg-text)] opacity-90">{stats.total}</span>
               <span className="text-[11px] font-bold text-[var(--pg-muted)] mt-1 uppercase tracking-wider">Total Conns</span>
            </div>
          </div>
        </div>
      </div>

      {/* GRAFIK QISMI */}
      <div className="luxury-card h-[550px] relative flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold tracking-tight text-[var(--pg-text)]">Active Session History</h3>
          <div className="flex bg-[var(--pg-hover)] p-1.5 rounded-xl border border-[var(--pg-border)] shadow-inner">
            {ranges.map((r) => (
              <button key={r.id} onClick={() => { setData([]); setTimeRange(r.id); }}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                  timeRange === r.id ? 'bg-pg-accent text-[var(--pg-bg)] shadow-md' : 'text-[var(--pg-muted)] hover:text-[var(--pg-text)]'
                }`}
              >{r.label}</button>
            ))}
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height="100%">
          {/* MARGIN qo'shildi, raqamlar kesilib qolmasligi uchun */}
          <AreaChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e3b341" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#e3b341" stopOpacity={0.01}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--pg-border)" />
            
            {/* X-AXIS: Vaqtlar kattalashtirildi va rangi ochartirildi */}
            <XAxis 
              dataKey="timeStr" 
              minTickGap={40} 
              tick={{fill: '#8b949e', fontSize: 13, fontWeight: 500, dy: 15}} 
              axisLine={false} 
              tickLine={false} 
            />
            
            {/* Y-AXIS: Raqamlar kattalashtirildi va qalinlashtirildi */}
            <YAxis 
              domain={[0, 'auto']} 
              allowDecimals={false} 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#8b949e', fontSize: 14, fontWeight: 700, dx: -10}} 
              width={50}
            />
            
            <Tooltip 
              cursor={{ stroke: 'rgba(227,179,65,0.4)', strokeWidth: 2, strokeDasharray: '4 4' }} 
              contentStyle={{ backgroundColor: 'var(--pg-panel)', border: '1px solid var(--pg-border)', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)', color: 'var(--pg-text)' }}
              itemStyle={{ color: '#e3b341', fontWeight: 'bold' }}
            />
            <Area type="monotone" dataKey="active" stroke="#e3b341" strokeWidth={4} fill="url(#areaGradient)" activeDot={{ r: 6, fill: '#e3b341', stroke: 'var(--pg-bg)', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

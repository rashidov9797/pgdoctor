// Centralized service managing all backend API interactions for pgdoctor

const getHeaders = () => {
    const headers = {};
    // Automatically fetches the API key if stored in localStorage or Vite environment variables
    const apiKey = localStorage.getItem('PGDOCTOR_API_KEY') || import.meta.env.VITE_API_KEY || '';
    if (apiKey) {
        headers['X-API-Key'] = apiKey;
    }
    return headers;
};

export async function fetchSessions() {
    const res = await fetch('/api/sessions', { headers: getHeaders() });
    if (!res.ok) throw new Error(`Failed to fetch sessions (Status: ${res.status})`);
    return res.json();
}

export async function fetchDatabases() {
    const res = await fetch('/api/databases', { headers: getHeaders() });
    if (!res.ok) throw new Error(`Failed to fetch databases (Status: ${res.status})`);
    return res.json();
}

export async function fetchBloat() {
    const res = await fetch('/api/bloat', { headers: getHeaders() });
    if (!res.ok) throw new Error(`Failed to fetch bloat statistics (Status: ${res.status})`);
    return res.json();
}

export async function fetchAshWaits() {
    const res = await fetch('/api/ash/waits?range=15 minutes', { headers: getHeaders() });
    if (!res.ok) return [];
    return res.json();
}

export async function fetchAshQueries() {
    const res = await fetch('/api/ash/queries', { headers: getHeaders() });
    if (!res.ok) return [];
    return res.json();
}

export async function actionSession(type, pid) {
    const res = await fetch(`/api/sessions/${pid}/${type}`, { 
        method: 'POST', 
        headers: getHeaders() 
    });
    if (!res.ok) throw new Error(`Process management failed (Status: ${res.status})`);
    return true;
}

// Barcha backend so'rovlarini shu yerda markazlashgan holda boshqaramiz

export async function fetchSessions() {
    const res = await fetch('/api/sessions');
    if (!res.ok) throw new Error('Sessions yuklashda xatolik');
    return res.json();
}

export async function fetchDatabases() {
    const res = await fetch('/api/databases');
    if (!res.ok) throw new Error('Databases yuklashda xatolik');
    return res.json();
}

export async function fetchBloat() {
    const res = await fetch('/api/bloat');
    if (!res.ok) throw new Error('Bloat yuklashda xatolik');
    return res.json();
}

export async function fetchAshWaits() {
    const res = await fetch('/api/ash/waits?range=15 minutes');
    if (!res.ok) return [];
    return res.json();
}

export async function fetchAshQueries() {
    const res = await fetch('/api/ash/queries');
    if (!res.ok) return [];
    return res.json();
}

export async function actionSession(type, pid) {
    const res = await fetch(`/api/sessions/${pid}/${type}`, { method: 'POST' });
    if (!res.ok) throw new Error('Jarayonni boshqarishda xatolik');
    return true;
}

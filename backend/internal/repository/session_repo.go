package repository

import (
"context"
"log/slog"

"github.com/jackc/pgx/v5/pgxpool"
"pgdoctor/internal/models"
)

type SessionRepo struct {
Pool *pgxpool.Pool
}

func (r *SessionRepo) GetSessions(ctx context.Context) ([]models.Session, error) {
// SQL dagi murakkab tiplarni text ga aylantiramiz (CAST)
query := `
SELECT 
pid, 
COALESCE(usename, ''), 
COALESCE(datname, ''), 
CAST(client_addr AS text), 
application_name, 
state, 
query, 
wait_event_type, 
wait_event, 
query_start,
COALESCE(CAST(now() - query_start AS text), '0s') as duration,
EXISTS (SELECT 1 FROM pg_locks l1 WHERE l1.pid = p.pid AND l1.granted = false) as is_blocking
FROM pg_stat_activity p
WHERE state IS NOT NULL AND pid <> pg_backend_pid();`

rows, err := r.Pool.Query(ctx, query)
if err != nil {
slog.Error("Live Sessions Query Error", "error", err)
return nil, err
}
defer rows.Close()

var sessions []models.Session
for rows.Next() {
var s models.Session
err := rows.Scan(
&s.PID, &s.Username, &s.Database, &s.ClientAddr, &s.ApplicationName, 
&s.State, &s.Query, &s.WaitEventType, &s.WaitEvent, &s.QueryStart,
&s.QueryDuration, &s.IsBlocking,
)
if err != nil {
slog.Error("Row Scan Error", "error", err)
continue
}
sessions = append(sessions, s)
}

// Agar ro'yxat bo'sh bo'lsa, null emas, [] qaytaramiz
if sessions == nil {
sessions = []models.Session{}
}
return sessions, nil
}

func (r *SessionRepo) TerminateSession(ctx context.Context, pid int) error {
_, err := r.Pool.Exec(ctx, "SELECT pg_terminate_backend($1)", pid)
return err
}

func (r *SessionRepo) CancelSession(ctx context.Context, pid int) error {
_, err := r.Pool.Exec(ctx, "SELECT pg_cancel_backend($1)", pid)
return err
}

package worker

import (
"context"
"log/slog"
"time"
"github.com/jackc/pgx/v5/pgxpool"
)

func StartAshWorker(pool *pgxpool.Pool) {
go func() {
ticker := time.NewTicker(5 * time.Second)
defer ticker.Stop()

for range ticker.C {
query := `
INSERT INTO pgdoctor_ash_history (snapshot_time, active_sessions, idle_sessions, blocking_locks)
SELECT 
NOW(),
COUNT(*) FILTER (WHERE state = 'active'),
COUNT(*) FILTER (WHERE state LIKE 'idle%'),
COUNT(*) FILTER (WHERE wait_event_type = 'Lock')
FROM pg_stat_activity 
WHERE pid <> pg_backend_pid();`

_, err := pool.Exec(context.Background(), query)
if err != nil {
// Faqatgina haqiqiy xato bo'lib qolsagina jiringlaydi
slog.Error("ASH Worker xatosi", "error", err)
}
}
}()
}

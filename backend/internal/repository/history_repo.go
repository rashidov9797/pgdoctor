package repository

import (
"context"
"github.com/jackc/pgx/v5/pgxpool"
)

type HistoryRepo struct {
Pool *pgxpool.Pool
}

type HistoryRow struct {
Time   int64 `json:"time"`
Active int   `json:"active"`
Total  int   `json:"total"`
}

func (r *HistoryRepo) GetHistory(ctx context.Context, minutes int) ([]HistoryRow, error) {
query := `
SELECT 
CAST(EXTRACT(epoch FROM snapshot_time) * 1000 AS BIGINT) as ts, 
active_sessions, 
(active_sessions + idle_sessions) as total_sessions
FROM pgdoctor_ash_history 
WHERE snapshot_time >= NOW() - INTERVAL '1 minute' * $1 
ORDER BY snapshot_time ASC
`
rows, err := r.Pool.Query(ctx, query, minutes)
if err != nil { return nil, err }
defer rows.Close()

var result []HistoryRow
for rows.Next() {
var row HistoryRow
if err := rows.Scan(&row.Time, &row.Active, &row.Total); err == nil {
result = append(result, row)
}
}
if result == nil { result = []HistoryRow{} }
return result, nil
}

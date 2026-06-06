package repository

import (
"context"
"log/slog"
"pgdoctor/internal/models"
"github.com/jackc/pgx/v5/pgxpool"
)

type QueryRepo struct {
Pool *pgxpool.Pool
}

func (r *QueryRepo) GetSlowQueries(ctx context.Context) ([]models.HeavyQuery, error) {
query := `
SELECT 
COALESCE(r.rolname, 'unknown') as username,
s.calls,
s.total_exec_time,
s.mean_exec_time,
s.shared_blks_read,
s.query
FROM pg_stat_statements s
LEFT JOIN pg_roles r ON r.oid = s.userid
ORDER BY s.mean_exec_time DESC
LIMIT 10;`

rows, err := r.Pool.Query(ctx, query)
if err != nil {
slog.Error("pg_stat_statements query failed", "error", err)
return nil, err
}
defer rows.Close()

var queries []models.HeavyQuery
for rows.Next() {
var q models.HeavyQuery
if err := rows.Scan(&q.Username, &q.Calls, &q.TotalExecTime, &q.MeanExecTime, &q.SharedBlksRead, &q.QueryText); err == nil {
queries = append(queries, q)
}
}
if queries == nil {
queries = []models.HeavyQuery{}
}
return queries, nil
}

package repository

import (
"context"
"log/slog"
"github.com/jackc/pgx/v5/pgxpool"
"pgdoctor/internal/models"
)

type AshRepo struct {
Pool *pgxpool.Pool
}

func (r *AshRepo) GetTopWaits(ctx context.Context, timeRange string) ([]models.AshWait, error) {
query := `SELECT wait_event, samples, pct FROM ash.top_waits($1) WHERE samples > 0;`
rows, err := r.Pool.Query(ctx, query, timeRange)
if err != nil {
return nil, err
}
defer rows.Close()
var waits []models.AshWait
for rows.Next() {
var w models.AshWait
if err := rows.Scan(&w.WaitEvent, &w.Samples, &w.Pct); err == nil {
waits = append(waits, w)
}
}
return waits, nil
}

func (r *AshRepo) GetTopQueries(ctx context.Context, timeRange string) ([]models.AshQuery, error) {
query := `
SELECT 
a.query_id, 
a.samples, 
a.pct, 
COALESCE(
(SELECT query FROM pg_stat_statements s WHERE s.queryid = a.query_id LIMIT 1), 
'Query text not captured'
) as query_text
FROM ash.top_queries($1) a
WHERE a.samples > 0 
ORDER BY a.samples DESC
LIMIT 10;`

rows, err := r.Pool.Query(ctx, query, timeRange)
if err != nil {
slog.Error("ASH Queries Error", "error", err)
return nil, err
}
defer rows.Close()

var queries []models.AshQuery
for rows.Next() {
var q models.AshQuery
if err := rows.Scan(&q.QueryID, &q.Samples, &q.Pct, &q.Query); err == nil {
queries = append(queries, q)
}
}
return queries, nil
}

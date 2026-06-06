package repository

import (
"context"
"log/slog"
"github.com/jackc/pgx/v5/pgxpool"
)

type BloatRepo struct {
Pool *pgxpool.Pool
}

type TableStats struct {
TableName      string  `json:"table_name"`
TableSize      float64 `json:"table_size_mb"`
DeadTuples     int64   `json:"dead_tuples"` // Aniq sanoq
BloatPercent   float64 `json:"bloat_percent"`
LastVacuum     string  `json:"last_vacuum"`
LastAutoVacuum string  `json:"last_autovacuum"`
VacuumCount    int     `json:"vacuum_count"`
AutoVacCount   int     `json:"autovacuum_count"`
AnalyzeCount   int     `json:"analyze_count"`
}

func (r *BloatRepo) GetBloatStats(ctx context.Context) ([]TableStats, error) {
query := `
SELECT 
COALESCE(schemaname || '.' || relname, 'unknown') as table_name,
COALESCE(ROUND(pg_total_relation_size(relid) / 1024.0 / 1024.0, 2), 0) as size_mb,
COALESCE(n_dead_tup, 0) as dead_tuples,
CASE 
WHEN (COALESCE(n_live_tup, 0) + COALESCE(n_dead_tup, 0)) > 0 
THEN (COALESCE(n_dead_tup, 0)::numeric / (COALESCE(n_live_tup, 0) + COALESCE(n_dead_tup, 0))::numeric) * 100.0
ELSE 0.0 
END as bloat_percent,
COALESCE(last_vacuum::text, 'Never') as last_vac,
COALESCE(last_autovacuum::text, 'Never') as last_autovac,
COALESCE(vacuum_count, 0) as vacuum_count,
COALESCE(autovacuum_count, 0) as autovacuum_count,
COALESCE(analyze_count, 0) + COALESCE(autoanalyze_count, 0) as total_analyze
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC NULLS LAST
LIMIT 10;`

rows, err := r.Pool.Query(ctx, query)
if err != nil {
slog.Error("SQL execution failed", "error", err)
return nil, err
}
defer rows.Close()

var stats []TableStats
for rows.Next() {
var s TableStats
if err := rows.Scan(
&s.TableName, &s.TableSize, &s.DeadTuples, &s.BloatPercent, 
&s.LastVacuum, &s.LastAutoVacuum, 
&s.VacuumCount, &s.AutoVacCount, &s.AnalyzeCount,
); err != nil {
slog.Error("Scan failed", "error", err)
continue
}
stats = append(stats, s)
}

if stats == nil {
stats = []TableStats{}
}
return stats, nil
}

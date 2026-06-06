package repository

import (
"context"
"log/slog"

"github.com/jackc/pgx/v5/pgxpool"
"pgdoctor/internal/models"
)

type DatabaseRepo struct {
Pool *pgxpool.Pool
}

func (r *DatabaseRepo) GetDatabases(ctx context.Context) ([]models.DatabaseStat, error) {
query := `
SELECT 
d.datname as db_name,
pg_catalog.pg_get_userbyid(d.datdba) as owner,
pg_database_size(d.datname) as size_bytes,
pg_size_pretty(pg_database_size(d.datname)) as size_pretty,
d.datconnlimit as conn_limit,
(SELECT count(1) FROM pg_stat_activity WHERE datname = d.datname) as active_connections
FROM pg_catalog.pg_database d
WHERE d.datistemplate = false
ORDER BY size_bytes DESC;`

rows, err := r.Pool.Query(ctx, query)
if err != nil {
slog.Error("Databases Query Error", "error", err)
return nil, err
}
defer rows.Close()

var dbs []models.DatabaseStat
for rows.Next() {
var d models.DatabaseStat
if err := rows.Scan(&d.Name, &d.Owner, &d.SizeBytes, &d.SizePretty, &d.ConnLimit, &d.ActiveConnections); err == nil {
dbs = append(dbs, d)
}
}

if dbs == nil {
dbs = []models.DatabaseStat{}
}
return dbs, nil
}

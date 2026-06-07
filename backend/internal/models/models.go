package models

import "time"

type Session struct {
PID             int        `json:"pid"`
Username        string     `json:"usename"`
Database        string     `json:"datname"`
ClientAddr      *string    `json:"client_addr"`
ApplicationName *string    `json:"application_name"`
State           string     `json:"state"`
WaitEventType   *string    `json:"wait_event_type"`
WaitEvent       *string    `json:"wait_event"`
Query           string     `json:"query"`
QueryStart      *time.Time `json:"query_start"`
QueryDuration   *string    `json:"query_duration"`
BackendStart    time.Time  `json:"backend_start"`
IsBlocking      bool       `json:"is_blocking"`
}

type DatabaseStat struct {
Name              string `json:"datname"`
Owner             string `json:"owner"`
SizeBytes         int64  `json:"size_bytes"`
SizePretty        string `json:"size_pretty"`
ActiveConnections int    `json:"active_connections"`
ConnLimit         int    `json:"conn_limit"`
}

type BloatStat struct {
TableName  string  `json:"table_name"`
TableSize  string  `json:"table_size"`
LiveTuples int64   `json:"live_tuples"`
DeadTuples int64   `json:"dead_tuples"`
BloatPct   float64 `json:"bloat_pct"`
}

type AshWait struct {
WaitEvent string  `json:"wait_event"`
Samples   int     `json:"samples"`
Pct       float64 `json:"pct"`
}

type AshQuery struct {
QueryID string  `json:"query_id"`
Samples int     `json:"samples"`
Pct     float64 `json:"pct"`
Query   string  `json:"query"`
}

type HeavyQuery struct {
Username       string  `json:"username"`
Calls          int64   `json:"calls"`
TotalExecTime  float64 `json:"total_exec_time"`
MeanExecTime   float64 `json:"mean_exec_time"`
SharedBlksRead int64   `json:"shared_blks_read"`
QueryText      string  `json:"query"`
}

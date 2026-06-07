package api

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"time"

	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/mem"
)

type SystemMetrics struct {
	CPU  string `json:"cpu"`
	RAM  string `json:"ram"`
	Disk string `json:"disk"`
}

type SystemHandler struct{}

func (h *SystemHandler) GetSystemMetrics(w http.ResponseWriter, r *http.Request) {
	c, _ := cpu.Percent(200*time.Millisecond, false)
	cpuVal := "0.0"
	if len(c) > 0 {
		cpuVal = fmt.Sprintf("%.1f", c[0])
	}

	v, _ := mem.VirtualMemory()
	ramVal := fmt.Sprintf("%.1f / %dGB", float64(v.Used)/1024/1024/1024, v.Total/1024/1024/1024)

	metrics := SystemMetrics{
		CPU:  cpuVal,
		RAM:  ramVal,
		Disk: "Stable",
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(metrics); err != nil {
		slog.Error("JSON encode failed", "error", err)
	}
}

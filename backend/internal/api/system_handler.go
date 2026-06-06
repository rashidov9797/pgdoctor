package api

import (
"encoding/json"
"fmt"
"net/http"
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
// CPU % o'qish
c, _ := cpu.Percent(0, false)
cpuVal := "0.0"
if len(c) > 0 {
cpuVal = fmt.Sprintf("%.1f", c[0])
}

// RAM o'qish
v, _ := mem.VirtualMemory()
// Ishlatilgan RAM va Umumiy RAM (GB formatida)
ramVal := fmt.Sprintf("%.1f / %dGB", float64(v.Used)/1024/1024/1024, v.Total/1024/1024/1024)

metrics := SystemMetrics{
CPU:  cpuVal,
RAM:  ramVal,
Disk: "Stable", // Disk ma'lumotlarini ham keyinchalik xuddi shu usulda qo'shish mumkin
}

w.Header().Set("Content-Type", "application/json")
json.NewEncoder(w).Encode(metrics)
}

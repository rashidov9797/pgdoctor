package api

import (
"encoding/json"
"log/slog"
"net/http"
"strconv"
"pgdoctor/internal/service"
)

type HistoryHandler struct {
Service *service.HistoryService
}

func (h *HistoryHandler) GetAshHistory(w http.ResponseWriter, r *http.Request) {
minutes := 5
if m := r.URL.Query().Get("minutes"); m != "" {
if parsed, err := strconv.Atoi(m); err == nil {
minutes = parsed
} else {
slog.Warn("Invalid minutes parameter", "input", m)
}
}

result, err := h.Service.GetHistory(r.Context(), minutes)
if err != nil {
slog.Error("History retrieval failed", "error", err)
http.Error(w, "Internal server error", http.StatusInternalServerError)
return
}

w.Header().Set("Content-Type", "application/json")
json.NewEncoder(w).Encode(result)
}

package api

import (
"encoding/json"
"net/http"
"pgdoctor/internal/service"
)

type AshHandler struct {
Service *service.AshService
}

func (h *AshHandler) GetTopWaits(w http.ResponseWriter, r *http.Request) {
waits, err := h.Service.GetTopWaits(r.Context(), "15 minutes")
if err != nil {
http.Error(w, err.Error(), http.StatusInternalServerError)
return
}
w.Header().Set("Content-Type", "application/json")
json.NewEncoder(w).Encode(waits)
}

func (h *AshHandler) GetTopQueries(w http.ResponseWriter, r *http.Request) {
queries, err := h.Service.GetTopQueries(r.Context(), "15 minutes")
if err != nil {
http.Error(w, err.Error(), http.StatusInternalServerError)
return
}
w.Header().Set("Content-Type", "application/json")
json.NewEncoder(w).Encode(queries)
}

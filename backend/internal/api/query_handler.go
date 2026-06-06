package api

import (
"encoding/json"
"net/http"
"pgdoctor/internal/service"
)

type QueryHandler struct {
Service *service.QueryService
}

func (h *QueryHandler) GetSlowQueries(w http.ResponseWriter, r *http.Request) {
queries, err := h.Service.GetSlowQueries(r.Context())
if err != nil {
http.Error(w, "Failed to fetch queries", http.StatusInternalServerError)
return
}
w.Header().Set("Content-Type", "application/json")
json.NewEncoder(w).Encode(queries)
}

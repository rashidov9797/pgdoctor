package api

import (
"encoding/json"
"net/http"
"pgdoctor/internal/service"
)

type BloatHandler struct {
Service *service.BloatService
}

func (h *BloatHandler) GetBloatStats(w http.ResponseWriter, r *http.Request) {
stats, err := h.Service.GetBloatStats(r.Context())
if err != nil {
http.Error(w, err.Error(), http.StatusInternalServerError)
return
}
w.Header().Set("Content-Type", "application/json")
json.NewEncoder(w).Encode(stats)
}


package api

import (
	"encoding/json"
	"net/http"
	"pgdoctor/internal/service"
)

type DatabaseHandler struct {
	Service *service.DatabaseService
}

func (h *DatabaseHandler) GetDatabases(w http.ResponseWriter, r *http.Request) {
	databases, err := h.Service.GetDatabases(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(databases)
}

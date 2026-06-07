package api

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"pgdoctor/internal/service"
)

type SessionHandler struct {
	Service *service.SessionService
}

func (h *SessionHandler) GetSessions(w http.ResponseWriter, r *http.Request) {
	sessions, err := h.Service.GetSessions(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(sessions); err != nil {
		slog.Error("JSON encode failed", "error", err)
	}
}

func (h *SessionHandler) TerminateSession(w http.ResponseWriter, r *http.Request) {
	if !h.Service.Config.EnableTerminate {
		http.Error(w, "Termination is disabled", http.StatusForbidden)
		return
	}

	pidStr := chi.URLParam(r, "pid")
	pid, err := strconv.Atoi(pidStr)
	if err != nil {
		http.Error(w, "Invalid PID format", http.StatusBadRequest)
		return
	}

	err = h.Service.TerminateSession(r.Context(), pid)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func (h *SessionHandler) CancelSession(w http.ResponseWriter, r *http.Request) {
	if !h.Service.Config.EnableTerminate {
		http.Error(w, "Termination is disabled", http.StatusForbidden)
		return
	}

	pidStr := chi.URLParam(r, "pid")
	pid, err := strconv.Atoi(pidStr)
	if err != nil {
		http.Error(w, "Invalid PID format", http.StatusBadRequest)
		return
	}

	err = h.Service.CancelSession(r.Context(), pid)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

package api

import (
"encoding/json"
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
json.NewEncoder(w).Encode(sessions)
}

func (h *SessionHandler) TerminateSession(w http.ResponseWriter, r *http.Request) {
pidStr := chi.URLParam(r, "pid")
pid, _ := strconv.Atoi(pidStr)

err := h.Service.TerminateSession(r.Context(), pid)
if err != nil {
http.Error(w, err.Error(), http.StatusInternalServerError)
return
}
w.WriteHeader(http.StatusOK)
}

func (h *SessionHandler) CancelSession(w http.ResponseWriter, r *http.Request) {
pidStr := chi.URLParam(r, "pid")
pid, _ := strconv.Atoi(pidStr)

err := h.Service.CancelSession(r.Context(), pid)
if err != nil {
http.Error(w, err.Error(), http.StatusInternalServerError)
return
}
w.WriteHeader(http.StatusOK)
}

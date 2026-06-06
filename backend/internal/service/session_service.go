package service

import (
"context"
"pgdoctor/internal/config"
"pgdoctor/internal/models"
"pgdoctor/internal/repository"
)

type SessionService struct {
Repo   *repository.SessionRepo
Config *config.Config
}

func (s *SessionService) GetSessions(ctx context.Context) ([]models.Session, error) {
return s.Repo.GetSessions(ctx)
}

func (s *SessionService) TerminateSession(ctx context.Context, pid int) error {
return s.Repo.TerminateSession(ctx, pid)
}

func (s *SessionService) CancelSession(ctx context.Context, pid int) error {
return s.Repo.CancelSession(ctx, pid)
}

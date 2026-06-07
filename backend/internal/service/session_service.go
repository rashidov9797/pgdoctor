package service

import (
	"context"
	"errors"
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
	if err := s.checkProtection(ctx, pid); err != nil {
		return err
	}
	return s.Repo.TerminateSession(ctx, pid)
}

func (s *SessionService) CancelSession(ctx context.Context, pid int) error {
	if err := s.checkProtection(ctx, pid); err != nil {
		return err
	}
	return s.Repo.CancelSession(ctx, pid)
}

func (s *SessionService) checkProtection(ctx context.Context, pid int) error {
	sessions, err := s.Repo.GetSessions(ctx)
	if err != nil {
		return err
	}

	var username string
	for _, sess := range sessions {
		if sess.PID == pid {
			username = sess.Username
			break
		}
	}

	for _, protectedUser := range s.Config.ProtectedUsers {
		if username == protectedUser {
			return errors.New("action denied: user is protected")
		}
	}
	return nil
}

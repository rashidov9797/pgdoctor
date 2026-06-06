
package service

import (
	"context"
	"pgdoctor/internal/models"
	"pgdoctor/internal/repository"
)

type DatabaseService struct {
	Repo *repository.DatabaseRepo
}

func (s *DatabaseService) GetDatabases(ctx context.Context) ([]models.DatabaseStat, error) {
	return s.Repo.GetDatabases(ctx)
}

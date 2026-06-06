package service

import (
"context"
"pgdoctor/internal/models"
"pgdoctor/internal/repository"
)

type AshService struct {
Repo *repository.AshRepo
}

func (s *AshService) GetTopWaits(ctx context.Context, timeRange string) ([]models.AshWait, error) {
return s.Repo.GetTopWaits(ctx, timeRange)
}

func (s *AshService) GetTopQueries(ctx context.Context, timeRange string) ([]models.AshQuery, error) {
return s.Repo.GetTopQueries(ctx, timeRange)
}

package service

import (
"context"
"pgdoctor/internal/models"
"pgdoctor/internal/repository"
)

type QueryService struct {
Repo *repository.QueryRepo
}

func (s *QueryService) GetSlowQueries(ctx context.Context) ([]models.HeavyQuery, error) {
return s.Repo.GetSlowQueries(ctx)
}

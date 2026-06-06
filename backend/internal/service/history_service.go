package service

import (
"context"
"pgdoctor/internal/repository"
)

type HistoryService struct {
Repo *repository.HistoryRepo
}

func (s *HistoryService) GetHistory(ctx context.Context, minutes int) ([]repository.HistoryRow, error) {
// Prevent abuse by capping history to 24 hours (1440 minutes)
if minutes > 1440 {
minutes = 1440
}
if minutes <= 0 {
minutes = 5
}
return s.Repo.GetHistory(ctx, minutes)
}

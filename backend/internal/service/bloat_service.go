package service

import (
"context"
"pgdoctor/internal/repository"
)

type BloatService struct {
Repo *repository.BloatRepo
}

// Qaytarish turi []repository.TableStats ga o'zgartirildi
func (s *BloatService) GetBloatStats(ctx context.Context) ([]repository.TableStats, error) {
return s.Repo.GetBloatStats(ctx)
}

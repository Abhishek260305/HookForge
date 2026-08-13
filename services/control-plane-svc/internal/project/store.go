package project

import (
	"context"
	"errors"
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var slugPattern = regexp.MustCompile(`^[a-z0-9]+(?:-[a-z0-9]+)*$`)

type Project struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	Slug        string    `json:"slug"`
	Environment string    `json:"environment"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type CreateInput struct {
	Name        string `json:"name"`
	Slug        string `json:"slug"`
	Environment string `json:"environment"`
}

type Store struct {
	pool *pgxpool.Pool
}

func NewStore(pool *pgxpool.Pool) *Store {
	return &Store{pool: pool}
}

func (s *Store) List(ctx context.Context) ([]Project, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT id, name, slug, environment, created_at, updated_at
		FROM control.projects
		ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]Project, 0)
	for rows.Next() {
		var p Project
		if err := rows.Scan(&p.ID, &p.Name, &p.Slug, &p.Environment, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, err
		}
		out = append(out, p)
	}
	return out, rows.Err()
}

func (s *Store) Create(ctx context.Context, in CreateInput) (Project, error) {
	in.Name = strings.TrimSpace(in.Name)
	in.Slug = strings.TrimSpace(strings.ToLower(in.Slug))
	if in.Environment == "" {
		in.Environment = "dev"
	}
	in.Environment = strings.TrimSpace(strings.ToLower(in.Environment))

	if in.Name == "" {
		return Project{}, fmt.Errorf("name is required")
	}
	if !slugPattern.MatchString(in.Slug) {
		return Project{}, fmt.Errorf("slug must be lowercase kebab-case")
	}
	if in.Environment != "dev" && in.Environment != "prod" {
		return Project{}, fmt.Errorf("environment must be dev or prod")
	}

	var p Project
	err := s.pool.QueryRow(ctx, `
		INSERT INTO control.projects (name, slug, environment)
		VALUES ($1, $2, $3)
		RETURNING id, name, slug, environment, created_at, updated_at
	`, in.Name, in.Slug, in.Environment).Scan(
		&p.ID, &p.Name, &p.Slug, &p.Environment, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		if isUniqueViolation(err) {
			return Project{}, fmt.Errorf("slug already exists")
		}
		return Project{}, err
	}
	return p, nil
}

func isUniqueViolation(err error) bool {
	return err != nil && (errors.Is(err, pgx.ErrNoRows) == false) &&
		(strings.Contains(err.Error(), "projects_slug_key") ||
			strings.Contains(err.Error(), "duplicate key") ||
			strings.Contains(err.Error(), "unique constraint"))
}

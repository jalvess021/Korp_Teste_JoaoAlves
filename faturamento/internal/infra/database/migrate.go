package database

import (
	"context"
	"database/sql"
	"embed"
	"fmt"
	"io/fs"
	"log"
	"path/filepath"
	"sort"
)

//go:embed migrations/*.sql
var migrationsFS embed.FS

const migrationAdvisoryLockKey int64 = 872341

func RunMigrations(db *sql.DB) error {
	ctx := context.Background()

	conn, err := db.Conn(ctx)
	if err != nil {
		return fmt.Errorf("erro ao obter conexão para migrations: %w", err)
	}
	defer conn.Close()

	if _, err := conn.ExecContext(ctx, "SELECT pg_advisory_lock($1)", migrationAdvisoryLockKey); err != nil {
		return fmt.Errorf("erro ao adquirir lock de migration: %w", err)
	}
	defer func() {
		if _, unlockErr := conn.ExecContext(ctx, "SELECT pg_advisory_unlock($1)", migrationAdvisoryLockKey); unlockErr != nil {
			log.Printf("erro ao liberar lock de migration: %v", unlockErr)
		}
	}()

	paths, err := fs.Glob(migrationsFS, "migrations/*.sql")
	if err != nil {
		return fmt.Errorf("erro ao listar migrations embutidas: %w", err)
	}
	if len(paths) == 0 {
		return fmt.Errorf("nenhuma migration encontrada")
	}

	sort.Strings(paths)

	for _, p := range paths {
		fileName := filepath.Base(p)
		sqlFile, err := migrationsFS.ReadFile(p)
		if err != nil {
			return fmt.Errorf("erro ao ler migration %s: %w", fileName, err)
		}

		log.Printf("migration aplicada. arquivo=%s", fileName)
		if _, err := conn.ExecContext(ctx, string(sqlFile)); err != nil {
			return fmt.Errorf("erro ao executar migration %s: %w", fileName, err)
		}
	}

	return nil
}
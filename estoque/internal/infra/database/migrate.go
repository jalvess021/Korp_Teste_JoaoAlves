package database

import (
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

func RunMigrations(db *sql.DB) error {
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
		if _, err := db.Exec(string(sqlFile)); err != nil {
			return fmt.Errorf("erro ao executar migration %s: %w", fileName, err)
		}
	}

	return nil
}
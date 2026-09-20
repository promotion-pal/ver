package ver

import "embed"

//go:embed db/migrations
var MigrationsFS embed.FS

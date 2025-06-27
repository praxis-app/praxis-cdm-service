## Database migrations

This directory is intended to be used for database migrations only.

TypeORM is used to handle database interactions and migrations. [PostgreSQL](https://www.postgresql.org/download) is the primary database and can be run via Docker or installed locally.

If you're using a locally installed instance of PostgreSQL, ensure that connection details in your `.env` file are correct.

```bash
# Create a new migration
$ npm run typeorm:gen ./src/database/migrations/<migration-name>

# Run migrations
$ npm run typeorm:run
```

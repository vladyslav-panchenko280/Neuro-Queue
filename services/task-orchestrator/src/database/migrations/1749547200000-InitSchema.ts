import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1749547200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "email"      VARCHAR NOT NULL UNIQUE,
        "tier"       VARCHAR NOT NULL DEFAULT 'free',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "api_keys" (
        "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id"    UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "key_hash"   VARCHAR NOT NULL UNIQUE,
        "name"       VARCHAR,
        "revoked"    BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "last_used"  TIMESTAMPTZ
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "tasks" (
        "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id"       UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "provider"      VARCHAR NOT NULL,
        "model"         VARCHAR NOT NULL,
        "priority"      VARCHAR NOT NULL,
        "status"        VARCHAR NOT NULL DEFAULT 'PENDING',
        "prompt"        TEXT NOT NULL,
        "parameters"    JSONB NOT NULL DEFAULT '{}',
        "result"        JSONB,
        "error_message" VARCHAR,
        "retry_count"   INTEGER NOT NULL DEFAULT 0,
        "worker_id"     VARCHAR,
        "created_at"    TIMESTAMPTZ NOT NULL DEFAULT now(),
        "queued_at"     TIMESTAMPTZ,
        "started_at"    TIMESTAMPTZ,
        "completed_at"  TIMESTAMPTZ
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_tasks_status" ON "tasks" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_tasks_provider_status" ON "tasks" ("provider", "status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_tasks_created_at" ON "tasks" ("created_at" DESC)`,
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "task_failures" (
        "id"             SERIAL PRIMARY KEY,
        "task_id"        UUID NOT NULL REFERENCES "tasks"("id") ON DELETE CASCADE,
        "provider"       VARCHAR,
        "error_code"     VARCHAR,
        "error_message"  VARCHAR,
        "attempt_number" INTEGER NOT NULL DEFAULT 0,
        "created_at"     TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      INSERT INTO "users" ("email", "tier")
      VALUES ('system@neuroqueue.local', 'free')
      ON CONFLICT ("email") DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "task_failures"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tasks"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "api_keys"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}

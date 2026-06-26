import { Sequelize, QueryInterface, DataTypes, Dialect } from 'sequelize';
import parseDatabaseUrl from 'parse-database-url';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

interface ParsedDatabaseUrl {
    driver?: string;
    user?: string;
    password?: string;
    host?: string;
    port?: number | string;
    database?: string;
}

interface Migration {
    name: string;
    up: (context: {
        queryInterface: QueryInterface;
        sequelize: Sequelize;
    }) => Promise<void>;
    down: (context: {
        queryInterface: QueryInterface;
        sequelize: Sequelize;
    }) => Promise<void>;
}

const RESULTS_TABLE = { schema: 'public', tableName: 'Results' } as const;

interface Legacy2021AnswersSeed {
    answers: Array<{
        agreeLevel: number;
        source?: string | null;
        statement?: string | null;
        QuestionId: string;
        PartyId: string;
        createdAt?: string;
        updatedAt?: string;
        deletedAt?: string | null;
    }>;
}

interface Calculator2026Seed {
    calculator: {
        slug: string;
        name: string;
        description?: string;
        answerScaleMin: number;
        answerScaleMax: number;
    };
    axes: Array<{
        code: string;
        name: string;
        negativeLabel: string;
        positiveLabel: string;
    }>;
    parties: Array<{
        code: string;
        name: string;
        sourceColumn: string;
    }>;
    questions: Array<{
        id: string;
        axisCode: string;
        order: number;
        dimensionOrder: number;
        facet: string;
        originalText: string;
        text: string;
        reversed: boolean;
        reviewStatus: string;
        reviewNote?: string;
    }>;
    ratings: Array<{
        questionId: string;
        partyCode: string;
        rating: number | null;
        evidenceStatus: string;
        evidenceUrl?: string | null;
        evidenceTitle?: string | null;
        evidenceNote?: string | null;
    }>;
}

function loadCalculator2026Seed(): Calculator2026Seed {
    const seedPath = join(
        __dirname,
        '../calculator-2026/seed/calculator-2026.seed.json',
    );
    return JSON.parse(readFileSync(seedPath, 'utf8')) as Calculator2026Seed;
}

function loadLegacy2021AnswersSeed(): Legacy2021AnswersSeed {
    const seedPath = join(
        __dirname,
        '../legacy-2021/seed/legacy-2021.answers.seed.json',
    );
    return JSON.parse(readFileSync(seedPath, 'utf8')) as Legacy2021AnswersSeed;
}

function timestamps() {
    const now = new Date();
    return { createdAt: now, updatedAt: now, deletedAt: null };
}

const migrations: Migration[] = [
    {
        name: '20251222_add_result_metadata_columns',
        up: async ({ queryInterface }) => {
            const tableDefinition =
                await queryInterface.describeTable(RESULTS_TABLE);

            const ensureColumn = async (
                column: string,
                definition: Parameters<QueryInterface['addColumn']>[2],
            ) => {
                if (tableDefinition[column]) return;
                await queryInterface.addColumn(
                    RESULTS_TABLE,
                    column,
                    definition,
                );
            };

            await ensureColumn('userAgent', {
                type: DataTypes.TEXT,
                allowNull: true,
            });
            await ensureColumn('geoCountry', {
                type: DataTypes.STRING,
                allowNull: true,
            });
            await ensureColumn('geoRegion', {
                type: DataTypes.STRING,
                allowNull: true,
            });
            await ensureColumn('geoCity', {
                type: DataTypes.STRING,
                allowNull: true,
            });
            await ensureColumn('geoLatitude', {
                type: DataTypes.FLOAT,
                allowNull: true,
            });
            await ensureColumn('geoLongitude', {
                type: DataTypes.FLOAT,
                allowNull: true,
            });
            await ensureColumn('geoTimezone', {
                type: DataTypes.STRING,
                allowNull: true,
            });
            await ensureColumn('isDumped', {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            });
            await ensureColumn('dumpReason', {
                type: DataTypes.STRING,
                allowNull: true,
            });
        },
        down: async ({ queryInterface }) => {
            const tableDefinition =
                await queryInterface.describeTable(RESULTS_TABLE);

            const removeColumnIfPresent = async (column: string) => {
                if (!tableDefinition[column]) return;
                await queryInterface.removeColumn(RESULTS_TABLE, column);
            };

            await removeColumnIfPresent('dumpReason');
            await removeColumnIfPresent('isDumped');
            await removeColumnIfPresent('geoTimezone');
            await removeColumnIfPresent('geoLongitude');
            await removeColumnIfPresent('geoLatitude');
            await removeColumnIfPresent('geoCity');
            await removeColumnIfPresent('geoRegion');
            await removeColumnIfPresent('geoCountry');
            await removeColumnIfPresent('userAgent');
        },
    },
    {
        name: '20260615_add_calculator_2026',
        up: async ({ queryInterface }) => {
            const seed = loadCalculator2026Seed();
            const commonTimestamps = timestamps();

            await queryInterface.createTable('Calculators', {
                slug: {
                    type: DataTypes.STRING,
                    primaryKey: true,
                    allowNull: false,
                },
                name: { type: DataTypes.STRING, allowNull: false },
                description: { type: DataTypes.TEXT, allowNull: true },
                answerScaleMin: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                answerScaleMax: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                createdAt: { type: DataTypes.DATE, allowNull: false },
                updatedAt: { type: DataTypes.DATE, allowNull: false },
                deletedAt: { type: DataTypes.DATE, allowNull: true },
            });

            await queryInterface.createTable('CalculatorAxes', {
                code: {
                    type: DataTypes.STRING,
                    primaryKey: true,
                    allowNull: false,
                },
                calculatorSlug: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    references: { model: 'Calculators', key: 'slug' },
                    onDelete: 'CASCADE',
                    onUpdate: 'CASCADE',
                },
                name: { type: DataTypes.STRING, allowNull: false },
                negativeLabel: { type: DataTypes.STRING, allowNull: false },
                positiveLabel: { type: DataTypes.STRING, allowNull: false },
                order: { type: DataTypes.INTEGER, allowNull: false },
                createdAt: { type: DataTypes.DATE, allowNull: false },
                updatedAt: { type: DataTypes.DATE, allowNull: false },
                deletedAt: { type: DataTypes.DATE, allowNull: true },
            });

            await queryInterface.createTable('CalculatorParties', {
                code: {
                    type: DataTypes.STRING,
                    primaryKey: true,
                    allowNull: false,
                },
                calculatorSlug: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    references: { model: 'Calculators', key: 'slug' },
                    onDelete: 'CASCADE',
                    onUpdate: 'CASCADE',
                },
                name: { type: DataTypes.STRING, allowNull: false },
                sourceColumn: { type: DataTypes.STRING, allowNull: false },
                color: { type: DataTypes.STRING, allowNull: true },
                createdAt: { type: DataTypes.DATE, allowNull: false },
                updatedAt: { type: DataTypes.DATE, allowNull: false },
                deletedAt: { type: DataTypes.DATE, allowNull: true },
            });

            await queryInterface.createTable('CalculatorQuestions', {
                id: {
                    type: DataTypes.STRING,
                    primaryKey: true,
                    allowNull: false,
                },
                calculatorSlug: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    references: { model: 'Calculators', key: 'slug' },
                    onDelete: 'CASCADE',
                    onUpdate: 'CASCADE',
                },
                axisCode: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    references: { model: 'CalculatorAxes', key: 'code' },
                    onDelete: 'RESTRICT',
                    onUpdate: 'CASCADE',
                },
                order: { type: DataTypes.INTEGER, allowNull: false },
                dimensionOrder: { type: DataTypes.FLOAT, allowNull: false },
                facet: { type: DataTypes.STRING, allowNull: false },
                originalText: { type: DataTypes.TEXT, allowNull: false },
                text: { type: DataTypes.TEXT, allowNull: false },
                reversed: { type: DataTypes.BOOLEAN, allowNull: false },
                reviewStatus: { type: DataTypes.STRING, allowNull: false },
                reviewNote: { type: DataTypes.TEXT, allowNull: true },
                createdAt: { type: DataTypes.DATE, allowNull: false },
                updatedAt: { type: DataTypes.DATE, allowNull: false },
                deletedAt: { type: DataTypes.DATE, allowNull: true },
            });

            await queryInterface.createTable('CalculatorPartyRatings', {
                questionId: {
                    type: DataTypes.STRING,
                    primaryKey: true,
                    allowNull: false,
                    references: { model: 'CalculatorQuestions', key: 'id' },
                    onDelete: 'CASCADE',
                    onUpdate: 'CASCADE',
                },
                partyCode: {
                    type: DataTypes.STRING,
                    primaryKey: true,
                    allowNull: false,
                    references: { model: 'CalculatorParties', key: 'code' },
                    onDelete: 'CASCADE',
                    onUpdate: 'CASCADE',
                },
                rating: { type: DataTypes.INTEGER, allowNull: true },
                evidenceStatus: { type: DataTypes.STRING, allowNull: false },
                evidenceUrl: { type: DataTypes.TEXT, allowNull: true },
                evidenceTitle: { type: DataTypes.TEXT, allowNull: true },
                evidenceNote: { type: DataTypes.TEXT, allowNull: true },
                createdAt: { type: DataTypes.DATE, allowNull: false },
                updatedAt: { type: DataTypes.DATE, allowNull: false },
                deletedAt: { type: DataTypes.DATE, allowNull: true },
            });

            await queryInterface.createTable('CalculatorSubmissions', {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true,
                    allowNull: false,
                },
                calculatorSlug: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    references: { model: 'Calculators', key: 'slug' },
                    onDelete: 'CASCADE',
                    onUpdate: 'CASCADE',
                },
                answers: { type: DataTypes.JSONB, allowNull: false },
                result: { type: DataTypes.JSONB, allowNull: false },
                fingerprint: { type: DataTypes.TEXT, allowNull: true },
                ipAddress: { type: DataTypes.STRING, allowNull: true },
                userAgent: { type: DataTypes.TEXT, allowNull: true },
                createdAt: { type: DataTypes.DATE, allowNull: false },
                updatedAt: { type: DataTypes.DATE, allowNull: false },
                deletedAt: { type: DataTypes.DATE, allowNull: true },
            });

            await queryInterface.bulkInsert('Calculators', [
                { ...seed.calculator, ...commonTimestamps },
            ]);
            await queryInterface.bulkInsert(
                'CalculatorAxes',
                seed.axes.map((axis, index) => ({
                    ...axis,
                    calculatorSlug: seed.calculator.slug,
                    order: index + 1,
                    ...commonTimestamps,
                })),
            );
            await queryInterface.bulkInsert(
                'CalculatorParties',
                seed.parties.map((party) => ({
                    ...party,
                    calculatorSlug: seed.calculator.slug,
                    color: null,
                    ...commonTimestamps,
                })),
            );
            await queryInterface.bulkInsert(
                'CalculatorQuestions',
                seed.questions.map((question) => ({
                    ...question,
                    calculatorSlug: seed.calculator.slug,
                    ...commonTimestamps,
                })),
            );
            await queryInterface.bulkInsert(
                'CalculatorPartyRatings',
                seed.ratings.map((rating) => ({
                    ...rating,
                    ...commonTimestamps,
                })),
            );
        },
        down: async ({ queryInterface }) => {
            await queryInterface.dropTable('CalculatorSubmissions');
            await queryInterface.dropTable('CalculatorPartyRatings');
            await queryInterface.dropTable('CalculatorQuestions');
            await queryInterface.dropTable('CalculatorParties');
            await queryInterface.dropTable('CalculatorAxes');
            await queryInterface.dropTable('Calculators');
        },
    },


    {
        name: '20260615_restore_legacy_2021_answers',
        up: async ({ queryInterface, sequelize }) => {
            const seed = loadLegacy2021AnswersSeed();
            const [existingRows] = (await sequelize.query(
                'SELECT "QuestionId", "PartyId" FROM "Answers"',
            )) as Array<Array<{ QuestionId: string; PartyId: string }>>;
            const existing = new Set(
                existingRows.map((row) => `${row.QuestionId}:${row.PartyId}`),
            );
            const answersToInsert = seed.answers
                .filter(
                    (answer) =>
                        !existing.has(`${answer.QuestionId}:${answer.PartyId}`),
                )
                .map((answer) => ({
                    agreeLevel: answer.agreeLevel,
                    source: answer.source ?? null,
                    statement: answer.statement ?? null,
                    QuestionId: answer.QuestionId,
                    PartyId: answer.PartyId,
                    createdAt: answer.createdAt
                        ? new Date(answer.createdAt)
                        : new Date(),
                    updatedAt: answer.updatedAt
                        ? new Date(answer.updatedAt)
                        : new Date(),
                    deletedAt: answer.deletedAt ? new Date(answer.deletedAt) : null,
                }));

            if (answersToInsert.length) {
                await queryInterface.bulkInsert('Answers', answersToInsert);
            }
        },
        down: async ({ sequelize }) => {
            const seed = loadLegacy2021AnswersSeed();
            for (const answer of seed.answers) {
                await sequelize.query(
                    'DELETE FROM "Answers" WHERE "QuestionId" = $1 AND "PartyId" = $2',
                    { bind: [answer.QuestionId, answer.PartyId] },
                );
            }
        },
    },
    {
        name: '20260615_curate_calculator_2026_audit',
        up: async ({ queryInterface }) => {
            const seed = loadCalculator2026Seed();
            const commonTimestamps = timestamps();
            const calculatorSlug = seed.calculator.slug;

            for (const question of seed.questions) {
                await queryInterface.bulkUpdate(
                    'CalculatorQuestions',
                    {
                        text: question.text,
                        reviewStatus: question.reviewStatus,
                        reviewNote: question.reviewNote ?? null,
                        updatedAt: commonTimestamps.updatedAt,
                    },
                    { id: question.id, calculatorSlug },
                );
            }

            for (const rating of seed.ratings) {
                await queryInterface.bulkUpdate(
                    'CalculatorPartyRatings',
                    {
                        rating: rating.rating,
                        evidenceStatus: rating.evidenceStatus,
                        evidenceUrl: rating.evidenceUrl ?? null,
                        evidenceTitle: rating.evidenceTitle ?? null,
                        evidenceNote: rating.evidenceNote ?? null,
                        updatedAt: commonTimestamps.updatedAt,
                    },
                    {
                        questionId: rating.questionId,
                        partyCode: rating.partyCode,
                    },
                );
            }
        },
        down: async ({ sequelize }) => {
            const now = new Date();
            const importedRatingNote =
                'Imported from ratings_matrix.xlsx; verify against official programs/statements.';
            const missingRatingNote = 'No spreadsheet rating supplied.';
            const importedQuestionNote =
                'Imported from ratings_matrix.xlsx; wording and ratings require source-backed review.';

            await sequelize.query(
                `UPDATE "CalculatorQuestions"
                 SET "text" = "originalText",
                     "reviewStatus" = 'needs_review',
                     "reviewNote" = $1,
                     "updatedAt" = $2
                 WHERE "calculatorSlug" = '2026'`,
                { bind: [importedQuestionNote, now] },
            );

            await sequelize.query(
                `UPDATE "CalculatorPartyRatings"
                 SET "rating" = NULL,
                     "evidenceStatus" = 'missing',
                     "evidenceUrl" = NULL,
                     "evidenceTitle" = NULL,
                     "evidenceNote" = $1,
                     "updatedAt" = $2
                 WHERE "evidenceStatus" IN ('weak_source', 'inferred_unverified')`,
                { bind: [missingRatingNote, now] },
            );

            await sequelize.query(
                `UPDATE "CalculatorPartyRatings"
                 SET "evidenceStatus" = 'needs_review',
                     "evidenceUrl" = NULL,
                     "evidenceTitle" = NULL,
                     "evidenceNote" = $1,
                     "updatedAt" = $2
                 WHERE "evidenceStatus" = 'spreadsheet_unverified'`,
                { bind: [importedRatingNote, now] },
            );
        },
    },
];

async function ensureMigrationsTable(sequelize: Sequelize) {
    await sequelize.query(`
        CREATE TABLE IF NOT EXISTS "AppMigrations" (
            name TEXT PRIMARY KEY,
            run_on TIMESTAMPTZ DEFAULT NOW()
        )
    `);
}

async function fetchAppliedMigrations(
    sequelize: Sequelize,
): Promise<Set<string>> {
    const [results] = (await sequelize.query(
        'SELECT name FROM "AppMigrations"',
    )) as Array<Array<{ name: string }>>;
    return new Set(results.map((row) => row.name));
}

async function markMigrationApplied(sequelize: Sequelize, name: string) {
    await sequelize.query('INSERT INTO "AppMigrations" (name) VALUES ($1)', {
        bind: [name],
    });
}

async function markMigrationReverted(sequelize: Sequelize, name: string) {
    await sequelize.query('DELETE FROM "AppMigrations" WHERE name = $1', {
        bind: [name],
    });
}

export interface RunMigrationsOptions {
    databaseUrl?: string;
    databaseSsl?: boolean;
    direction?: 'up' | 'down';
    logger?: Pick<typeof console, 'log' | 'error'>;
}

export async function runMigrations(options: RunMigrationsOptions = {}) {
    const logger = options.logger ?? console;
    const databaseUrl = options.databaseUrl ?? process.env.DATABASE_URL;
    const databaseSsl =
        options.databaseSsl ?? process.env.DATABASE_SSL === 'true';
    const direction = options.direction ?? 'up';

    if (!databaseUrl) {
        throw new Error('DATABASE_URL must be set to run migrations.');
    }

    const parsed = parseDatabaseUrl(databaseUrl) as ParsedDatabaseUrl;
    const dialect = (parsed.driver ?? 'postgres') as Dialect;

    const sequelize = new Sequelize(
        parsed.database ?? '',
        parsed.user ?? '',
        parsed.password ?? '',
        {
            host: parsed.host ?? undefined,
            port: parsed.port ? Number(parsed.port) : undefined,
            dialect,
            logging: false,
            dialectOptions: databaseSsl
                ? {
                      ssl: {
                          require: true,
                          rejectUnauthorized: false,
                      },
                  }
                : undefined,
        },
    );

    try {
        await sequelize.authenticate();
        await ensureMigrationsTable(sequelize);
        const applied = await fetchAppliedMigrations(sequelize);

        const migrationsToRun =
            direction === 'up' ? migrations : [...migrations].reverse();

        for (const migration of migrationsToRun) {
            const isApplied = applied.has(migration.name);

            if (direction === 'up' && isApplied) {
                logger.log(
                    `Skipping migration ${migration.name} (already applied).`,
                );
                continue;
            }

            if (direction === 'down' && !isApplied) {
                logger.log(
                    `Skipping migration ${migration.name} (not applied).`,
                );
                continue;
            }

            logger.log(
                `${direction === 'up' ? 'Applying' : 'Reverting'} migration ${
                    migration.name
                }...`,
            );

            const context = {
                queryInterface: sequelize.getQueryInterface(),
                sequelize,
            };

            if (direction === 'up') {
                await migration.up(context);
                await markMigrationApplied(sequelize, migration.name);
                logger.log(`Migration ${migration.name} applied.`);
            } else {
                await migration.down(context);
                await markMigrationReverted(sequelize, migration.name);
                logger.log(`Migration ${migration.name} reverted.`);
            }
        }

        logger.log('Migrations completed.');
    } finally {
        await sequelize.close();
    }
}

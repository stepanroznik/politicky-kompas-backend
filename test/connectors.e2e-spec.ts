import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { SourceModule } from '../src/source/source.module';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { QuestionModule } from '../src/question/question.module';
import { SourceService } from '../src/source/source.service';
import { LoggerModule } from '../src/common/logger/logger.module';

process.env.AUTH_DISABLE = 'true';

describe('QuestionController (e2e)', () => {
    let app: INestApplication;
    let createdSources: any;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot(),
                SequelizeModule.forRoot({
                    dialect: 'postgres',
                    host: process.env.DB_HOST,
                    port: +process.env.DB_PORT,
                    username: process.env.DB_USERNAME,
                    password: process.env.DB_PASSWORD,
                    database: process.env.DB_DATABASE_TEST,
                    autoLoadModels: true,
                    logging: false,
                    sync: { force: true },
                    define: { timestamps: true, paranoid: true },
                }),
                QuestionModule,
                SourceModule,
                LoggerModule.register({ silent: true }),
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ transform: true }));
        await app.init();
        const sourceService = moduleFixture.get(SourceService);
        createdSources = await sourceService.create([
            { name: 'test' },
            { name: 'tost' },
        ]);
    });

    afterAll(async () => {
        await app.close();
    });

    const questionsToCreate = [
        {
            name: 'test',
            regexSequence: 'tost',
            tagExtractionScript: 'test',
            tagBubbleMapping: {
                test: 'tost',
            },
        },
        {
            name: 'test2',
            regexSequence: 'tost2',
            tagExtractionScript: 'test2',
            tagBubbleMapping: {
                test: 'tost2',
            },
        },
    ];
    let createdQuestionId = '';

    describe('GET "/"', () => {
        it('returns 404', () => {
            return request(app.getHttpServer()).get('/').expect(404);
        });
    });

    describe('POST "/questions"', () => {
        it('returns a 400 error on invalid payload (properties missing)', () => {
            return request(app.getHttpServer())
                .post('/questions')
                .send([{}])
                .expect(400);
        });
        it('returns a 400 error on invalid payload (object instead of an array)', () => {
            return request(app.getHttpServer())
                .post('/questions')
                .send({})
                .expect(400);
        });
        it('returns a 400 error on invalid payload (no payload)', () => {
            return request(app.getHttpServer())
                .post('/questions')
                .send()
                .expect(400);
        });
        it('returns a 400 error on invalid payload (missing sourceId)', () => {
            return request(app.getHttpServer())
                .post('/questions')
                .send(questionsToCreate)
                .expect(400);
        });
        it('creates a question', () => {
            return request(app.getHttpServer())
                .post('/questions')
                .send([
                    {
                        ...questionsToCreate[0],
                        sourceId: createdSources[0].id,
                    },
                    {
                        ...questionsToCreate[1],
                        sourceId: createdSources[0].id,
                    },
                ])
                .expect(201)
                .then((res) => {
                    createdQuestionId = res.body[0].id;
                    expect(res.body[0].name).toEqual(questionsToCreate[0].name);
                    expect(res.body[1].name).toEqual(questionsToCreate[1].name);
                });
        });
        it.todo('returns 400 error on invalid SourceId');
        it('returns 409 on duplicate name', () => {
            return request(app.getHttpServer())
                .post('/questions')
                .send([
                    {
                        ...questionsToCreate[0],
                        sourceId: createdSources[0].id,
                    },
                    {
                        ...questionsToCreate[1],
                        sourceId: createdSources[0].id,
                    },
                ])
                .expect(409);
        });
    });

    describe('GET "/questions"', () => {
        it('returns an array with proper payload', async () => {
            const res = await request(app.getHttpServer())
                .get('/questions?with-tes=true')
                .expect(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body[0].id).toEqual(createdQuestionId);
            expect(res.body[0].name).toEqual(questionsToCreate[0].name);
            expect(res.body[0].regexSequence).toEqual(
                questionsToCreate[0].regexSequence,
            );
            expect(res.body[0].tagExtractionScript).toEqual(
                questionsToCreate[0].tagExtractionScript,
            );
            expect(res.body[0].tagBubbleMapping).toEqual(
                questionsToCreate[0].tagBubbleMapping,
            );
            expect(res.body[0].sourceId).toEqual(createdSources[0].id);
            expect(res.body[1].name).toEqual(questionsToCreate[1].name);
            expect(res.body[1].regexSequence).toEqual(
                questionsToCreate[1].regexSequence,
            );
            expect(res.body[1].tagExtractionScript).toEqual(
                questionsToCreate[1].tagExtractionScript,
            );
            expect(res.body[1].tagBubbleMapping).toEqual(
                questionsToCreate[1].tagBubbleMapping,
            );
            expect(res.body[1].sourceId).toEqual(createdSources[0].id);
        });
        it('returns an array of questions without tag extraction scripts', () => {
            return request(app.getHttpServer())
                .get('/questions')
                .expect(200)
                .then((res) => {
                    expect(Array.isArray(res.body)).toBe(true);
                    expect(res.body[0].tagExtractionScript).toBeUndefined();
                    expect(res.body[1].tagExtractionScript).toBeUndefined();
                });
        });
    });

    describe('GET "/questions/:id"', () => {
        it('returns 400 on malformed id', () => {
            return request(app.getHttpServer())
                .get('/questions/malformed-id')
                .expect(400);
        });
        it('returns 404 on non-existent id', () => {
            return request(app.getHttpServer())
                .get('/questions/5fa2d83a-5c5f-4c9b-9759-7f08415791f1')
                .expect(404);
        });
        it('returns a single question', () => {
            return request(app.getHttpServer())
                .get('/questions/' + createdQuestionId)
                .expect(200)
                .then((res) => {
                    expect(res.body.id).toEqual(createdQuestionId);
                    expect(res.body.name).toEqual(questionsToCreate[0].name);
                });
        });
    });

    describe('PATCH "/questions/:id"', () => {
        it('returns 400 on malformed id', () => {
            return request(app.getHttpServer())
                .patch('/questions/malformed-id')
                .expect(400);
        });
        it('returns 404 on non-existent id', () => {
            return request(app.getHttpServer())
                .patch('/questions/5fa2d83a-5c5f-4c9b-9759-7f08415791f1')
                .send({
                    name: 'new name',
                })
                .expect(404);
        });
        it('returns 409 on duplicate name', () => {
            return request(app.getHttpServer())
                .patch('/questions/' + createdQuestionId)
                .send(questionsToCreate[1])
                .expect(409);
        });
        it('returns a modified question', () => {
            return request(app.getHttpServer())
                .patch('/questions/' + createdQuestionId)
                .send({
                    name: 'new name',
                    regexSequence: 'new rs',
                    tagExtractionScript: 'new tes',
                    tagBubbleMapping: {
                        tost: 'test',
                    },
                    sourceId: createdSources[1].id,
                })
                .expect(200)
                .then((res) => {
                    expect(res.body.id).toEqual(createdQuestionId);
                    expect(res.body.name).toEqual('new name');
                    expect(res.body.regexSequence).toEqual('new rs');
                    expect(res.body.tagExtractionScript).toEqual('new tes');
                    expect(res.body.tagBubbleMapping).toEqual({
                        tost: 'test',
                    });
                    expect(res.body.sourceId).toEqual(createdSources[1].id);
                });
        });
    });

    describe('DELETE "/questions/:id"', () => {
        it('returns 400 on malformed id', () => {
            return request(app.getHttpServer())
                .delete('/questions/malformed-id')
                .expect(400);
        });
        it('returns 200 on non-existent id', () => {
            return request(app.getHttpServer())
                .delete('/questions/5fa2d83a-5c5f-4c9b-9759-7f08415791f1')
                .expect(200);
        });
        it('deletes a question', async () => {
            await request(app.getHttpServer())
                .delete('/questions/' + createdQuestionId)
                .expect(200);
            return request(app.getHttpServer())
                .get('/questions/' + createdQuestionId)
                .expect(404);
        });
        it('returns the soft deleted question', async () => {
            const res = await request(app.getHttpServer())
                .get(`/questions/${createdQuestionId}?include-deleted=true`)
                .expect(200);
            expect(res.body.id).toEqual(createdQuestionId);
            expect(res.body.name).toEqual(
                `new name (deleted)_${createdQuestionId}`,
            );
            expect(res.body.deletedAt).toBeTruthy();
        });
    });

    describe('PATCH "/questions/:id?restore=true"', () => {
        it('restores a question', async () => {
            const res = await request(app.getHttpServer())
                .patch(`/questions/${createdQuestionId}?restore=true`)
                .expect(200);
            expect(res.body.id).toEqual(createdQuestionId);
            expect(res.body.name).toEqual('new name');
            expect(res.body.deletedAt).toBeNull();
        });
        it('returns the restored question', async () => {
            const res = await request(app.getHttpServer())
                .get(`/questions/${createdQuestionId}`)
                .expect(200);
            expect(res.body.id).toEqual(createdQuestionId);
            expect(res.body.name).toEqual('new name');
            expect(res.body.deletedAt).toBeNull();
        });
    });

    describe('DELETE "/questions/:id?force=true"', () => {
        it('hard deletes a question', async () => {
            await request(app.getHttpServer())
                .delete(`/questions/${createdQuestionId}?force=true`)
                .expect(200);
            return request(app.getHttpServer())
                .get('/questions/' + createdQuestionId)
                .expect(404);
        });
        it('returns 404', async () => {
            await request(app.getHttpServer())
                .get(`/questions/${createdQuestionId}?include-deleted=true`)
                .expect(404);
        });
    });
});

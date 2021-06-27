import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { SourceModule } from '../src/source/source.module';
import { ConfigModule } from '@nestjs/config';
import { getModelToken, SequelizeModule } from '@nestjs/sequelize';
import { QuestionModule } from '../src/question/question.module';
import { LoggerModule } from '../src/common/logger/logger.module';
import { Question } from '../src/question/entities/question.entity';

process.env.AUTH_DISABLE = 'true';

describe('SourceController (e2e)', () => {
    let app: INestApplication;
    let questionRepository: typeof Question;

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
                SourceModule,
                QuestionModule,
                LoggerModule.register({ silent: true }),
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        questionRepository = moduleFixture.get<typeof Question>(
            getModelToken(Question),
        );
        app.useGlobalPipes(new ValidationPipe({ transform: true }));
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    const sourcesToCreate = [
        {
            name: 'test',
        },
        {
            name: 'tost',
        },
    ];
    let createdSourceId = '';
    let createdQuestions;

    describe('GET "/"', () => {
        it('returns 404', () => {
            return request(app.getHttpServer()).get('/').expect(404);
        });
    });

    describe('POST "/sources"', () => {
        it('returns a 400 error on invalid payload (name missing)', () => {
            return request(app.getHttpServer())
                .post('/sources')
                .send([{}])
                .expect(400);
        });
        it('returns a 400 error on invalid payload (object instead of an array)', () => {
            return request(app.getHttpServer())
                .post('/sources')
                .send({})
                .expect(400);
        });
        it('returns a 400 error on invalid payload (no payload)', () => {
            return request(app.getHttpServer())
                .post('/sources')
                .send()
                .expect(400);
        });
        it('creates a source', () => {
            return request(app.getHttpServer())
                .post('/sources')
                .send(sourcesToCreate)
                .expect(201)
                .then((res) => {
                    createdSourceId = res.body[0].id;
                    expect(res.body[0].name).toEqual(sourcesToCreate[0].name);
                    expect(res.body[1].name).toEqual(sourcesToCreate[1].name);
                });
        });
        it('returns 409 on duplicate name', () => {
            return request(app.getHttpServer())
                .post('/sources')
                .send(sourcesToCreate)
                .expect(409);
        });
    });

    describe('GET "/sources"', () => {
        it('returns an array with proper payload', async () => {
            createdQuestions = await questionRepository.bulkCreate([
                {
                    name: 'test',
                    regexSequence: 'tost',
                    tagExtractionScript: 'test',
                    tagBubbleMapping: { test: 'tost' },
                    SourceId: createdSourceId,
                },
            ]);
            const res = await request(app.getHttpServer())
                .get('/sources')
                .expect(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body[0].id).toEqual(createdSourceId);
            expect(res.body[0].name).toEqual(sourcesToCreate[0].name);
            expect(res.body[1].name).toEqual(sourcesToCreate[1].name);
            expect(res.body[0].questions).toBeUndefined();
        });
        it('returns an array with questions in the payload', async () => {
            const res = await request(app.getHttpServer())
                .get('/sources?with-questions=true')
                .expect(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body[0].id).toEqual(createdSourceId);
            expect(res.body[0].name).toEqual(sourcesToCreate[0].name);
            expect(res.body[1].name).toEqual(sourcesToCreate[1].name);
            expect(res.body[0].questions[0].id).toEqual(
                createdQuestions[0].id,
            );
            expect(res.body[0].questions[0].name).toEqual('test');
        });
    });

    describe('GET "/sources/:id"', () => {
        it('returns 400 on malformed id', () => {
            return request(app.getHttpServer())
                .get('/sources/malformed-id')
                .expect(400);
        });
        it('returns 404 on non-existent id', () => {
            return request(app.getHttpServer())
                .get('/sources/5fa2d83a-5c5f-4c9b-9759-7f08415791f1')
                .expect(404);
        });
        it('returns a single source', () => {
            return request(app.getHttpServer())
                .get('/sources/' + createdSourceId)
                .expect(200)
                .then((res) => {
                    expect(res.body.id).toEqual(createdSourceId);
                    expect(res.body.name).toEqual(sourcesToCreate[0].name);
                });
        });
    });

    describe('PATCH "/sources/:id"', () => {
        it('returns 400 on malformed id', () => {
            return request(app.getHttpServer())
                .patch('/sources/malformed-id')
                .expect(400);
        });
        it('returns 404 on non-existent id', () => {
            return request(app.getHttpServer())
                .patch('/sources/5fa2d83a-5c5f-4c9b-9759-7f08415791f1')
                .send({ name: 'new name' })
                .expect(404);
        });
        it('returns 409 on duplicate name', () => {
            return request(app.getHttpServer())
                .patch('/sources/' + createdSourceId)
                .send(sourcesToCreate[1])
                .expect(409);
        });
        it('returns a modified source', () => {
            return request(app.getHttpServer())
                .patch('/sources/' + createdSourceId)
                .send({ name: 'new name' })
                .expect(200)
                .then((res) => {
                    expect(res.body.id).toEqual(createdSourceId);
                    expect(res.body.name).toEqual('new name');
                });
        });
    });

    describe('DELETE "/sources/:id"', () => {
        it('returns 400 on malformed id', () => {
            return request(app.getHttpServer())
                .get('/sources/malformed-id')
                .expect(400);
        });
        it('returns 404 on non-existent id', () => {
            return request(app.getHttpServer())
                .get('/sources/5fa2d83a-5c5f-4c9b-9759-7f08415791f1')
                .expect(404);
        });
        it('returns 400 if there are questions linked to the source', async () => {
            await request(app.getHttpServer())
                .delete('/sources/' + createdSourceId)
                .expect(400);
        });
        it('deletes a source', async () => {
            await questionRepository.destroy({
                where: { id: createdQuestions[0].id },
                force: true,
            });
            await request(app.getHttpServer())
                .delete('/sources/' + createdSourceId)
                .expect(200);
            return request(app.getHttpServer())
                .get('/sources/' + createdSourceId)
                .expect(404);
        });
        it('returns the soft deleted source', async () => {
            const res = await request(app.getHttpServer())
                .get(`/sources/${createdSourceId}?include-deleted=true`)
                .expect(200);
            expect(res.body.id).toEqual(createdSourceId);
            expect(res.body.name).toEqual(
                `new name (deleted)_${createdSourceId}`,
            );
            expect(res.body.deletedAt).toBeTruthy();
        });
    });

    describe('PATCH "/sources/:id?restore=true"', () => {
        it('restores a source', async () => {
            const res = await request(app.getHttpServer())
                .patch(`/sources/${createdSourceId}?restore=true`)
                .expect(200);
            expect(res.body.id).toEqual(createdSourceId);
            expect(res.body.name).toEqual('new name');
            expect(res.body.deletedAt).toBeNull();
        });
        it('returns the restored source', async () => {
            const res = await request(app.getHttpServer())
                .get(`/sources/${createdSourceId}`)
                .expect(200);
            expect(res.body.id).toEqual(createdSourceId);
            expect(res.body.name).toEqual('new name');
            expect(res.body.deletedAt).toBeNull();
        });
    });

    describe('DELETE "/sources/:id?force=true"', () => {
        it('hard deletes a source', async () => {
            await request(app.getHttpServer())
                .delete(`/sources/${createdSourceId}?force=true`)
                .expect(200);
            return request(app.getHttpServer())
                .get('/sources/' + createdSourceId)
                .expect(404);
        });
        it('returns 404', async () => {
            await request(app.getHttpServer())
                .get(`/sources/${createdSourceId}?include-deleted=true`)
                .expect(404);
        });
    });
});

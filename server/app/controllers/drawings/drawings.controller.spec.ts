import { expect } from 'chai';
import 'reflect-metadata';
import * as supertest from 'supertest';
import { DrawingForm } from '../../../../common/communication/drawing-form';
import { Stubbed, testingContainer } from '../../../test/test-utils';
import { Application } from '../../app';
import { DrawingsService } from '../../services/drawings/drawings.service';
import { TYPES } from '../../types';

const HTTP_STATUS_OK = 200;
const HTTP_STATUS_NO_CONTENT = 204;
const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;
const HTTP_STATUS_NOT_FOUND = 404;
const HTTP_STATUS_BAD_GATEWAY = 502;
const HTTP_STATUS_CREATED = 201;

// tslint:disable: no-any
describe('DrawingsController', () => {
    let drawingsService: Stubbed<DrawingsService>;
    let app: Express.Application;

    const TAGS_MOCK: string[] = ['one', 'two', 'three', 'four', 'five', 'six'];
    const drawingForms: DrawingForm[] = [
        { id: '1', name: 'drawingOne', tags: TAGS_MOCK, drawingData: 'base64' },
        { id: '2', name: 'drawingTwo', tags: TAGS_MOCK, drawingData: 'base64' },
        { id: '3', name: 'drawingThree', tags: TAGS_MOCK, drawingData: 'base64' },
    ];

    beforeEach(async () => {
        const [container, sandbox] = await testingContainer();
        container.rebind(TYPES.DrawingsService).toConstantValue({
            deleteDrawing: sandbox.stub().resolves(),
            getDrawings: sandbox.stub().resolves(drawingForms),
            storeDrawing: sandbox.stub().resolves(),
        });
        drawingsService = container.get(TYPES.DrawingsService);
        app = container.get<Application>(TYPES.Application).app;
    });

    it('should return status 204 on valid delete request to /delete/:id', (done) => {
        drawingsService.deleteDrawing.resolves({});
        supertest(app).delete('/api/database/delete/1').expect(HTTP_STATUS_NO_CONTENT, done);
    });

    it('should return status 500 when a drawing is not found on the server on delete request to /delete/:id', async () => {
        drawingsService.deleteDrawing.rejects(new Error('FILE_NOT_FOUND'));
        return supertest(app).delete('/api/database/delete/1').expect(HTTP_STATUS_INTERNAL_SERVER_ERROR);
    });

    it('should return status 404 when the drawing info is not found on database on delete request to /delete/:id', async () => {
        drawingsService.deleteDrawing.rejects(new Error('NOT_ON_DATABASE'));
        return supertest(app).delete('/api/database/delete/1').expect(HTTP_STATUS_NOT_FOUND);
    });

    it('should return status 502 when drawings service has failed to delete the drawing on delete request to /delete/:id', async () => {
        drawingsService.deleteDrawing.rejects(new Error('FAILED_TO_DELETE_DRAWING'));
        return supertest(app).delete('/api/database/delete/1').expect(HTTP_STATUS_BAD_GATEWAY);
    });

    // TODO: last test not passing
    it('should return a list of drawings from drawings service on valid get request', async () => {
        drawingsService.getDrawings.resolves(drawingForms);

        return supertest(app)
            .get('/api/database')
            .expect(HTTP_STATUS_OK)
            .then((response: any) => {
                expect(response.body).to.deep.equal(drawingForms);
            });
    });

    it('should store a drawing on valid post request to /upload', async () => {
        return supertest(app).post('/api/database/upload').send(drawingForms[0]).set('Accept', 'application/json').expect(HTTP_STATUS_CREATED);
    });

    it('should return status 500 when the server failed to save the drawing on post request to /upload', async () => {
        drawingsService.storeDrawing.rejects(new Error('FAILED_TO_SAVE_DRAWING'));
        return supertest(app).post('/api/database/upload').expect(HTTP_STATUS_INTERNAL_SERVER_ERROR);
    });

    it('should return status 502 when a database error occured on post request to /upload', async () => {
        drawingsService.storeDrawing.rejects(new Error('DATABASE_ERROR'));
        return supertest(app).post('/api/database/upload').expect(HTTP_STATUS_BAD_GATEWAY);
    });
});

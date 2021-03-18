// import 'reflect-metadata';
// import { Stubbed, testingContainer } from '../../../test/test-utils';
// import { Application } from '../../app';
// import { DrawingsService } from '../../services/drawings/drawings.service';
// import { TYPES } from '../../types';

// // tslint:disable:no-any
// const HTTP_STATUS_OK = 200;
// const HTTP_STATUS_CREATED = 201;

// describe('IndexController', () => {
//     let drawingsService: Stubbed<DrawingsService>;
//     let app: Express.Application;

// beforeEach(async () => {
//     const [container, sandbox] = await testingContainer();
//     container.rebind(TYPES.DrawingsService).toConstantValue({
//         deleteDrawing: sandbox.stub().resolves(),
//     });
//     drawingsService = container.get(TYPES.DrawingsService);
//     app = container.get<Application>(TYPES.Application).app;
// });

//     it('#delete should return message from drawings service on valid delete request', async () => {});

//     it('#delete should return an error message from drawings service when no file is found', async () => {});

//     it('#delete should return an error message from drawings service when the file isnt on the database', async () => {});

//     it('#delete should return an error message from drawings service when theres an error deleting', async () => {});

//     it('#get should return a message from drawings service on valid get request', async () => {});

//     it('#post should return a message from drawings service on valid post request', async () => {});

//     it('#post should return an error message from drawings service when theres an error saving', async () => {});

//     it('#post should return an error message from drawings service when theres an error with the database', async () => {});

// it('should return message from index service on valid get request to root', async () => {
//     return supertest(app)
//         .get('/api/index')
//         .expect(HTTP_STATUS_OK)
//         .then((response: any) => {
//             expect(response.body).to.deep.equal(baseMessage);
//         });
// });

// it('should return message from index service on valid get request to about route', async () => {
//     const aboutMessage = { ...baseMessage, title: 'About' };
//     drawingsService.about.returns(aboutMessage);
//     return supertest(app)
//         .get('/api/index/about')
//         .expect(HTTP_STATUS_OK)
//         .then((response: any) => {
//             expect(response.body).to.deep.equal(aboutMessage);
//         });
// });

// it('should store message in the array on valid post request to /send', async () => {
//     const message: Message = { title: 'Hello', body: 'World' };
//     return supertest(app).post('/api/index/send').send(message).set('Accept', 'application/json').expect(HTTP_STATUS_CREATED);
// });

// it('should return an arrat of messages on valid get request to /all', async () => {
//     indexService.getAllMessages.returns([baseMessage, baseMessage]);
//     return supertest(app)
//         .get('/api/index/all')
//         .expect(HTTP_STATUS_OK)
//         .then((response: any) => {
//             expect(response.body).to.deep.equal([baseMessage, baseMessage]);
//         });
// });
// });

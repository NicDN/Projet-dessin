// tslint:disable: no-string-literal
// tslint:disable: no-unused-expression
import { DrawingForm } from '@common/communication/drawing-form';
import { expect } from 'chai';
// import { taggedConstraint } from 'inversify';
// import { Db } from 'mongodb';
// import { MongoMemoryServer } from 'mongodb-memory-server';
import 'reflect-metadata';
// import { isMainThread } from 'worker_threads';
import { Stubbed, testingContainer } from '../../../test/test-utils';
import { TYPES } from '../../types';
import { DatabaseService } from '../database/database.service';
import { DatabaseServiceMock } from '../database/database.service.mock';
import { DrawingsService } from './drawings.service';

describe('Index service', () => {
    let databaseService: Stubbed<DatabaseService>;
    let drawingsService: DrawingsService;
    let databaseServiceMock: DatabaseServiceMock;

    beforeEach(async () => {
        databaseServiceMock = new DatabaseServiceMock();
        // il faut stub this.databaseService.database.collection(DATABASE_COLLECTION)
        const [container, sandbox] = await testingContainer();
        container.rebind(TYPES.DatabaseService).toConstantValue({
            start: sandbox.stub().resolves(databaseServiceMock.start()),
            closeConnection: sandbox.stub().resolves(databaseServiceMock.closeConnection()),
            database: sandbox.stub().resolves(databaseServiceMock.database),
        });
        databaseService = container.get(TYPES.DrawingsService);

        drawingsService = new DrawingsService(databaseService);
    });

    it('should return this.databaseService.database.collection when #collection is called', async () => {});

    it('should throw an error when #storeDrawing doesnt have a valid DrawingForm', async () => {});

    it('should store the drawing when #storeDrawing have a valid DrawingForm', async () => {});

    it('should throw an error when #storeDrawing doesnt have a valid directory', async () => {});

    it('should throw an error when #storeDrawing cant communicate with the database', async () => {});

    it('should return all the validDrawings when #getDrawings is called', async () => {});

    it('should return an empty array when #getDrawings is called an theres no drawing in the collection', async () => {});

    it('should throw an error when #getDrawings have a connection problem with the database', async () => {});

    it('should filter by tags when #getDrawings get at least one tag', async () => {});

    it('#filterDrawingsByTags should return every DrawingForms with a valid tag one time', async () => {
        const EXPECTED_FORM: DrawingForm = { id: '', name: 'Agatha', tags: ['jesus', 'pain naan'], drawingData: '' };
        const FORMS: DrawingForm[] = [{ id: '', name: 'OogaBooga', tags: ['houlala', 'bongo'], drawingData: '' }, EXPECTED_FORM];
        const SEARCH_TAGS = ['jesus'];

        expect(drawingsService['filterDrawingsByTags'](FORMS, SEARCH_TAGS)).to.equal(EXPECTED_FORM);
    });

    it('#filterDrawingsByTags should return every DrawingForms with at least one of the valid tags one time', async () => {
        const EXPECTED_FORMS: DrawingForm[] = [
            { id: '', name: 'OogaBooga', tags: ['houlala', 'bongo'], drawingData: '' },
            { id: '', name: 'Agatha', tags: ['jesus', 'pain naan'], drawingData: '' },
        ];
        const SEARCH_TAGS = ['jesus', 'houlala'];

        expect(drawingsService['filterDrawingsByTags'](EXPECTED_FORMS, SEARCH_TAGS)).to.equal(EXPECTED_FORMS);
    });

    it('#filterDrawingsByTags should return an empty array if theres no DrawingForm', async () => {});

    it('#filterDrawingsByTags should return an empty array if theres no DrawingForm with a valid tag', async () => {});

    it('#getValidDrawings should return an array of 3 DrawingForms', async () => {});

    it('#getValidDrawings should return nothing if it cant read one of the drawingForms in the directory', async () => {});

    it('should delete a drawing on the server when #deleteDrawing have a valid id', async () => {});

    it('should throw an error when #deleteDrawing cant find the file to delete', async () => {});

    it('#deleteDrawing should throw an error when the infos of the drawing to delete arent on the database', async () => {});

    it('#deleteDrawing should throw an error when theres an problem with the database', async () => {});

    it('should return true when #validateDrawing get a valid drawing', async () => {
        const drawingForm: DrawingForm = { id: '', name: 'OogaBooga', tags: [], drawingData: '' };
        expect(drawingsService['validateDrawing'](drawingForm)).to.be.true;
    });

    it('should return false when #validateDrawing get a drawing with an unvalid tag', async () => {
        const drawingForm: DrawingForm = { id: '', name: 'OogaBooga', tags: ['a'], drawingData: '' };
        expect(drawingsService['validateDrawing'](drawingForm)).to.be.false;
    });

    it('should return false when #validateDrawing get a drawing without a name', async () => {
        const drawingForm: DrawingForm = { id: '', name: '', tags: [], drawingData: '' };
        expect(drawingsService['validateDrawing'](drawingForm)).to.be.false;
    });

    it('should return true when #validateTags have only valid tags', async () => {
        const tags: string[] = ['ans', 'babushka'];
        expect(drawingsService['validateTags'](tags)).to.be.true;
    });

    it('should return true when #validateTags has no tags', async () => {
        const tags: string[] = [];
        expect(drawingsService['validateTags'](tags)).to.be.true;
    });

    it('should return false when #validateTags have at least one too long tag', async () => {
        const tags: string[] = ['a'];
        expect(drawingsService['validateTags'](tags)).to.be.false;
    });

    it('should return false when #validateTags have at least one too short tag', async () => {
        const tags: string[] = ['abcdefghijklmnopqrstuvwxyz'];
        expect(drawingsService['validateTags'](tags)).to.be.false;
    });

    it('should return false when #validateTags have at least one tag with numbers', async () => {
        const tags: string[] = ['xXx.N00bM@st3r69.xXx'];
        expect(drawingsService['validateTags'](tags)).to.be.false;
    });

    it('should write a file in the local directory when #writeFile get a valid fileName and string', async () => {});

    it('should throw an error when #writeFile cant write the file', async () => {});

    it('should return a valid string when #readFile get a valid name', async () => {});

    it('should return nothing if #readFile cant read the asked file', async () => {});
});

import { DrawingForm } from '@common/communication/drawing-form';
import * as chai from 'chai';
// tslint:disable-next-line: no-duplicate-imports
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as fs from 'fs';
import { MongoClient } from 'mongodb';
import 'reflect-metadata';
import { restore, spy, stub } from 'sinon';
import { DrawingData } from '../../../classes/drawingData';
import { DatabaseServiceMock } from '../database/database.service.mock';
import { DrawingsService } from './drawings.service';
chai.use(chaiAsPromised);

// tslint:disable: no-any
// tslint:disable: no-string-literal
// tslint:disable: no-unused-expression
describe('Drawings service', () => {
    let drawingsService: DrawingsService;
    let databaseServiceMock: DatabaseServiceMock;
    let client: MongoClient;
    let testDrawingData: DrawingData;
    let baseDrawingForm: DrawingForm;
    let testID: string;

    const DRAWINGS_EXPECTED_LENGTH = 3;
    const DRAWINGS_INSERTED: DrawingForm[] = [
        {
            id: '0',
            name: 'Gabriel',
            tags: ['hello', 'world'],
            drawingData: '',
        },
        {
            id: '1',
            name: 'Nicolas',
            tags: ['Bonjour', 'hiii'],
            drawingData: '',
        },
        {
            id: '2',
            name: 'Josquin',
            tags: ['wazza', 'yooooo'],
            drawingData: '',
        },
        {
            id: '3',
            name: 'Adnane',
            tags: ['Danke', 'Schon'],
            drawingData: '',
        },
    ];

    beforeEach(async () => {
        databaseServiceMock = new DatabaseServiceMock();

        client = (await databaseServiceMock.start()) as MongoClient;

        testDrawingData = {
            name: 'test',
            tags: ['hello', 'world'],
        };

        baseDrawingForm = {
            id: '-1',
            name: 'base drawing',
            tags: ['base', 'drawing'],
            drawingData: '',
        };

        drawingsService = new DrawingsService(databaseServiceMock as any);

        await drawingsService.collection.insertOne(testDrawingData).then(async (data) => {
            testID = data.insertedId.toString();
        });
    });

    afterEach(async () => {
        restore();
        await databaseServiceMock.closeConnection();
    });

    it('should store a drawing correctly if the drawing has a valid name and tag', async () => {
        const newDrawing: DrawingForm = {
            id: '-1',
            name: 'new Drawing',
            tags: ['new', 'drawing'],
            drawingData: '',
        };
        stub(drawingsService, 'writeFile' as any).resolves();
        await drawingsService.storeDrawing(newDrawing);
        const drawings = await drawingsService.collection.find({}).toArray();
        expect(drawings.length).to.equal(2);
    });

    it('should not store a new drawing if it does not have a valid name and tags', async () => {
        const newDrawing: DrawingForm = {
            id: '-1',
            name: '', // invalid name
            tags: ['12345', 'a'], // invalid tags
            drawingData: '',
        };

        try {
            await drawingsService.storeDrawing(newDrawing);
        } catch {
            const drawings = await drawingsService.collection.find({}).toArray();
            expect(drawings.length).to.equal(1);
        }
    });

    it('#storeDrawing should throw an error when #writeFile throws a error', async () => {
        const failedToSaveDrawingError: Error = new Error('FAILED_TO_SAVE_DRAWING');

        stub(drawingsService, 'writeFile' as any).rejects(failedToSaveDrawingError);
        try {
            await drawingsService.storeDrawing(baseDrawingForm);
        } catch (error) {
            expect(error.message).to.deep.equal('FAILED_TO_SAVE_DRAWING');
        }
    });

    it('#storeDrawing should throw an error when #insertOne throws a error', async () => {
        await client.close();
        try {
            await drawingsService.storeDrawing(baseDrawingForm);
        } catch (error) {
            expect(error.message).to.eql('DATABASE_ERROR');
        }
    });

    it('should get all drawings from DB', async () => {
        stub(drawingsService, 'getValidDrawings' as any).resolvesArg(0);
        const drawings: DrawingForm[] = await drawingsService.getDrawings([], 0);
        expect(drawings.length).to.equal(1);
        expect(drawings[0].name).to.deep.equal(testDrawingData.name);
        expect(drawings[0].tags).to.deep.equal(testDrawingData.tags);
    });

    it('should return an empty array when #getDrawings is called an theres no drawing in the collection', async () => {
        databaseServiceMock = new DatabaseServiceMock();

        drawingsService = new DrawingsService(databaseServiceMock as any);
        await databaseServiceMock.start();

        stub(drawingsService, 'getValidDrawings' as any).resolvesArg(0);
        const drawings: DrawingForm[] = await drawingsService.getDrawings([], 0);
        expect(drawings.length).to.equal(0);
    });

    it('#getDrawings should throw an error  when #find throws a error', async () => {
        client.close();
        try {
            stub(drawingsService, 'getValidDrawings' as any).resolvesArg(0);
            await drawingsService.getDrawings([], 0);
        } catch (error) {
            expect(error.message).to.eql('DATABASE_ERROR');
        }
    });

    it('should filter by tags when the tags provided contains at least one tag', async () => {
        stub(drawingsService, 'getValidDrawings' as any).resolvesArg(0);
        const filterDrawingsByTagsStub = stub(drawingsService, 'filterDrawingsByTags' as any).returnsArg(0);
        const drawings: DrawingForm[] = await drawingsService.getDrawings(['tag'], 0);

        expect(filterDrawingsByTagsStub.callCount === 1).to.be.true;
        expect(drawings.length).to.equal(1);
        expect(drawings[0].name).to.deep.equal(testDrawingData.name);
        expect(drawings[0].tags).to.deep.equal(testDrawingData.tags);
    });

    it('#filterDrawingsByTags should return every DrawingForms with a valid tag one time', async () => {
        const EXPECTED_FORM: DrawingForm = { id: '', name: 'Agatha', tags: ['jesus', 'pain naan'], drawingData: '' };
        const FORMS: DrawingForm[] = [{ id: '', name: 'OogaBooga', tags: ['houlala', 'bongo'], drawingData: '' }, EXPECTED_FORM];
        const SEARCH_TAGS = ['jesus'];

        expect(drawingsService['filterDrawingsByTags'](FORMS, SEARCH_TAGS)).to.eql([EXPECTED_FORM]);
    });

    it('#filterDrawingsByTags should return every DrawingForms with at least one of the valid tags one time', async () => {
        const EXPECTED_FORMS: DrawingForm[] = [
            { id: '', name: 'OogaBooga', tags: ['houlala', 'bongo'], drawingData: '' },
            { id: '', name: 'Agatha', tags: ['jesus', 'pain naan'], drawingData: '' },
        ];
        const SEARCH_TAGS = ['jesus', 'houlala'];

        expect(drawingsService['filterDrawingsByTags'](EXPECTED_FORMS.reverse(), SEARCH_TAGS)).to.eql(EXPECTED_FORMS);
    });

    it('#filterDrawingsByTags should return an empty array if theres no DrawingForm', async () => {
        const EXPECTED_FORMS: DrawingForm[] = [];
        const SEARCH_TAGS = ['jesus', 'houlala'];

        expect(drawingsService['filterDrawingsByTags'](EXPECTED_FORMS.reverse(), SEARCH_TAGS)).to.eql([]);
    });

    it('#filterDrawingsByTags should return an empty array if theres no DrawingForm with a valid tag', async () => {
        const EXPECTED_FORMS: DrawingForm[] = [
            { id: '', name: 'Roger', tags: ['autre', 'mauvais'], drawingData: '' },
            { id: '', name: 'jean', tags: ['Hallah', 'pas bon'], drawingData: '' },
        ];
        const SEARCH_TAGS = ['jesus', 'houlala'];

        expect(drawingsService['filterDrawingsByTags'](EXPECTED_FORMS.reverse(), SEARCH_TAGS)).to.eql([]);
    });

    it('#getValidDrawings should return the correct array of valid drawings at index 0', async () => {
        stub(drawingsService, 'readFile' as any).resolves('abcd');

        const validDrawings: DrawingForm[] = await drawingsService['getValidDrawings'](DRAWINGS_INSERTED, 0);

        expect(validDrawings.length).to.equal(DRAWINGS_EXPECTED_LENGTH);
        expect(validDrawings[0]).to.equal(DRAWINGS_INSERTED[0]);
        expect(validDrawings[1]).to.equal(DRAWINGS_INSERTED[1]);
        expect(validDrawings[2]).to.equal(DRAWINGS_INSERTED[2]);
    });

    it('#getValidDrawings should return the correct array of valid drawings at index 1', async () => {
        stub(drawingsService, 'readFile' as any).resolves('abcd');

        const validDrawings: DrawingForm[] = await drawingsService['getValidDrawings'](DRAWINGS_INSERTED, 1);

        expect(validDrawings.length).to.equal(DRAWINGS_EXPECTED_LENGTH);
        expect(validDrawings[0]).to.equal(DRAWINGS_INSERTED[1]);
        expect(validDrawings[1]).to.equal(DRAWINGS_INSERTED[2]);
        // tslint:disable-next-line: no-magic-numbers
        expect(validDrawings[2]).to.equal(DRAWINGS_INSERTED[3]);
    });

    it('#getValidDrawings should return the correct array of valid drawings at index length - 1', async () => {
        stub(drawingsService, 'readFile' as any).resolves('abcd');

        const validDrawings: DrawingForm[] = await drawingsService['getValidDrawings'](DRAWINGS_INSERTED, DRAWINGS_INSERTED.length - 1);

        expect(validDrawings.length).to.equal(DRAWINGS_EXPECTED_LENGTH);
        // tslint:disable-next-line: no-magic-numbers
        expect(validDrawings[0]).to.equal(DRAWINGS_INSERTED[3]);
        expect(validDrawings[1]).to.equal(DRAWINGS_INSERTED[0]);
        expect(validDrawings[2]).to.equal(DRAWINGS_INSERTED[1]);
    });

    it('#getValidDrawings should return an array of less then 3 drawings if theres not enough drawings in the server or database', async () => {
        const drawingsLength2 = [DRAWINGS_INSERTED[0]];
        stub(drawingsService, 'readFile' as any).resolves('abcd');

        const validDrawings: DrawingForm[] = await drawingsService['getValidDrawings'](drawingsLength2, 0);

        expect(validDrawings.length).to.equal(1);
        expect(drawingsLength2[0]).to.equal(DRAWINGS_INSERTED[0]);
    });

    it('#getValidDrawings should return an empty array if it get no drawings', async () => {
        stub(drawingsService, 'readFile' as any).resolves('abcd');

        const validDrawings: DrawingForm[] = await drawingsService['getValidDrawings']([], 0);

        expect(validDrawings).to.deep.equal([]);
    });

    it('#getValidDrawings should not return valid drawings if #readFile theow a error', async () => {
        stub(drawingsService, 'readFile' as any).rejects();
        let validDrawings: DrawingForm[] = DRAWINGS_INSERTED;

        validDrawings = await drawingsService['getValidDrawings'](DRAWINGS_INSERTED, 0);

        expect(validDrawings).to.deep.equal([]);
    });

    it('should delete a drawing on the server when the drawing exist on database', async () => {
        const unlinkSyncStub = stub(fs, 'unlinkSync');
        await drawingsService.deleteDrawing(testID); // existing id
        const drawings = await drawingsService.collection.find({}).toArray();
        expect(unlinkSyncStub.calledOnce).to.be.true;
        expect(drawings.length).to.equal(0);
    });

    it('should throw an error when #deleteDrawing cant find the file to delete', async () => {
        try {
            await drawingsService.deleteDrawing(testID);
        } catch (error) {
            expect(error.message).to.deep.equal('FILE_NOT_FOUND');
        }
    });

    it('#deleteDrawing should throw an error when the drawing does not exist on the the database', async () => {
        stub(fs, 'unlinkSync');
        try {
            await drawingsService.deleteDrawing('60564adf6dd63e715fb8d8fa'); // non existing id
        } catch (error) {
            expect(error.message).to.eql('NOT_ON_DATABASE');
        }
    });

    it('#deleteDrawing should throw an error when #findOneAndDelete throws a error', async () => {
        client.close();
        stub(fs, 'unlinkSync');
        try {
            await drawingsService.deleteDrawing(testID);
        } catch (error) {
            expect(error.message).to.eql('FAILED_TO_DELETE_DRAWING');
        }
    });

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

    it('should write a file in the local directory when #writeFile get a valid fileName and string', async () => {
        const FILENAME = drawingsService['DRAWINGS_DIRECTORY'] + '/bruh';
        const CONTENT = 'adsf';
        const fsWriteFileSpy = spy(fs, 'writeFile');

        await drawingsService['writeFile'](FILENAME, CONTENT);
        fs.unlinkSync(FILENAME);
        expect(fsWriteFileSpy.calledOnce);
    });

    it('should throw an error when #writeFile cant write the file', async () => {
        const FILENAME = 'D:`//..w.`w.e2-e-2e0=932-0r32fdsfdsc';
        const CONTENT = 'adsf';
        const fsWriteFileSpy = spy(fs, 'writeFile');

        try {
            await drawingsService['writeFile'](FILENAME, CONTENT);
        } catch {
            expect(fsWriteFileSpy.calledOnce);
        }
    });

    it('should return a valid string when #readFile get a valid name', async () => {
        const FILENAME = drawingsService['DRAWINGS_DIRECTORY'] + '/bruh';
        const CONTENT = 'adsf';
        fs.writeFileSync(FILENAME, CONTENT);

        const file = await drawingsService['readFile'](FILENAME);
        fs.unlinkSync(FILENAME);
        expect(file).to.eql(CONTENT);
    });

    it('should return empty string if #readFile cant read the asked file', async () => {
        const FILENAME = drawingsService['DRAWINGS_DIRECTORY'] + '/bruh';
        const fsReadFileSpy = spy(fs, 'readFile');
        let file = '';

        try {
            file = await drawingsService['readFile'](FILENAME);
        } catch {
            expect(file).to.eql('');
            expect(fsReadFileSpy.calledOnce);
        }
    });
    // tslint:disable-next-line: max-file-line-count
});

// tslint:disable: no-string-literal
import { fail } from 'assert';
import * as chai from 'chai';
// tslint:disable-next-line: no-duplicate-imports
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { MongoMemoryServer } from 'mongodb-memory-server';
import 'reflect-metadata';
import { DatabaseService } from './database.service';
chai.use(chaiAsPromised);

// tslint:disable: no-unused-expression
describe('Database service', () => {
    let databaseService: DatabaseService;
    let mongoServer: MongoMemoryServer;

    beforeEach(async () => {
        databaseService = new DatabaseService();
        mongoServer = new MongoMemoryServer();
    });

    afterEach(async () => {
        if (databaseService['client'] && databaseService['client'].isConnected()) {
            await databaseService['client'].close();
        }
    });

    it('#start without passing url should still connect to the databse', async () => {
        await databaseService.start();
        expect(databaseService['client']).to.not.be.undefined;
        expect(databaseService['db'].databaseName).to.equal('polydessin');
    });

    it('#start should connect to the database when start is called', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        expect(databaseService['client']).to.not.be.undefined;
        expect(databaseService['db'].databaseName).to.equal('polydessin');
    });

    it('should no longer be connected if close is called', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        await databaseService.closeConnection();
        expect(databaseService['client'].isConnected()).to.be.false;
    });

    it('should not connect to the database when start is called with wrong URL', async () => {
        try {
            await databaseService.start('WRONG URL');
            fail();
        } catch {
            expect(databaseService['client']).to.be.undefined;
        }
    });

    it('should return this.db when #database is called', async () => {
        expect(databaseService.database).to.equals(databaseService['db']);
    });
});

// tslint:disable: no-string-literal
import * as chai from 'chai';
// tslint:disable-next-line: no-duplicate-imports
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import 'reflect-metadata';
import { spy, stub } from 'sinon';
import { DatabaseService } from './database.service';
chai.use(chaiAsPromised); // this allows us to test for rejection

describe('Database service', () => {
    let databaseService: DatabaseService;
    let mongoServer: MongoMemoryServer;

    beforeEach(async () => {
        databaseService = new DatabaseService();

        // Start a local test server
        mongoServer = new MongoMemoryServer();
        await mongoServer.getUri();
    });

    afterEach(async () => {
        if (databaseService['client'] && databaseService['client'].isConnected()) {
            await databaseService['client'].close();
        }
    });

    // NB : We dont test the case when DATABASE_URL is used in order to not connect to the real database
    it('#start should connect to the database when start is called', async () => {
        // Reconnect to local server
        await databaseService.start();
        // tslint:disable-next-line: no-unused-expression
        expect(databaseService['client']).to.not.be.undefined;
        expect(databaseService['db'].databaseName).to.equal('polydessin');
    });

    it('#start should throw an error when the database is closed', async () => {
        // Try to reconnect to local server
        mongoServer.stop();
        try {
            databaseService.start();
        } catch {
            // tslint:disable-next-line: no-unused-expression
            expect(databaseService['client']).to.be.undefined;
        }
    });

    it('#start should throw an error when connection fail', async () => {
        const clientConnectStub = stub(MongoClient, 'connect').returns();
        const startSpy = spy(databaseService, 'start');
        expect(startSpy).to.throw();
    });

    it('should no longer be connected if close is called', async () => {
        await databaseService.start();
        await databaseService.closeConnection();
        // tslint:disable-next-line: no-unused-expression
        expect(databaseService['client'].isConnected()).to.be.false;
    });

    it('should return this.db when #database is called', async () => {});
});

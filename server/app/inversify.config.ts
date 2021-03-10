import { DrawingsController } from '@app/controllers/drawings/drawings.controller';
import { DrawingsService } from '@app/services/drawings/drawings.service';
import { Container } from 'inversify';
import { Application } from './app';
import { Server } from './server';
import { DatabaseService } from './services/database/database.service';
import { TYPES } from './types';

export const containerBootstrapper: () => Promise<Container> = async () => {
    const container: Container = new Container();

    container.bind(TYPES.Server).to(Server);
    container.bind(TYPES.Application).to(Application);

    // for the project
    container.bind(TYPES.DrawingsController).to(DrawingsController);
    container.bind(TYPES.DatabaseService).to(DatabaseService).inSingletonScope();
    container.bind(TYPES.DrawingsService).to(DrawingsService);

    return container;
};

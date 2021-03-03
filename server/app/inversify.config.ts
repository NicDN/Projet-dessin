import { DateController } from '@app/controllers/date.controller';
import { DrawingsController } from '@app/controllers/drawings/drawings.controller';
import { IndexController } from '@app/controllers/index.controller';
// import { DatabaseService } from '@app/services/database/database.service';
import { DateService } from '@app/services/date.service';
import { DrawingsService } from '@app/services/drawings/drawings.service';

import { IndexService } from '@app/services/index.service';
import { Container } from 'inversify';
import { Application } from './app';
import { Server } from './server';
import { TYPES } from './types';

export const containerBootstrapper: () => Promise<Container> = async () => {
    const container: Container = new Container();

    container.bind(TYPES.Server).to(Server);
    container.bind(TYPES.Application).to(Application);

    container.bind(TYPES.IndexController).to(IndexController);
    container.bind(TYPES.IndexService).to(IndexService);

    container.bind(TYPES.DrawingsController).to(DrawingsController);
    // container.bind(TYPES.DatabaseService).to(DatabaseService);
    container.bind(TYPES.DrawingsService).to(DrawingsService);

    container.bind(TYPES.DateController).to(DateController);
    container.bind(TYPES.DateService).to(DateService);

    return container;
};

import { TYPES } from '@app/types';
import { DrawingForm } from '@common/communication/drawingForm';
import { Message } from '@common/communication/message';
import { NextFunction, Request, Response, Router } from 'express';
import { inject, injectable } from 'inversify';
import { DatabaseService } from '../services/database.service';

const HTTP_STATUS_CREATED = 201;

@injectable()
export class DatabaseController {
    router: Router;

    constructor(@inject(TYPES.DatabaseService) private databaseService: DatabaseService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/', async (req: Request, res: Response, next: NextFunction) => {
            // Send the request to the service and send the response
            const time: Message = await this.databaseService.helloWorld();
            res.json(time);
        });

        this.router.get('/about', (req: Request, res: Response, next: NextFunction) => {
            // Send the request to the service and send the response
            res.json(this.databaseService.about());
        });

        this.router.post('/upload', (req: Request, res: Response, next: NextFunction) => {
            const drawingForm: DrawingForm = req.body;
            this.databaseService.storeData(drawingForm);
            res.sendStatus(HTTP_STATUS_CREATED);
        });

        this.router.get('/download', (req: Request, res: Response, next: NextFunction) => {
            res.json(this.databaseService.getData());
        });
    }
}

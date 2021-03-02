import { TYPES } from '@app/types';
import { DrawingForm } from '@common/communication/drawingForm';
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

        // TODO: use async ?
        this.router.get('/', async (req: Request, res: Response, next: NextFunction) => {
            res.json(this.databaseService.getData());
        });

        this.router.delete('/delete/:id', async (req: Request, res: Response, next: NextFunction) => {
            // this.databaseService
            //     .deleteCourse(req.params.id)
            //     .then(() => {
            //         res.sendStatus(Httpstatus.NO_CONTENT).send();
            //     })
            //     .catch((error: Error) => {
            //         res.status(Httpstatus.NOT_FOUND).send(error.message);
            //     });
            // console.log(req.params.id);
            console.log('allo');
        });

        this.router.post('/upload', (req: Request, res: Response, next: NextFunction) => {
            const drawingForm: DrawingForm = req.body;
            this.databaseService.storeData(drawingForm);
            res.sendStatus(HTTP_STATUS_CREATED);
        });
    }
}

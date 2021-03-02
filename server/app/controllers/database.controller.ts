import { TYPES } from '@app/types';
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

        // TODO: use async ?
        this.router.get('/', async (req: Request, res: Response, next: NextFunction) => {
            // Send the request to the service and send the response
            const time: Message = await this.databaseService.helloWorld();
            res.json(time);
        });

        this.router.delete('/api/index/delete/:id', async (req: Request, res: Response, next: NextFunction) => {
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
            const formData: FormData = req.body;
            this.databaseService.storeData(formData);
            res.sendStatus(HTTP_STATUS_CREATED);
        });

        this.router.get('/download', (req: Request, res: Response, next: NextFunction) => {
            res.json(this.databaseService.getData());
        });
    }
}

import { DrawingsService } from '@app/services/drawings/drawings.service';
import { TYPES } from '@app/types';
import { DrawingForm } from '@common/communication/drawingForm';
import { NextFunction, Request, Response, Router } from 'express';
import { inject, injectable } from 'inversify';

const HTTP_STATUS_CREATED = 201;

@injectable()
export class DrawingsController {
    router: Router;

    constructor(@inject(TYPES.DrawingsService) private drawingsService: DrawingsService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/', async (req: Request, res: Response, next: NextFunction) => {
            this.drawingsService.getData(req.body).then((forms) => {
                res.json(forms);
            });
        });

        // this.router.get('/tags', async (req: Request, res: Response, next: NextFunction) => {
        //     this.drawingsService.getData(req.body).then((forms) => {
        //         res.json(forms);
        //     });
        // });

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
        });

        this.router.post('/upload', (req: Request, res: Response, next: NextFunction) => {
            const drawingForm: DrawingForm = req.body;
            this.drawingsService.storeData(drawingForm);
            res.sendStatus(HTTP_STATUS_CREATED);
        });
    }
}

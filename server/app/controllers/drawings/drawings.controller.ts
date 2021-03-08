import { DrawingsService } from '@app/services/drawings/drawings.service';
import { TYPES } from '@app/types';
import { DrawingForm } from '@common/communication/drawingForm';
import { NextFunction, Request, Response, Router } from 'express';
import * as Httpstatus from 'http-status-codes';
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

        this.router.delete('/delete/:id', async (req: Request, res: Response, next: NextFunction) => {
            console.log(req.params.id);
            this.drawingsService
                .deleteDrawing(req.params.id)
                .then(() => {
                    res.sendStatus(Httpstatus.StatusCodes.NO_CONTENT);
                })
                .catch((error: Error) => {
                    res.status(Httpstatus.StatusCodes.NOT_FOUND).send(error.message);
                });
        });

        this.router.get('/', async (req: Request, res: Response, next: NextFunction) => {
            this.drawingsService.getDrawings(req.query.tags, Number(req.query.index)).then((forms) => {
                res.json(forms);
            });
        });

        this.router.post('/upload', (req: Request, res: Response, next: NextFunction) => {
            const drawingForm: DrawingForm = req.body;
            this.drawingsService.storeDrawing(drawingForm);
            res.sendStatus(HTTP_STATUS_CREATED);
        });
    }
}

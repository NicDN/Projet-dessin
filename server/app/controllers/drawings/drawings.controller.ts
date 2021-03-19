import { DrawingsService } from '@app/services/drawings/drawings.service';
import { TYPES } from '@app/types';
import { DrawingForm } from '@common/communication/drawing-form';
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
            this.drawingsService
                .deleteDrawing(req.params.id)
                .then(() => {
                    res.sendStatus(Httpstatus.StatusCodes.NO_CONTENT);
                })
                .catch((error: Error) => {
                    if (error.message === 'FILE_NOT_FOUND') {
                        res.status(Httpstatus.StatusCodes.INTERNAL_SERVER_ERROR).send();
                        return;
                    }
                    if (error.message === 'NOT_ON_DATABASE') {
                        res.status(Httpstatus.StatusCodes.NOT_FOUND).send();
                        return;
                    }
                    if (error.message === 'FAILED_TO_DELETE_DRAWING') {
                        res.status(Httpstatus.StatusCodes.BAD_GATEWAY).send();
                        return;
                    }
                    res.status(Httpstatus.StatusCodes.BAD_REQUEST).send();
                });
        });

        this.router.get('/', async (req: Request, res: Response, next: NextFunction) => {
            this.drawingsService
                .getDrawings(JSON.parse(req.query.tags || '[]'), Number(req.query.index || 0))
                .then((drawingForm) => {
                    res.json(drawingForm);
                })
                .catch((error: Error) => {
                    if (error.message === 'DATABASE_ERROR') {
                        res.status(Httpstatus.StatusCodes.BAD_GATEWAY).send();
                        return;
                    }
                    res.status(Httpstatus.StatusCodes.BAD_REQUEST).send();
                });
        });

        this.router.post('/upload', (req: Request, res: Response, next: NextFunction) => {
            const drawingForm: DrawingForm = req.body;
            this.drawingsService
                .storeDrawing(drawingForm)
                .then(() => {
                    res.sendStatus(HTTP_STATUS_CREATED);
                })
                .catch((error: Error) => {
                    if (error.message === 'FAILED_TO_SAVE_DRAWING') {
                        res.status(Httpstatus.StatusCodes.INTERNAL_SERVER_ERROR).send();
                        return;
                    }
                    if (error.message === 'DATABASE_ERROR') {
                        res.status(Httpstatus.StatusCodes.BAD_GATEWAY).send();
                        return;
                    }
                    res.status(Httpstatus.StatusCodes.BAD_REQUEST).send();
                });
        });
    }
}

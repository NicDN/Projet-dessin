import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class StampService extends Tool {
    // TODO: put links in a JSON ?
    stamps: string[] = [
        'https://media.lactualite.com/2020/03/jqb10755641.jpg',
        'https://pbs.twimg.com/profile_images/1210618202457292802/lt9KD2lt.jpg',
        'https://pbs.twimg.com/profile_images/1963916757/carre-FB-Twitter-br_400x400.jpg',
        'https://cdn.eso.org/images/thumb300y/eso1907a.jpg',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQwp2WSOJ81mjgmNNn4Mx2o9HDfPKN7MFixe6SUjwrfMvValc5PAqZufIyDolSF2sGHVs&usqp=CAU',
        'https://p.kindpng.com/picc/s/707-7071194_meme-memexd-memes-shrek-shrekmeme-mikewazowski-shrek-mike.png',
    ];

    selectedStampSrc: string = '';

    readonly SCALING_MAX_VALUE: number = 3; // TODO: change to appropriate value
    readonly SCALING_MIN_VALUE: number = 1;

    readonly ANGLE_MAX_VALUE: number = 360;
    readonly ANGLE_MIN_VALUE: number = 0;

    scaling: number = 1;
    angle: number = this.ANGLE_MIN_VALUE;

    constructor(drawingService: DrawingService) {
        super(drawingService, 'Étampe');
    }

    onMouseMove(event: MouseEvent): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.displayPreview(event);
    }

    private displayPreview(event: MouseEvent): void {
        this.drawImageOnCanvas(event, this.drawingService.previewCtx);
    }

    onMouseDown(event: MouseEvent): void {
        this.drawImageOnCanvas(event, this.drawingService.baseCtx);
        return;
    }

    private drawImageOnCanvas(event: MouseEvent, ctx: CanvasRenderingContext2D): void {
        const stampPreview: HTMLImageElement = new Image();
        stampPreview.src = this.selectedStampSrc;
        // stampPreview.setAttribute = ('crossOrigin', ' ');
        const mousePosition = this.getPositionFromMouse(event);

        ctx.drawImage(
            stampPreview,
            mousePosition.x - Math.floor((stampPreview.width * this.scaling) / 2),
            mousePosition.y - Math.floor((stampPreview.height * this.scaling) / 2),
            stampPreview.width * this.scaling,
            stampPreview.height * this.scaling,
        );
    }

    onScroll(event: MouseEvent): void {
        this.rotateStamp(event);
    }

    rotateStamp(event: MouseEvent): void {
        let stampCanvasTmp: HTMLCanvasElement = document.createElement('canvas');
        let stampCanvasTmpCtx = stampCanvasTmp.getContext('2d') as CanvasRenderingContext2D;
        stampCanvasTmp.width = this.drawingService.previewCanvas.width;
        stampCanvasTmp.height = this.drawingService.previewCanvas.height;

        const currentCoords = this.getPositionFromMouse(event);
        stampCanvasTmpCtx.translate(currentCoords.x, currentCoords.y);
        stampCanvasTmpCtx.rotate((45 * Math.PI) / 180);
        stampCanvasTmpCtx.translate(-currentCoords.x, -currentCoords.y);

        this.drawingService.previewCtx.putImageData(stampCanvasTmpCtx.getImageData(0, 0, stampCanvasTmp.width, stampCanvasTmp.height), 0, 0);
        this.drawImageOnCanvas(event, this.drawingService.previewCtx);
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
}

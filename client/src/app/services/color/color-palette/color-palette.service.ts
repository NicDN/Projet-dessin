import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ColorPaletteService {
    // draw(ctx: CanvasRenderingContext2D, selectedPosition: { x: number; y: number }, hue: string): void {
    //     if (!this.ctx) {
    //         this.ctx = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    //     }
    //     const width = this.canvas.nativeElement.width;
    //     const height = this.canvas.nativeElement.height;

    //     this.ctx.fillStyle = this.hue || 'rgba(255,255,255,1)';
    //     this.ctx.fillRect(0, 0, width, height);

    //     const whiteGrad = this.ctx.createLinearGradient(0, 0, width, 0);
    //     whiteGrad.addColorStop(0, 'rgba(255,255,255,1)');
    //     whiteGrad.addColorStop(1, 'rgba(255,255,255,0)');

    //     this.ctx.fillStyle = whiteGrad;
    //     this.ctx.fillRect(0, 0, width, height);

    //     const blackGrad = this.ctx.createLinearGradient(0, 0, 0, height);
    //     blackGrad.addColorStop(0, 'rgba(0,0,0,0)');
    //     blackGrad.addColorStop(1, 'rgba(0,0,0,1)');

    //     this.ctx.fillStyle = blackGrad;
    //     this.ctx.fillRect(0, 0, width, height);

    //     if (this.selectedPosition) {
    //         this.ctx.strokeStyle = 'white';
    //         this.ctx.fillStyle = 'white';
    //         this.ctx.beginPath();
    //         this.ctx.arc(this.selectedPosition.x, this.selectedPosition.y, this.DIAMETER, 0, 2 * Math.PI);
    //         this.ctx.lineWidth = this.THICKNESS;
    //         this.ctx.stroke();
    //     }
    // }
}

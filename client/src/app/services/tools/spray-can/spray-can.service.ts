import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PencilService } from '@app/services/tools/pencil/pencil-service';

@Injectable({
    providedIn: 'root',
})
export class SprayCanService extends PencilService {
    // commented for tslint purposes
    // private emissionRate: number;
    // private sprayDiameter: number;
    // private dropletsDiameter: number;

    constructor(drawingService: DrawingService, colorService: ColorService) {
        super(drawingService, colorService);
        this.toolName = 'Aérosol';
    }

    drawLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        ctx.save();
        this.setContext(ctx);

        const oldPointX: number = path[0].x;
        const oldPointY: number = path[0].y;

        // tslint:disable-next-line: only-arrow-functions
        // Je pourrais faire ceci dans une autre fonction possiblement? https://javascript.info/settimeout-setinterval
        const timeIsh = setTimeout(this.getRandomNumber, 3, 4);

        //     function draw(): void {
        //     // hello
        //     if (!timeIsh) return;
        //     timeIsh = setTimeout(draw, 50);
        // }, 50);

        ctx.restore();
    }

    getRandomNumber(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min) + min);
    }

    setContext(ctx: CanvasRenderingContext2D): void {
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
    }
}

/*
var el = document.getElementById('c');
var ctx = el.getContext('2d');
var clientX, clientY, timeout;
var density = 40;

function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

el.onmousedown = function(e) {
  ctx.lineJoin = ctx.lineCap = 'round';
  clientX = e.clientX;
  clientY = e.clientY;
  
  timeout = setTimeout(function draw() {
    for (var i = density; i--; ) {
      var angle = getRandomFloat(0, Math.PI * 2);
      var radius = getRandomFloat(0, 30);
      ctx.globalAlpha = Math.random();
      ctx.fillRect(
        clientX + radius * Math.cos(angle),
        clientY + radius * Math.sin(angle), 
        getRandomFloat(1, 2), getRandomFloat(1, 2));
    }
    if (!timeout) return;
    timeout = setTimeout(draw, 50);
  }, 50);
};
el.onmousemove = function(e) {
  clientX = e.clientX;
  clientY = e.clientY;
};
el.onmouseup = function() {
  clearTimeout(timeout);
}; */

import { Injectable } from '@angular/core';
import { TraceTool } from '@app/classes/trace-tool';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Observable, Subject } from 'rxjs';

export enum TextPositon {
    Center,
    Left,
    Right,
}

export enum FontStyle {
    Arial,
    Times,
    Comic,
    Consolas,
    Bembo,
}

@Injectable({
    providedIn: 'root',
})
export class TextService extends TraceTool {
    readonly TEXT_MIN_SIZE: number = 25;
    readonly TEXT_MAX_SIZE: number = 30;
    readonly MULTIPLIER: number = 1.5;
    readonly MINUS_ONE: number = -1;

    private subject: Subject<boolean> = new Subject<boolean>();

    textSize: number = this.TEXT_MIN_SIZE;
    textPosition: TextPositon = TextPositon.Left;

    writeItalic: boolean = false;
    writeBold: boolean = false;
    isWriting: boolean = false;

    fontStyle: FontStyle = FontStyle.Arial;
    private writtenOnPreview: string = '';
    private initialClickPosition: Vec2;
    private writingPosition: number = 0; // This value is the offset starting from the end of the current string (writtenOnPreview).
    private fontStyleTable: string[] = ['Arial', 'Times', 'Comic Sans MS', 'Consolas', 'Bembo'];
    private enterPosition: number[] = [];
    // private atEnterLeft: boolean = false;
    // private atEnterRight: boolean = false;

    constructor(drawingService: DrawingService, colorService: ColorService) {
        super(drawingService, colorService, 'Texte');
    }

    onMouseDown(event: MouseEvent): void {
        if (this.isWriting === true) {
            this.drawText(this.drawingService.baseCtx, this.writtenOnPreview);
            this.disableWriting();
            return;
        }
        this.isWriting = true;
        this.disableEnableHotKeyService(false);
        this.initialClickPosition = this.getPositionFromMouse(event);
    }

    onKeyDown(event: KeyboardEvent): void {
        // Maybe making this function a switch case?
        if (event.key === 'Escape') {
            this.disableWriting();
            return;
        }

        if (event.key === 'ArrowLeft') {
            this.arrowLeftPressed();
        }

        if (event.key === 'ArrowRight') {
            this.arrowRightPressed();
        }

        if (event.key === 'ArrowUp') {
            // something
        }

        if (event.key === 'ArrowDown') {
            // something
        }

        if (event.key === 'Delete') {
            this.deletePressed();
            return;
        }

        if (event.key === 'Backspace') {
            this.backSpacePressed();
            return;
        }

        if (event.key === 'Enter') {
            this.enterPressed();
        }

        if (this.isWriting) {
            this.addChar(event);
        }
    }

    private arrowLeftPressed(): void {
        if (this.writingPosition !== this.writtenOnPreview.length) this.writingPosition += 1;
        // if (this.writingPosition === this.writtenOnPreview.length) return;
        // let enterDetected = this.enterPosition.indexOf(this.writtenOnPreview.length - this.writingPosition);
        // if (this.atEnterLeft === false) {
        //     if (!this.atEnterLeft && enterDetected !== this.MINUS_ONE) this.atEnterLeft = true;
        // } else {
        //     enterDetected = this.enterPosition.indexOf(this.writtenOnPreview.length - this.writingPosition + 1);
        //     if (this.atEnterLeft && enterDetected === this.MINUS_ONE) {
        //         this.writingPosition += 1;
        //         this.atEnterLeft = false;
        //         return;
        //     }
        // }
        // if (enterDetected === this.MINUS_ONE) this.writingPosition += 1;
    }

    private arrowRightPressed(): void {
        if (this.writingPosition !== 0) this.writingPosition -= 1;
    }

    private deletePressed(): void {
        if (this.writingPosition === 0) return;
        const enterDeleted = this.enterPosition.indexOf(this.writtenOnPreview.length - this.writingPosition + 1);
        if (enterDeleted !== this.MINUS_ONE) {
            this.enterPosition.splice(enterDeleted, 1);
        } else
            this.writtenOnPreview =
                this.writtenOnPreview.substring(0, this.writtenOnPreview.length - this.writingPosition) +
                this.writtenOnPreview.substring(this.writtenOnPreview.length - this.writingPosition + 1, this.writtenOnPreview.length);
        this.writingPosition -= 1;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawText(this.drawingService.previewCtx, this.writtenOnPreview);
    }

    private backSpacePressed(): void {
        const enterDeleted = this.enterPosition.indexOf(this.writtenOnPreview.length - this.writingPosition);
        if (enterDeleted !== this.MINUS_ONE) {
            this.enterPosition.splice(enterDeleted, 1);
        } else
            this.writtenOnPreview =
                this.writtenOnPreview.substring(0, this.writtenOnPreview.length - this.writingPosition - 1) +
                this.writtenOnPreview.substring(this.writtenOnPreview.length - this.writingPosition, this.writtenOnPreview.length);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawText(this.drawingService.previewCtx, this.writtenOnPreview);
    }

    private enterPressed(): void {
        this.enterPosition.push(this.writtenOnPreview.length - this.writingPosition);
        this.enterPosition.sort((n1, n2) => n1 - n2);
    }

    private addChar(event: KeyboardEvent): void {
        if (event.key.length !== 1 && event.key !== 'Enter') return;
        if (event.key !== 'Enter') {
            const nextToEnter = this.enterPosition.indexOf(this.writtenOnPreview.length - this.writingPosition + 1);
            if (nextToEnter !== this.MINUS_ONE) {
                for (let i = nextToEnter; i < this.enterPosition.length; i++) {
                    this.enterPosition[i] += 1;
                }
            }
            this.writtenOnPreview =
                this.writtenOnPreview.substring(0, this.writtenOnPreview.length - this.writingPosition) +
                event.key +
                this.writtenOnPreview.substring(this.writtenOnPreview.length - this.writingPosition, this.writtenOnPreview.length);
        }
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawText(this.drawingService.previewCtx, this.writtenOnPreview);
    }

    private disableWriting(): void {
        this.isWriting = false;
        this.disableEnableHotKeyService(true);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.writtenOnPreview = '';
        this.writingPosition = 0;
        this.enterPosition = [];
    }

    drawText(ctx: CanvasRenderingContext2D, text: string): void {
        ctx.save();
        this.setContextForWriting(ctx);
        if (this.enterPosition.length !== 0) {
            // You can get a very close approximation of the vertical height by checking the length of a capital M (multiplying by 1.5 for comfort).
            const approximateHeight = ctx.measureText('M').width * this.MULTIPLIER;
            let i = 0;
            let previousPosition = 0;
            for (const position of this.enterPosition) {
                ctx.fillText(
                    this.writtenOnPreview.substring(previousPosition, position),
                    this.initialClickPosition.x,
                    this.initialClickPosition.y + approximateHeight * i,
                );
                i += 1;
                previousPosition = position;
            }
            if (previousPosition !== this.writtenOnPreview.length) {
                ctx.fillText(
                    this.writtenOnPreview.substring(previousPosition, this.writtenOnPreview.length),
                    this.initialClickPosition.x,
                    this.initialClickPosition.y + approximateHeight * i,
                );
            }
        } else ctx.fillText(text, this.initialClickPosition.x, this.initialClickPosition.y);
        ctx.restore();
    }

    private setContextForWriting(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.colorService.mainColor.rgbValue;
        ctx.globalAlpha = this.colorService.mainColor.opacity;
        let writingType: string;
        if (this.writeBold && this.writeItalic) writingType = 'italic bold';
        else if (this.writeBold) writingType = 'bold';
        else if (this.writeItalic) writingType = 'italic';
        else writingType = 'normal';
        ctx.font = writingType + ' ' + this.textSize + 'px ' + this.fontStyleTable[this.fontStyle];
    }

    private disableEnableHotKeyService(bool: boolean): void {
        this.subject.next(bool);
    }

    disableEnableKeyEvents(): Observable<boolean> {
        return this.subject.asObservable();
    }
}

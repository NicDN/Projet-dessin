import { Injectable } from '@angular/core';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { TextService } from '@app/services/tools/text/textService/text.service';

@Injectable({
    providedIn: 'root',
})
export class TextHotkeyService {
    constructor(private textService: TextService, private drawingService: DrawingService) {}

    arrowLeftPressed(): void {
        if (this.textService.writingPosition !== this.textService.writtenOnPreview.length) this.textService.writingPosition += 1;
    }

    arrowRightPressed(): void {
        if (this.textService.writingPosition !== 0) this.textService.writingPosition -= 1;
    }

    arrowUpPressed(): void {
        let closestEnterPos = -1;
        let index = -1;

        for (const enter of this.textService.enterPosition) {
            if (this.textService.writtenOnPreview.length - enter >= this.textService.writingPosition) {
                closestEnterPos = enter;
                index++;
            }
        }

        if (closestEnterPos === this.textService.MINUS_ONE) return;

        if (index === 0) {
            this.textService.writingPosition += closestEnterPos;
            if (this.textService.writtenOnPreview.length - closestEnterPos >= this.textService.writingPosition) {
                this.textService.writingPosition = this.textService.writtenOnPreview.length - closestEnterPos + 1;
            }
            return;
        }
        this.textService.writingPosition +=
            closestEnterPos - this.textService.enterPosition[this.textService.enterPosition.indexOf(closestEnterPos) - 1];
        if (this.textService.writtenOnPreview.length - closestEnterPos >= this.textService.writingPosition) {
            this.textService.writingPosition = this.textService.writtenOnPreview.length - closestEnterPos + 1;
        }
    }

    arrowDownPressed(): void {
        let closestEnterPos = -1;
        let index = -1;

        for (const enter of this.textService.enterPosition) {
            index++;
            if (this.textService.writtenOnPreview.length - enter < this.textService.writingPosition) {
                closestEnterPos = enter;
                break;
            }
        }

        if (closestEnterPos === this.textService.MINUS_ONE) return;
        if (index === 0) {
            this.indexZeroExeption(closestEnterPos);
            return;
        }

        this.textService.writingPosition -=
            closestEnterPos - this.textService.enterPosition[this.textService.enterPosition.indexOf(closestEnterPos) - 1];

        if (
            this.textService.writingPosition <=
            this.textService.writtenOnPreview.length - this.textService.enterPosition[this.textService.enterPosition.indexOf(closestEnterPos) + 1]
        ) {
            this.textService.writingPosition =
                this.textService.writtenOnPreview.length -
                this.textService.enterPosition[this.textService.enterPosition.indexOf(closestEnterPos) + 1] +
                1;
        }

        if (0 > this.textService.writingPosition) {
            this.textService.writingPosition = 0;
            return;
        }
    }

    private indexZeroExeption(closestEnterPos: number): void {
        this.textService.writingPosition -= closestEnterPos;
        if (0 > this.textService.writingPosition) {
            this.textService.writingPosition = 0;
        }
        if (
            this.textService.writingPosition <=
            this.textService.writtenOnPreview.length - this.textService.enterPosition[this.textService.enterPosition.indexOf(closestEnterPos) + 1]
        ) {
            this.textService.writingPosition =
                this.textService.writtenOnPreview.length -
                this.textService.enterPosition[this.textService.enterPosition.indexOf(closestEnterPos) + 1] +
                1;
        }
    }

    deletePressed(): void {
        if (this.textService.writingPosition === 0) return;

        const enterDeleted = this.textService.enterPosition.indexOf(this.textService.writtenOnPreview.length - this.textService.writingPosition + 1);

        if (enterDeleted !== this.textService.MINUS_ONE) this.textService.enterPosition.splice(enterDeleted, 1);

        this.textService.changeWrittenOnPreview('', 0, 1);

        for (let i = 0; i < this.textService.enterPosition.length; i++) {
            if (this.textService.writtenOnPreview.length - this.textService.writingPosition + 1 < this.textService.enterPosition[i]) {
                this.textService.enterPosition[i] -= 1;
            }
        }

        this.textService.writingPosition -= 1;

        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.textService.registerTextCommand(this.drawingService.previewCtx, this.textService.writtenOnPreview);
        this.textService.drawBox();
    }

    backSpacePressed(): void {
        if (this.textService.writingPosition === this.textService.writtenOnPreview.length) return;

        const enterDeleted = this.textService.enterPosition.indexOf(this.textService.writtenOnPreview.length - this.textService.writingPosition);

        if (enterDeleted !== this.textService.MINUS_ONE) this.textService.enterPosition.splice(enterDeleted, 1);
        this.textService.changeWrittenOnPreview('', this.textService.MINUS_ONE, 0);

        for (let i = 0; i < this.textService.enterPosition.length; i++) {
            if (this.textService.writtenOnPreview.length - this.textService.writingPosition < this.textService.enterPosition[i])
                this.textService.enterPosition[i] -= 1;
        }

        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.textService.registerTextCommand(this.drawingService.previewCtx, this.textService.writtenOnPreview);
        this.textService.drawBox();
    }

    enterPressed(): void {
        this.textService.enterPosition.push(this.textService.writtenOnPreview.length - this.textService.writingPosition + 1);
        this.textService.changeWrittenOnPreview(' ', 0, 0);
        this.textService.enterPosition.sort((n1, n2) => n1 - n2);

        const writingPosFromStart = this.textService.writtenOnPreview.length - this.textService.writingPosition + 1;

        let lastValue = -1;
        for (let i = 0; i < this.textService.enterPosition.length; i++) {
            if (writingPosFromStart <= this.textService.enterPosition[i] || this.textService.enterPosition[i] === lastValue)
                this.textService.enterPosition[i] += 1;
            lastValue = this.textService.enterPosition[i];
        }
    }
}

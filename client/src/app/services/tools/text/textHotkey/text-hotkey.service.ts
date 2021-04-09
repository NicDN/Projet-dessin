import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class TextHotkeyService {
    // tslint:disable-next-line: no-empty
    constructor() {}

    arrowLeftPressed(): void {
        // if (this.textService.writingPosition !== this.textService.writtenOnPreview.length) this.textService.writingPosition += 1;
    }

    arrowRightPressed(): void {
        // if (this.textService.writingPosition !== 0) this.textService.writingPosition -= 1;
    }
}

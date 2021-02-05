import { ColorService } from '@app/services/color/color.service';
import { Tool } from './tool';

export class DrawingTool extends Tool {
    thickness: number;
    constructor(protected colorService: ColorService) {
        super();
    }
}

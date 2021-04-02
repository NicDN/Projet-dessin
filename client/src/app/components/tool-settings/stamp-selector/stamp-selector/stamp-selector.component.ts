import { Component, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { SliderSetting } from '@app/classes/slider-setting';
import { StampLibraryBottomSheetComponent } from '@app/components/tool-settings/stamp-selector/stamp-library-bottom-sheet/stamp-library-bottom-sheet.component';
import { StampService } from '@app/services/tools/stamp/stamp.service';

@Component({
    selector: 'app-stamp-selector',
    templateUrl: './stamp-selector.component.html',
    styleUrls: ['./stamp-selector.component.scss'],
})
export class StampSelectorComponent implements OnInit {
    scalingSetting: SliderSetting;
    angleSetting: SliderSetting;

    private previousSrc: string = this.stampService.stamps[0];

    constructor(public stampService: StampService, private bottomSheet: MatBottomSheet) {}

    ngOnInit(): void {
        this.scalingSetting = {
            title: "Facteur de mise à l'échelle",
            unit: '',
            min: this.stampService.SCALING_MIN_VALUE * 10,
            max: this.stampService.SCALING_MAX_VALUE * 10,

            getAttribute: () => {
                return this.stampService.scaling / 10;
            },
            action: (value: number) => (this.stampService.scaling = value),
        };

        this.angleSetting = {
            title: "Angle d'orientation",
            unit: 'Degrés',
            min: this.stampService.ANGLE_MIN_VALUE,
            max: this.stampService.ANGLE_MAX_VALUE,

            getAttribute: () => {
                return Math.ceil(Math.abs((this.stampService.angle * 180) / Math.PI)) % 360;
            },
            action: (value: number) => (this.stampService.angle = (value * Math.PI) / 180),
        };

        this.stampService.selectedStampSrc = this.stampService.selectedStampSrc;
    }

    openStampLibrary(): void {
        const bottomSheetRef = this.bottomSheet.open(StampLibraryBottomSheetComponent, {
            data: this.stampService.stamps,
        });

        bottomSheetRef.afterDismissed().subscribe((stampSrc: string) => {
            if (stampSrc == undefined) {
                this.stampService.selectedStampSrc = this.previousSrc;
                return;
            }
            this.stampService.selectedStampSrc = stampSrc;
            this.previousSrc = this.stampService.selectedStampSrc;
        });
    }
}

import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'app-option-bar',
    templateUrl: './option-bar.component.html',
    styleUrls: ['./option-bar.component.scss'],
})
export class OptionBarComponent implements OnInit {
    readonly SHOW_DELAY_MS: number = 750;
    showDelay: FormControl = new FormControl(this.SHOW_DELAY_MS);

    optionBarElements: { icon: string; toolTipContent: string }[] = [{ icon: 'plus', toolTipContent: 'Créer un nouveau dessin (Ctrl+O)' }];

    ngOnInit(): void {
        //
    }

    toggleActive(): void {
        //
    }
}

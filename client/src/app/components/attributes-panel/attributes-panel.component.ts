import { Component, OnInit } from '@angular/core';
import { Option } from '@app/classes/option';
import { OptionsService } from '@app/services/options.service';
@Component({
    selector: 'app-attributes-panel',
    templateUrl: './attributes-panel.component.html',
    styleUrls: ['./attributes-panel.component.scss'],
})
export class AttributesPanelComponent implements OnInit {
    currentOption: Option = this.optionsService.currentOption;

    constructor(private optionsService: OptionsService) {}

    ngOnInit(): void {
        //
    }
}

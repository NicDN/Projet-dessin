import { Component, OnInit } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-line-settings-selector',
  templateUrl: './line-settings-selector.component.html',
  styleUrls: ['./line-settings-selector.component.scss']
})
export class LineSettingsSelectorComponent implements OnInit {

  dotJunctionChecked:boolean;
  diameterValueModel=5;
  constructor() { }

  ngOnInit(): void {
  }

  onChange(changedValue:MatSlideToggleChange){
    this.dotJunctionChecked=changedValue.checked;
  }

}

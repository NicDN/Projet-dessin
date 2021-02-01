import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-thickness-selector',
    templateUrl: './thickness-selector.component.html',
    styleUrls: ['./thickness-selector.component.scss'],
})
export class ThicknessSelectorComponent implements OnInit {
    thicknessModel = 1;
    constructor() {}

    ngOnInit(): void {}
}

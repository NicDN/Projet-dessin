import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
    readonly SHOW_DELAY_MS: number = 750;
    showDelay: FormControl = new FormControl(this.SHOW_DELAY_MS);
    element: HTMLElement;

    // let sideBarOptionsArray: {icon:string,toolTipContent:string}[]=[
    //     {icon:'mouse-pointer',toolTipContent:'Outils de sélection'},
    //     {icon:'',toolTipContent:''},
    //     {icon:'',toolTipContent:''},
    //     {icon:'',toolTipContent:''},
    //     {icon:'',toolTipContent:''},
    //     {icon:'',toolTipContent:''},
    //     {icon:'',toolTipContent:''},
    //     {icon:'',toolTipContent:''},
    //     {icon:'',toolTipContent:''},
    //     {icon:'',toolTipContent:''},
    //     {icon:'',toolTipContent:''},
    //     {icon:'',toolTipContent:''},
    //     {icon:'',toolTipContent:''},
    //     {icon:'',toolTipContent:''},
    //     {icon:'',toolTipContent:''},
    //     {icon:'',toolTipContent:''},
    //     {icon:'',toolTipContent:''}
    // ];

    // attributes toolTipPosition =right
    // array of objects containing (icon,tooltip)

    // tslint:disable-next-line: no-any (TEMPORARY)
    toggleActive(event: any): void {
        event.preventDefault();
        if (this.element !== undefined) {
            this.element.style.backgroundColor = 'rgb(33, 38, 43)';
        }
        const target = event.currentTarget;
        target.style.backgroundColor = '#e51282';
        this.element = target;
    }
}

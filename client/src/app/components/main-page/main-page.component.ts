import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { IndexService } from '@app/services/index/index.service';
import { Message } from '@common/communication/message';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly title: string = 'LOG2990';
    message: BehaviorSubject<string> = new BehaviorSubject<string>('');
    controlKeyDown: boolean = false;
    containsDrawing: boolean = false; // temporary boolean

    constructor(private basicService: IndexService, private router: Router) {}

    sendTimeToServer(): void {
        const newTimeMessage: Message = {
            title: 'Hello from the client',
            body: 'Time is : ' + new Date().toString(),
        };
        // Important de ne pas oublier "subscribe" ou l'appel ne sera jamais lancé puisque personne l'observe
        this.basicService.basicPost(newTimeMessage).subscribe();
    }

    getMessagesFromServer(): void {
        this.basicService
            .basicGet()
            // Cette étape transforme le Message en un seul string
            .pipe(
                map((message: Message) => {
                    return `${message.title} ${message.body}`;
                }),
            )
            .subscribe(this.message);
    }

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        event.stopPropagation();
        if (event.ctrlKey) {
            this.controlKeyDown = true;
            event.preventDefault();
        }
        switch (event.code) {
            case 'KeyO':
                this.router.navigate(['/editor']);
                break;
            default:
            /* Nothing happens if a random key is pressed */
            /* Maybe we want this to be in a service */
        }
        event.returnValue = true; // Renables shortcuts like f11
    }

    @HostListener('window:keyup', ['$event'])
    onKeyUp(event: KeyboardEvent): void {
        if (event.ctrlKey) this.controlKeyDown = false;
    }
}

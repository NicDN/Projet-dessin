import { Injectable } from '@angular/core';
import { IndexService } from '@app/services/index/index.service';
import { Message } from '@common/communication/message';

@Injectable({
    providedIn: 'root',
})
export class SaveService {
    message: Message;

    constructor(public indexService: IndexService){}

    showMessage() {
        this.indexService.basicGet()
            .subscribe((msg: Message) => this.message = {
                title: msg.title,
                body: msg.body,
            });
        window.confirm(this.message.body);
    }
}

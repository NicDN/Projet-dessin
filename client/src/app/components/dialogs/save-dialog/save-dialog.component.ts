import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Message } from '@common/communication/message';

@Component({
    selector: 'app-save-dialog',
    templateUrl: './save-dialog.component.html',
    styleUrls: ['./save-dialog.component.scss'],
})
export class SaveDialogComponent implements OnInit {
    SERVER_URL = 'http://localhost:3000/api/index/upload';
    uploadForm: FormGroup;
    message: Message = { body: 'Hello', title: 'World' };

    constructor(private drawingService: DrawingService, private formBuilder: FormBuilder, private httpClient: HttpClient) {}

    ngOnInit() {
        this.uploadForm = this.formBuilder.group({
            profile: [''],
        });
        this.uploadForm.get('profile')?.setValue(this.drawingService.canvas);

        this.onSubmit();
    }

    onSubmit() {
        const formData = new FormData();
        formData.append('drawing', this.uploadForm.get('profile')?.value);
        formData.append('suckMyAss', 'pls suck my ass');

        this.httpClient.post<void>(this.SERVER_URL, formData).subscribe(
            (res) => console.log(res),
            (err) => console.log(err),
        );
    }
}

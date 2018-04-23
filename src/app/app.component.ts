// Angular
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// RXJX
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';

// Constants
const UPDATE_URL = './assets/update.json';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    // styleUrls: ['./app.component.scss'] // Enable as needed
})
export class AppComponent {
    public lastUpdate: number;
    constructor(
        private httpClientService: HttpClient,
    ) {
        this.httpClientService.get(UPDATE_URL).subscribe(
            (result: Object) => {
                this.lastUpdate = result['updated'];
            },
            error => {
                console.log(error);
            }
        );
    }
}

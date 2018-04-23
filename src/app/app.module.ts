// Angular
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

// UI (bootstrap, clarity, etc...)
import { ClarityModule } from "@clr/angular";

// Routing
import { AppRoutingModule, RoutedComponents } from 'app/app-routing.module';

// Services
// import * as Services from 'app/services';

// Components
import { AppComponent } from 'app/app.component';
import * as Components from 'app/components';


@NgModule({
    // Modules
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        ClarityModule,
        AppRoutingModule,
        HttpClientModule,
        FormsModule,
    ],
    // Components
    declarations: [
        AppComponent,
        RoutedComponents,
        Components.MachineIoComponent,
        Components.MachineModalComponent,
    ],
    // Services
    providers: [
        // Services,
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }

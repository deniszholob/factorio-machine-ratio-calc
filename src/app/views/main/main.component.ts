import { Component } from '@angular/core';
import { LayoutComponent } from './layout/layout.component';
import { ProductionChainEditorComponent } from 'src/app/components/production-chain-editor/production-chain-editor.component';
import { APP_BUILD_DATE } from 'src/app/app.build';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  host: { class: 'contents' },
  imports: [LayoutComponent, ProductionChainEditorComponent],
})
export class MainComponent {
  protected readonly APP_BUILD_DATE: number = APP_BUILD_DATE;
}

import { ChangeDetectionStrategy, Component } from '@angular/core';

import { FooterComponent } from 'src/app/components/footer/footer.component';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { LinksComponent } from 'src/app/components/links/links.component';
import { ProductionChainListComponent } from 'src/app/components/production-chain-list/production-chain-list.component';
import { ProductionViewComponent } from '../../components/production-view/production-view.component';
import { MainLayoutComponent } from '../../layouts/main-layout/main-layout.component';

@Component({
  selector: 'app-dev',
  templateUrl: './dev.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  imports: [
    MainLayoutComponent,
    ProductionViewComponent,
    HeaderComponent,
    ProductionChainListComponent,
    LinksComponent,
    FooterComponent,
  ],
})
export class DevComponent {}

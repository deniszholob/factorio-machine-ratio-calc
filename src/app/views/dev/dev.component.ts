import {
  ChangeDetectionStrategy,
  Component,
  Signal,
  inject,
} from '@angular/core';

import { FooterComponent } from 'src/app/components/footer/footer.component';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { LinksComponent } from 'src/app/components/links/links.component';
import { ProductionChainGroupComponent } from 'src/app/components/production-chain-group/production-chain-group.component';
import { ProductionChainService } from 'src/app/shared/production-chain/production-chain.service';
import { ProductionChainEditorComponent } from '../../components/production-chain-editor/production-chain-editor.component';
import { MainLayoutComponent } from '../../layouts/main-layout/main-layout.component';

@Component({
  selector: 'app-dev',
  templateUrl: './dev.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  imports: [
    MainLayoutComponent,
    ProductionChainEditorComponent,
    HeaderComponent,
    ProductionChainGroupComponent,
    LinksComponent,
    FooterComponent,
  ],
})
export class DevComponent {
  private readonly productionChainService = inject(ProductionChainService);

  protected readonly $hasProductionChains: Signal<boolean> =
    this.productionChainService.$hasProductionChains;
}

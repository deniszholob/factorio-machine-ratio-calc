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
import { SettingsViewComponent } from 'src/app/components/settings-view/settings-view.component';
import { SettingsService } from 'src/app/shared/settings/settings.service';
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
    SettingsViewComponent,
  ],
})
export class DevComponent {
  private readonly productionChainService = inject(ProductionChainService);
  private readonly settingsService = inject(SettingsService);

  protected readonly $hasProductionChains: Signal<boolean> =
    this.productionChainService.$hasProductionChains;
  protected readonly $isSettingsOpen = this.settingsService.$isSettingsOpen;
}

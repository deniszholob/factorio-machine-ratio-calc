import {
  ChangeDetectionStrategy,
  Component,
  Signal,
  inject,
} from '@angular/core';
import { FooterComponent } from 'src/app/views/main/footer/footer.component';
import { HeaderComponent } from 'src/app/views/main/header/header.component';
import { LinksComponent } from 'src/app/views/main/links/links.component';
import { SettingsViewComponent } from 'src/app/components/settings-view/settings-view.component';
import { ProductionChainEditorComponent } from 'src/app/components/production/production-chain-editor/production-chain-editor.component';
import { ProductionChainService } from 'src/app/shared/services/production-chain/production-chain.service';
import { SettingsService } from 'src/app/shared/services/settings/settings.service';
import { MainLayoutComponent } from 'src/app/layouts/main-layout/main-layout.component';
import { ContentLayoutComponent } from 'src/app/layouts/content-layout/content-layout.component';
import { ProductionCatalogEditorComponent } from 'src/app/components/production/production-chain-editor/production-catalog-editor/production-catalog-editor.component';
import { ProductionCatalogUiService } from 'src/app/shared/services/production-catalog/production-catalog-ui.service';
import { ProductionChainGroupComponent } from 'src/app/components/production-chain-group/production-chain-group.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
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
    ContentLayoutComponent,
    ProductionCatalogEditorComponent,
  ],
})
export class MainComponent {
  private readonly productionChainService = inject(ProductionChainService);
  private readonly settingsService = inject(SettingsService);
  private readonly productionCatalogUiService = inject(
    ProductionCatalogUiService,
  );

  protected readonly $hasProductionChains: Signal<boolean> =
    this.productionChainService.$hasProductionChains;
  protected readonly $activeProductionChainId: Signal<string | undefined> =
    this.productionChainService.$activeProductionChainId;
  protected readonly $isSettingsOpen = this.settingsService.$isSettingsOpen;
  protected readonly $isCatalogOpen =
    this.productionCatalogUiService.$isCatalogOpen;

  protected closeCatalog(): void {
    this.productionCatalogUiService.closeCatalog();
  }
}

import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductionCatalogService } from 'src/app/shared/services/production-catalog/production-catalog.service';
import { ProductionChainService } from 'src/app/shared/services/production-chain/production-chain.service';
import {
  CatalogMachine,
  CatalogProduction,
  CatalogRecipe,
} from 'src/app/shared/models/production-catalog-state/production-catalog-state.model';
import { FilePickerComponent } from 'src/app/forms/file-picker/file-picker.component';
import { SectionBlockComponent } from 'src/app/layouts/section-block/section-block.component';
import { CatalogRecipeFormComponent } from './catalog-recipe-form/catalog-recipe-form.component';
import { FormFieldBlockComponent } from '../../forms/form-field-block/form-field-block.component';
import { BadgeComponent } from '../generic/badge/badge.component';
import {
  SelectionButtonGroupComponent,
  SelectionButtonOption,
} from 'src/app/forms/selection-button-group/selection-button-group.component';
import { CatalogEditorTab } from './catalog-editor-tab.enum';
import {
  IMPORT_MODE_INFO_OPTIONS,
  ImportMode,
} from 'src/app/shared/models/import-mode.enum';

@Component({
  selector: 'app-production-catalog-editor',
  templateUrl: './production-catalog-editor.component.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    FilePickerComponent,
    SectionBlockComponent,
    CatalogRecipeFormComponent,
    FormFieldBlockComponent,
    BadgeComponent,
    SelectionButtonGroupComponent,
  ],
})
export class ProductionCatalogEditorComponent {
  protected readonly CatalogEditorTab = CatalogEditorTab;

  private readonly productionCatalogService = inject(ProductionCatalogService);
  private readonly productionChainService = inject(ProductionChainService);

  public readonly $catalog = this.productionCatalogService.$catalog;
  public readonly $itemNames = this.productionCatalogService.$itemNames;
  public readonly $itemIconsByName =
    this.productionCatalogService.$itemIconsByName;
  public readonly $machineIconsByName =
    this.productionCatalogService.$machineIconsByName;
  public readonly $plainItems = computed(() =>
    this.$catalog().items.filter((item) => item.isMachine !== true),
  );
  public readonly $machines = computed<CatalogMachine[]>(() =>
    this.$catalog()
      .items.filter((item) => item.isMachine === true)
      .map((item) => ({
        name: item.name,
        iconUrl: item.iconUrl,
        craftingSpeed: item.craftingSpeed ?? 1,
        productivity: item.productivity ?? 1,
        drain: item.drain ?? 1,
      })),
  );
  public readonly $productions = computed<CatalogProduction[]>(
    () => this.$catalog().productions,
  );
  protected readonly $activeTab = signal<CatalogEditorTab>(
    CatalogEditorTab.Import,
  );
  protected readonly $importMode = signal<ImportMode>(ImportMode.Add);
  protected readonly $uploadError = signal<string | undefined>(undefined);
  protected readonly $itemFilter = signal<string>('');
  protected readonly $machineFilter = signal<string>('');
  protected readonly $recipeFilter = signal<string>('');
  protected readonly $productionFilter = signal<string>('');
  protected readonly $visibleItems = computed(() =>
    filterByName(this.$plainItems(), this.$itemFilter()),
  );
  protected readonly $visibleMachines = computed(() =>
    filterByName(this.$machines(), this.$machineFilter()),
  );
  protected readonly $visibleRecipes = computed(() =>
    filterByName(this.$catalog().recipes, this.$recipeFilter()),
  );
  protected readonly $visibleProductions = computed(() =>
    filterByName(this.$productions(), this.$productionFilter()),
  );
  protected readonly $usageCounts = computed<CatalogUsageCounts>(() => {
    const itemByName: Record<string, number> = {};
    const machineByName: Record<string, number> = {};
    const recipeByName: Record<string, number> = {};
    const productionByName: Record<string, number> = {};
    const catalog = this.$catalog();
    const chainProductions = this.productionChainService
      .$productionChains()
      .flatMap((chain) => chain.productions);

    for (const recipe of catalog.recipes) {
      for (const item of recipe.inputs) {
        incrementCountByName(itemByName, item.name);
      }
      for (const item of recipe.outputs) {
        incrementCountByName(itemByName, item.name);
      }
    }

    for (const template of catalog.productions) {
      incrementCountByName(machineByName, template.production.machine.name);
      incrementCountByName(recipeByName, template.production.recipe.name);
      for (const item of template.production.recipe.inputs) {
        incrementCountByName(itemByName, item.name);
      }
      for (const item of template.production.recipe.outputs) {
        incrementCountByName(itemByName, item.name);
      }
    }

    for (const production of chainProductions) {
      incrementCountByName(machineByName, production.machine.name);
      incrementCountByName(recipeByName, production.recipe.name);
      incrementCountByName(productionByName, production.name);
      for (const item of production.recipe.inputs) {
        incrementCountByName(itemByName, item.name);
      }
      for (const item of production.recipe.outputs) {
        incrementCountByName(itemByName, item.name);
      }
    }

    return {
      itemByName,
      machineByName,
      recipeByName,
      productionByName,
    };
  });
  protected readonly $itemUsageByName = computed<Record<string, number>>(
    () => this.$usageCounts().itemByName,
  );
  protected readonly $machineUsageByName = computed<Record<string, number>>(
    () => this.$usageCounts().machineByName,
  );
  protected readonly $recipeUsageByName = computed<Record<string, number>>(
    () => this.$usageCounts().recipeByName,
  );
  protected readonly $productionUsageByName = computed<Record<string, number>>(
    () => this.$usageCounts().productionByName,
  );
  protected readonly $visibleProductionCards = computed(() => {
    const machineIconsByName = this.$machineIconsByName();
    const productionUsageByName = this.$productionUsageByName();
    const catalogProductions = this.$productions();
    return this.$visibleProductions().map((template) => {
      const machineName = template.production.machine.name;
      return {
        index: catalogProductions.indexOf(template),
        name: template.name,
        machineName,
        recipeName: template.production.recipe.name,
        recipeIconUrl: template.production.recipe.iconUrl ?? template.iconUrl,
        machineIconUrl: findIconByName(machineIconsByName, machineName),
        usageCount: getCountByName(productionUsageByName, template.name),
      };
    });
  });
  protected readonly $tabOptions = computed<
    readonly SelectionButtonOption<CatalogEditorTab>[]
  >(() => [
    {
      id: CatalogEditorTab.Import,
      display: 'Import',
      iconClass: 'fas fa-right-left',
      count: 5,
    },
    {
      id: CatalogEditorTab.Items,
      display: 'Items',
      iconClass: 'fas fa-box',
      count: this.$plainItems().length,
    },
    {
      id: CatalogEditorTab.Machines,
      display: 'Machines',
      iconClass: 'fas fa-industry',
      count: this.$machines().length,
    },
    {
      id: CatalogEditorTab.Recipes,
      display: 'Recipes',
      iconClass: 'fas fa-scroll',
      count: this.$catalog().recipes.length,
    },
    {
      id: CatalogEditorTab.Productions,
      display: 'Productions',
      iconClass: 'fas fa-diagram-project',
      count: this.$productions().length,
    },
  ]);
  protected readonly importModeOptions: readonly SelectionButtonOption<ImportMode>[] =
    [...IMPORT_MODE_INFO_OPTIONS];
  private readonly itemNameBeforeEdit = new WeakMap<object, string>();
  private readonly machineNameBeforeEdit = new WeakMap<object, string>();

  protected onItemFilterChange(value: string): void {
    this.$itemFilter.set(value);
  }

  protected onMachineFilterChange(value: string): void {
    this.$machineFilter.set(value);
  }

  protected onRecipeFilterChange(value: string): void {
    this.$recipeFilter.set(value);
  }

  protected onProductionFilterChange(value: string): void {
    this.$productionFilter.set(value);
  }

  protected async onUploadCatalog(files: File[]): Promise<void> {
    await this.runUpload(() =>
      this.productionCatalogService.uploadCatalog(files, this.$importMode()),
    );
  }

  protected async onUploadItems(files: File[]): Promise<void> {
    await this.runUpload(() =>
      this.productionCatalogService.uploadItems(files, this.$importMode()),
    );
  }

  protected async onUploadRecipes(files: File[]): Promise<void> {
    await this.runUpload(() =>
      this.productionCatalogService.uploadRecipes(files, this.$importMode()),
    );
  }

  protected async onUploadMachines(files: File[]): Promise<void> {
    await this.runUpload(() =>
      this.productionCatalogService.uploadMachines(files, this.$importMode()),
    );
  }

  protected async onUploadProductions(files: File[]): Promise<void> {
    await this.runUpload(() =>
      this.productionCatalogService.uploadProductions(
        files,
        this.$importMode(),
      ),
    );
  }

  protected onDownloadCatalog(): void {
    this.productionCatalogService.downloadCatalog();
  }

  protected onDownloadItems(): void {
    this.productionCatalogService.downloadItems();
  }

  protected onDownloadRecipes(): void {
    this.productionCatalogService.downloadRecipes();
  }

  protected onDownloadMachines(): void {
    this.productionCatalogService.downloadMachines();
  }

  protected onDownloadProductions(): void {
    this.productionCatalogService.downloadProductions();
  }

  protected onDeleteCatalog(): void {
    this.productionCatalogService.clearCatalog();
  }

  protected onAddItem(): void {
    this.productionCatalogService.addItem();
  }

  protected onItemNameFocus(item: { name: string }): void {
    const name = item.name.trim();
    if (!name) {
      return;
    }
    this.itemNameBeforeEdit.set(item, name);
  }

  protected onItemNameChange(item: { name: string }, name: string): void {
    const catalogIndex = this.findCatalogItemIndex(item);
    if (!item || catalogIndex === -1) {
      return;
    }
    const previousName = this.itemNameBeforeEdit.get(item) ?? item.name;
    const nextName = name.trim();
    this.productionCatalogService.updateItemAtIndex(catalogIndex, {
      ...item,
      name: nextName,
    });
    this.productionCatalogService.renameReferences(previousName, nextName);
    this.productionChainService.renameCatalogReferences(
      previousName,
      nextName,
      false,
    );
    this.itemNameBeforeEdit.delete(item);
  }

  protected onItemIconChange(item: { name: string }, iconUrl: string): void {
    const catalogIndex = this.findCatalogItemIndex(item);
    if (!item || catalogIndex === -1) {
      return;
    }
    this.productionCatalogService.updateItemAtIndex(catalogIndex, {
      ...item,
      iconUrl: iconUrl.trim() || undefined,
    });
  }

  protected onRemoveItem(item: { name: string }): void {
    if (getCountByName(this.$itemUsageByName(), item.name) > 0) {
      return;
    }
    const catalogIndex = this.findCatalogItemIndex(item);
    if (catalogIndex === -1) {
      return;
    }
    this.productionCatalogService.removeItemAtIndex(catalogIndex);
  }

  protected onAddRecipe(): void {
    this.productionCatalogService.addRecipe();
  }

  protected onRecipeChange(recipe: CatalogRecipe): void {
    const index = this.findRecipeIndex(recipe.name);
    if (index === -1) {
      return;
    }
    this.productionCatalogService.updateRecipeAtIndex(index, {
      name: recipe.name.trim(),
      iconUrl: recipe.iconUrl?.trim() || undefined,
      timeToComplete: recipe.timeToComplete,
      inputs: recipe.inputs,
      outputs: recipe.outputs,
    });
  }

  protected onAddRecipeItem(
    recipe: CatalogRecipe,
    collection: 'inputs' | 'outputs',
  ): void {
    recipe[collection].push({ name: '', count: 1 });
    this.onRecipeChange(recipe);
  }

  protected onRemoveRecipeItem(
    recipe: CatalogRecipe,
    itemIndex: number,
    collection: 'inputs' | 'outputs',
  ): void {
    recipe[collection].splice(itemIndex, 1);
    this.onRecipeChange(recipe);
  }

  protected onRemoveRecipe(recipe: CatalogRecipe): void {
    if (getCountByName(this.$recipeUsageByName(), recipe.name) > 0) {
      return;
    }
    const index = this.findRecipeIndex(recipe.name);
    if (index === -1) {
      return;
    }
    this.productionCatalogService.removeRecipeAtIndex(index);
  }

  protected onAddMachine(): void {
    this.productionCatalogService.addMachine();
  }

  protected onMachineNameFocus(machine: CatalogMachine): void {
    const name = machine.name.trim();
    if (!name) {
      return;
    }
    this.machineNameBeforeEdit.set(machine, name);
  }

  protected onMachineChange(machine: CatalogMachine): void {
    const index = this.findMachineIndex(machine.name);
    if (index === -1) {
      return;
    }
    const previousName =
      this.machineNameBeforeEdit.get(machine) ?? machine.name;
    const nextName = machine.name.trim();
    this.productionCatalogService.updateMachineAtIndex(index, {
      name: nextName,
      iconUrl: machine.iconUrl?.trim() || undefined,
      craftingSpeed: machine.craftingSpeed,
      productivity: machine.productivity,
      drain: machine.drain,
    });
    this.productionCatalogService.renameReferences(previousName, nextName);
    this.productionChainService.renameCatalogReferences(
      previousName,
      nextName,
      true,
    );
    this.machineNameBeforeEdit.delete(machine);
  }

  protected onRemoveMachine(machine: CatalogMachine): void {
    if (getCountByName(this.$machineUsageByName(), machine.name) > 0) {
      return;
    }
    const index = this.findMachineIndex(machine.name);
    if (index === -1) {
      return;
    }
    this.productionCatalogService.removeMachineAtIndex(index);
  }

  protected onRemoveProduction(index: number, name: string): void {
    if (getCountByName(this.$productionUsageByName(), name) > 0) {
      return;
    }
    this.productionCatalogService.removeProductionTemplateAtIndex(index);
  }

  private async runUpload(action: () => Promise<void>): Promise<void> {
    try {
      await action();
      this.$uploadError.set(undefined);
    } catch {
      this.$uploadError.set('Failed to import catalog JSON');
    }
  }

  private findCatalogItemIndex(item: { name: string } | undefined): number {
    if (!item) {
      return -1;
    }

    return this.$catalog().items.findIndex(
      (catalogItem) =>
        catalogItem.isMachine !== true &&
        catalogItem.name.trim().toLowerCase() ===
          item.name.trim().toLowerCase(),
    );
  }

  private findRecipeIndex(name: string): number {
    return this.$catalog().recipes.findIndex(
      (recipe) =>
        recipe.name.trim().toLowerCase() === name.trim().toLowerCase(),
    );
  }

  private findMachineIndex(name: string): number {
    return this.$machines().findIndex(
      (machine) =>
        machine.name.trim().toLowerCase() === name.trim().toLowerCase(),
    );
  }
}

function filterByName<T extends { name: string }>(
  values: T[],
  query: string,
): T[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return values;
  }
  return values.filter((value) =>
    value.name.trim().toLowerCase().includes(normalized),
  );
}

function findIconByName(
  iconsByName: Record<string, string>,
  name: string,
): string | undefined {
  const exact = iconsByName[name];
  if (exact) {
    return exact;
  }

  const normalized = name.trim().toLowerCase();
  for (const [itemName, iconUrl] of Object.entries(iconsByName)) {
    if (itemName.trim().toLowerCase() === normalized) {
      return iconUrl;
    }
  }
  return undefined;
}

interface CatalogUsageCounts {
  itemByName: Record<string, number>;
  machineByName: Record<string, number>;
  recipeByName: Record<string, number>;
  productionByName: Record<string, number>;
}

function normalizeUsageKey(name: string): string {
  return name.trim().toLowerCase();
}

function incrementCountByName(map: Record<string, number>, name: string): void {
  const key = normalizeUsageKey(name);
  if (!key) {
    return;
  }
  map[key] = (map[key] ?? 0) + 1;
}

function getCountByName(map: Record<string, number>, name: string): number {
  const key = normalizeUsageKey(name);
  if (!key) {
    return 0;
  }
  return map[key] ?? 0;
}

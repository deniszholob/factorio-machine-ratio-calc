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
  CatalogRecipeItemCollection,
} from 'src/app/shared/models/production-catalog-state/production-catalog-state.model';
import { FilePickerComponent } from 'src/app/forms/file-picker/file-picker.component';
import { SectionBlockComponent } from 'src/app/layouts/section-block/section-block.component';
import { CatalogRecipeFormComponent } from './catalog-recipe-form/catalog-recipe-form.component';
import { FormFieldBlockComponent } from '../../forms/form-field-block/form-field-block.component';
import { BadgeComponent } from '../generic/badge/badge.component';
import { BadgeSize } from '../generic/badge/badge-size.enum';
import { BadgeTone } from '../generic/badge/badge-tone.enum';
import { CompositeIconComponent } from '../generic/composite-icon/composite-icon.component';
import {
  SelectionButtonGroupComponent,
  SelectionButtonOption,
} from 'src/app/forms/selection-button-group/selection-button-group.component';
import { CatalogEditorTab } from './catalog-editor-tab.enum';
import {
  IMPORT_MODE_INFO_OPTIONS,
  ImportMode,
} from 'src/app/shared/models/import-mode.enum';
import { TooltipDirective } from '../generic/tooltip/tooltip.directive';
import { ModalComponent } from '../generic/modal/modal.component';
import { ProductionEditorComponent } from '../production/production-chain-editor/production-editor/production-editor.component';
import { Production } from 'src/app/shared/models/production-chain/production/production.model';
import { ImportExportService } from 'src/app/shared/services/import-export/import-export.service';
import {
  DATA_TYPES_INFO,
  DataTypes,
} from 'src/app/shared/models/data-types/data-types.enum';

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
    CompositeIconComponent,
    SelectionButtonGroupComponent,
    TooltipDirective,
    ModalComponent,
    ProductionEditorComponent,
  ],
})
export class ProductionCatalogEditorComponent {
  protected readonly CatalogEditorTab = CatalogEditorTab;
  protected readonly BadgeSize = BadgeSize;
  protected readonly BadgeTone = BadgeTone;

  private readonly productionCatalogService = inject(ProductionCatalogService);
  private readonly productionChainService = inject(ProductionChainService);
  private readonly importExportService = inject(ImportExportService);
  protected readonly itemFileAccept =
    this.productionCatalogService.itemFileAccept;
  protected readonly catalogFileAccept =
    this.productionCatalogService.catalogFileAccept;
  protected readonly recipeFileAccept =
    this.productionCatalogService.recipeFileAccept;
  protected readonly machineFileAccept =
    this.productionCatalogService.machineFileAccept;
  protected readonly productionFileAccept =
    this.productionCatalogService.productionFileAccept;

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
  protected readonly $isDeleteCatalogConfirmOpen = signal<boolean>(false);
  protected readonly $isConvertItemConfirmOpen = signal<boolean>(false);
  protected readonly $convertItemCandidateName = signal<string>('');
  protected readonly $convertItemCandidateIndex = signal<number | undefined>(
    undefined,
  );
  protected readonly $isProductionEditorOpen = signal<boolean>(false);
  protected readonly $editingProductionTemplateIndex = signal<
    number | undefined
  >(undefined);
  protected readonly $editingProductionTemplateDraft = signal<
    Production | undefined
  >(undefined);
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
  protected readonly $hasBlankItem = computed<boolean>(() =>
    this.$plainItems().some((item) => item.name.trim().length === 0),
  );
  protected readonly $hasBlankMachine = computed<boolean>(() =>
    this.$machines().some((machine) => machine.name.trim().length === 0),
  );
  protected readonly $hasBlankRecipe = computed<boolean>(() =>
    this.$catalog().recipes.some((recipe) => recipe.name.trim().length === 0),
  );
  protected readonly $hasBlankProduction = computed<boolean>(() =>
    this.$productions().some((template) => template.name.trim().length === 0),
  );
  protected readonly $usageCounts = computed<CatalogUsageCounts>(() => {
    const itemUsedBySetByName: Record<string, Set<string>> = {};
    const machineUsedBySetByName: Record<string, Set<string>> = {};
    const recipeUsedBySetByName: Record<string, Set<string>> = {};
    const productionUsedBySetByName: Record<string, Set<string>> = {};
    const catalog = this.$catalog();
    const chainItems = this.productionChainService.$productionChains();
    const machineNameSet = new Set(
      this.$machines().map((machine) => normalizeUsageKey(machine.name)),
    );

    for (const recipe of catalog.recipes) {
      const usageLabel = createUsageLabel(DataTypes.Recipe, recipe.name);
      const uniqueItemNames = new Set<string>([
        ...recipe.inputs.map((item) => item.name),
        ...recipe.outputs.map((item) => item.name),
      ]);
      for (const itemName of uniqueItemNames) {
        addUsageLabelByName(itemUsedBySetByName, itemName, usageLabel);
        if (machineNameSet.has(normalizeUsageKey(itemName))) {
          addUsageLabelByName(machineUsedBySetByName, itemName, usageLabel);
        }
      }
    }

    for (const template of catalog.productions) {
      const usageLabel = createUsageLabel(DataTypes.Production, template.name);
      addUsageLabelByName(
        machineUsedBySetByName,
        template.production.machine.name,
        usageLabel,
      );
      addUsageLabelByName(
        recipeUsedBySetByName,
        template.production.recipe.name,
        usageLabel,
      );
    }

    for (const chain of chainItems) {
      for (const production of chain.productions) {
        const usageLabel = createUsageLabel(
          DataTypes.ProductionChain,
          `${chain.display}`,
        );
        addUsageLabelByName(
          productionUsedBySetByName,
          production.name,
          usageLabel,
        );
      }
    }

    return {
      itemByName: toUsageCountMap(itemUsedBySetByName),
      machineByName: toUsageCountMap(machineUsedBySetByName),
      recipeByName: toUsageCountMap(recipeUsedBySetByName),
      productionByName: toUsageCountMap(productionUsedBySetByName),
      itemUsedByByName: toSortedUsageMap(itemUsedBySetByName),
      machineUsedByByName: toSortedUsageMap(machineUsedBySetByName),
      recipeUsedByByName: toSortedUsageMap(recipeUsedBySetByName),
      productionUsedByByName: toSortedUsageMap(productionUsedBySetByName),
    };
  });
  protected readonly $itemUsageByName = computed<Record<string, number>>(
    () => this.$usageCounts().itemByName,
  );
  protected readonly $itemUsageTooltipByName = computed<Record<string, string>>(
    () => toUsageTooltipMap(this.$usageCounts().itemUsedByByName),
  );
  protected readonly $machineUsageByName = computed<Record<string, number>>(
    () => this.$usageCounts().machineByName,
  );
  protected readonly $machineUsageTooltipByName = computed<
    Record<string, string>
  >(() => toUsageTooltipMap(this.$usageCounts().machineUsedByByName));
  protected readonly $recipeUsageByName = computed<Record<string, number>>(
    () => this.$usageCounts().recipeByName,
  );
  protected readonly $recipeUsageTooltipByName = computed<
    Record<string, string>
  >(() => toUsageTooltipMap(this.$usageCounts().recipeUsedByByName));
  protected readonly $productionUsageByName = computed<Record<string, number>>(
    () => this.$usageCounts().productionByName,
  );
  protected readonly $productionUsageTooltipByName = computed<
    Record<string, string>
  >(() => toUsageTooltipMap(this.$usageCounts().productionUsedByByName));
  protected readonly $visibleProductionCards = computed(() => {
    const machineIconsByName = this.$machineIconsByName();
    const productionUsageByName = this.$productionUsageByName();
    const productionUsageTooltipByName = this.$productionUsageTooltipByName();
    const catalogProductions = this.$productions();
    return this.$visibleProductions().map((template) => {
      const machineName = template.production.machine.name;
      return {
        index: catalogProductions.indexOf(template),
        productionId: template.production.id,
        production: template.production,
        name: template.name,
        machineName,
        recipeName: template.production.recipe.name,
        recipeIconUrl: template.production.recipe.iconUrl ?? template.iconUrl,
        machineIconUrl: findIconByName(machineIconsByName, machineName),
        usageCount: getCountByName(productionUsageByName, template.name),
        usageTooltip:
          productionUsageTooltipByName[normalizeUsageKey(template.name)] ?? '',
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
  protected readonly addBlockedTitleByType = {
    item: 'Use the existing blank item first before adding another one.',
    machine: 'Use the existing blank machine first before adding another one.',
    recipe: 'Use the existing blank recipe first before adding another one.',
    production:
      'Use the existing blank production first before adding another one.',
  } as const;
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
    this.$isDeleteCatalogConfirmOpen.set(true);
  }

  protected onConfirmDeleteCatalog(): void {
    this.productionCatalogService.clearCatalog();
  }

  protected onCancelDeleteCatalog(): void {
    this.$isDeleteCatalogConfirmOpen.set(false);
  }

  protected onDeleteAllItems(): void {
    this.productionCatalogService.clearItems();
  }

  protected onDeleteAllMachines(): void {
    this.productionCatalogService.clearMachines();
  }

  protected onDeleteAllRecipes(): void {
    this.productionCatalogService.clearRecipes();
  }

  protected onDeleteAllProductions(): void {
    this.productionCatalogService.clearProductions();
  }

  protected onAddItem(): void {
    if (this.$hasBlankItem()) {
      return;
    }
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

  protected onDownloadItem(item: { name: string }): void {
    this.productionCatalogService.downloadItemByName(item.name);
  }

  protected onRequestConvertItemToMachine(item: { name: string }): void {
    const catalogIndex = this.findCatalogItemIndex(item);
    if (catalogIndex === -1 || !item.name.trim()) {
      return;
    }
    this.$convertItemCandidateName.set(item.name.trim());
    this.$convertItemCandidateIndex.set(catalogIndex);
    this.$isConvertItemConfirmOpen.set(true);
  }

  protected onConfirmConvertItemToMachine(): void {
    const index = this.$convertItemCandidateIndex();
    if (index === undefined) {
      return;
    }
    this.productionCatalogService.convertItemToMachineAtIndex(index);
    this.$convertItemCandidateIndex.set(undefined);
    this.$convertItemCandidateName.set('');
  }

  protected onCancelConvertItemToMachine(): void {
    this.$convertItemCandidateIndex.set(undefined);
    this.$convertItemCandidateName.set('');
    this.$isConvertItemConfirmOpen.set(false);
  }

  protected onAddRecipe(): void {
    if (this.$hasBlankRecipe()) {
      return;
    }
    this.productionCatalogService.addRecipe();
  }

  protected onRecipeChange(recipe: CatalogRecipe): void {
    const index = this.findRecipeIndex(recipe);
    if (index === -1) {
      return;
    }
    const trimmedName = recipe.name.trim();
    const inferredName = recipe.outputs[0]?.name?.trim() ?? '';
    const nextName = trimmedName || inferredName;
    if (nextName !== recipe.name) {
      recipe.name = nextName;
    }
    this.productionCatalogService.updateRecipeAtIndex(index, {
      name: nextName,
      iconUrl: recipe.iconUrl?.trim() || undefined,
      timeToComplete: recipe.timeToComplete,
      inputs: recipe.inputs,
      outputs: recipe.outputs,
    });
  }

  protected onAddRecipeItem(
    recipe: CatalogRecipe,
    collection: CatalogRecipeItemCollection,
  ): void {
    if (collection === CatalogRecipeItemCollection.Inputs) {
      recipe.inputs.push({ name: '', count: 1 });
    } else {
      recipe.outputs.push({ name: '', count: 1 });
    }
    this.onRecipeChange(recipe);
  }

  protected onRemoveRecipeItem(
    recipe: CatalogRecipe,
    itemIndex: number,
    collection: CatalogRecipeItemCollection,
  ): void {
    if (collection === CatalogRecipeItemCollection.Inputs) {
      recipe.inputs.splice(itemIndex, 1);
    } else {
      recipe.outputs.splice(itemIndex, 1);
    }
    this.onRecipeChange(recipe);
  }

  protected onRemoveRecipe(recipe: CatalogRecipe): void {
    if (getCountByName(this.$recipeUsageByName(), recipe.name) > 0) {
      return;
    }
    const index = this.findRecipeIndex(recipe);
    if (index === -1) {
      return;
    }
    this.productionCatalogService.removeRecipeAtIndex(index);
  }

  protected onDownloadRecipe(recipe: CatalogRecipe): void {
    this.productionCatalogService.downloadRecipeByName(recipe.name);
  }

  protected onAddMachine(): void {
    if (this.$hasBlankMachine()) {
      return;
    }
    this.productionCatalogService.addMachine();
  }

  protected onAddProduction(): void {
    if (this.$hasBlankProduction()) {
      return;
    }
    this.productionCatalogService.addProductionTemplate();
  }

  protected onMachineNameFocus(machine: CatalogMachine): void {
    const name = machine.name.trim();
    if (!name) {
      return;
    }
    this.machineNameBeforeEdit.set(machine, name);
  }

  protected onMachineChange(
    machine: CatalogMachine,
    visibleMachineIndex: number,
  ): void {
    const index = this.findMachineIndexByReference(
      machine,
      visibleMachineIndex,
    );
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

  protected onRemoveMachine(
    machine: CatalogMachine,
    visibleMachineIndex: number,
  ): void {
    if (getCountByName(this.$machineUsageByName(), machine.name) > 0) {
      return;
    }
    const index = this.findMachineIndexByReference(
      machine,
      visibleMachineIndex,
    );
    if (index === -1) {
      return;
    }
    this.productionCatalogService.removeMachineAtIndex(index);
  }

  protected onDownloadMachine(machine: CatalogMachine): void {
    this.productionCatalogService.downloadMachineByName(machine.name);
  }

  protected onRemoveProduction(index: number, name: string): void {
    if (getCountByName(this.$productionUsageByName(), name) > 0) {
      return;
    }
    this.productionCatalogService.removeProductionTemplateAtIndex(index);
  }

  protected onEditProduction(index: number): void {
    const template = this.$catalog().productions[index];
    if (!template) {
      return;
    }
    this.$editingProductionTemplateIndex.set(index);
    this.$editingProductionTemplateDraft.set(
      cloneProduction(template.production),
    );
    this.$isProductionEditorOpen.set(true);
  }

  protected onDownloadProduction(production: Production): void {
    this.importExportService.downloadProductionById(production.id, production);
  }

  protected onEditedProductionDraftChange(production: Production): void {
    this.$editingProductionTemplateDraft.set(cloneProduction(production));
  }

  protected onSaveEditedProduction(): void {
    const index = this.$editingProductionTemplateIndex();
    const draft = this.$editingProductionTemplateDraft();
    if (index === undefined || !draft) {
      this.onCancelEditProduction();
      return;
    }
    this.productionCatalogService.updateProductionTemplateAtIndex(index, {
      name: draft.name,
      iconUrl: draft.iconUrl,
      production: draft,
    });
    this.onCancelEditProduction();
  }

  protected onCancelEditProduction(): void {
    this.$isProductionEditorOpen.set(false);
    this.$editingProductionTemplateIndex.set(undefined);
    this.$editingProductionTemplateDraft.set(undefined);
  }

  private async runUpload(action: () => Promise<void>): Promise<void> {
    try {
      await action();
      this.$uploadError.set(undefined);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to import catalog JSON';
      this.$uploadError.set(message);
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

  private findRecipeIndex(target: CatalogRecipe | string): number {
    if (typeof target !== 'string') {
      const indexByReference = this.$catalog().recipes.indexOf(target);
      if (indexByReference !== -1) {
        return indexByReference;
      }
      return this.$catalog().recipes.findIndex(
        (recipe) =>
          recipe.name.trim().toLowerCase() === target.name.trim().toLowerCase(),
      );
    }

    return this.$catalog().recipes.findIndex(
      (recipe) =>
        recipe.name.trim().toLowerCase() === target.trim().toLowerCase(),
    );
  }

  private findMachineIndex(name: string): number {
    return this.$machines().findIndex(
      (machine) =>
        machine.name.trim().toLowerCase() === name.trim().toLowerCase(),
    );
  }

  private findMachineIndexByReference(
    machine: CatalogMachine,
    visibleMachineIndex: number,
  ): number {
    const visibleMachines = this.$visibleMachines();
    const candidate = visibleMachines[visibleMachineIndex];
    if (candidate === machine) {
      const index = this.$machines().indexOf(candidate);
      if (index !== -1) {
        return index;
      }
    }
    return this.findMachineIndex(machine.name);
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
  itemUsedByByName: Record<string, string[]>;
  machineUsedByByName: Record<string, string[]>;
  recipeUsedByByName: Record<string, string[]>;
  productionUsedByByName: Record<string, string[]>;
}

function normalizeUsageKey(name: string): string {
  return name.trim().toLowerCase();
}

function addUsageLabelByName(
  map: Record<string, Set<string>>,
  name: string,
  usageLabel: string,
): void {
  const key = normalizeUsageKey(name);
  if (!key || !usageLabel.trim()) {
    return;
  }
  if (!map[key]) {
    map[key] = new Set<string>();
  }
  map[key].add(usageLabel);
}

function toSortedUsageMap(
  map: Record<string, Set<string>>,
): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(map).map(([key, labels]) => [key, [...labels].sort()]),
  );
}

function toUsageCountMap(
  map: Record<string, Set<string>>,
): Record<string, number> {
  return Object.fromEntries(
    Object.entries(map).map(([key, labels]) => [key, labels.size]),
  );
}

function toUsageTooltipMap(
  map: Record<string, string[]>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(map).map(([key, labels]) => [key, labels.join('\n')]),
  );
}

function createUsageLabel(contextId: DataTypes, name: string): string {
  const context: string = DATA_TYPES_INFO[contextId].display;
  const nextName = name.trim();
  if (!nextName) {
    return context;
  }
  return `${context}: ${nextName}`;
}

function getCountByName(map: Record<string, number>, name: string): number {
  const key = normalizeUsageKey(name);
  if (!key) {
    return 0;
  }
  return map[key] ?? 0;
}

function cloneProduction(production: Production): Production {
  if (typeof structuredClone === 'function') {
    return structuredClone(production);
  }
  return JSON.parse(JSON.stringify(production)) as Production;
}

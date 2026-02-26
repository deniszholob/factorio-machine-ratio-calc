import { Injectable, computed, signal } from '@angular/core';
import {
  CatalogItem,
  CatalogMachine,
  CatalogProduction,
  CatalogRecipe,
  ProductionCatalogState,
  createDefaultCatalogState,
} from '../../models/production-catalog-state/production-catalog-state.model';
import { LOCAL_STORAGE_KEY_CATALOG } from '../import-export/local-storage.data';
import {
  newMachineItem,
  normalizeProduction,
} from 'src/app/components/production/production-chain-editor/production-editor/production.util';
import { SharedProductionIconsPayload } from '../production-chain/production-chain-hash.util';
import { Production } from '../../models/production-chain/production/production.model';
import { ImportMode } from '../../models/import-mode.enum';
import { DataTypes } from '../../models/data-types/data-types.enum';

const DOWNLOAD_FILE_EXTENSION = 'json';
const DOWNLOAD_FILE_PREFIX = 'PRC1';
const DOWNLOAD_SCOPE_LIST = 'list';
const CATALOG_DOWNLOAD_TYPE = 'Catalog';
const DOWNLOAD_FILE_NAME_PATTERN = new RegExp(
  `^${DOWNLOAD_FILE_PREFIX}\\.([^.]+)\\.(${Object.values(DataTypes).join('|')})\\.${DOWNLOAD_FILE_EXTENSION}$`,
);
const DEFAULT_ITEM_NAME = 'Default-Item';
const DEFAULT_RECIPE_NAME = 'Default Recipe';
const DEFAULT_MACHINE_NAME = 'Default Machine';
const DEFAULT_PRODUCTION_NAME = 'Project Assembly';
const DEFAULT_AUTONAME_PRODUCTION_NAME = `${DEFAULT_RECIPE_NAME} in ${DEFAULT_MACHINE_NAME}`;

enum CatalogNameType {
  'Item' = 'Item',
  'Recipe' = 'Recipe',
  'Machine' = 'Machine',
  'Production' = 'Production',
}

@Injectable({ providedIn: 'root' })
export class ProductionCatalogService {
  private readonly _$catalog = signal<ProductionCatalogState>(loadCatalog());
  public readonly $catalog = this._$catalog.asReadonly();
  public readonly itemFileAccept = getDataTypeFileAccept(DataTypes.Item);
  public readonly recipeFileAccept = getDataTypeFileAccept(DataTypes.Recipe);
  public readonly machineFileAccept = getDataTypeFileAccept(DataTypes.Machine);
  public readonly productionFileAccept = getDataTypeFileAccept(
    DataTypes.Production,
  );
  public readonly catalogFileAccept = getCatalogFileAccept();

  private readonly $machineItems = computed(() =>
    this.$catalog().items.filter((item) => item.isMachine === true),
  );

  public readonly $itemNames = computed(() =>
    this.$catalog()
      .items.map((item) => item.name)
      .filter((item) => item.trim().length > 0)
      .sort((a, b) => a.localeCompare(b)),
  );

  public readonly $recipeNames = computed(() =>
    this.$catalog()
      .recipes.map((recipe) => recipe.name)
      .filter((recipe) => recipe.trim().length > 0)
      .sort((a, b) => a.localeCompare(b)),
  );

  public readonly $machineNames = computed(() =>
    this.$machineItems()
      .map((machine) => machine.name)
      .filter((machine) => machine.trim().length > 0)
      .sort((a, b) => a.localeCompare(b)),
  );

  public readonly $productionNames = computed(() =>
    this.$catalog()
      .productions.map((template) => template.name)
      .filter((name) => name.trim().length > 0)
      .sort((a, b) => a.localeCompare(b)),
  );

  public readonly $itemIconsByName = computed<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const item of this.$catalog().items) {
      if (!item.iconUrl) {
        continue;
      }
      map[item.name] = item.iconUrl;
    }
    return map;
  });

  public readonly $recipeIconsByName = computed<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const recipe of this.$catalog().recipes) {
      if (!recipe.iconUrl) {
        continue;
      }
      map[recipe.name] = recipe.iconUrl;
    }
    return map;
  });

  public readonly $machineIconsByName = computed<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const machine of this.$machineItems()) {
      if (!machine.iconUrl) {
        continue;
      }
      map[machine.name] = machine.iconUrl;
    }
    return map;
  });

  public readonly $productionIconsByName = computed<Record<string, string>>(
    () => {
      const map: Record<string, string> = {};
      for (const template of this.$catalog().productions) {
        if (!template.iconUrl) {
          continue;
        }
        map[template.name] = template.iconUrl;
      }
      return map;
    },
  );

  public getSharedIconMaps(): SharedProductionIconsPayload {
    return {
      itemByName: { ...this.$itemIconsByName() },
      recipeByName: { ...this.$recipeIconsByName() },
      machineByName: { ...this.$machineIconsByName() },
    };
  }

  public rebuildCatalogFromProductions(
    productions: Production[],
    icons?: SharedProductionIconsPayload,
  ): void {
    const nextState = buildCatalogStateFromProductions(productions, icons);
    this.setCatalog(nextState);
  }

  public mergeCatalogFromProductions(productions: Production[]): void {
    const incoming = buildCatalogStateFromProductions(productions);
    const merged = mergeCatalogStates(this.$catalog(), incoming);
    this.setCatalog(merged);
  }

  public getRecipeByName(name: string): CatalogRecipe | undefined {
    const index = this.findRecipeIndex(name);
    if (index === -1) {
      return undefined;
    }
    const recipe = this.$catalog().recipes[index];
    return cloneRecipe(recipe);
  }

  public getMachineByName(name: string): CatalogMachine | undefined {
    const machineItem = this.$machineItems().find(
      (item) => item.name.trim().toLowerCase() === name.trim().toLowerCase(),
    );
    if (!machineItem) {
      return undefined;
    }

    return {
      name: machineItem.name,
      iconUrl: machineItem.iconUrl,
      craftingSpeed: machineItem.craftingSpeed ?? 1,
      productivity: machineItem.productivity ?? 1,
      drain: machineItem.drain ?? 1,
    };
  }

  public getProductionTemplateByName(
    name: string,
  ): CatalogProduction | undefined {
    const index = findIndexByName(this.$catalog().productions, name);
    if (index === -1) {
      return undefined;
    }

    const template = this.$catalog().productions[index];
    return {
      name: template.name,
      iconUrl: template.iconUrl,
      production: cloneProduction(template.production),
    };
  }

  public async uploadCatalog(files: File[], mode: ImportMode): Promise<void> {
    const file = getFirstFile(files);
    if (!file) {
      return;
    }
    assertCatalogFileName(file.name);

    const payload = await readJsonFile<unknown>(file);
    const incoming = normalizeCatalogState(payload);
    const nextState =
      mode === ImportMode.Override
        ? incoming
        : mergeCatalogStates(this.$catalog(), incoming);
    this.setCatalog(nextState);
  }

  public async uploadItems(files: File[], mode: ImportMode): Promise<void> {
    const file = getFirstFile(files);
    if (!file) {
      return;
    }
    const fileMeta = assertCatalogUploadFileType(file.name, DataTypes.Item);

    const payload = await readJsonFile<unknown>(file);
    const incomingItems = normalizeCatalogItemsByScope(payload, fileMeta.scope);

    this._$catalog.update((state) => {
      const machineItems = state.items.filter(
        (item) => item.isMachine === true,
      );
      const nextItems =
        mode === ImportMode.Override
          ? [...incomingItems, ...machineItems]
          : mergeByName(state.items, incomingItems);
      const nextState = withCatalogConsistency({
        ...state,
        items: nextItems,
      });
      saveCatalog(nextState);
      return nextState;
    });
  }

  public async uploadRecipes(files: File[], mode: ImportMode): Promise<void> {
    const file = getFirstFile(files);
    if (!file) {
      return;
    }
    const fileMeta = assertCatalogUploadFileType(file.name, DataTypes.Recipe);

    const payload = await readJsonFile<unknown>(file);
    const incomingRecipes = normalizeCatalogRecipesByScope(
      payload,
      fileMeta.scope,
    );

    this._$catalog.update((state) => {
      const nextRecipes =
        mode === ImportMode.Override
          ? incomingRecipes
          : mergeByName(state.recipes, incomingRecipes);
      const nextState = withCatalogConsistency({
        ...state,
        recipes: nextRecipes,
      });
      saveCatalog(nextState);
      return nextState;
    });
  }

  public async uploadMachines(files: File[], mode: ImportMode): Promise<void> {
    const file = getFirstFile(files);
    if (!file) {
      return;
    }
    const fileMeta = assertCatalogUploadFileType(file.name, DataTypes.Machine);

    const payload = await readJsonFile<unknown>(file);
    const incomingMachines = normalizeCatalogMachinesByScope(
      payload,
      fileMeta.scope,
    ).map((machine) => machineToCatalogItem(machine));

    this._$catalog.update((state) => {
      const nonMachineItems = state.items.filter((item) => !item.isMachine);
      const nextItems =
        mode === ImportMode.Override
          ? [...nonMachineItems, ...incomingMachines]
          : mergeByName(state.items, incomingMachines);
      const nextState = withCatalogConsistency({
        ...state,
        items: nextItems,
      });
      saveCatalog(nextState);
      return nextState;
    });
  }

  public async uploadProductions(
    files: File[],
    mode: ImportMode,
  ): Promise<void> {
    const file = getFirstFile(files);
    if (!file) {
      return;
    }
    const fileMeta = assertCatalogUploadFileType(file.name, DataTypes.Production);

    const payload = await readJsonFile<unknown>(file);
    const incomingTemplates = normalizeCatalogProductionsByScope(
      payload,
      fileMeta.scope,
    );
    this._$catalog.update((state) => {
      const nextTemplates =
        mode === ImportMode.Override
          ? incomingTemplates
          : mergeByName(state.productions, incomingTemplates);
      const nextState = withCatalogConsistency({
        ...state,
        productions: nextTemplates,
      });
      saveCatalog(nextState);
      return nextState;
    });
  }

  public downloadCatalog(): void {
    downloadJson(this.$catalog(), createCatalogFileName());
  }

  public downloadItems(): void {
    const plainItems = this.$catalog().items.filter(
      (item) => item.isMachine !== true,
    );
    downloadJson(plainItems, createDownloadFileName(DataTypes.Item));
  }

  public downloadItemByName(name: string): void {
    const index = findIndexByName(this.$catalog().items, name);
    if (index === -1) {
      return;
    }
    const item = this.$catalog().items[index];
    if (item.isMachine === true) {
      return;
    }
    downloadJson(
      item,
      createDownloadFileNameWithScope(toDownloadScope(item.name), DataTypes.Item),
    );
  }

  public downloadRecipes(): void {
    downloadJson(this.$catalog().recipes, createDownloadFileName(DataTypes.Recipe));
  }

  public downloadRecipeByName(name: string): void {
    const index = findIndexByName(this.$catalog().recipes, name);
    if (index === -1) {
      return;
    }
    const recipe = this.$catalog().recipes[index];
    downloadJson(
      recipe,
      createDownloadFileNameWithScope(
        toDownloadScope(recipe.name),
        DataTypes.Recipe,
      ),
    );
  }

  public downloadMachines(): void {
    const machines = this.$machineItems().map((item) => ({
      name: item.name,
      iconUrl: item.iconUrl,
      craftingSpeed: item.craftingSpeed ?? 1,
      productivity: item.productivity ?? 1,
      drain: item.drain ?? 1,
    }));
    downloadJson(machines, createDownloadFileName(DataTypes.Machine));
  }

  public downloadMachineByName(name: string): void {
    const machineItem = this.$machineItems().find(
      (item) => item.name.trim().toLowerCase() === name.trim().toLowerCase(),
    );
    if (!machineItem) {
      return;
    }

    const machine: CatalogMachine = {
      name: machineItem.name,
      iconUrl: machineItem.iconUrl,
      craftingSpeed: machineItem.craftingSpeed ?? 1,
      productivity: machineItem.productivity ?? 1,
      drain: machineItem.drain ?? 1,
    };

    downloadJson(
      machine,
      createDownloadFileNameWithScope(
        toDownloadScope(machine.name),
        DataTypes.Machine,
      ),
    );
  }

  public downloadProductions(): void {
    downloadJson(
      this.$catalog().productions,
      createDownloadFileName(DataTypes.Production),
    );
  }

  public clearCatalog(): void {
    const nextState = createDefaultCatalogState();
    this._$catalog.set(nextState);
    saveCatalog(nextState);
  }

  public clearItems(): void {
    this._$catalog.update((state) => {
      const nextState: ProductionCatalogState = {
        ...state,
        items: state.items.filter((item) => item.isMachine === true),
      };
      saveCatalog(nextState);
      return nextState;
    });
  }

  public clearMachines(): void {
    this._$catalog.update((state) => {
      const nextState: ProductionCatalogState = {
        ...state,
        items: state.items.filter((item) => item.isMachine !== true),
      };
      saveCatalog(nextState);
      return nextState;
    });
  }

  public clearRecipes(): void {
    this._$catalog.update((state) => {
      const nextState = withCatalogConsistency({
        ...state,
        recipes: [],
      });
      saveCatalog(nextState);
      return nextState;
    });
  }

  public clearProductions(): void {
    this._$catalog.update((state) => {
      const nextState = withCatalogConsistency({
        ...state,
        productions: [],
      });
      saveCatalog(nextState);
      return nextState;
    });
  }

  public upsertRecipe(recipe: CatalogRecipe): void {
    const trimmed = recipe.name.trim();
    if (!trimmed || isDefaultRecipeName(trimmed)) {
      return;
    }

    this._$catalog.update((state) => {
      const index = findIndexByName(state.recipes, trimmed);
      const nextRecipes = [...state.recipes];
      const normalizedRecipe: CatalogRecipe = {
        name: trimmed,
        iconUrl: normalizeIconUrl(recipe.iconUrl),
        timeToComplete: recipe.timeToComplete,
        inputs: recipe.inputs.map((item) => ({ ...item })),
        outputs: recipe.outputs.map((item) => ({ ...item })),
      };

      if (index === -1) {
        nextRecipes.push(normalizedRecipe);
      } else {
        nextRecipes[index] = normalizedRecipe;
      }

      const nextState = withCatalogConsistency({
        ...state,
        recipes: nextRecipes,
      });
      saveCatalog(nextState);
      return nextState;
    });
  }

  public upsertMachine(machine: CatalogMachine): void {
    const trimmed = machine.name.trim();
    if (!trimmed || isDefaultMachineName(trimmed)) {
      return;
    }

    this._$catalog.update((state) => {
      const nextItems = [...state.items];
      const index = findIndexByName(nextItems, trimmed);
      const machineItem = machineToCatalogItem(machine);

      if (index === -1) {
        nextItems.push(machineItem);
      } else {
        nextItems[index] = {
          ...nextItems[index],
          ...machineItem,
          isMachine: true,
        };
      }

      const nextState = withCatalogConsistency({
        ...state,
        items: nextItems,
      });
      saveCatalog(nextState);
      return nextState;
    });
  }

  public upsertItemName(name: string): void {
    const trimmed = name.trim();
    if (!trimmed || isDefaultItemName(trimmed)) {
      return;
    }

    this._$catalog.update((state) => {
      if (findIndexByName(state.items, trimmed) !== -1) {
        return state;
      }

      const nextState: ProductionCatalogState = {
        ...state,
        items: [...state.items, { name: trimmed }],
      };
      saveCatalog(nextState);
      return nextState;
    });
  }

  public addItem(): void {
    this._$catalog.update((state) => {
      const nextState: ProductionCatalogState = {
        ...state,
        items: [...state.items, { name: '' }],
      };
      saveCatalog(nextState);
      return nextState;
    });
  }

  public updateItemAtIndex(index: number, item: CatalogItem): void {
    this._$catalog.update((state) => {
      if (index < 0 || index >= state.items.length) {
        return state;
      }

      const nextItems = [...state.items];
      nextItems[index] = {
        ...nextItems[index],
        name: item.name,
        iconUrl: normalizeIconUrl(item.iconUrl),
      };
      const nextState: ProductionCatalogState = {
        ...state,
        items: nextItems,
      };
      saveCatalog(nextState);
      return nextState;
    });
  }

  public renameReferences(previousName: string, nextName: string): void {
    const from = previousName.trim();
    const to = nextName.trim();
    if (!from || !to || from.toLowerCase() === to.toLowerCase()) {
      return;
    }

    this._$catalog.update((state) => {
      const nextRecipes = state.recipes.map((recipe) => ({
        ...recipe,
        inputs: recipe.inputs.map((item) =>
          item.name.trim().toLowerCase() === from.toLowerCase()
            ? { ...item, name: to }
            : item,
        ),
        outputs: recipe.outputs.map((item) =>
          item.name.trim().toLowerCase() === from.toLowerCase()
            ? { ...item, name: to }
            : item,
        ),
      }));
      const nextState: ProductionCatalogState = {
        ...state,
        recipes: nextRecipes,
      };
      saveCatalog(nextState);
      return nextState;
    });
  }

  public removeItemAtIndex(index: number): void {
    this._$catalog.update((state) => {
      if (index < 0 || index >= state.items.length) {
        return state;
      }
      const nextItems = [...state.items];
      nextItems.splice(index, 1);
      const nextState: ProductionCatalogState = {
        ...state,
        items: nextItems,
      };
      saveCatalog(nextState);
      return nextState;
    });
  }

  public convertItemToMachineAtIndex(index: number): void {
    this._$catalog.update((state) => {
      if (index < 0 || index >= state.items.length) {
        return state;
      }
      const target = state.items[index];
      if (target?.isMachine === true) {
        return state;
      }

      const nextItems = [...state.items];
      nextItems[index] = {
        ...target,
        isMachine: true,
        craftingSpeed: target.craftingSpeed ?? 1,
        productivity: target.productivity ?? 1,
        drain: target.drain ?? 1,
      };

      const nextState: ProductionCatalogState = {
        ...state,
        items: nextItems,
      };
      saveCatalog(nextState);
      return nextState;
    });
  }

  public addRecipe(): void {
    this._$catalog.update((state) => {
      const nextRecipes = [...state.recipes];
      nextRecipes.push({
        name: '',
        timeToComplete: 1,
        inputs: [{ name: '', count: 1 }],
        outputs: [{ name: '', count: 1 }],
      });
      const nextState: ProductionCatalogState = {
        ...state,
        recipes: nextRecipes,
      };
      saveCatalog(nextState);
      return nextState;
    });
  }

  public updateRecipeAtIndex(index: number, recipe: CatalogRecipe): void {
    this._$catalog.update((state) => {
      if (index < 0 || index >= state.recipes.length) {
        return state;
      }

      const nextRecipes = [...state.recipes];
      nextRecipes[index] = {
        name: recipe.name,
        iconUrl: normalizeIconUrl(recipe.iconUrl),
        timeToComplete: recipe.timeToComplete,
        inputs: recipe.inputs.map((item) => ({ ...item })),
        outputs: recipe.outputs.map((item) => ({ ...item })),
      };

      const nextState: ProductionCatalogState = {
        ...state,
        recipes: nextRecipes,
      };
      saveCatalog(nextState);
      return nextState;
    });
  }

  public removeRecipeAtIndex(index: number): void {
    this._$catalog.update((state) => {
      if (index < 0 || index >= state.recipes.length) {
        return state;
      }
      const nextRecipes = [...state.recipes];
      nextRecipes.splice(index, 1);
      const nextState: ProductionCatalogState = {
        ...state,
        recipes: nextRecipes,
      };
      saveCatalog(nextState);
      return nextState;
    });
  }

  public addMachine(): void {
    this._$catalog.update((state) => {
      const nextState: ProductionCatalogState = {
        ...state,
        items: [
          ...state.items,
          {
            name: '',
            isMachine: true,
            craftingSpeed: 1,
            productivity: 1,
            drain: 1,
          },
        ],
      };
      saveCatalog(nextState);
      return nextState;
    });
  }

  public updateMachineAtIndex(index: number, machine: CatalogMachine): void {
    this._$catalog.update((state) => {
      const machines = state.items.filter((item) => item.isMachine);
      if (index < 0 || index >= machines.length) {
        return state;
      }

      const targetName = machines[index].name;
      const nextItems = state.items.map((item) => {
        if (
          item.name.trim().toLowerCase() !== targetName.trim().toLowerCase()
        ) {
          return item;
        }
        return {
          ...item,
          ...machineToCatalogItem(machine),
          isMachine: true,
        };
      });

      const nextState: ProductionCatalogState = {
        ...state,
        items: nextItems,
      };
      saveCatalog(nextState);
      return nextState;
    });
  }

  public removeMachineAtIndex(index: number): void {
    this._$catalog.update((state) => {
      const machines = state.items.filter((item) => item.isMachine);
      if (index < 0 || index >= machines.length) {
        return state;
      }

      const targetName = machines[index].name;
      const nextItems = state.items.filter(
        (item) =>
          !(
            item.isMachine &&
            item.name.trim().toLowerCase() === targetName.trim().toLowerCase()
          ),
      );

      const nextState: ProductionCatalogState = {
        ...state,
        items: nextItems,
      };
      saveCatalog(nextState);
      return nextState;
    });
  }

  public upsertProductionTemplate(production: Production): void {
    const normalized = normalizeProduction(production);
    const trimmedName = normalized.name.trim();
    if (!trimmedName || isDefaultProductionName(trimmedName)) {
      return;
    }

    this._$catalog.update((state) => {
      const indexById = state.productions.findIndex(
        (template) => template.production.id === normalized.id,
      );
      const index = indexById;
      const nextTemplates = [...state.productions];
      let nextName = trimmedName;

      if (indexById !== -1) {
        const otherTemplates = nextTemplates.filter(
          (_template, templateIndex) => templateIndex !== indexById,
        );
        if (findIndexByName(otherTemplates, nextName) !== -1) {
          nextName = ensureUniqueName(nextName, otherTemplates);
        }
      } else if (findIndexByName(nextTemplates, nextName) !== -1) {
        nextName = ensureUniqueName(nextName, nextTemplates);
      }

      const nextProduction = cloneProduction(normalized);
      nextProduction.name = nextName;
      const nextTemplate: CatalogProduction = {
        name: nextName,
        iconUrl: normalizeIconUrl(normalized.iconUrl),
        production: nextProduction,
      };

      if (index === -1) {
        nextTemplates.push(nextTemplate);
      } else {
        nextTemplates[index] = nextTemplate;
      }

      const nextState = withCatalogConsistency({
        ...state,
        productions: nextTemplates,
      });
      saveCatalog(nextState);
      return nextState;
    });
  }

  public addProductionTemplate(): void {
    this._$catalog.update((state) => {
      const nextState: ProductionCatalogState = {
        ...state,
        productions: [
          ...state.productions,
          {
            name: '',
            production: normalizeProduction({
              name: '',
              recipe: {
                name: '',
                timeToComplete: 1,
                inputs: [newMachineItem()],
                outputs: [newMachineItem()],
              },
              machine: {
                name: '',
                craftingSpeed: 1,
                productivity: 1,
                drain: 1,
              },
            }),
          },
        ],
      };
      saveCatalog(nextState);
      return nextState;
    });
  }

  public updateProductionTemplateAtIndex(
    index: number,
    template: CatalogProduction,
  ): void {
    this._$catalog.update((state) => {
      if (index < 0 || index >= state.productions.length) {
        return state;
      }
      const nextTemplates = [...state.productions];
      const normalized = normalizeProduction(template.production);
      nextTemplates[index] = {
        name: template.name.trim(),
        iconUrl: normalizeIconUrl(template.iconUrl),
        production: cloneProduction(normalized),
      };
      const nextState: ProductionCatalogState = {
        ...state,
        productions: nextTemplates,
      };
      saveCatalog(nextState);
      return nextState;
    });
  }

  public removeProductionTemplateAtIndex(index: number): void {
    this._$catalog.update((state) => {
      if (index < 0 || index >= state.productions.length) {
        return state;
      }
      const nextTemplates = [...state.productions];
      nextTemplates.splice(index, 1);
      const nextState = withCatalogConsistency({
        ...state,
        productions: nextTemplates,
      });
      saveCatalog(nextState);
      return nextState;
    });
  }

  private setCatalog(nextState: ProductionCatalogState): void {
    const normalized = withCatalogConsistency(nextState);
    this._$catalog.set(normalized);
    saveCatalog(normalized);
  }

  private findRecipeIndex(name: string): number {
    return findIndexByName(this.$catalog().recipes, name);
  }
}

function machineToCatalogItem(machine: CatalogMachine): CatalogItem {
  return {
    name: machine.name.trim(),
    iconUrl: normalizeIconUrl(machine.iconUrl),
    isMachine: true,
    craftingSpeed: machine.craftingSpeed,
    productivity: machine.productivity,
    drain: machine.drain,
  };
}

function normalizeIconUrl(iconUrl: string | undefined): string | undefined {
  if (!iconUrl) {
    return undefined;
  }
  const trimmed = iconUrl.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function getFirstFile(files: File[]): File | undefined {
  if (files.length === 0) {
    return undefined;
  }
  return files[0];
}

function loadCatalog(): ProductionCatalogState {
  const payload = localStorage.getItem(LOCAL_STORAGE_KEY_CATALOG);
  if (!payload) {
    return createDefaultCatalogState();
  }

  try {
    const parsed = JSON.parse(payload) as unknown;
    return normalizeCatalogState(parsed);
  } catch {
    return createDefaultCatalogState();
  }
}

function saveCatalog(state: ProductionCatalogState): void {
  const payload = JSON.stringify(state);
  localStorage.setItem(LOCAL_STORAGE_KEY_CATALOG, payload);
}

function buildCatalogStateFromProductions(
  productions: Production[],
  icons?: SharedProductionIconsPayload,
): ProductionCatalogState {
  const nextState = createDefaultCatalogState();
  const recipeIconsByName = {
    ...(icons?.recipeByName ?? {}),
    ...collectRecipeIconsByName(productions),
  };
  const itemIconsByName = {
    ...(icons?.itemByName ?? {}),
    ...collectItemIconsByName(productions, recipeIconsByName),
  };
  const machineIconsByName = { ...(icons?.machineByName ?? {}) };

  for (const source of productions) {
    const production = normalizeProduction(source);

    const machineName = production.machine.name.trim();
    if (isAllowedCatalogName(machineName, CatalogNameType.Machine)) {
      upsertCatalogItemByName(nextState.items, {
        name: machineName,
        isMachine: true,
        iconUrl: findIconByName(machineIconsByName, machineName),
        craftingSpeed: production.machine.craftingSpeed,
        productivity: production.machine.productivity,
        drain: production.machine.drain,
      });
    }

    const recipeName = production.recipe.name.trim();
    const firstOutputName = production.recipe.outputs[0]?.name?.trim() ?? '';
    if (isAllowedCatalogName(recipeName, CatalogNameType.Recipe)) {
      upsertRecipeByName(nextState.recipes, {
        name: recipeName,
        iconUrl:
          normalizeIconUrl(production.recipe.iconUrl) ??
          findIconByName(recipeIconsByName, recipeName) ??
          findIconByName(itemIconsByName, firstOutputName),
        timeToComplete: production.recipe.timeToComplete,
        inputs: production.recipe.inputs.map((item) => ({
          name: item.name,
          count: item.count,
        })),
        outputs: production.recipe.outputs.map((item) => ({
          name: item.name,
          count: item.count,
        })),
      });
    }

    for (const item of production.recipe.inputs) {
      const itemName = item.name.trim();
      if (!isAllowedCatalogName(itemName, CatalogNameType.Item)) {
        continue;
      }
      upsertCatalogItemByName(nextState.items, {
        name: itemName,
        iconUrl: findIconByName(itemIconsByName, itemName),
      });
    }

    for (const item of production.recipe.outputs) {
      const itemName = item.name.trim();
      if (!isAllowedCatalogName(itemName, CatalogNameType.Item)) {
        continue;
      }
      upsertCatalogItemByName(nextState.items, {
        name: itemName,
        iconUrl: findIconByName(itemIconsByName, itemName),
      });
    }

    const productionName = production.name.trim();
    if (!isAllowedCatalogName(productionName, CatalogNameType.Production)) {
      continue;
    }

    const template: CatalogProduction = {
      name: productionName,
      iconUrl: normalizeIconUrl(production.iconUrl),
      production: cloneProduction(production),
    };
    upsertProductionTemplateByName(nextState.productions, template);
  }

  return withCatalogConsistency(nextState);
}

function upsertCatalogItemByName(
  items: CatalogItem[],
  item: CatalogItem,
): void {
  const index = findIndexByName(items, item.name);
  const normalizedIconUrl = normalizeIconUrl(item.iconUrl);
  if (index === -1) {
    items.push({
      ...item,
      iconUrl: normalizedIconUrl,
    });
    return;
  }

  items[index] = {
    ...items[index],
    ...item,
    iconUrl: normalizedIconUrl ?? items[index].iconUrl,
  };
}

function upsertRecipeByName(
  recipes: CatalogRecipe[],
  recipe: CatalogRecipe,
): void {
  const index = findIndexByName(recipes, recipe.name);
  if (index === -1) {
    recipes.push(recipe);
    return;
  }
  recipes[index] = recipe;
}

function upsertProductionTemplateByName(
  templates: CatalogProduction[],
  template: CatalogProduction,
): void {
  const index = findIndexByName(templates, template.name);
  if (index === -1) {
    templates.push(template);
    return;
  }
  templates[index] = template;
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

function collectRecipeIconsByName(
  productions: Production[],
): Record<string, string> {
  const map: Record<string, string> = {};

  for (const source of productions) {
    const production = normalizeProduction(source);
    const recipeName = production.recipe.name.trim();
    const recipeIconUrl = normalizeIconUrl(production.recipe.iconUrl);
    if (!recipeName || !recipeIconUrl) {
      continue;
    }
    map[recipeName] = recipeIconUrl;
  }

  return map;
}

function collectItemIconsByName(
  productions: Production[],
  recipeIconsByName: Record<string, string>,
): Record<string, string> {
  const map: Record<string, string> = {};

  for (const source of productions) {
    const production = normalizeProduction(source);
    const firstOutputName = production.recipe.outputs[0]?.name?.trim();
    if (!firstOutputName) {
      continue;
    }

    const recipeName = production.recipe.name.trim();
    const iconUrl =
      normalizeIconUrl(production.recipe.iconUrl) ??
      findIconByName(recipeIconsByName, recipeName);
    if (!iconUrl) {
      continue;
    }
    map[firstOutputName] = iconUrl;
  }

  return map;
}

function cloneRecipe(recipe: CatalogRecipe): CatalogRecipe {
  return {
    name: recipe.name,
    iconUrl: recipe.iconUrl,
    timeToComplete: recipe.timeToComplete,
    inputs: recipe.inputs.map((item) => ({ ...item })),
    outputs: recipe.outputs.map((item) => ({ ...item })),
  };
}

function findIndexByName<T extends { name: string }>(
  items: T[],
  name: string,
): number {
  const normalized = name.trim().toLowerCase();
  return items.findIndex(
    (item) => item.name.trim().toLowerCase() === normalized,
  );
}

function ensureUniqueName<T extends { name: string }>(
  baseName: string,
  items: T[],
): string {
  const normalizedNames = new Set(
    items.map((item) => item.name.trim().toLowerCase()),
  );
  if (!normalizedNames.has(baseName.toLowerCase())) {
    return baseName;
  }

  let counter = 2;
  let nextName = `${baseName} ${counter}`;
  while (normalizedNames.has(nextName.toLowerCase())) {
    counter += 1;
    nextName = `${baseName} ${counter}`;
  }
  return nextName;
}

function withCatalogConsistency(
  source: ProductionCatalogState,
): ProductionCatalogState {
  const items = normalizeCatalogItems(source.items);
  const recipes = normalizeCatalogRecipes(source.recipes);
  const productions = normalizeCatalogProductions(source.productions);

  const recipeItemNames = recipes.flatMap((recipe) => [
    ...recipe.inputs.map((item) => item.name),
    ...recipe.outputs.map((item) => item.name),
  ]);

  const mergedItems = mergeByName(
    items,
    recipeItemNames
      .filter((name) => isAllowedCatalogName(name, CatalogNameType.Item))
      .map((name) => ({ name })),
  );

  return {
    items: mergedItems,
    recipes,
    productions,
  };
}

function normalizeCatalogState(payload: unknown): ProductionCatalogState {
  if (!payload || typeof payload !== 'object') {
    return createDefaultCatalogState();
  }

  const maybe = payload as {
    items?: unknown;
    recipes?: unknown;
    machines?: unknown;
    productions?: unknown;
  };

  const items = normalizeCatalogItems(maybe.items);
  const recipes = normalizeCatalogRecipes(maybe.recipes);
  const productions = normalizeCatalogProductions(maybe.productions);
  const machines = normalizeCatalogMachines(maybe.machines).map((machine) =>
    machineToCatalogItem(machine),
  );

  return withCatalogConsistency({
    items: mergeByName(items, machines),
    recipes,
    productions,
  });
}

function normalizeCatalogItems(payload: unknown): CatalogItem[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  const nextItems: CatalogItem[] = [];
  for (const item of payload) {
    const normalized = normalizeCatalogItem(item);
    if (!normalized) {
      continue;
    }
    const existingIndex = findIndexByName(nextItems, normalized.name);
    if (existingIndex === -1) {
      nextItems.push(normalized);
    } else {
      nextItems[existingIndex] = {
        ...nextItems[existingIndex],
        ...normalized,
      };
    }
  }

  return nextItems;
}

function normalizeCatalogItemsByScope(
  payload: unknown,
  scope: string,
): CatalogItem[] {
  if (scope === DOWNLOAD_SCOPE_LIST) {
    const nextItems = normalizeCatalogItems(payload);
    if (nextItems.length === 0) {
      throw new Error('Uploaded item file must contain an items array');
    }
    return nextItems;
  }

  const item = normalizeCatalogItem(payload);
  if (!item) {
    throw new Error('Uploaded item file must contain exactly one item object');
  }
  return [item];
}

function normalizeCatalogRecipes(payload: unknown): CatalogRecipe[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  const nextRecipes: CatalogRecipe[] = [];
  for (const recipe of payload) {
    const normalized = normalizeCatalogRecipe(recipe);
    if (!normalized) {
      continue;
    }

    const index = findIndexByName(nextRecipes, normalized.name);
    if (index === -1) {
      nextRecipes.push(normalized);
    } else {
      nextRecipes[index] = normalized;
    }
  }

  return nextRecipes;
}

function normalizeCatalogRecipesByScope(
  payload: unknown,
  scope: string,
): CatalogRecipe[] {
  if (scope === DOWNLOAD_SCOPE_LIST) {
    const nextRecipes = normalizeCatalogRecipes(payload);
    if (nextRecipes.length === 0) {
      throw new Error('Uploaded recipe file must contain a recipes array');
    }
    return nextRecipes;
  }

  const recipe = normalizeCatalogRecipe(payload);
  if (!recipe) {
    throw new Error(
      'Uploaded recipe file must contain exactly one recipe object',
    );
  }
  return [recipe];
}

function normalizeCatalogProductions(payload: unknown): CatalogProduction[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  const nextTemplates: CatalogProduction[] = [];
  for (const template of payload) {
    const normalized = normalizeCatalogProduction(template);
    if (!normalized) {
      continue;
    }

    const index = findIndexByName(nextTemplates, normalized.name);
    if (index === -1) {
      nextTemplates.push(normalized);
    } else {
      nextTemplates[index] = normalized;
    }
  }

  return nextTemplates;
}

function normalizeCatalogProductionsByScope(
  payload: unknown,
  scope: string,
): CatalogProduction[] {
  if (scope === DOWNLOAD_SCOPE_LIST) {
    const nextTemplates = normalizeCatalogProductions(payload);
    if (nextTemplates.length === 0) {
      throw new Error(
        'Uploaded production file must contain a productions array',
      );
    }
    return nextTemplates;
  }

  const template = normalizeCatalogProduction(payload);
  if (!template) {
    throw new Error(
      'Uploaded production file must contain exactly one production object',
    );
  }
  return [template];
}

function normalizeCatalogMachines(payload: unknown): CatalogMachine[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  const nextMachines: CatalogMachine[] = [];
  for (const machine of payload) {
    const normalized = normalizeCatalogMachine(machine);
    if (!normalized) {
      continue;
    }

    const index = findIndexByName(nextMachines, normalized.name);
    if (index === -1) {
      nextMachines.push(normalized);
    } else {
      nextMachines[index] = normalized;
    }
  }

  return nextMachines;
}

function normalizeCatalogMachinesByScope(
  payload: unknown,
  scope: string,
): CatalogMachine[] {
  if (scope === DOWNLOAD_SCOPE_LIST) {
    const nextMachines = normalizeCatalogMachines(payload);
    if (nextMachines.length === 0) {
      throw new Error('Uploaded machine file must contain a machines array');
    }
    return nextMachines;
  }

  const machine = normalizeCatalogMachine(payload);
  if (!machine) {
    throw new Error(
      'Uploaded machine file must contain exactly one machine object',
    );
  }
  return [machine];
}

function normalizeCatalogItem(payload: unknown): CatalogItem | undefined {
  if (!payload || typeof payload !== 'object') {
    return undefined;
  }

  const item = payload as {
    name?: unknown;
    iconUrl?: unknown;
    isMachine?: unknown;
    craftingSpeed?: unknown;
    productivity?: unknown;
    drain?: unknown;
  };
  const name = typeof item.name === 'string' ? item.name.trim() : '';
  if (!isAllowedCatalogName(name, CatalogNameType.Item)) {
    return undefined;
  }

  return {
    name,
    iconUrl:
      typeof item.iconUrl === 'string'
        ? normalizeIconUrl(item.iconUrl)
        : undefined,
    isMachine: item.isMachine === true,
    craftingSpeed: toValidNumber(item.craftingSpeed, undefined),
    productivity: toValidNumber(item.productivity, undefined),
    drain: toValidNumber(item.drain, undefined),
  };
}

function normalizeCatalogRecipe(payload: unknown): CatalogRecipe | undefined {
  if (!payload || typeof payload !== 'object') {
    return undefined;
  }

  const recipe = payload as {
    name?: unknown;
    iconUrl?: unknown;
    timeToComplete?: unknown;
    inputs?: unknown;
    outputs?: unknown;
  };

  const name = typeof recipe.name === 'string' ? recipe.name.trim() : '';
  if (!isAllowedCatalogName(name, CatalogNameType.Recipe)) {
    return undefined;
  }

  return {
    name,
    iconUrl:
      typeof recipe.iconUrl === 'string'
        ? normalizeIconUrl(recipe.iconUrl)
        : undefined,
    timeToComplete: toValidNumber(recipe.timeToComplete, 1) ?? 1,
    inputs: normalizeRecipeItems(recipe.inputs),
    outputs: normalizeRecipeItems(recipe.outputs),
  };
}

function normalizeCatalogProduction(
  payload: unknown,
): CatalogProduction | undefined {
  if (!payload || typeof payload !== 'object') {
    return undefined;
  }

  const asProductionLike = payload as Partial<Production>;
  if (
    typeof asProductionLike.name === 'string' &&
    typeof asProductionLike.recipe === 'object' &&
    typeof asProductionLike.machine === 'object'
  ) {
    const normalizedDirect = normalizeProduction(
      asProductionLike as Production,
    );
    if (
      !isAllowedCatalogName(normalizedDirect.name, CatalogNameType.Production)
    ) {
      return undefined;
    }
    return {
      name: normalizedDirect.name,
      iconUrl: normalizeIconUrl(normalizedDirect.iconUrl),
      production: normalizedDirect,
    };
  }

  const productionTemplate = payload as {
    name?: unknown;
    iconUrl?: unknown;
    production?: unknown;
  };
  const name =
    typeof productionTemplate.name === 'string'
      ? productionTemplate.name.trim()
      : '';
  if (!isAllowedCatalogName(name, CatalogNameType.Production)) {
    return undefined;
  }

  const production = normalizeProduction(
    (productionTemplate.production as Production | undefined) ?? { name },
  );

  return {
    name,
    iconUrl:
      typeof productionTemplate.iconUrl === 'string'
        ? normalizeIconUrl(productionTemplate.iconUrl)
        : undefined,
    production,
  };
}

function normalizeCatalogMachine(payload: unknown): CatalogMachine | undefined {
  if (!payload || typeof payload !== 'object') {
    return undefined;
  }

  const machine = payload as {
    name?: unknown;
    iconUrl?: unknown;
    craftingSpeed?: unknown;
    productivity?: unknown;
    drain?: unknown;
  };

  const name = typeof machine.name === 'string' ? machine.name.trim() : '';
  if (!isAllowedCatalogName(name, CatalogNameType.Machine)) {
    return undefined;
  }

  return {
    name,
    iconUrl:
      typeof machine.iconUrl === 'string'
        ? normalizeIconUrl(machine.iconUrl)
        : undefined,
    craftingSpeed: toValidNumber(machine.craftingSpeed, 1) ?? 1,
    productivity: toValidNumber(machine.productivity, 1) ?? 1,
    drain: toValidNumber(machine.drain, 1) ?? 1,
  };
}

function normalizeRecipeItems(
  payload: unknown,
): Array<{ name: string; count: number }> {
  if (!Array.isArray(payload)) {
    return [];
  }

  const nextItems: Array<{ name: string; count: number }> = [];
  for (const item of payload) {
    if (!item || typeof item !== 'object') {
      continue;
    }

    const recipeItem = item as { name?: unknown; count?: unknown };
    const name =
      typeof recipeItem.name === 'string' ? recipeItem.name.trim() : '';

    nextItems.push({
      name,
      count: toValidNumber(recipeItem.count, 1) ?? 1,
    });
  }

  return nextItems;
}

function cloneProduction(production: Production): Production {
  if (typeof structuredClone === 'function') {
    return structuredClone(production);
  }
  return JSON.parse(JSON.stringify(production)) as Production;
}

function isAllowedCatalogName(
  name: string,
  type: CatalogNameType,
): boolean {
  const trimmed = name.trim();
  if (!trimmed) {
    return false;
  }
  if (type === CatalogNameType.Item) {
    return !isDefaultItemName(trimmed);
  }
  if (type === CatalogNameType.Recipe) {
    return !isDefaultRecipeName(trimmed);
  }
  if (type === CatalogNameType.Machine) {
    return !isDefaultMachineName(trimmed);
  }
  return !isDefaultProductionName(trimmed);
}

function isDefaultItemName(name: string): boolean {
  return name.trim().toLowerCase() === DEFAULT_ITEM_NAME.toLowerCase();
}

function isDefaultRecipeName(name: string): boolean {
  return name.trim().toLowerCase() === DEFAULT_RECIPE_NAME.toLowerCase();
}

function isDefaultMachineName(name: string): boolean {
  return name.trim().toLowerCase() === DEFAULT_MACHINE_NAME.toLowerCase();
}

function isDefaultProductionName(name: string): boolean {
  const normalized = name.trim().toLowerCase();
  return (
    normalized === DEFAULT_PRODUCTION_NAME.toLowerCase() ||
    normalized === DEFAULT_AUTONAME_PRODUCTION_NAME.toLowerCase()
  );
}

function toValidNumber(
  value: unknown,
  fallback: number | undefined,
): number | undefined {
  if (
    typeof value !== 'number' ||
    Number.isNaN(value) ||
    !Number.isFinite(value)
  ) {
    return fallback;
  }
  return value;
}

function mergeCatalogStates(
  existing: ProductionCatalogState,
  incoming: ProductionCatalogState,
): ProductionCatalogState {
  return withCatalogConsistency({
    items: mergeByName(existing.items, incoming.items),
    recipes: mergeByName(existing.recipes, incoming.recipes),
    productions: mergeByName(existing.productions, incoming.productions),
  });
}

function mergeByName<T extends { name: string }>(
  existing: T[],
  incoming: T[],
): T[] {
  const next = [...existing.map((item) => ({ ...item }))];
  for (const incomingItem of incoming) {
    const index = findIndexByName(next, incomingItem.name);
    if (index === -1) {
      next.push({ ...incomingItem });
    } else {
      next[index] = { ...next[index], ...incomingItem };
    }
  }
  return next;
}

function createDownloadFileName(dataType: DataTypes): string {
  return `${DOWNLOAD_FILE_PREFIX}.${DOWNLOAD_SCOPE_LIST}.${dataType}`;
}

function createDownloadFileNameWithScope(
  scope: string,
  dataType: DataTypes,
): string {
  return `${DOWNLOAD_FILE_PREFIX}.${scope}.${dataType}`;
}

function createCatalogFileName(): string {
  return `${DOWNLOAD_FILE_PREFIX}.${DOWNLOAD_SCOPE_LIST}.${CATALOG_DOWNLOAD_TYPE}`;
}

function getDataTypeFileAccept(dataType: DataTypes): string {
  return `.${dataType}.${DOWNLOAD_FILE_EXTENSION},.${DOWNLOAD_FILE_EXTENSION}`;
}

function getCatalogFileAccept(): string {
  return `.${CATALOG_DOWNLOAD_TYPE}.${DOWNLOAD_FILE_EXTENSION},.${DOWNLOAD_FILE_EXTENSION}`;
}

function assertCatalogUploadFileType(
  fileName: string,
  expectedDataType: DataTypes,
): UploadedCatalogFileMeta {
  const match = DOWNLOAD_FILE_NAME_PATTERN.exec(fileName);
  if (!match) {
    throw new Error(
      `Invalid file name "${fileName}". Expected "${DOWNLOAD_FILE_PREFIX}.{id|${DOWNLOAD_SCOPE_LIST}}.{${Object.values(DataTypes).join('|')}}.${DOWNLOAD_FILE_EXTENSION}".`,
    );
  }

  const scope = match[1]?.trim();
  const dataType = match[2] as DataTypes;
  if (dataType !== expectedDataType) {
    throw new Error(
      `Invalid file type "${dataType}". Expected "${expectedDataType}" in file name.`,
    );
  }
  if (!scope) {
    throw new Error(
      `Invalid file name "${fileName}". Missing import scope before "${expectedDataType}".`,
    );
  }
  return { scope, dataType };
}

function assertCatalogFileName(fileName: string): void {
  const expectedFileName = `${DOWNLOAD_FILE_PREFIX}.${DOWNLOAD_SCOPE_LIST}.${CATALOG_DOWNLOAD_TYPE}.${DOWNLOAD_FILE_EXTENSION}`;
  if (fileName !== expectedFileName) {
    throw new Error(
      `Invalid file name "${fileName}". Expected "${expectedFileName}".`,
    );
  }
}

function toDownloadScope(value: string): string {
  const normalized = value
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return normalized.length > 0 ? normalized : DOWNLOAD_SCOPE_LIST;
}

function downloadJson(data: unknown, fileName: string): void {
  const payload = JSON.stringify(data, null, 2);
  const element: HTMLAnchorElement = document.createElement('a');
  element.setAttribute(
    'href',
    'data:text/json;charset=UTF-8,' + encodeURIComponent(payload),
  );
  element.setAttribute('download', `${fileName}.${DOWNLOAD_FILE_EXTENSION}`);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function readJsonFile<T>(file: File): Promise<T> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsText(file, 'UTF-8');
    fileReader.onload = () => {
      try {
        const fileResult = fileReader.result?.toString();
        if (!fileResult) {
          reject(new Error('Empty file result'));
          return;
        }
        const parsed = JSON.parse(fileResult) as T;
        resolve(parsed);
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Invalid JSON'));
      }
    };
    fileReader.onerror = (error) => {
      reject(error instanceof Error ? error : new Error('Error reading file'));
    };
  });
}

interface UploadedCatalogFileMeta {
  scope: string;
  dataType: DataTypes;
}

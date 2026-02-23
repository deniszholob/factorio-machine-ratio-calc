import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  inject,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  newMachineItem,
  reCalcItemRate,
  reCalcProductionRates,
  toMachineItems,
  toRecipeItems,
} from './production.util';
import { ProductionCatalogService } from 'src/app/shared/services/production-catalog/production-catalog.service';
import { IconAutocompleteInputComponent } from 'src/app/forms/icon-autocomplete-input/icon-autocomplete-input.component';
import { FormFieldBlockComponent } from 'src/app/forms/form-field-block/form-field-block.component';
import { RecipeIoListComponent } from 'src/app/components/production/recipe-io-list/recipe-io-lis.component.';
import { MachineItem } from 'src/app/shared/models/production-chain/production/machine-item/machine-item.model';
import { Production } from 'src/app/shared/models/production-chain/production/production.model';

@Component({
  selector: 'app-production-editor',
  templateUrl: './production-editor.component.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    IconAutocompleteInputComponent,
    FormFieldBlockComponent,
    RecipeIoListComponent,
  ],
})
export class ProductionEditorComponent {
  private readonly productionCatalogService = inject(ProductionCatalogService);

  public readonly $machine = input.required<Production | undefined>();
  public readonly $machineChange = output<Production>();
  public readonly $itemNameOptions = this.productionCatalogService.$itemNames;
  public readonly $recipeNameOptions =
    this.productionCatalogService.$recipeNames;
  public readonly $machineNameOptions =
    this.productionCatalogService.$machineNames;
  public readonly $itemIconsByName =
    this.productionCatalogService.$itemIconsByName;
  public readonly $recipeIconsByName =
    this.productionCatalogService.$recipeIconsByName;
  public readonly $machineIconsByName =
    this.productionCatalogService.$machineIconsByName;
  protected readonly inputListId = 'production-editor-inputs';
  protected readonly outputListId = 'production-editor-outputs';

  protected onAddItem(itemList: MachineItem[], production: Production): void {
    const nextItem = newMachineItem();
    itemList.push(nextItem);
    this.productionCatalogService.upsertItemName(nextItem.name);
    this.onRecipeChanged(production);
    reCalcItemRate(nextItem, production);
    this.emitMachineChanged(production);
  }

  protected onDeleteItem(
    itemList: MachineItem[],
    index: number,
    production: Production,
  ): void {
    if (index > -1) {
      itemList.splice(index, 1);
      this.onRecipeChanged(production);
      reCalcProductionRates(production);
      this.emitMachineChanged(production);
    }
  }

  protected onRecipeNameChange(production: Production): void {
    const name = production.recipe.name.trim();
    if (!name) {
      return;
    }

    production.recipe.useAutoName = false;
    production.recipe.useAutoIcon = false;

    const saved = this.productionCatalogService.getRecipeByName(name);
    if (saved) {
      production.recipe.iconUrl = saved.iconUrl;
      production.recipe.timeToComplete = saved.timeToComplete;
      production.recipe.inputs = toMachineItems(saved.inputs);
      production.recipe.outputs = toMachineItems(saved.outputs);
    } else {
      this.productionCatalogService.upsertRecipe({
        name,
        iconUrl: production.recipe.iconUrl,
        timeToComplete: production.recipe.timeToComplete,
        inputs: toRecipeItems(production.recipe.inputs),
        outputs: toRecipeItems(production.recipe.outputs),
      });
    }

    reCalcProductionRates(production);
    this.emitMachineChanged(production);
  }

  protected onMachineNameChange(production: Production): void {
    const name = production.machine.name.trim();
    if (!name) {
      return;
    }

    const saved = this.productionCatalogService.getMachineByName(name);
    if (saved) {
      production.machine.craftingSpeed = saved.craftingSpeed;
      production.machine.productivity = saved.productivity;
      production.machine.drain = saved.drain;
    } else {
      this.productionCatalogService.upsertMachine({
        name,
        iconUrl: this.findMachineIconUrl(name),
        craftingSpeed: production.machine.craftingSpeed,
        productivity: production.machine.productivity,
        drain: production.machine.drain,
      });
    }

    reCalcProductionRates(production);
    this.emitMachineChanged(production);
  }

  protected onRecipeChanged(production: Production): void {
    this.syncRecipeDefaults(production);
    const name = production.recipe.name.trim();
    if (name) {
      this.productionCatalogService.upsertRecipe({
        name,
        iconUrl: production.recipe.iconUrl,
        timeToComplete: production.recipe.timeToComplete,
        inputs: toRecipeItems(production.recipe.inputs),
        outputs: toRecipeItems(production.recipe.outputs),
      });
    }
    this.emitMachineChanged(production);
  }

  protected onMachineChanged(production: Production): void {
    const name = production.machine.name.trim();
    if (name) {
      this.productionCatalogService.upsertMachine({
        name,
        iconUrl: this.findMachineIconUrl(name),
        craftingSpeed: production.machine.craftingSpeed,
        productivity: production.machine.productivity,
        drain: production.machine.drain,
      });
    }
    this.emitMachineChanged(production);
  }

  protected onItemNameChange(item: MachineItem, production: Production): void {
    this.productionCatalogService.upsertItemName(item.name);
    this.onRecipeChanged(production);
  }

  protected onItemCountChange(item: MachineItem, production: Production): void {
    reCalcItemRate(item, production);
    this.onRecipeChanged(production);
  }

  protected onRecipeTimeChange(production: Production): void {
    reCalcProductionRates(production);
    this.onRecipeChanged(production);
    this.emitMachineChanged(production);
  }

  protected onMachineStatsChange(production: Production): void {
    reCalcProductionRates(production);
    this.onMachineChanged(production);
    this.emitMachineChanged(production);
  }

  protected onRecipeNameInput(value: string, production: Production): void {
    production.recipe.useAutoName = false;
    production.recipe.useAutoIcon = false;
    production.recipe.name = value;
  }

  protected drop(
    event: CdkDragDrop<
      {
        name: string;
        count: number;
        rate?: number;
        totalRate?: number;
      }[]
    >,
  ): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
    const production = this.$machine();
    if (!production) {
      return;
    }
    this.onRecipeChanged(production);
  }

  private emitMachineChanged(production: Production): void {
    this.syncRecipeDefaults(production);
    this.productionCatalogService.upsertProductionTemplate(production);
    this.$machineChange.emit(production);
  }

  private syncRecipeDefaults(production: Production): void {
    const firstOutputName = production.recipe.outputs[0]?.name?.trim() ?? '';
    if (production.recipe.useAutoName !== false) {
      production.recipe.useAutoName = true;
      production.recipe.name = firstOutputName || 'Default Recipe';
    }
    if (production.recipe.useAutoIcon !== false) {
      production.recipe.useAutoIcon = true;
      production.recipe.iconUrl =
        this.findItemIconUrl(firstOutputName) ??
        this.findRecipeIconUrl(production.recipe.name);
    }
  }

  private findItemIconUrl(name: string): string | undefined {
    if (!name) {
      return undefined;
    }
    const iconsByName = this.$itemIconsByName();
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

  private findRecipeIconUrl(name: string): string | undefined {
    if (!name) {
      return undefined;
    }
    const iconsByName = this.$recipeIconsByName();
    const exact = iconsByName[name];
    if (exact) {
      return exact;
    }

    const normalized = name.trim().toLowerCase();
    for (const [recipeName, iconUrl] of Object.entries(iconsByName)) {
      if (recipeName.trim().toLowerCase() === normalized) {
        return iconUrl;
      }
    }
    return undefined;
  }

  private findMachineIconUrl(name: string): string | undefined {
    if (!name) {
      return undefined;
    }
    const iconsByName = this.$machineIconsByName();
    const exact = iconsByName[name];
    if (exact) {
      return exact;
    }

    const normalized = name.trim().toLowerCase();
    for (const [machineName, iconUrl] of Object.entries(iconsByName)) {
      if (machineName.trim().toLowerCase() === normalized) {
        return iconUrl;
      }
    }
    return undefined;
  }
}

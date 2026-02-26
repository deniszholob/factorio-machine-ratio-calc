import { CommonModule } from '@angular/common';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  CatalogRecipe,
  CatalogRecipeItemCollection,
} from 'src/app/shared/models/production-catalog-state/production-catalog-state.model';
import { FormFieldBlockComponent } from 'src/app/forms/form-field-block/form-field-block.component';
import { RecipeIoListComponent } from 'src/app/components/production/recipe-io-list/recipe-io-lis.component.';
import { SectionTitleComponent } from 'src/app/layouts/section-block/section-title/section-title.component';
import { BadgeComponent } from 'src/app/components/generic/badge/badge.component';
import { BadgeSize } from 'src/app/components/generic/badge/badge-size.enum';
import { BadgeTone } from 'src/app/components/generic/badge/badge-tone.enum';
import { TooltipDirective } from '../../generic/tooltip/tooltip.directive';

@Component({
  selector: 'app-catalog-recipe-form',
  templateUrl: './catalog-recipe-form.component.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    FormFieldBlockComponent,
    RecipeIoListComponent,
    SectionTitleComponent,
    BadgeComponent,
    TooltipDirective,
  ],
})
export class CatalogRecipeFormComponent {
  protected readonly CatalogRecipeItemCollection = CatalogRecipeItemCollection;
  protected readonly BadgeSize = BadgeSize;
  protected readonly BadgeTone = BadgeTone;

  public readonly $recipe = input.required<CatalogRecipe>();
  public readonly $itemNames = input.required<string[]>();
  public readonly $itemIconsByName = input<Record<string, string>>({});
  public readonly $usageCount = input<number>(0);
  public readonly $usageTooltip = input<string>('');
  public readonly $deleteDisabledReason = input<string | undefined>(undefined);

  public readonly $recipeChange = output<void>();
  public readonly $removeRecipe = output<void>();
  public readonly $addRecipeItem = output<CatalogRecipeItemCollection>();
  public readonly $removeRecipeItem = output<{
    collection: CatalogRecipeItemCollection;
    index: number;
  }>();
  public readonly $downloadRecipe = output<void>();
  private readonly recipeListIdPrefix = createRecipeListIdPrefix();
  protected readonly inputListId = `${this.recipeListIdPrefix}-inputs`;
  protected readonly outputListId = `${this.recipeListIdPrefix}-outputs`;

  protected onRecipeChange(): void {
    this.$recipeChange.emit();
  }

  protected onRemoveRecipe(): void {
    if (this.$usageCount() > 0) {
      return;
    }
    this.$removeRecipe.emit();
  }

  protected onDownloadRecipe(): void {
    this.$downloadRecipe.emit();
  }

  protected onAddRecipeItem(collection: CatalogRecipeItemCollection): void {
    this.$addRecipeItem.emit(collection);
  }

  protected onRemoveRecipeItem(
    collection: CatalogRecipeItemCollection,
    index: number,
  ): void {
    this.$removeRecipeItem.emit({ collection, index });
  }

  protected onDrop(
    event: CdkDragDrop<
      {
        name: string;
        count: number;
        rate?: number;
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
    this.onRecipeChange();
  }
}

function createRecipeListIdPrefix(): string {
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `catalog-recipe-${randomPart}`;
}

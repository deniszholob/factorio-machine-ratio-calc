import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CatalogRecipe } from 'src/app/shared/models/production-catalog-state/production-catalog-state.model';
import { FormFieldBlockComponent } from 'src/app/forms/form-field-block/form-field-block.component';
import { RecipeIoListComponent } from 'src/app/components/production/recipe-io-list/recipe-io-lis.component.';
import { SectionTitleComponent } from 'src/app/layouts/section-block/section-title/section-title.component';
import { BadgeComponent } from 'src/app/components/generic/badge/badge.component';

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
  ],
})
export class CatalogRecipeFormComponent {
  public readonly $recipe = input.required<CatalogRecipe>();
  public readonly $itemNames = input.required<string[]>();
  public readonly $itemIconsByName = input<Record<string, string>>({});
  public readonly $usageCount = input<number>(0);
  public readonly $deleteDisabledReason = input<string | undefined>(undefined);

  public readonly $recipeChange = output<void>();
  public readonly $removeRecipe = output<void>();
  public readonly $addRecipeItem = output<'inputs' | 'outputs'>();
  public readonly $removeRecipeItem = output<{
    collection: 'inputs' | 'outputs';
    index: number;
  }>();

  protected onRecipeChange(): void {
    this.$recipeChange.emit();
  }

  protected onRemoveRecipe(): void {
    if (this.$usageCount() > 0) {
      return;
    }
    this.$removeRecipe.emit();
  }

  protected onAddRecipeItem(collection: 'inputs' | 'outputs'): void {
    this.$addRecipeItem.emit(collection);
  }

  protected onRemoveRecipeItem(
    collection: 'inputs' | 'outputs',
    index: number,
  ): void {
    this.$removeRecipeItem.emit({ collection, index });
  }
}

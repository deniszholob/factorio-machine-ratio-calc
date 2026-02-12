import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CatalogRecipe } from 'src/app/shared/production-catalog/production-catalog.model';
import { FormFieldBlockComponent } from 'src/app/components/form-field-block/form-field-block.component';
import { RecipeIoListComponent } from 'src/app/components/recipe-io-list/recipe-io-list.component';

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
  ],
})
export class CatalogRecipeFormComponent {
  public readonly $recipe = input.required<CatalogRecipe>();
  public readonly $itemNames = input.required<string[]>();
  public readonly $itemIconsByName = input<Record<string, string>>({});

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

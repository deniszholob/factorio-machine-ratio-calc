import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormFieldBlockComponent } from '../../../forms/form-field-block/form-field-block.component';
import { IconAutocompleteInputComponent } from '../../../forms/icon-autocomplete-input/icon-autocomplete-input.component';

interface EditableRecipeItem {
  name: string;
  count: number;
  rate?: number;
}

@Component({
  selector: 'app-recipe-io-list',
  templateUrl: './recipe-io-list.component.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    FormFieldBlockComponent,
    IconAutocompleteInputComponent,
  ],
})
export class RecipeIoListComponent {
  public readonly $label = input.required<string>();
  public readonly $items = input.required<EditableRecipeItem[]>();
  public readonly $itemNameOptions = input.required<string[]>();
  public readonly $itemIconsByName = input<Record<string, string>>({});
  public readonly $showRates = input<boolean>(false);
  public readonly $dragEnabled = input<boolean>(false);
  public readonly $listId = input<string>('');
  public readonly $connectedTo = input<string[]>([]);
  public readonly $countUnit = input<string>('x');
  public readonly $rateUnit = input<string>('/s');

  public readonly $add = output<void>();
  public readonly $remove = output<number>();
  public readonly $itemCountChange = output<number>();
  public readonly $itemNameCommit = output<number>();
  public readonly $dropListDropped =
    output<CdkDragDrop<EditableRecipeItem[]>>();

  protected onAdd(): void {
    this.$add.emit();
  }

  protected onRemove(index: number): void {
    this.$remove.emit(index);
  }

  protected onItemCountChange(index: number): void {
    this.$itemCountChange.emit(index);
  }

  protected onItemNameCommit(index: number): void {
    this.$itemNameCommit.emit(index);
  }

  protected onDrop(event: CdkDragDrop<EditableRecipeItem[]>): void {
    this.$dropListDropped.emit(event);
  }
}

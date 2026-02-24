import {
  CdkDrag,
  CdkDragEnd,
  CdkDragEnter,
  CdkDragExit,
  CdkDragStart,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormFieldBlockComponent } from '../../../forms/form-field-block/form-field-block.component';
import { SelectSingleIconInputComponent } from '../../../forms/select-single-icon-input/select-single-icon-input.component';

interface EditableRecipeItem {
  name: string;
  count: number;
  rate?: number;
}

interface RecipeIoDragData {
  sourceListId: string;
}

export enum RecipeIoDropHighlightMode {
  'None' = 'None',
  'WithinContainer' = 'WithinContainer',
  'CrossContainer' = 'CrossContainer',
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
    SelectSingleIconInputComponent,
  ],
})
export class RecipeIoListComponent {
  protected readonly RecipeIoDropHighlightMode = RecipeIoDropHighlightMode;

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
  protected readonly $dropHighlightMode = signal<RecipeIoDropHighlightMode>(
    RecipeIoDropHighlightMode.None,
  );
  protected readonly $isDropActive = computed<boolean>(() => {
    return this.$dropHighlightMode() !== RecipeIoDropHighlightMode.None;
  });

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
    this.clearDropHighlight();
    this.$dropListDropped.emit(event);
  }

  protected onDragStarted(_event: CdkDragStart<unknown>): void {
    this.$dropHighlightMode.set(RecipeIoDropHighlightMode.WithinContainer);
  }

  protected onDragEnded(_event: CdkDragEnd<unknown>): void {
    this.clearDropHighlight();
  }

  protected onDropListEntered(event: CdkDragEnter<EditableRecipeItem[]>): void {
    const sourceListId = this.readSourceListId(event.item.data);
    const targetListId = this.$listId();
    if (!sourceListId || !targetListId) {
      this.$dropHighlightMode.set(RecipeIoDropHighlightMode.WithinContainer);
      return;
    }
    this.$dropHighlightMode.set(
      sourceListId === targetListId
        ? RecipeIoDropHighlightMode.WithinContainer
        : RecipeIoDropHighlightMode.CrossContainer,
    );
  }

  protected onDropListExited(_event: CdkDragExit<EditableRecipeItem[]>): void {
    this.clearDropHighlight();
  }

  private clearDropHighlight(): void {
    this.$dropHighlightMode.set(RecipeIoDropHighlightMode.None);
  }

  private readSourceListId(data: unknown): string | undefined {
    if (!data || typeof data !== 'object') {
      return undefined;
    }
    if (!('sourceListId' in data)) {
      return undefined;
    }
    const sourceListId = (data as RecipeIoDragData).sourceListId;
    return typeof sourceListId === 'string' ? sourceListId : undefined;
  }
}

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

@Component({
  selector: 'app-icon-autocomplete-input',
  templateUrl: './icon-autocomplete-input.component.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
})
export class IconAutocompleteInputComponent {
  public readonly $value = input<string>('');
  public readonly $options = input<string[]>([]);
  public readonly $iconsByName = input<Record<string, string>>({});
  public readonly $placeholder = input<string>('');
  public readonly $name = input<string>('');
  public readonly $showCurrentIcon = input<boolean>(true);
  public readonly $valueChange = output<string>();
  public readonly $commit = output<string>();

  protected readonly $isOpen = signal(false);
  protected readonly $highlightedIndex = signal<number>(-1);

  protected readonly $currentIconUrl = computed(() => {
    const value = this.$value().trim().toLowerCase();
    if (!value) {
      return undefined;
    }
    const matchedOption = this.$options().find(
      (option) => option.trim().toLowerCase() === value,
    );
    if (!matchedOption) {
      return undefined;
    }
    return this.$iconsByName()[matchedOption];
  });

  protected readonly $filteredOptions = computed(() => {
    const query = this.$value().trim().toLowerCase();
    const options = this.$options();
    if (!query) {
      return options.slice(0, 20);
    }

    return options
      .filter((option) => option.trim().toLowerCase().includes(query))
      .slice(0, 20);
  });

  protected onInput(value: string): void {
    this.$valueChange.emit(value);
    this.$isOpen.set(true);
    this.$highlightedIndex.set(0);
  }

  protected onFocus(): void {
    this.$isOpen.set(true);
    this.$highlightedIndex.set(0);
  }

  protected onBlur(): void {
    setTimeout(() => {
      this.$isOpen.set(false);
      this.$highlightedIndex.set(-1);
      this.$commit.emit(this.$value());
    }, 120);
  }

  protected onOptionSelect(option: string): void {
    this.$valueChange.emit(option);
    this.$commit.emit(option);
    this.$isOpen.set(false);
    this.$highlightedIndex.set(-1);
  }

  protected onKeyDown(event: KeyboardEvent): void {
    const options = this.$filteredOptions();
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.$isOpen.set(true);
      const nextIndex =
        this.$highlightedIndex() >= options.length - 1
          ? 0
          : this.$highlightedIndex() + 1;
      this.$highlightedIndex.set(nextIndex);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.$isOpen.set(true);
      const nextIndex =
        this.$highlightedIndex() <= 0
          ? options.length - 1
          : this.$highlightedIndex() - 1;
      this.$highlightedIndex.set(nextIndex);
      return;
    }

    if (event.key === 'Enter') {
      if (!this.$isOpen()) {
        return;
      }
      event.preventDefault();
      const option = options[this.$highlightedIndex()];
      if (option) {
        this.onOptionSelect(option);
      } else {
        this.$commit.emit(this.$value());
      }
      return;
    }

    if (event.key === 'Escape') {
      this.$isOpen.set(false);
      this.$highlightedIndex.set(-1);
    }
  }
}

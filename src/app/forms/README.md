# Forms Component Catalog

This folder contains reusable form primitives and composable controls.

## Design Principles

- Keep controls focused: layout wrappers should not own input/search logic.
- Keep behavior reusable: filtering, keyboard navigation, and selection logic should live in dedicated controls.
- Keep visuals consistent: readonly displays should align with field rhythm while remaining visually distinct from disabled inputs.
- Prefer composition: build complex forms by combining small primitives.

## Component Roadmap

### Core Inputs

- `input-single`: single value text/number input.
- `input-multi`: editable list of text/number values.
- `input-area`: multiline text input.
- `readonly`: display-only value field; styled as part of the form system, not a disabled input.

### File Inputs

- `file-picker-single`: choose one file/folder.
- `file-picker-multi`: choose multiple files with add/remove list management.

### Date Inputs

- `date-picker-single`: one date value.
- `date-picker-multi`: array of dates.
- `date-picker-range`: start/end range picker.

### Selection Inputs

- `select-single`: single-value dropdown with type-to-filter and empty-state message.
- `select-single-input`: single-value dropdown that can create a new value when no option matches.
- `select-multi`: multi-select chips with filtered dropdown, select/unselect all, option checkboxes, and invalid-value warning when selected values are missing from option source.
- `select-multi-input`: `select-multi` with create-new behavior from filter input.
- `select-list`: radio/checkbox list selection.
- `select-button-group`: segmented buttons for mutually exclusive choices.

### Display and Utility

- `toggle`: constrained boolean/dual-state variant (often replaceable by `select-button-group`).
- `pill`/`badge`: compact status indicator with theme variants.
- `object-editor`: complex object/array editor with add/remove/edit controls.

## Separation of Concerns

- `form-field-block`: label + prefix/suffix layout shell.
- `select-single-input`: searchable/selectable text behavior.
- Domain-specific wrappers may compose both, but should not reimplement dropdown behavior.

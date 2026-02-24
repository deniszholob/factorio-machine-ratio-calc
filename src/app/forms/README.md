# Forms Component Catalog

This folder contains reusable form primitives and composable controls.

## Design Principles

- Common styling and label/addon structure live in a field wrapper such as `form-field-block`.
- Individual field components own only field-specific behavior.
- Keep visuals consistent and heights aligned across form fields and form actions.

## Available Components

### Input

- `input-single`: single primitive value text/number/url/etc. input.
- `input-multi` (planned): editable list of primitive values.
- `input-area` (planned): multiline text input.

### Readonly

- `readonly-field`: display-only value field (not a disabled input styling).

### File

- `file-picker-single`: choose one file/folder.
- `file-picker-multi` (planned): choose multiple files with add/remove list management.

### Date

- `date-picker-single` (planned): one date value.
- `date-picker-multi` (planned): array of dates.
- `date-picker-range` (planned): start/end range picker.

### Select

- `select-single` (optionally separate or part of `select-single-input`): single-value searchable select dropdown with type-to-filter and empty-state message
- `select-single-input`: single-value searchable select using `ng-select`, supports add-custom mode.
- `select-single-icon-input`: icon-aware single select with templated selected value and dropdown options.
- `select-list`: radio/checkbox list selection.
- `select-button-group`: segmented button selection.
- `select-multi` (planned): multi-select chips + filter.
- `select-multi-input` (planned): multi-select with add-custom behavior.

### Utility

- `pill`/`badge`: compact status indicator with theme variants.
- `object-editor` (planned): complex object/array editor with add/remove/edit controls.
- `toggle` (optional): constrained boolean/dual-state variant (often replaceable by `select-button-group`)

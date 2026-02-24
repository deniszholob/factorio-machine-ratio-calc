import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';

import { InputSingleComponent } from './input-single/input-single.component';
import { ReadonlyFieldComponent } from './readonly-field/readonly-field.component';
import { SelectSingleInputComponent } from './select-single-input/select-single-input.component';
import { SelectSingleIconInputComponent } from './select-single-icon-input/select-single-icon-input.component';
import { SelectionButtonGroupComponent } from './selection-button-group/selection-button-group.component';
import {
  SelectionListComponent,
  SelectionListType,
} from './selection-list/selection-list.component';
import { SelectInputMode } from './select-input-mode.enum';

export default {
  title: 'Forms/Fields',
  decorators: [
    moduleMetadata({
      imports: [
        InputSingleComponent,
        ReadonlyFieldComponent,
        SelectSingleInputComponent,
        SelectSingleIconInputComponent,
        SelectionButtonGroupComponent,
        SelectionListComponent,
      ],
    }),
  ],
  parameters: {
    docs: { description: { component: 'Forms field showcase' } },
  },
} satisfies Meta;

export const Fields: StoryObj = {
  render: () => ({
    props: {
      selectSingleMode: SelectInputMode.SelectOrCreate,
      buttonValue: 'Items',
      selectionListType: SelectionListType.Radio,
    },
    template: `
      <section class="flex max-w-5xl flex-col gap-6 p-4 text-stone-200">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <app-input-single
            [$label]="'Input Single'"
            [$className]="'min-w-56'"
            [$value]="'Iron Plate'"
            [$placeholder]="'Type item name'"
          ></app-input-single>

          <app-readonly-field
            [$label]="'Readonly'"
            [$className]="'min-w-56'"
            [$value]="'Iron Gear Wheel'"
          ></app-readonly-field>

          <app-select-single-input
            [$label]="'Select Single'"
            [$className]="'min-w-56'"
            [$value]="'Iron Plate'"
            [$placeholder]="'Select item'"
            [$options]="['Iron Plate', 'Copper Plate', 'Steel Plate']"
            [$mode]="selectSingleMode"
          ></app-select-single-input>

          <app-select-single-icon-input
            [$label]="'Select Single Icon'"
            [$className]="'min-w-56'"
            [$value]="'Iron Plate'"
            [$placeholder]="'Select item'"
            [$options]="['Iron Plate', 'Copper Plate', 'Steel Plate']"
            [$iconsByName]="{
              'Iron Plate': 'https://wiki.factorio.com/images/Iron_plate.png',
              'Copper Plate': 'https://wiki.factorio.com/images/Copper_plate.png'
            }"
            [$mode]="selectSingleMode"
            [$showSelectedIcon]="true"
          ></app-select-single-icon-input>
        </div>

        <app-selection-button-group
          [$value]="buttonValue"
          [$buttonClass]="'h-9 px-3 py-0'"
          [$options]="[
            { id: 'Import', display: 'Import', count: 5 },
            { id: 'Items', display: 'Items', count: 12 },
            { id: 'Recipes', display: 'Recipes', count: 4 }
          ]"
        ></app-selection-button-group>

        <app-selection-list
          [$name]="'master-selection-list'"
          [$type]="selectionListType"
          [$options]="[
            { id: 'Modal', display: 'Modal Popup', description: 'Open in a dialog.' },
            { id: 'Sidebar', display: 'Sidebar', description: 'Open in the side panel.' }
          ]"
          [$defaultValue]="'Modal'"
          [$selectedValue]="'Modal'"
        ></app-selection-list>
      </section>
    `,
  }),
};

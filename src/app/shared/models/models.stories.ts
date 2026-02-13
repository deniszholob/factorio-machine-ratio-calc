import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  signal,
} from '@angular/core';
import { Meta, StoryObj } from '@storybook/angular';
import {
  buildEnumEntries,
  buildModelMocks,
  createTreeRows,
  getSelectedMockHeader,
  MockModuleExports,
  SRC_ROOT_LABEL,
  stringifyMock,
  TreeRow,
} from './model.util';

type RenderRow = TreeRow &
  Readonly<{
    isSelected: boolean;
    isCollapsed: boolean;
    isEnumEntry: boolean;
    isCompactRow: boolean;
  }>;

type RequireWithContext = NodeRequire & {
  context: (
    path: string,
    deep?: boolean,
    filter?: RegExp,
  ) => {
    keys: () => string[];
    <T = unknown>(id: string): T;
  };
};

const mockContext = (require as RequireWithContext).context(
  '../../',
  true,
  /\.model\.mock\.ts$/,
);
const enumContext = (require as RequireWithContext).context(
  '../../',
  true,
  /\.enum\.ts$/,
);

const MODEL_MOCKS = {
  ...buildModelMocks(
    mockContext
      .keys()
      .sort()
      .map((filePath) => [filePath, mockContext<MockModuleExports>(filePath)]),
  ),
  ...buildEnumEntries(
    enumContext
      .keys()
      .sort()
      .map((filePath) => [filePath, enumContext<MockModuleExports>(filePath)]),
  ),
};

const MOCK_KEYS = Object.keys(MODEL_MOCKS).sort();
const DEFAULT_MOCK_KEY = MOCK_KEYS[0] ?? '';

const TREE_ROWS = createTreeRows(MOCK_KEYS);

function isArrayMockKey(mockKey: string): boolean {
  return mockKey.endsWith('_Array');
}

function isEnumFilePath(filePath: string): boolean {
  return filePath.endsWith('.enum.ts');
}

function isRelevantEnumExport(mockKey: string): boolean {
  const [, exportName = ''] = mockKey.split(' :: ');
  return exportName.endsWith('_INFO_OPTIONS');
}

function collapseVisibleFolderChains(
  rows: readonly RenderRow[],
): readonly RenderRow[] {
  const output: RenderRow[] = [];
  let index = 0;

  while (index < rows.length) {
    const row = rows[index];
    if (row.kind !== 'folder') {
      output.push(row);
      index += 1;
      continue;
    }

    const mergedLabels = [row.label];
    let current = row;
    let cursor = index + 1;

    while (cursor < rows.length) {
      const next = rows[cursor];
      if (
        next.kind !== 'folder' ||
        next.depth !== current.depth + 1 ||
        next.parentFolderPaths.at(-1) !== current.folderPath
      ) {
        break;
      }

      mergedLabels.push(next.label);
      current = next;
      cursor += 1;
    }

    if (mergedLabels.length > 1) {
      output.push({
        ...row,
        label: mergedLabels.join('/'),
      });
      index = cursor;
      continue;
    }

    output.push(row);
    index += 1;
  }

  return output;
}

@Component({
  selector: 'app-models-mocks-viewer',
  template: `
    <section
      class="flex h-screen min-h-0 min-w-5xl flex-row overflow-auto bg-black p-3 text-zinc-100"
      [class.cursor-col-resize]="$isResizingSidebar()"
      [class.select-none]="$isResizingSidebar()"
    >
      <aside
        class="flex h-full shrink-0 flex-col overflow-hidden rounded-sm border border-zinc-700 bg-neutral-900 shadow-lg"
        [style.width.px]="$sidebarWidth()"
      >
        <header
          class="flex flex-col gap-3 border-b border-zinc-700 bg-zinc-800 px-4 py-3"
        >
          <div class="flex items-center justify-between gap-2">
            <h1
              class="text-xs font-semibold tracking-widest text-zinc-100 uppercase"
            >
              Models Mock Explorer
            </h1>
          </div>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex flex-wrap items-center gap-2">
              <button
                class="inline-flex cursor-pointer items-center gap-2 rounded-md border border-sky-400/40 bg-sky-500/10 px-2 py-1 text-xs text-sky-100 hover:bg-sky-500/20 focus-visible:outline-2 focus-visible:outline-sky-300"
                [attr.aria-pressed]="$hideArrayEntries()"
                (click)="toggleHideArrays()"
                type="button"
              >
                <span
                  class="inline-block h-3 w-3 rounded-sm border border-sky-300/60"
                  [class.bg-sky-300]="$hideArrayEntries()"
                  [class.border-sky-200]="$hideArrayEntries()"
                ></span>
                Relevant Values
              </button>
              <button
                class="inline-flex cursor-pointer items-center gap-2 rounded-md border border-sky-400/40 bg-sky-500/10 px-2 py-1 text-xs text-sky-100 hover:bg-sky-500/20 focus-visible:outline-2 focus-visible:outline-sky-300"
                [attr.aria-pressed]="$compactSingleChains()"
                (click)="toggleCompactSingleChains()"
                type="button"
              >
                <span
                  class="inline-block h-3 w-3 rounded-sm border border-sky-300/60"
                  [class.bg-sky-300]="$compactSingleChains()"
                  [class.border-sky-200]="$compactSingleChains()"
                ></span>
                Compact Tree
              </button>
            </div>
            <div class="flex items-center gap-2">
              <button
                class="inline-flex cursor-pointer items-center rounded-md border border-sky-400/40 bg-sky-500/10 px-2 py-1 text-xs text-sky-100 hover:bg-sky-500/20 focus-visible:outline-2 focus-visible:outline-sky-300"
                (click)="expandAllFolders()"
                type="button"
              >
                Expand
              </button>
              <button
                class="inline-flex cursor-pointer items-center rounded-md border border-sky-400/40 bg-sky-500/10 px-2 py-1 text-xs text-sky-100 hover:bg-sky-500/20 focus-visible:outline-2 focus-visible:outline-sky-300"
                (click)="collapseAllFolders()"
                type="button"
              >
                Collapse
              </button>
            </div>
          </div>
          <div class="flex flex-row flex-wrap justify-between gap-1">
            <p class="text-xs text-zinc-300">
              Root:
              <code class="rounded bg-zinc-900 px-1 py-0.5 text-zinc-200">{{
                $rootLabel
              }}</code>
            </p>
            <p class="text-xs text-zinc-300">
              Tree generated from
              <code class="rounded bg-zinc-900 px-1 py-0.5 text-zinc-200"
                >*.model.mock.ts</code
              >
              and
              <code class="rounded bg-zinc-900 px-1 py-0.5 text-zinc-200"
                >*.enum.ts</code
              >.
            </p>
          </div>
          <div class="flex items-center gap-2">
            <label class="sr-only" for="models-search">Search models</label>
            <input
              class="w-full rounded-md border border-zinc-600 bg-zinc-900 px-2 py-1 text-sm text-zinc-100 placeholder-zinc-500 focus:border-sky-400 focus:outline-none"
              id="models-search"
              [value]="$searchQuery()"
              (input)="onSearchInput($event)"
              type="search"
              placeholder="Search files, folders, and values..."
              autocomplete="off"
            />
            <button
              class="inline-flex cursor-pointer items-center rounded-md border border-zinc-600 bg-zinc-800 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-zinc-400"
              [disabled]="$searchQuery().length === 0"
              (click)="clearSearch()"
              type="button"
            >
              Clear
            </button>
          </div>
          <p class="text-xs text-zinc-400" aria-live="polite">
            {{ $displayRows().length }} visible entries
          </p>
        </header>

        <div
          class="min-h-0 flex-1 overflow-auto px-2 py-2 outline-none"
          (keydown)="onTreeKeydown($event)"
          tabindex="0"
          role="tree"
          aria-label="Model mocks explorer"
        >
          @if ($displayRows().length === 0) {
            <p class="px-2 py-3 text-sm text-zinc-400">No matching entries.</p>
          } @else {
            @for (row of $displayRows(); track row.id) {
              @if (row.kind === 'folder') {
                <button
                  class="relative flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs font-semibold tracking-wide text-zinc-200 uppercase hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-zinc-400"
                  [attr.aria-expanded]="!row.isCollapsed"
                  [style.paddingLeft.px]="8 + row.depth * 16"
                  [class.bg-sky-950]="row.id === $activeRowId()"
                  [class.ring-1]="row.id === $activeRowId()"
                  [class.ring-sky-700]="row.id === $activeRowId()"
                  (click)="toggleFolder(row.folderPath || '')"
                  type="button"
                  role="treeitem"
                >
                  @for (offset of row.guideOffsets; track offset) {
                    <span
                      class="pointer-events-none absolute top-0 bottom-0 w-px bg-zinc-700"
                      [style.left.px]="offset"
                    ></span>
                  }
                  <span class="inline-block w-3 text-center text-zinc-400">
                    @if (row.isCollapsed) {
                      ▸
                    } @else {
                      ▾
                    }
                  </span>
                  <span
                    class="inline-flex h-4 w-4 items-center justify-center rounded border border-sky-300 bg-sky-500/10 text-xs leading-none text-sky-300"
                    >D</span
                  >
                  <span>{{ row.label }}</span>
                </button>
              } @else if (row.kind === 'file') {
                <button
                  class="relative flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs font-medium text-zinc-200 hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-zinc-400"
                  [attr.aria-expanded]="!row.isCollapsed"
                  [style.paddingLeft.px]="8 + row.depth * 16"
                  [class.bg-sky-950]="row.id === $activeRowId()"
                  [class.ring-1]="row.id === $activeRowId()"
                  [class.ring-sky-700]="row.id === $activeRowId()"
                  (click)="toggleFile(row.filePath || '')"
                  type="button"
                  role="treeitem"
                >
                  @for (offset of row.guideOffsets; track offset) {
                    <span
                      class="pointer-events-none absolute top-0 bottom-0 w-px bg-zinc-700"
                      [style.left.px]="offset"
                    ></span>
                  }
                  <span class="inline-block w-3 text-center text-zinc-500">
                    @if (row.isCollapsed) {
                      ▸
                    } @else {
                      ▾
                    }
                  </span>
                  <span
                    class="inline-flex h-4 w-4 items-center justify-center rounded border text-xs leading-none"
                    [class.border-red-300]="!row.isEnumEntry"
                    [class.bg-red-500/20]="!row.isEnumEntry"
                    [class.text-red-200]="!row.isEnumEntry"
                    [class.border-emerald-300]="row.isEnumEntry"
                    [class.bg-emerald-500/20]="row.isEnumEntry"
                    [class.text-emerald-200]="row.isEnumEntry"
                    >{{ row.isEnumEntry ? 'E' : 'M' }}</span
                  >
                  {{ row.label }}
                </button>
              } @else {
                <button
                  class="relative w-full rounded-md px-2 py-1 text-left text-sm focus-visible:outline-2 focus-visible:outline-zinc-400"
                  [style.paddingLeft.px]="8 + row.depth * 16"
                  [class.bg-sky-950]="row.isSelected"
                  [class.border]="row.isSelected"
                  [class.border-sky-700]="row.isSelected"
                  [class.ring-1]="row.id === $activeRowId()"
                  [class.ring-sky-700]="row.id === $activeRowId()"
                  [class.font-medium]="row.isSelected"
                  [class.text-zinc-100]="row.isSelected"
                  [class.text-zinc-300]="!row.isSelected"
                  [class.hover:bg-zinc-800]="!row.isSelected"
                  (click)="selectMock(row.mockKey || '')"
                  type="button"
                  role="treeitem"
                >
                  @for (offset of row.guideOffsets; track offset) {
                    <span
                      class="pointer-events-none absolute top-0 bottom-0 w-px bg-zinc-700"
                      [style.left.px]="offset"
                    ></span>
                  }
                  <span class="inline-block w-3"></span>
                  <span
                    class="mr-2 inline-flex h-4 w-4 items-center justify-center rounded border text-xs leading-none"
                    [class.border-amber-300]="
                      !row.isEnumEntry && !row.isCompactRow
                    "
                    [class.bg-amber-500/20]="
                      !row.isEnumEntry && !row.isCompactRow
                    "
                    [class.text-amber-200]="
                      !row.isEnumEntry && !row.isCompactRow
                    "
                    [class.border-red-300]="
                      !row.isEnumEntry && row.isCompactRow
                    "
                    [class.bg-red-500/20]="!row.isEnumEntry && row.isCompactRow"
                    [class.text-red-200]="!row.isEnumEntry && row.isCompactRow"
                    [class.border-emerald-300]="row.isEnumEntry"
                    [class.bg-emerald-500/20]="row.isEnumEntry"
                    [class.text-emerald-200]="row.isEnumEntry"
                    >{{
                      row.isEnumEntry ? 'E' : row.isCompactRow ? 'M' : 'V'
                    }}</span
                  >
                  {{ row.label }}
                </button>
              }
            }
          }
        </div>
      </aside>

      <div
        class="group relative flex h-full w-1 shrink-0 cursor-col-resize items-stretch justify-center rounded-sm transition-colors hover:bg-zinc-700"
        [class.bg-zinc-700/60]="$isResizingSidebar()"
        [class.ring-1]="$isResizingSidebar()"
        [class.ring-zinc-500]="$isResizingSidebar()"
        (pointerdown)="startSidebarResize($event)"
        (pointermove)="onSidebarResize($event)"
        (pointerup)="stopSidebarResize($event)"
        (pointercancel)="stopSidebarResize($event)"
      >
        <span
          class="my-3 w-1 rounded bg-zinc-500/60 transition group-hover:bg-zinc-300/80"
          [class.bg-zinc-200]="$isResizingSidebar()"
          [class.w-0.5]="$isResizingSidebar()"
        ></span>
      </div>

      <main
        class="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-sm border border-zinc-700 bg-black shadow-lg"
      >
        <header
          class="flex items-center justify-between gap-3 border-b border-zinc-700 bg-zinc-800 px-4 py-3"
        >
          <h2 class="truncate text-sm font-semibold text-zinc-100">
            {{ $selectedMockHeader().name }}
          </h2>
          <span class="truncate text-xs text-zinc-400">{{
            $selectedMockHeader().path
          }}</span>
        </header>

        <pre
          class="min-h-0 flex-1 overflow-auto bg-zinc-900 p-4 font-mono text-xs leading-relaxed text-zinc-200"
          >{{ $selectedMockData() }}</pre
        >
      </main>
    </section>
  `,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModelsMocksViewerComponent {
  protected readonly $rootLabel = SRC_ROOT_LABEL;
  protected readonly $selectedMockKey = signal(DEFAULT_MOCK_KEY);
  protected readonly $searchQuery = signal('');
  protected readonly $hideArrayEntries = signal(true);
  protected readonly $compactSingleChains = signal(true);
  protected readonly $sidebarWidth = signal(450);
  protected readonly $isResizingSidebar = signal(false);
  protected readonly $activeRowId = signal(
    DEFAULT_MOCK_KEY ? `mock:${DEFAULT_MOCK_KEY.replace(' :: ', '::')}` : '',
  );
  protected readonly $collapsedFolderPaths = signal<ReadonlySet<string>>(
    new Set<string>(),
  );
  protected readonly $collapsedFilePaths = signal<ReadonlySet<string>>(
    new Set<string>(),
  );

  protected readonly $selectedMockData = computed(() =>
    stringifyMock(MODEL_MOCKS, this.$selectedMockKey()),
  );
  protected readonly $selectedMockHeader = computed(() =>
    getSelectedMockHeader(this.$selectedMockKey()),
  );

  protected readonly $visibleRows = computed<readonly RenderRow[]>(() => {
    const selectedMockKey = this.$selectedMockKey();
    const hideArrayEntries = this.$hideArrayEntries();
    const collapsedFolderPaths = this.$collapsedFolderPaths();
    const collapsedFilePaths = this.$collapsedFilePaths();

    return TREE_ROWS.filter((row) => {
      const rowIsEnumEntry =
        row.kind === 'file'
          ? isEnumFilePath(row.filePath ?? '')
          : isEnumFilePath(row.parentFilePath ?? '');

      return (
        (!hideArrayEntries ||
          row.kind !== 'mock' ||
          (rowIsEnumEntry
            ? isRelevantEnumExport(row.mockKey ?? '')
            : !isArrayMockKey(row.mockKey ?? ''))) &&
        row.parentFolderPaths.every(
          (path) => !collapsedFolderPaths.has(path),
        ) &&
        (!row.parentFilePath || !collapsedFilePaths.has(row.parentFilePath))
      );
    }).map((row) => ({
      ...row,
      isEnumEntry:
        row.kind === 'file'
          ? isEnumFilePath(row.filePath ?? '')
          : isEnumFilePath(row.parentFilePath ?? ''),
      isCompactRow: false,
      isSelected: row.kind === 'mock' && row.mockKey === selectedMockKey,
      isCollapsed:
        (row.kind === 'folder' && row.folderPath
          ? collapsedFolderPaths.has(row.folderPath)
          : false) ||
        (row.kind === 'file' && row.filePath
          ? collapsedFilePaths.has(row.filePath)
          : false),
    }));
  });
  protected readonly $renderRows = computed<readonly RenderRow[]>(() => {
    const visibleRows = this.$visibleRows();
    if (!this.$compactSingleChains()) {
      return visibleRows;
    }

    const fileCountByFolderPath = new Map<string, number>();
    const folderCountByFolderPath = new Map<string, number>();
    const mockCountByFilePath = new Map<string, number>();

    visibleRows.forEach((row) => {
      if (row.kind === 'file') {
        const parentFolderPath = row.parentFolderPaths.at(-1);
        if (parentFolderPath) {
          fileCountByFolderPath.set(
            parentFolderPath,
            (fileCountByFolderPath.get(parentFolderPath) ?? 0) + 1,
          );
        }
      }

      if (row.kind === 'folder') {
        const parentFolderPath = row.parentFolderPaths.at(-1);
        if (parentFolderPath) {
          folderCountByFolderPath.set(
            parentFolderPath,
            (folderCountByFolderPath.get(parentFolderPath) ?? 0) + 1,
          );
        }
      }

      if (row.kind === 'mock' && row.parentFilePath) {
        mockCountByFilePath.set(
          row.parentFilePath,
          (mockCountByFilePath.get(row.parentFilePath) ?? 0) + 1,
        );
      }
    });

    const rowsToSkip = new Set<string>();
    const mockDepthAdjustByFilePath = new Map<string, number>();
    const compactedRows: RenderRow[] = [];

    visibleRows.forEach((row) => {
      if (rowsToSkip.has(row.id)) {
        return;
      }

      if (row.kind === 'mock') {
        const depthAdjust = row.parentFilePath
          ? (mockDepthAdjustByFilePath.get(row.parentFilePath) ?? 0)
          : 0;
        compactedRows.push({
          ...row,
          depth: row.depth + depthAdjust,
          guideOffsets: row.guideOffsets.slice(
            0,
            Math.max(0, row.depth + depthAdjust),
          ),
        });
        return;
      }

      if (row.kind === 'folder' && row.folderPath && !row.isCollapsed) {
        const childFileCount = fileCountByFolderPath.get(row.folderPath) ?? 0;
        const childFolderCount =
          folderCountByFolderPath.get(row.folderPath) ?? 0;
        if (childFileCount !== 1 || childFolderCount !== 0) {
          compactedRows.push(row);
          return;
        }

        const childFile = visibleRows.find(
          (item) =>
            item.kind === 'file' &&
            item.parentFolderPaths.at(-1) === row.folderPath &&
            !rowsToSkip.has(item.id),
        );
        if (!childFile || !childFile.filePath || childFile.isCollapsed) {
          compactedRows.push(row);
          return;
        }

        const childMockCount = mockCountByFilePath.get(childFile.filePath) ?? 0;
        if (childMockCount === 1) {
          const childMock = visibleRows.find(
            (item) =>
              item.kind === 'mock' &&
              item.parentFilePath === childFile.filePath &&
              !rowsToSkip.has(item.id),
          );
          if (childMock?.mockKey) {
            rowsToSkip.add(childFile.id);
            rowsToSkip.add(childMock.id);
            compactedRows.push({
              ...childMock,
              id: `compact:${row.id}:${childFile.id}:${childMock.id}`,
              label: childFile.label,
              depth: row.depth,
              guideOffsets: row.guideOffsets,
              parentFilePath: undefined,
              parentFolderPaths: row.parentFolderPaths,
              isCompactRow: true,
            });
            return;
          }
        }

        rowsToSkip.add(childFile.id);
        mockDepthAdjustByFilePath.set(childFile.filePath, -1);
        compactedRows.push({
          ...childFile,
          id: `compact:${row.id}:${childFile.id}`,
          depth: row.depth,
          guideOffsets: row.guideOffsets,
          parentFolderPaths: row.parentFolderPaths,
          isCompactRow: true,
        });
        return;
      }

      if (row.kind !== 'file' || !row.filePath || row.isCollapsed) {
        compactedRows.push(row);
        return;
      }

      const childMockCount = mockCountByFilePath.get(row.filePath) ?? 0;
      if (childMockCount !== 1) {
        compactedRows.push(row);
        return;
      }

      const childMock = visibleRows.find(
        (item) =>
          item.kind === 'mock' &&
          item.parentFilePath === row.filePath &&
          !rowsToSkip.has(item.id),
      );
      if (!childMock || !childMock.mockKey) {
        compactedRows.push(row);
        return;
      }

      rowsToSkip.add(childMock.id);
      compactedRows.push({
        ...childMock,
        id: `compact:${row.id}:${childMock.id}`,
        label: row.label,
        isCompactRow: true,
      });
    });

    return compactedRows;
  });
  protected readonly $displayRows = computed<readonly RenderRow[]>(() => {
    const searchQuery = this.$searchQuery().trim().toLowerCase();
    const rows = this.$renderRows();
    if (!searchQuery) {
      return rows;
    }

    const matchedRows = rows.filter((row) => {
      const searchableText = [
        row.label,
        row.folderPath ?? '',
        row.filePath ?? '',
        row.parentFilePath ?? '',
        row.mockKey ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return searchableText.includes(searchQuery);
    });

    if (matchedRows.length === 0) {
      return [];
    }

    const includedIds = new Set<string>();
    const matchedFolderPaths = new Set<string>();
    const matchedFilePaths = new Set<string>();

    matchedRows.forEach((row) => {
      includedIds.add(row.id);
      row.parentFolderPaths.forEach((folderPath) => {
        includedIds.add(`folder:${folderPath}`);
      });
      if (row.parentFilePath) {
        includedIds.add(`file:${row.parentFilePath}`);
      }
      if (row.kind === 'folder' && row.folderPath) {
        matchedFolderPaths.add(row.folderPath);
      }
      if (row.kind === 'file' && row.filePath) {
        matchedFilePaths.add(row.filePath);
      }
    });

    rows.forEach((row) => {
      if (
        row.parentFolderPaths.some((folderPath) =>
          matchedFolderPaths.has(folderPath),
        )
      ) {
        includedIds.add(row.id);
      }
      if (row.parentFilePath && matchedFilePaths.has(row.parentFilePath)) {
        includedIds.add(row.id);
      }
    });

    const filteredRows = rows.filter((row) => includedIds.has(row.id));
    return collapseVisibleFolderChains(filteredRows);
  });

  constructor() {
    effect(() => {
      const selectedMockKey = this.$selectedMockKey();
      if (!selectedMockKey) {
        return;
      }

      const selectedRowId = `mock:${selectedMockKey.replace(' :: ', '::')}`;
      const matchingRow = this.$displayRows().find(
        (row) =>
          row.id === selectedRowId ||
          (row.kind === 'mock' && row.mockKey === selectedMockKey),
      );
      if (matchingRow) {
        this.$activeRowId.set(matchingRow.id);
      }
    });

    effect(() => {
      const renderRows = this.$displayRows();
      const hasSelectedVisibleRow = renderRows.some(
        (row) => row.kind === 'mock' && row.mockKey === this.$selectedMockKey(),
      );
      if (hasSelectedVisibleRow) {
        return;
      }

      const firstVisibleMock = renderRows.find((row) => row.kind === 'mock');
      if (firstVisibleMock?.mockKey) {
        this.$selectedMockKey.set(firstVisibleMock.mockKey);
        this.$activeRowId.set(firstVisibleMock.id);
      }
    });
  }

  protected toggleFolder(folderPath: string): void {
    this.$collapsedFolderPaths.update((current) => {
      const next = new Set(current);

      if (next.has(folderPath)) {
        next.delete(folderPath);
      } else {
        next.add(folderPath);
      }

      return next;
    });

    this.$activeRowId.set(`folder:${folderPath}`);
  }

  protected selectMock(mockKey: string): void {
    this.$selectedMockKey.set(mockKey);
    this.$activeRowId.set(`mock:${mockKey.replace(' :: ', '::')}`);
  }

  protected toggleFile(filePath: string): void {
    this.$collapsedFilePaths.update((current) => {
      const next = new Set(current);

      if (next.has(filePath)) {
        next.delete(filePath);
      } else {
        next.add(filePath);
      }

      return next;
    });

    this.$activeRowId.set(`file:${filePath}`);
  }

  protected expandAllFolders(): void {
    this.$collapsedFolderPaths.set(new Set<string>());
    this.$collapsedFilePaths.set(new Set<string>());
  }

  protected collapseAllFolders(): void {
    const folderPaths = TREE_ROWS.flatMap((row) =>
      row.kind === 'folder' && row.folderPath ? [row.folderPath] : [],
    );
    const filePaths = TREE_ROWS.flatMap((row) =>
      row.kind === 'file' && row.filePath ? [row.filePath] : [],
    );

    this.$collapsedFolderPaths.set(new Set(folderPaths));
    this.$collapsedFilePaths.set(new Set(filePaths));
  }

  protected startSidebarResize(event: PointerEvent): void {
    const target = event.currentTarget;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    target.setPointerCapture(event.pointerId);
    this.$isResizingSidebar.set(true);
  }

  protected onSidebarResize(event: PointerEvent): void {
    if (!this.$isResizingSidebar()) {
      return;
    }

    const minSidebarWidth = 260;
    const maxSidebarWidth = 720;
    const nextWidth = Math.max(
      minSidebarWidth,
      Math.min(maxSidebarWidth, event.clientX - 16),
    );
    this.$sidebarWidth.set(nextWidth);
  }

  protected stopSidebarResize(event: PointerEvent): void {
    const target = event.currentTarget;
    if (
      target instanceof HTMLElement &&
      target.hasPointerCapture(event.pointerId)
    ) {
      target.releasePointerCapture(event.pointerId);
    }

    this.$isResizingSidebar.set(false);
  }

  protected onTreeKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.moveActive(1);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.moveActive(-1);
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.expandOrActivate();
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.collapseOrGoParent();
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.activateCurrentRow();
    }
  }

  protected toggleHideArrays(): void {
    this.$hideArrayEntries.update((current) => !current);
  }

  protected toggleCompactSingleChains(): void {
    this.$compactSingleChains.update((current) => !current);
  }

  protected onSearchInput(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement) {
      this.$searchQuery.set(target.value);
    }
  }

  protected clearSearch(): void {
    this.$searchQuery.set('');
  }

  private moveActive(delta: number): void {
    const rows = this.$displayRows();
    if (rows.length === 0) {
      return;
    }

    const currentIndex = rows.findIndex(
      (row) => row.id === this.$activeRowId(),
    );
    const safeCurrentIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = Math.min(
      rows.length - 1,
      Math.max(0, safeCurrentIndex + delta),
    );
    const nextRow = rows[nextIndex];

    this.$activeRowId.set(nextRow.id);
    if (nextRow.kind === 'mock' && nextRow.mockKey) {
      this.$selectedMockKey.set(nextRow.mockKey);
    }
  }

  private expandOrActivate(): void {
    const row = this.$displayRows().find(
      (item) => item.id === this.$activeRowId(),
    );
    if (!row) {
      return;
    }

    if (row.kind === 'folder' && row.folderPath && row.isCollapsed) {
      this.toggleFolder(row.folderPath);
      return;
    }

    if (row.kind === 'file' && row.filePath && row.isCollapsed) {
      this.toggleFile(row.filePath);
      return;
    }

    if (row.kind === 'mock' && row.mockKey) {
      this.$selectedMockKey.set(row.mockKey);
    }
  }

  private collapseOrGoParent(): void {
    const rows = this.$displayRows();
    const row = rows.find((item) => item.id === this.$activeRowId());
    if (!row) {
      return;
    }

    if (row.kind === 'folder' && row.folderPath && !row.isCollapsed) {
      this.toggleFolder(row.folderPath);
      return;
    }

    if (row.kind === 'file' && row.filePath && !row.isCollapsed) {
      this.toggleFile(row.filePath);
      return;
    }

    if (row.kind === 'mock' && row.parentFilePath) {
      this.$activeRowId.set(`file:${row.parentFilePath}`);
      return;
    }

    const parentPath = row.parentFolderPaths.at(-1);
    if (!parentPath) {
      return;
    }

    this.$activeRowId.set(`folder:${parentPath}`);
  }

  private activateCurrentRow(): void {
    const row = this.$displayRows().find(
      (item) => item.id === this.$activeRowId(),
    );
    if (!row) {
      return;
    }

    if (row.kind === 'folder' && row.folderPath) {
      this.toggleFolder(row.folderPath);
      return;
    }

    if (row.kind === 'file' && row.filePath) {
      this.toggleFile(row.filePath);
      return;
    }

    if (row.kind === 'mock' && row.mockKey) {
      this.$selectedMockKey.set(row.mockKey);
    }
  }
}

const meta: Meta<ModelsMocksViewerComponent> = {
  title: 'Models Mocks Viewer',
  component: ModelsMocksViewerComponent,
  parameters: {
    docs: {
      description: {
        component:
          'File-explorer viewer for model mocks with auto-discovery, tree navigation, collapse, and JSON preview.',
      },
    },
    layout: 'fullscreen',
  },
  argTypes: {},
  args: {},
};

export default meta;

type Story = StoryObj<ModelsMocksViewerComponent>;

export const ModelsMocksViewer: Story = {
  render: (args) => ({ props: args }),
};

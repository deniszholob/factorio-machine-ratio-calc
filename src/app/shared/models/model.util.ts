export type MockModuleExports = Readonly<Record<string, unknown>>;

export enum TreeRowKind {
  'Folder' = 'Folder',
  'File' = 'File',
  'Mock' = 'Mock',
}

export type TreeRow = Readonly<{
  id: string;
  label: string;
  depth: number;
  kind: TreeRowKind;
  mockKey?: string;
  filePath?: string;
  folderPath?: string;
  parentFolderPaths: readonly string[];
  parentFilePath?: string;
  guideOffsets: readonly number[];
}>;

export type TreeRenderRow = TreeRow &
  Readonly<{
    isSelected: boolean;
    isCollapsed: boolean;
    isEnumEntry: boolean;
    isCompactRow: boolean;
  }>;

export type TreeRenderOptions = Readonly<{
  selectedMockKey: string;
  hideArrayEntries: boolean;
  collapsedFolderPaths: ReadonlySet<string>;
  collapsedFilePaths: ReadonlySet<string>;
}>;

export const SRC_ROOT_LABEL = 'src';
export const APP_ROOT_LABEL = 'app';

type FileEntry = {
  filePath: string;
  parentFolderPath: string;
  parentFolderPaths: readonly string[];
  fileName: string;
  modelLabel: string;
  mockExports: readonly string[];
};

type FolderChildren = {
  folders: Set<string>;
  files: FileEntry[];
};

export function normalizeMockFilePath(filePath: string): string {
  const normalizedSlashes = filePath.replaceAll('\\', '/');
  const withoutDotPrefix = normalizedSlashes.replace(/^\.\//u, '');
  const withoutSrcPrefix = withoutDotPrefix.replace(/^src\//u, '');

  if (withoutSrcPrefix.startsWith(`${APP_ROOT_LABEL}/`)) {
    return withoutSrcPrefix;
  }

  return `${APP_ROOT_LABEL}/${withoutSrcPrefix}`;
}

export function buildModelMocks(
  mockModules: ReadonlyArray<readonly [string, MockModuleExports]>,
): Readonly<Record<string, unknown>> {
  return mockModules.reduce<Record<string, unknown>>(
    (acc, [filePath, mockModule]) => {
      const normalizedPath = normalizeMockFilePath(filePath);

      Object.entries(mockModule).forEach(([exportName, exportValue]) => {
        if (exportName === '__esModule' || typeof exportValue === 'function') {
          return;
        }

        acc[`${normalizedPath} :: ${exportName}`] = exportValue;
      });

      return acc;
    },
    {},
  );
}

export function buildEnumEntries(
  enumModules: ReadonlyArray<readonly [string, MockModuleExports]>,
): Readonly<Record<string, unknown>> {
  return enumModules.reduce<Record<string, unknown>>(
    (acc, [filePath, enumModule]) => {
      const normalizedPath = normalizeMockFilePath(filePath);

      Object.entries(enumModule).forEach(([exportName, exportValue]) => {
        if (exportName === '__esModule' || typeof exportValue === 'function') {
          return;
        }

        acc[`${normalizedPath} :: ${exportName}`] = exportValue;
      });

      return acc;
    },
    {},
  );
}

export function stringifyMock(
  modelMocks: Readonly<Record<string, unknown>>,
  mockKey: string,
): string {
  return JSON.stringify(modelMocks[mockKey] ?? null, null, 2);
}

export function getSelectedMockHeader(selectedMockKey: string): Readonly<{
  name: string;
  path: string;
}> {
  const [path = '', name = ''] = selectedMockKey.split(' :: ');
  return {
    name,
    path: path ? `${SRC_ROOT_LABEL}/${path}` : SRC_ROOT_LABEL,
  };
}

export function toMockRowId(mockKey: string): string {
  return `mock:${mockKey.replace(' :: ', '::')}`;
}

export function isArrayMockKey(mockKey: string): boolean {
  return mockKey.endsWith('_Array');
}

export function isEnumFilePath(filePath: string): boolean {
  return filePath.endsWith('.enum.ts');
}

export function isRelevantEnumExport(mockKey: string): boolean {
  const [, exportName = ''] = mockKey.split(' :: ');
  return exportName.endsWith('_INFO_OPTIONS');
}

export function toModelLabel(fileName: string): string {
  return fileName
    .replace(/\.model\.mock\.ts$/u, '')
    .replace(/\.mock\.ts$/u, '')
    .replace(/\.enum\.ts$/u, '')
    .replace(/[-_.]+/gu, ' ');
}

export function toGuideOffsets(depth: number): readonly number[] {
  return Array.from({ length: depth }, (_, index) => 14 + index * 16);
}

function getOrCreateChildren(
  folderChildren: Map<string, FolderChildren>,
  folderPath: string,
): FolderChildren {
  const existing = folderChildren.get(folderPath);
  if (existing) {
    return existing;
  }

  const next: FolderChildren = { folders: new Set<string>(), files: [] };
  folderChildren.set(folderPath, next);
  return next;
}

function compactFolderChain(
  folderChildren: Map<string, FolderChildren>,
  startPath: string,
): Readonly<{ finalPath: string; label: string }> {
  const labels: string[] = [];
  let currentPath = startPath;
  let shouldContinue = true;

  do {
    const folderName = currentPath.split('/').at(-1) ?? currentPath;
    labels.push(folderName);

    const currentChildren = getOrCreateChildren(folderChildren, currentPath);
    const childFolders = Array.from(currentChildren.folders).sort((left, right) =>
      left.localeCompare(right),
    );

    shouldContinue = currentChildren.files.length === 0 && childFolders.length === 1;
    if (shouldContinue) {
      currentPath = childFolders[0];
    }
  } while (shouldContinue);

  return {
    finalPath: currentPath,
    label: labels.join('/'),
  };
}

function renderFolder(
  rows: TreeRow[],
  folderChildren: Map<string, FolderChildren>,
  folderPath: string,
  depth: number,
  parentFolderPaths: readonly string[],
  compactLabel?: string,
): void {
  const folderName = compactLabel ?? folderPath.split('/').at(-1) ?? folderPath;
  const children = getOrCreateChildren(folderChildren, folderPath);

  rows.push({
    id: `folder:${folderPath}`,
    label: folderName,
    depth,
    kind: TreeRowKind.Folder,
    folderPath,
    parentFolderPaths,
    guideOffsets: toGuideOffsets(depth),
  });

  children.files
    .sort((left, right) => {
      if (left.parentFolderPath === right.parentFolderPath) {
        return left.fileName.localeCompare(right.fileName);
      }

      const leftIsParentMatch = left.modelLabel === left.parentFolderPath.split('/').at(-1);
      const rightIsParentMatch =
        right.modelLabel === right.parentFolderPath.split('/').at(-1);

      if (leftIsParentMatch && !rightIsParentMatch) {
        return -1;
      }

      if (!leftIsParentMatch && rightIsParentMatch) {
        return 1;
      }

      return left.fileName.localeCompare(right.fileName);
    })
    .forEach((fileEntry) => {
      rows.push({
        id: `file:${fileEntry.filePath}`,
        label: fileEntry.modelLabel,
        depth: depth + 1,
        kind: TreeRowKind.File,
        filePath: fileEntry.filePath,
        parentFolderPaths: [...parentFolderPaths, folderPath],
        guideOffsets: toGuideOffsets(depth + 1),
      });

      fileEntry.mockExports.forEach((exportName) => {
        rows.push({
          id: toMockRowId(`${fileEntry.filePath} :: ${exportName}`),
          label: exportName,
          depth: depth + 2,
          kind: TreeRowKind.Mock,
          mockKey: `${fileEntry.filePath} :: ${exportName}`,
          parentFilePath: fileEntry.filePath,
          parentFolderPaths: [...parentFolderPaths, folderPath],
          guideOffsets: toGuideOffsets(depth + 2),
        });
      });
    });

  Array.from(children.folders)
    .sort((leftPath, rightPath) => leftPath.localeCompare(rightPath))
    .forEach((childFolderPath) => {
      const compactNode = compactFolderChain(folderChildren, childFolderPath);
      renderFolder(
        rows,
        folderChildren,
        compactNode.finalPath,
        depth + 1,
        [...parentFolderPaths, folderPath],
        compactNode.label,
      );
    });
}

export function createTreeRows(mockKeys: readonly string[]): TreeRow[] {
  const fileToExports = new Map<string, string[]>();
  const folderChildren = new Map<string, FolderChildren>();

  mockKeys.forEach((mockKey) => {
    const [filePath, exportName] = mockKey.split(' :: ');
    const exports = fileToExports.get(filePath) ?? [];
    exports.push(exportName);
    fileToExports.set(filePath, exports);
  });

  const files: FileEntry[] = Array.from(fileToExports.entries())
    .sort(([leftPath], [rightPath]) => leftPath.localeCompare(rightPath))
    .map(([filePath, exports]) => {
      const segments = filePath.split('/');
      const parentFolderPaths = segments.slice(0, -1);
      const parentFolderPath = parentFolderPaths.join('/');
      const fileName = segments.at(-1) ?? filePath;
      const modelLabel = toModelLabel(fileName);

      return {
        filePath,
        parentFolderPath,
        parentFolderPaths,
        fileName,
        modelLabel,
        mockExports: exports.sort(),
      };
    });

  files.forEach((fileEntry) => {
    getOrCreateChildren(folderChildren, fileEntry.parentFolderPath).files.push(fileEntry);

    fileEntry.parentFolderPaths.forEach((_, index) => {
      const folderPath = fileEntry.parentFolderPaths.slice(0, index + 1).join('/');
      const parentPath = fileEntry.parentFolderPaths.slice(0, index).join('/');
      getOrCreateChildren(folderChildren, parentPath).folders.add(folderPath);
      getOrCreateChildren(folderChildren, folderPath);
    });
  });

  const rows: TreeRow[] = [];
  const rootChildren = getOrCreateChildren(folderChildren, '');

  rootChildren.files
    .sort((left, right) => left.fileName.localeCompare(right.fileName))
    .forEach((fileEntry) => {
      rows.push({
        id: `file:${fileEntry.filePath}`,
        label: fileEntry.modelLabel,
        depth: 0,
        kind: TreeRowKind.File,
        filePath: fileEntry.filePath,
        parentFolderPaths: [],
        guideOffsets: toGuideOffsets(0),
      });

      fileEntry.mockExports.forEach((exportName) => {
        rows.push({
          id: toMockRowId(`${fileEntry.filePath} :: ${exportName}`),
          label: exportName,
          depth: 1,
          kind: TreeRowKind.Mock,
          mockKey: `${fileEntry.filePath} :: ${exportName}`,
          parentFilePath: fileEntry.filePath,
          parentFolderPaths: [],
          guideOffsets: toGuideOffsets(1),
        });
      });
    });

  Array.from(rootChildren.folders)
    .sort((leftPath, rightPath) => leftPath.localeCompare(rightPath))
    .forEach((folderPath) => {
      const compactNode = compactFolderChain(folderChildren, folderPath);
      renderFolder(rows, folderChildren, compactNode.finalPath, 0, [], compactNode.label);
    });

  return rows;
}

export function buildTreeRenderRows(
  rows: readonly TreeRow[],
  options: TreeRenderOptions,
): TreeRenderRow[] {
  const {
    selectedMockKey,
    hideArrayEntries,
    collapsedFolderPaths,
    collapsedFilePaths,
  } = options;

  return rows
    .filter((row) => {
      const rowIsEnumEntry =
        row.kind === TreeRowKind.File
          ? isEnumFilePath(row.filePath ?? '')
          : isEnumFilePath(row.parentFilePath ?? '');

      return (
        (!hideArrayEntries ||
          row.kind !== TreeRowKind.Mock ||
          (rowIsEnumEntry
            ? isRelevantEnumExport(row.mockKey ?? '')
            : !isArrayMockKey(row.mockKey ?? ''))) &&
        row.parentFolderPaths.every((path) => !collapsedFolderPaths.has(path)) &&
        (!row.parentFilePath || !collapsedFilePaths.has(row.parentFilePath))
      );
    })
    .map((row) => ({
      ...row,
      isEnumEntry:
        row.kind === TreeRowKind.File
          ? isEnumFilePath(row.filePath ?? '')
          : isEnumFilePath(row.parentFilePath ?? ''),
      isCompactRow: false,
      isSelected: row.kind === TreeRowKind.Mock && row.mockKey === selectedMockKey,
      isCollapsed:
        (row.kind === TreeRowKind.Folder && row.folderPath
          ? collapsedFolderPaths.has(row.folderPath)
          : false) ||
        (row.kind === TreeRowKind.File && row.filePath
          ? collapsedFilePaths.has(row.filePath)
          : false),
    }));
}

export function compactSingleChains(rows: readonly TreeRenderRow[]): TreeRenderRow[] {
  const fileCountByFolderPath = new Map<string, number>();
  const folderCountByFolderPath = new Map<string, number>();
  const mockCountByFilePath = new Map<string, number>();

  rows.forEach((row) => {
    if (row.kind === TreeRowKind.File) {
      const parentFolderPath = row.parentFolderPaths.at(-1);
      if (parentFolderPath) {
        fileCountByFolderPath.set(
          parentFolderPath,
          (fileCountByFolderPath.get(parentFolderPath) ?? 0) + 1,
        );
      }
    }

    if (row.kind === TreeRowKind.Folder) {
      const parentFolderPath = row.parentFolderPaths.at(-1);
      if (parentFolderPath) {
        folderCountByFolderPath.set(
          parentFolderPath,
          (folderCountByFolderPath.get(parentFolderPath) ?? 0) + 1,
        );
      }
    }

    if (row.kind === TreeRowKind.Mock && row.parentFilePath) {
      mockCountByFilePath.set(
        row.parentFilePath,
        (mockCountByFilePath.get(row.parentFilePath) ?? 0) + 1,
      );
    }
  });

  const rowsToSkip = new Set<string>();
  const mockDepthAdjustByFilePath = new Map<string, number>();
  const compactedRows: TreeRenderRow[] = [];

  rows.forEach((row) => {
    if (rowsToSkip.has(row.id)) {
      return;
    }

    if (row.kind === TreeRowKind.Mock) {
      const depthAdjust = row.parentFilePath
        ? (mockDepthAdjustByFilePath.get(row.parentFilePath) ?? 0)
        : 0;
      compactedRows.push({
        ...row,
        depth: row.depth + depthAdjust,
        guideOffsets: row.guideOffsets.slice(0, Math.max(0, row.depth + depthAdjust)),
      });
      return;
    }

    if (row.kind === TreeRowKind.Folder && row.folderPath && !row.isCollapsed) {
      const childFileCount = fileCountByFolderPath.get(row.folderPath) ?? 0;
      const childFolderCount = folderCountByFolderPath.get(row.folderPath) ?? 0;
      if (childFileCount !== 1 || childFolderCount !== 0) {
        compactedRows.push(row);
        return;
      }

      const childFile = rows.find(
        (item) =>
          item.kind === TreeRowKind.File &&
          item.parentFolderPaths.at(-1) === row.folderPath &&
          !rowsToSkip.has(item.id),
      );
      if (!childFile || !childFile.filePath || childFile.isCollapsed) {
        compactedRows.push(row);
        return;
      }

      const childMockCount = mockCountByFilePath.get(childFile.filePath) ?? 0;
      if (childMockCount === 1) {
        const childMock = rows.find(
          (item) =>
            item.kind === TreeRowKind.Mock &&
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

    if (row.kind !== TreeRowKind.File || !row.filePath || row.isCollapsed) {
      compactedRows.push(row);
      return;
    }

    const childMockCount = mockCountByFilePath.get(row.filePath) ?? 0;
    if (childMockCount !== 1) {
      compactedRows.push(row);
      return;
    }

    const childMock = rows.find(
      (item) =>
        item.kind === TreeRowKind.Mock &&
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
}

export function collapseVisibleFolderChains(
  rows: readonly TreeRenderRow[],
): readonly TreeRenderRow[] {
  const output: TreeRenderRow[] = [];
  let index = 0;

  while (index < rows.length) {
    const row = rows[index];
    if (row.kind !== TreeRowKind.Folder) {
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
        next.kind !== TreeRowKind.Folder ||
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

export function filterRowsBySearch(
  rows: readonly TreeRenderRow[],
  searchQueryRaw: string,
): TreeRenderRow[] {
  const searchQuery = searchQueryRaw.trim().toLowerCase();
  if (!searchQuery) {
    return [...rows];
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
    if (row.kind === TreeRowKind.Folder && row.folderPath) {
      matchedFolderPaths.add(row.folderPath);
    }
    if (row.kind === TreeRowKind.File && row.filePath) {
      matchedFilePaths.add(row.filePath);
    }
  });

  rows.forEach((row) => {
    if (row.parentFolderPaths.some((folderPath) => matchedFolderPaths.has(folderPath))) {
      includedIds.add(row.id);
    }
    if (row.parentFilePath && matchedFilePaths.has(row.parentFilePath)) {
      includedIds.add(row.id);
    }
  });

  const filteredRows = rows.filter((row) => includedIds.has(row.id));
  return [...collapseVisibleFolderChains(filteredRows)];
}

export function getCollapseTargets(rows: readonly TreeRow[]): Readonly<{
  folderPaths: readonly string[];
  filePaths: readonly string[];
}> {
  const folderPaths = rows.flatMap((row) =>
    row.kind === TreeRowKind.Folder && row.folderPath ? [row.folderPath] : [],
  );
  const filePaths = rows.flatMap((row) =>
    row.kind === TreeRowKind.File && row.filePath ? [row.filePath] : [],
  );

  return { folderPaths, filePaths };
}

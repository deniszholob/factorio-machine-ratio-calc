export type MockModuleExports = Readonly<Record<string, unknown>>;

export type TreeRow = Readonly<{
  id: string;
  label: string;
  depth: number;
  kind: 'folder' | 'file' | 'mock';
  mockKey?: string;
  filePath?: string;
  folderPath?: string;
  parentFolderPaths: readonly string[];
  parentFilePath?: string;
  guideOffsets: readonly number[];
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
  mockModules: ReadonlyArray<readonly [string, MockModuleExports]>
): Readonly<Record<string, unknown>> {
  return mockModules.reduce<Record<string, unknown>>((acc, [filePath, mockModule]) => {
    const normalizedPath = normalizeMockFilePath(filePath);

    Object.entries(mockModule).forEach(([exportName, exportValue]) => {
      if (exportName === '__esModule' || typeof exportValue === 'function') {
        return;
      }

      acc[`${normalizedPath} :: ${exportName}`] = exportValue;
    });

    return acc;
  }, {});
}

export function buildEnumEntries(
  enumModules: ReadonlyArray<readonly [string, MockModuleExports]>
): Readonly<Record<string, unknown>> {
  return enumModules.reduce<Record<string, unknown>>((acc, [filePath, enumModule]) => {
    const normalizedPath = normalizeMockFilePath(filePath);

    Object.entries(enumModule).forEach(([exportName, exportValue]) => {
      if (exportName === '__esModule' || typeof exportValue === 'function') {
        return;
      }

      acc[`${normalizedPath} :: ${exportName}`] = exportValue;
    });

    return acc;
  }, {});
}

export function stringifyMock(
  modelMocks: Readonly<Record<string, unknown>>,
  mockKey: string
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

export function toModelLabel(fileName: string): string {
  return fileName
    .replace(/\.model\.mock\.ts$/u, '')
    .replace(/\.mock\.ts$/u, '')
    .replace(/[-_.]+/gu, ' ');
}

export function toGuideOffsets(depth: number): readonly number[] {
  return Array.from({ length: depth }, (_, index) => 14 + index * 16);
}

function getOrCreateChildren(
  folderChildren: Map<string, FolderChildren>,
  folderPath: string
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
  startPath: string
): Readonly<{ finalPath: string; label: string }> {
  const labels: string[] = [];
  let currentPath = startPath;
  let shouldContinue = true;

  do {
    const folderName = currentPath.split('/').at(-1) ?? currentPath;
    labels.push(folderName);

    const currentChildren = getOrCreateChildren(folderChildren, currentPath);
    const childFolders = Array.from(currentChildren.folders).sort((left, right) =>
      left.localeCompare(right)
    );

    shouldContinue =
      currentChildren.files.length === 0 && childFolders.length === 1;
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
  compactLabel?: string
): void {
  const folderName = compactLabel ?? folderPath.split('/').at(-1) ?? folderPath;
  const children = getOrCreateChildren(folderChildren, folderPath);

  rows.push({
    id: `folder:${folderPath}`,
    label: folderName,
    depth,
    kind: 'folder',
    folderPath,
    parentFolderPaths,
    guideOffsets: toGuideOffsets(depth),
  });

  children.files
    .sort((left, right) => left.fileName.localeCompare(right.fileName))
    .forEach((fileEntry) => {
      rows.push({
        id: `file:${fileEntry.filePath}`,
        label: fileEntry.modelLabel,
        depth: depth + 1,
        kind: 'file',
        filePath: fileEntry.filePath,
        parentFolderPaths: [...parentFolderPaths, folderPath],
        guideOffsets: toGuideOffsets(depth + 1),
      });

      fileEntry.mockExports.forEach((exportName) => {
        rows.push({
          id: `mock:${fileEntry.filePath}::${exportName}`,
          label: exportName,
          depth: depth + 2,
          kind: 'mock',
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
        compactNode.label
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
    getOrCreateChildren(folderChildren, fileEntry.parentFolderPath).files.push(
      fileEntry
    );

    fileEntry.parentFolderPaths.forEach((_, index) => {
      const folderPath = fileEntry.parentFolderPaths
        .slice(0, index + 1)
        .join('/');
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
        kind: 'file',
        filePath: fileEntry.filePath,
        parentFolderPaths: [],
        guideOffsets: toGuideOffsets(0),
      });

      fileEntry.mockExports.forEach((exportName) => {
        rows.push({
          id: `mock:${fileEntry.filePath}::${exportName}`,
          label: exportName,
          depth: 1,
          kind: 'mock',
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
      renderFolder(
        rows,
        folderChildren,
        compactNode.finalPath,
        0,
        [],
        compactNode.label
      );
    });

  return rows;
}

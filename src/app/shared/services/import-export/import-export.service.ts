import { Injectable, inject } from '@angular/core';

import { guid } from '../../utils/guid/guid.util';
import { LOCAL_STORAGE_KEY_STATE } from './local-storage.data';
import { ProductionChain } from '../../models/production-chain/production-chain.model';
import { Production } from '../../models/production-chain/production/production.model';
import { ImportMode } from '../../models/import-mode.enum';
import { DataTypes, DATA_TYPES_OPTIONS } from '../../models/data-types/data-types.enum';
import { normalizeProduction } from 'src/app/components/production/production-chain-editor/production-editor/production.util';
import { ProductionCatalogService } from '../production-catalog/production-catalog.service';

const DOWNLOAD_FILE_PREFIX = 'PRC1';
const DOWNLOAD_SCOPE_LIST = 'list';
const DOWNLOAD_FILE_EXTENSION = `json`;
const DOWNLOAD_FILE_NAME_PATTERN = new RegExp(
  `^${DOWNLOAD_FILE_PREFIX}\\.([^.]+)\\.(${DATA_TYPES_OPTIONS.join('|')})\\.${DOWNLOAD_FILE_EXTENSION}$`,
);

/** Responsible for
 * - loading json data from a file
 * - saving json data to a file
 *
 *  Data:
 * - ProductionChain[] for full app state
 * - Machine[] for a single production chain
 */
@Injectable({ providedIn: 'root' })
export class ImportExportService {
  private readonly productionCatalogService = inject(ProductionCatalogService);

  public readonly productionChainFileAccept = getDataTypeFileAccept(
    DataTypes.ProductionChain,
  );
  public readonly productionFileAccept = getDataTypeFileAccept(
    DataTypes.Production,
  );

  // #region IO
  /** Load/Upload/Import from json file to localstorage */
  public async uploadAllProductionChains(
    files: File[],
    mode: ImportMode,
  ): Promise<void> {
    const file = getFirstFile(files);
    if (!file) {
      return;
    }
    const fileMeta = assertFileDataType(file.name, DataTypes.ProductionChain);
    assertFileScope(fileMeta.scope, DOWNLOAD_SCOPE_LIST);

    const payload = await readJsonFile<unknown>(file);
    const chains = normalizeProductionChainsPayload(payload);
    if (chains.length === 0) {
      throw new Error('Upload contains no production chains');
    }
    if (mode === ImportMode.Override) {
      this.saveProductionChains(chains);
    } else {
      const existingChains = this.loadAllProductionChains();
      const mergedChains = mergeProductionChains(existingChains, chains);
      this.saveProductionChains(mergedChains);
    }

    this.productionCatalogService.mergeCatalogFromProductions(
      chains.flatMap((chain) => chain.productions),
    );
  }

  /** Save/Download/Export from localstorage to json file */
  public downloadAllProductionChains(): void {
    const chains: ProductionChain[] = this.loadAllProductionChains();
    downloadJson(
      chains,
      createDownloadFileName(DOWNLOAD_SCOPE_LIST, DataTypes.ProductionChain),
    );
  }

  /** Load/Upload/Import one production chain JSON file */
  public async uploadProductionChain(
    files: File[],
    mode: ImportMode,
  ): Promise<void> {
    const file = getFirstFile(files);
    if (!file) {
      return;
    }
    const fileMeta = assertFileDataType(file.name, DataTypes.ProductionChain);
    if (fileMeta.scope === DOWNLOAD_SCOPE_LIST) {
      throw new Error(
        `Invalid file scope "${fileMeta.scope}". Expected production chain id in file name.`,
      );
    }

    const payload = await readJsonFile<unknown>(file);
    const incomingChains = normalizeProductionChainsPayload(payload);
    if (incomingChains.length !== 1) {
      throw new Error('Expected exactly one production chain in uploaded file');
    }
    const incoming = incomingChains[0];
    const existingChains = this.loadAllProductionChains();
    const nextChains = upsertImportedChain(
      existingChains,
      incoming,
      fileMeta.scope,
      mode,
    );
    this.saveProductionChains(nextChains);
    this.productionCatalogService.mergeCatalogFromProductions(incoming.productions);
  }

  /** Load/Upload/Import from json file to localstorage*/
  public async uploadProductionChainById(
    files: File[],
    mode: ImportMode,
    targetProductionChainId?: string,
  ): Promise<void> {
    const file = getFirstFile(files);
    if (!file) {
      return;
    }

    const fileMeta = assertFileDataType(file.name, DataTypes.Production);
    const payload = await readJsonFile<unknown>(file);
    const productions =
      fileMeta.scope === DOWNLOAD_SCOPE_LIST
        ? normalizeProductionsPayload(payload)
        : [normalizeSingleProductionPayload(payload, fileMeta.scope)];
    this.saveProductionChainById(targetProductionChainId, productions, mode);
    this.productionCatalogService.mergeCatalogFromProductions(productions);
  }

  /** Save/Download/Export productions list to json file */
  public downloadProductions(productionsData: Production[]): void {
    downloadJson(
      productionsData,
      createDownloadFileName(DOWNLOAD_SCOPE_LIST, DataTypes.Production),
    );
  }

  /** Save/Download/Export single production to json file */
  public downloadProductionById(
    productionId: string,
    productionData: Production,
  ): void {
    downloadJson(
      productionData,
      createDownloadFileName(productionId, DataTypes.Production),
    );
  }

  public downloadProductionChain(chain: ProductionChain): void {
    downloadJson(
      chain,
      createDownloadFileName(chain.id, DataTypes.ProductionChain),
    );
  }
  // #endregion

  // #region Storage - ProductionChains
  public loadAllProductionChains(): ProductionChain[] {
    const payload = localStorage.getItem(LOCAL_STORAGE_KEY_STATE);
    return payload ? JSON.parse(payload) : [];
  }

  public saveAllProductionChains(chains: ProductionChain[]): void {
    this.saveProductionChains(chains);
  }

  public clearAllProductionChains(): void {
    localStorage.removeItem(LOCAL_STORAGE_KEY_STATE);
  }
  // #endregion

  // #region Storage - Productions
  /** Save productions to a new production chain in localstorage */
  private saveProductionChainById(
    productionChainId: string | undefined,
    productions: Production[],
    mode: ImportMode,
  ): void {
    const existingChains: ProductionChain[] = this.loadAllProductionChains();
    const existingChainById: ProductionChain | undefined = productionChainId
      ? existingChains.find((chain) => chain.id === productionChainId)
      : undefined;
    const productionChainName = existingChainById?.display ?? 'Imported Production Chain';
    const existingChain: ProductionChain | undefined = existingChains.find(
      (chain) =>
        chain.id === productionChainId ||
        chain.display.trim().toLowerCase() ===
          productionChainName.trim().toLowerCase(),
    );
    if (mode === ImportMode.Override) {
      if (existingChain) {
        const nextChains = existingChains.map((chain) =>
          chain.id === existingChain.id
            ? { ...chain, productions }
            : chain,
        );
        this.saveProductionChains(nextChains);
        return;
      }
    }

    const nextDisplay = ensureUniqueDisplayName(
      productionChainName,
      existingChains.map((chain) => chain.display),
    );

    existingChains.push({
      id: productionChainId && !existingChainById ? productionChainId : guid(),
      display: nextDisplay,
      productions,
    });

    this.saveProductionChains(existingChains);
  }

  private saveProductionChains(chains: ProductionChain[]): void {
    const payload: string = JSON.stringify(chains ?? []);
    localStorage.setItem(LOCAL_STORAGE_KEY_STATE, payload);
  }
  // #endregion
}

// #region Helpers
function readJsonFile<T>(file: File): Promise<T> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsText(file, 'UTF-8');
    fileReader.onload = () => {
      try {
        const fileResult = fileReader.result?.toString();
        if (!fileResult) {
          reject(new Error('Empty file result'));
          return;
        }
        const parsed = JSON.parse(fileResult) as T;
        resolve(parsed);
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Invalid JSON'));
      }
    };
    fileReader.onerror = (error) => {
      reject(error instanceof Error ? error : new Error('Error reading file'));
    };
  });
}

function downloadJson(data: unknown, fileName: string): void {
  const payload = JSON.stringify(data, null, 2);
  const element: HTMLAnchorElement = document.createElement('a');
  element.setAttribute(
    'href',
    'data:text/json;charset=UTF-8,' + encodeURIComponent(payload),
  );
  element.setAttribute('download', `${fileName}.${DOWNLOAD_FILE_EXTENSION}`);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function createDownloadFileName(scope: string, dataType: DataTypes): string {
  return `${DOWNLOAD_FILE_PREFIX}.${scope}.${dataType}`;
}

function getDataTypeFileAccept(dataType: DataTypes): string {
  return `.${dataType}.${DOWNLOAD_FILE_EXTENSION},.${DOWNLOAD_FILE_EXTENSION}`;
}

function assertFileDataType(
  fileName: string,
  expectedType: DataTypes,
): UploadedFileMeta {
  const parsed = parseUploadedFileMeta(fileName);
  if (parsed.dataType !== expectedType) {
    throw new Error(
      `Invalid upload file type "${parsed.dataType}". Expected "${expectedType}" from a ${expectedType} export.`,
    );
  }
  return parsed;
}

function assertFileScope(
  fileScope: string | undefined,
  expectedScope: string,
): void {
  if (fileScope === expectedScope) {
    return;
  }
  throw new Error(
    `Invalid file scope "${fileScope ?? ''}". Expected "${expectedScope}" in file name.`,
  );
}

function parseUploadedFileMeta(fileName: string): UploadedFileMeta {
  const match = DOWNLOAD_FILE_NAME_PATTERN.exec(fileName);
  if (!match) {
    throw new Error(
      `Invalid file name "${fileName}". Expected "${DOWNLOAD_FILE_PREFIX}.{id|${DOWNLOAD_SCOPE_LIST}}.{${DATA_TYPES_OPTIONS.join('|')}}.${DOWNLOAD_FILE_EXTENSION}".`,
    );
  }

  const dataType = match[2] as DataTypes;
  const scope = match[1]?.trim();
  return {
    dataType,
    scope: scope && scope.length > 0 ? scope : undefined,
  };
}

function getFirstFile(files: File[]): File | undefined {
  if (files.length === 0) {
    return undefined;
  }
  return files[0];
}

function normalizeProductionChainsPayload(payload: unknown): ProductionChain[] {
  if (Array.isArray(payload)) {
    return payload
      .map((chain) => normalizeImportedProductionChain(chain))
      .filter((chain): chain is ProductionChain => Boolean(chain));
  }

  const singleChain = normalizeImportedProductionChain(payload);
  return singleChain ? [singleChain] : [];
}

function normalizeImportedProductionChain(
  payload: unknown,
): ProductionChain | undefined {
  if (!payload || typeof payload !== 'object') {
    return undefined;
  }

  const chain = payload as {
    id?: unknown;
    display?: unknown;
    iconUrl?: unknown;
    productions?: unknown;
  };
  const productions = normalizeProductionsPayload(chain.productions);
  const id =
    typeof chain.id === 'string' && chain.id.trim().length > 0
      ? chain.id.trim()
      : guid();
  const display =
    typeof chain.display === 'string' && chain.display.trim().length > 0
      ? chain.display.trim()
      : 'Imported Production Chain';

  return {
    id,
    display,
    iconUrl:
      typeof chain.iconUrl === 'string' && chain.iconUrl.trim().length > 0
        ? chain.iconUrl.trim()
        : undefined,
    productions,
  };
}

function normalizeProductionsPayload(payload: unknown): Production[] {
  if (Array.isArray(payload)) {
    return payload.map((production) =>
      normalizeProduction(production as Production),
    );
  }

  if (payload && typeof payload === 'object') {
    const maybe = payload as { productions?: unknown };
    if (Array.isArray(maybe.productions)) {
      return maybe.productions.map((production) =>
        normalizeProduction(production as Production),
      );
    }
  }

  throw new Error('Uploaded JSON does not contain a valid productions array');
}

function normalizeSingleProductionPayload(
  payload: unknown,
  expectedProductionId: string | undefined,
): Production {
  if (Array.isArray(payload)) {
    if (payload.length !== 1) {
      throw new Error(
        'Uploaded production file must contain exactly one production object',
      );
    }
    const production = normalizeProduction(payload[0] as Production);
    validateProductionIdScope(production, expectedProductionId);
    return production;
  }

  if (!payload || typeof payload !== 'object') {
    throw new Error('Uploaded production file does not contain a production');
  }

  const production = normalizeProduction(payload as Production);
  validateProductionIdScope(production, expectedProductionId);
  return production;
}

function validateProductionIdScope(
  production: Production,
  expectedProductionId: string | undefined,
): void {
  if (!expectedProductionId || !expectedProductionId.trim()) {
    return;
  }
  if (production.id.trim() === expectedProductionId.trim()) {
    return;
  }
  throw new Error(
    `Production id mismatch: file id "${expectedProductionId}" does not match payload id "${production.id}".`,
  );
}

function upsertImportedChain(
  existingChains: ProductionChain[],
  incoming: ProductionChain,
  importId: string | undefined,
  mode: ImportMode,
): ProductionChain[] {
  const normalizedImportId = importId?.trim();
  const existingById = normalizedImportId
    ? existingChains.find((chain) => chain.id === normalizedImportId)
    : undefined;
  const nextId = normalizedImportId ?? incoming.id;

  if (mode === ImportMode.Override) {
    if (existingById) {
      return existingChains.map((chain) =>
        chain.id === existingById.id
          ? {
              ...incoming,
              id: existingById.id,
              display: incoming.display || existingById.display,
            }
          : chain,
      );
    }
    return [...existingChains, { ...incoming, id: nextId }];
  }

  const existingIds = new Set(existingChains.map((chain) => chain.id));
  const finalId = existingIds.has(nextId) ? guid() : nextId;
  const finalDisplay = ensureUniqueDisplayName(
    incoming.display,
    existingChains.map((chain) => chain.display),
  );
  return [
    ...existingChains,
    {
      ...incoming,
      id: finalId,
      display: finalDisplay,
    },
  ];
}

function ensureUniqueDisplayName(
  baseName: string,
  existingNames: string[],
): string {
  if (!existingNames.includes(baseName)) {
    return baseName;
  }

  let counter = 1;
  let nextName = `${baseName} (imported)`;
  while (existingNames.includes(nextName)) {
    counter += 1;
    nextName = `${baseName} (imported ${counter})`;
  }
  return nextName;
}

interface UploadedFileMeta {
  dataType: DataTypes;
  scope?: string;
}

function mergeProductionChains(
  existingChains: ProductionChain[],
  incomingChains: ProductionChain[],
): ProductionChain[] {
  const nextChains: ProductionChain[] = [...existingChains];
  const existingIds = new Set(existingChains.map((chain) => chain.id));
  const existingNames = new Set(existingChains.map((chain) => chain.display));

  for (const chain of incomingChains) {
    const nextId = existingIds.has(chain.id) ? guid() : chain.id;
    const nextDisplay = ensureUniqueDisplayName(
      chain.display,
      Array.from(existingNames),
    );

    nextChains.push({
      ...chain,
      id: nextId,
      display: nextDisplay,
      productions: Array.isArray(chain.productions) ? chain.productions : [],
    });

    existingIds.add(nextId);
    existingNames.add(nextDisplay);
  }

  return nextChains;
}
// #endregion

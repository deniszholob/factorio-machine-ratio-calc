import { Injectable } from '@angular/core';

import { Production } from 'src/app/components/production-chain-editor/production-editor/production.model';
import { guid } from '../guid/guid.util';
import { LOCAL_STORAGE_KEY_STATE } from '../local-storage/local-storage.data';
import { ProductionChain } from 'src/app/components/production-chain-group/production-chain-item/production-chain.model';
import { ImportMode } from '../settings/settings.service';

// const DOWNLOAD_FILE_PREFIX = `PRC`;
// const DOWNLOAD_FILE_SUFFIX = `data`;
const DOWNLOAD_FILE_EXTENSION = `json`;
const DOWNLOAD_FILE_NAME = `PRC_production_chains`;

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
  // #region IO
  /** Load/Upload/Import from json file to localstorage */
  public async uploadAllProductionChains(
    files: File[],
    mode: ImportMode,
  ): Promise<void> {
    if (files.length === 0) {
      return;
    }

    const file = files[0];
    if (!file) {
      return;
    }

    const chains: ProductionChain[] =
      await readJsonFile<ProductionChain[]>(file);
    if (mode === 'override') {
      this.saveProductionChains(chains);
      return;
    }

    const existingChains = this.loadAllProductionChains();
    const mergedChains = mergeProductionChains(existingChains, chains);
    this.saveProductionChains(mergedChains);
  }

  /** Save/Download/Export from localstorage to json file */
  public downloadAllProductionChains(): void {
    const chains: ProductionChain[] = this.loadAllProductionChains();
    downloadJson(chains, DOWNLOAD_FILE_NAME);
  }

  /** Load/Upload/Import from json file to localstorage*/
  public async uploadProductionChainById(
    files: File[],
    mode: ImportMode,
  ): Promise<void> {
    if (files.length === 0) {
      return;
    }

    const file = files[0];
    if (!file) {
      return;
    }

    const fileName = file.name;
    const productionChainName = fileName.replace(
      `.${DOWNLOAD_FILE_EXTENSION}`,
      '',
    );
    const productions: Production[] = await readJsonFile<Production[]>(file);
    this.saveProductionChainById(productionChainName, productions, mode);
  }

  /** Save/Download/Export from localstorage to json file */
  public downloadProductionChainById(
    productionChainId: string,
    productionsData?: Production[],
  ): void {
    const productions =
      productionsData ?? this.loadProductionChainById(productionChainId);
    downloadJson(productions, productionChainId);
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

  private loadProductionChainById(productionChainId: string): Production[] {
    const productionChains = this.loadAllProductionChains();
    const productionChain = productionChains.find(
      (chain) => chain.id === productionChainId,
    );
    return productionChain?.productions ?? [];
  }
  // #endregion

  // #region Storage - Productions
  /** Save productions to a new production chain in localstorage */
  private saveProductionChainById(
    productionChainName: string,
    productions: Production[],
    mode: ImportMode,
  ): void {
    const existingChains: ProductionChain[] = this.loadAllProductionChains();
    const existingChain: ProductionChain | undefined = existingChains.find(
      (chain) => chain.display === productionChainName,
    );
    if (mode === 'override') {
      if (existingChain) {
        const nextChains = existingChains.map((chain) =>
          chain.display === productionChainName
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
      id: guid(),
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
  const payload = JSON.stringify(data);
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

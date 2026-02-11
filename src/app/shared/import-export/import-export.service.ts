import { Injectable } from '@angular/core';

import { Production } from 'src/app/components/production-chain-editor/production-editor/production.model';
import { guid } from '../guid/guid.util';
import { LOCAL_STORAGE_KEY_STATE } from '../local-storage/local-storage.data';
import { ProductionChain } from 'src/app/components/production-chain-group/production-chain-item/production-chain.model';

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
  public async uploadAllProductionChains(files: File[]): Promise<void> {
    if (files.length === 0) {
      return;
    }

    const file = files[0];
    if (!file) {
      return;
    }

    const chains: ProductionChain[] =
      await readJsonFile<ProductionChain[]>(file);
    this.saveProductionChains(chains);
  }

  /** Save/Download/Export from localstorage to json file */
  public downloadAllProductionChains(): void {
    const chains: ProductionChain[] = this.loadAllProductionChains();
    downloadJson(chains, DOWNLOAD_FILE_NAME);
  }

  /** Load/Upload/Import from json file to localstorage*/
  public async uploadProductionChainById(files: File[]): Promise<void> {
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
    this.saveProductionChainById(productionChainName, productions);
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
  ): void {
    const existingChains: ProductionChain[] = this.loadAllProductionChains();
    const existingChain: ProductionChain | undefined = existingChains.find(
      (chain) => chain.display === productionChainName,
    );
    if (existingChain) {
      return;
    }

    existingChains.push({
      id: guid(),
      display: productionChainName,
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
// #endregion

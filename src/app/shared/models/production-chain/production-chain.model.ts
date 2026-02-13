import { Production } from './production/production.model';

export interface ProductionChain {
  /** guid */
  id: string;
  /** Editable Display Name */
  display: string;
  /** Optional icon URL */
  iconUrl?: string;
  /** Productions to display in the main screen */
  productions: Production[];
}

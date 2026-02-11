import { Production } from '../production-modal/production.model';

export interface ProductionChain {
  /** guid */
  id: string;
  /** Editable Display Name */
  display: string;
  /** Productions to display in the main screen */
  productions: Production[];
}

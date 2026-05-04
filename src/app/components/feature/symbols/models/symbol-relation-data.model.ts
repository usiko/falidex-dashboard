import { IBaseCirculaire, IBasePlacement, IBasePosition, IBaseFiliere, IBaseSymbolSens, IBaseSymbolAcessory } from "../../../../models/data/base-data-models";
import { IRelationItem } from "../../../../models/data/base-relations.models";

export interface SymbolRelationData {
  link: IRelationItem;
  position?: IBasePosition;
  placement?: IBasePlacement;
  filiere?: IBaseFiliere;
  circulaire?: IBaseCirculaire;
  signification?: any;
  symbolSens?: IBaseSymbolSens;
  symbolAccessory?: IBaseSymbolAcessory;
  circulaireColors: Array<{
    circulaireColor: any;
    colors: any[];
  }>;
}

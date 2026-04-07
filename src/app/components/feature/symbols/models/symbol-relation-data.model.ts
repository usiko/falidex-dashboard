import { IBaseCirculaire, IBasePlacement, IBasePosition, IBaseFiliere } from "../../../../models/data/base-data-models";
import { IRelationItem } from "../../../../models/data/base-relations.models";

export interface SymbolRelationData {
  link: IRelationItem;
  position?: IBasePosition;
  placement?: IBasePlacement;
  filiere?: IBaseFiliere;
  circulaire?: IBaseCirculaire;
  signification?: any;
  circulaireColors: Array<{
    circulaireColor: any;
    colors: any[];
  }>;
}

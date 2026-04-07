import { IBaseCirculaire, IBasePlacement, IBasePosition, IBaseSymbol } from "../../../../models/data/base-data-models";
import { IRelationItem } from "../../../../models/data/base-relations.models";


export interface LinkData {
  link: IRelationItem;
  position?: IBasePosition;
  placement?: IBasePlacement;
  symbole?: IBaseSymbol;
  symboleSens?: any;
  circulaire?: IBaseCirculaire;
  circulaireColors: Array<{
    circulaireColor: any;
    colors: any[];
  }>;
}

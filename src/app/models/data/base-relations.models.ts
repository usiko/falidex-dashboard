import { IBaseCodeSpe } from './base-data-models';
import { ICodeSpe } from './linked-data-models';

export interface IRelationItem {
    id:string,
    placementId?: string;
    positionId?: string;
    filiereId?: string;
    symboleId?: string;
    symboleSensId?: string;
    symboleAccessoryId?: string;
    circulaireId?: string;
    significationId?: string;
    spe?: boolean;
    note?: string;
}

/*export interface IRelationContentSpe {
    id: string;
    name: string;
    text?: string;
    article?: string;
    note?: string;
}*/

export interface IRelationData {
    name: string;
    id: string;
    annee: number;
    default: boolean;
    visible:boolean;
    editable:boolean;
    national:boolean;
    ville?:string
    relations: IRelationItem[];
    specificites?: IBaseCodeSpe[];
}

import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import {
  IBaseCirculaire,
  IBaseCirculaireColor,
  IBaseColor,
  IBaseFiliere,
  IBaseSymbol,
  IBaseSignification,
  IBasePlacement,
  IBasePosition,
  IBaseSymbolSens,
  IBaseSymbolAcessory,
  IBaseCodeSpe
} from '../../models/data/base-data-models';
import { IRelationData, IRelationItem } from '../../models/data/base-relations.models';
import { PictureService } from '../picture/picture.service';
import { ConfigService } from '../config/config.service';
import { AppConfigService } from '../config/app.config.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly basePath = '/mockdata';
  private http = inject(HttpClient);
  private pictureService = inject(PictureService);
  private configService = inject(AppConfigService);

  constructor() {}

  // ==================== Items ====================

  /**
   * Récupère la liste des circulaires
   */
  getCirculaires(): Observable<IBaseCirculaire[]> {
    return this.http.get<IBaseCirculaire[]>(`${this.configService.getConfig()?.urls.dataServer}/${this.configService.getConfig()?.paths.circulaires}`);
  }

  /**
   * Récupère la liste des associations circulaires-colors
   */
  getCirculairesColors(): Observable<IBaseCirculaireColor[]> {
    return this.http.get<IBaseCirculaireColor[]>(`${this.configService.getConfig()?.urls.dataServer}/${this.configService.getConfig()?.paths.circulaireColors}`);
  }

  /**
   * Récupère la liste des couleurs
   */
  getColors(): Observable<IBaseColor[]> {
    return this.http.get<IBaseColor[]>(`${this.configService.getConfig()?.urls.dataServer}/${this.configService.getConfig()?.paths.colors}`);
  }

  /**
   * Récupère la liste des filières
   */
  getFilieres(): Observable<IBaseFiliere[]> {
    return this.http.get<IBaseFiliere[]>(`${this.configService.getConfig()?.urls.dataServer}/${this.configService.getConfig()?.paths.filieres}`);
  }

  /**
   * Récupère la liste des placements
   */
  getPlacements(): Observable<IBasePlacement[]> {
    return this.http.get<IBasePlacement[]>(`${this.configService.getConfig()?.urls.dataServer}/${this.configService.getConfig()?.paths.placements}`);
  }

  /**
   * Récupère la liste des positions
   */
  getPositions(): Observable<IBasePosition[]> {
    return this.http.get<IBasePosition[]>(`${this.configService.getConfig()?.urls.dataServer}/${this.configService.getConfig()?.paths.positions}`);
  }

  /**
   * Récupère la liste des significations
   */
  getSignifications(): Observable<IBaseSignification[]> {
    return this.http.get<IBaseSignification[]>(`${this.configService.getConfig()?.urls.dataServer}/${this.configService.getConfig()?.paths.significations}`);
  }

  /**
   * Récupère la liste des symboles
   */
  getSymboles(): Observable<IBaseSymbol[]> {
    return this.http.get<IBaseSymbol[]>(`${this.configService.getConfig()?.urls.dataServer}/${this.configService.getConfig()?.paths.symbols}`).pipe(map(symboles=>{
        return symboles.map(symbol=>{
           
            return {
                ...symbol,
                imgs:(symbol.imgs??[]).map(item=>{
                     const url = this.pictureService.getFullResourceUrl(item.url)
                     return {
                        ...item,
                        url:url??''
                     }
                })
                
            }
        })
    }))
  }

  /**
   * Récupère la liste des symboles sens
   */
  getSymbolesSens(): Observable<IBaseSymbolSens[]> {
    return this.http.get<IBaseSymbolSens[]>(`${this.configService.getConfig()?.urls.dataServer}/${this.configService.getConfig()?.paths.symbolSens}`);
  }

  /**
   * Récupère la liste des symboles accessoires
   */
  getSymbolesAccessoires(): Observable<IBaseSymbolAcessory[]> {
    return this.http.get<IBaseSymbolAcessory[]>(`${this.configService.getConfig()?.urls.dataServer}/${this.configService.getConfig()?.paths.symbolAccessories}`);
  }

  // ==================== Relations ====================

  /**
   * Récupère la liste des relations disponibles
   */
  getListRelations(): Observable<{ name: string; id: string; lastUpdate: string }[]> {
    return this.http.get<{ name: string; id: string; lastUpdate: string }[]>(`${this.configService.getConfig()?.urls.dataServer}/${this.configService.getConfig()?.paths.dataLink}`);
  }


  /**
   * Récupère les données d'une relation spécifique par son ID
   */
  getRelationById(relationId: string): Observable<IRelationData> {
    return this.http.get<IRelationData>(`${this.configService.getConfig()?.urls.dataServer}/${this.configService.getConfig()?.paths.dataLinkItem}/${relationId}`).pipe(
      map(data => this.ensureRelationItemIds(data))
    );
  }
  /**
   * creer une relation item
   */
  createRelation(item:Omit<IRelationData,'id'>): Observable<void> {
    return this.http.post<IRelationData>(
        `${this.configService.getConfig()?.urls.dataServer}/${this.configService.getConfig()?.paths.dataLinkItem}`,
        item
    ).pipe(
      map(data =>void 0)
    );
  }
  /**
   * creer une relation item
   */
  updateRelation(item:IRelationData): Observable<void> {
    return this.http.put(
        `${this.configService.getConfig()?.urls.dataServer}/${this.configService.getConfig()?.paths.dataLinkItem}`,
        item
    ).pipe(
      map(data =>void 0)
    );
  }
  /**
   * creer une relation item
   */
  deleteRelation(id:string): Observable<void> {
    return this.http.delete(
        `${this.configService.getConfig()?.urls.dataServer}/${this.configService.getConfig()?.paths.dataLinkItem}/${id}`
    ).pipe(
      map(data =>void 0)
    );
  }
  /**
   * creer une relation item
   */
  createRelationItem(relationId: string,item:Omit<IRelationItem,'id'>): Observable<void> {
    return this.http.post<IRelationData>(
        `${this.configService.getConfig()?.urls.dataServer}/${this.configService.getConfig()?.paths.dataLinkItem}/${relationId}/create`,
        item
    ).pipe(
      map(data =>void 0)
    );
  }
  /**
   * update une relation item
   */
  updateRelationItem(relationId: string,item:IRelationItem): Observable<void> {
    return this.http.post<IRelationData>(
        `${this.configService.getConfig()?.urls.dataServer}/${this.configService.getConfig()?.paths.dataLinkItem}/${relationId}/update`,
        item
    ).pipe(
      map(data =>void 0)
    );
  }

  /**
   * delete une relation item
   */
  deleteRelationItem(relationId: string, itemId: string): Observable<void> {
    return this.http.delete(
        `${this.configService.getConfig()?.urls.dataServer}/${this.configService.getConfig()?.paths.dataLinkItem}/${relationId}/relation-item/${itemId}`
    ).pipe(
      map(data =>void 0)
    );
  }

  /**
   * Assure que tous les IRelationItem ont un ID
   * Génère un UUID si l'ID est manquant
   */
  private ensureRelationItemIds(data: IRelationData): IRelationData {
    return {
      ...data,
      relations: data.relations.map((item,index) => ({
        ...item,
        id: item.id ||`rel-${index}`
      }))
    };
  }
}
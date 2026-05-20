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
  IBaseCodeSpe,
  IOccurence
} from '../../models/data/base-data-models';
import { IRelationData, IRelationItem } from '../../models/data/base-relations.models';
import { PictureService } from '../picture/picture.service';
import { ConfigService } from '../config/config.service';
import { AppConfigService } from '../config/app.config.service';
import { IFiliere, ISymbol } from '../../models/data/linked-data-models';
import { environment } from '../../../environments/environment';

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
    return this.http.get<IBaseCirculaire[]>(`${environment.urls.dataServer}/${this.configService.getConfig()?.paths.circulaires}`);
  }

  /**
   * Récupère la liste des associations circulaires-colors
   */
  getCirculairesColors(): Observable<IBaseCirculaireColor[]> {
    return this.http.get<IBaseCirculaireColor[]>(`${environment.urls.dataServer}/${this.configService.getConfig()?.paths.circulaireColors}`);
  }

  /**
   * Récupère la liste des couleurs
   */
  getColors(): Observable<IBaseColor[]> {
    return this.http.get<IBaseColor[]>(`${environment.urls.dataServer}/${this.configService.getConfig()?.paths.colors}`);
  }

  /**
   * Récupère la liste des filières
   */
  getFilieres(): Observable<IBaseFiliere[]> {
    return this.http.get<IBaseFiliere[]>(`${environment.urls.dataServer}/${this.configService.getConfig()?.paths.filieres}`);
  }

  /**
   * Récupère la liste des placements
   */
  getPlacements(): Observable<IBasePlacement[]> {
    return this.http.get<IBasePlacement[]>(`${environment.urls.dataServer}/${this.configService.getConfig()?.paths.placements}`);
  }

  /**
   * Récupère la liste des positions
   */
  getPositions(): Observable<IBasePosition[]> {
    return this.http.get<IBasePosition[]>(`${environment.urls.dataServer}/${this.configService.getConfig()?.paths.positions}`);
  }

  /**
   * Récupère la liste des significations
   */
  getSignifications(): Observable<IBaseSignification[]> {
    return this.http.get<IBaseSignification[]>(`${environment.urls.dataServer}/${this.configService.getConfig()?.paths.significations}`);
  }

  /**
   * Récupère la liste des symboles
   */
  getSymboles(): Observable<IBaseSymbol[]> {
    return this.http.get<IBaseSymbol[]>(`${environment.urls.dataServer}/${this.configService.getConfig()?.paths.symbols}`).pipe(map(symboles=>{
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
    return this.http.get<IBaseSymbolSens[]>(`${environment.urls.dataServer}/${this.configService.getConfig()?.paths.symbolSens}`);
  }

  /**
   * Récupère la liste des symboles accessoires
   */
  getSymbolesAccessoires(): Observable<IBaseSymbolAcessory[]> {
    return this.http.get<IBaseSymbolAcessory[]>(`${environment.urls.dataServer}/${this.configService.getConfig()?.paths.symbolAccessories}`);
  }

  // ==================== Relations ====================

  /**
   * Récupère la liste des relations disponibles
   */
  getListRelations(): Observable<{ name: string; id: string; lastUpdate: string }[]> {
    return this.http.get<{ name: string; id: string; lastUpdate: string }[]>(`${environment.urls.dataServer}/${this.configService.getConfig()?.paths.dataLink}`);
  }


  /**
   * Récupère les données d'une relation spécifique par son ID
   */
  getRelationById(relationId: string): Observable<IRelationData> {
    return this.http.get<IRelationData>(`${environment.urls.dataServer}/${this.configService.getConfig()?.paths.dataLinkItem}/${relationId}`).pipe(
      map(data => this.ensureRelationItemIds(data))
    );
  }
  /**
   * creer une relation item
   */
  createRelation(item:Omit<IRelationData,'id'>): Observable<IRelationData> {
    return this.http.post<IRelationData>(
        `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.dataLinkItem}`,
        item
    );
  }
  /**
   * creer une relation item
   */
  updateRelation(item:IRelationData): Observable<void> {
    return this.http.put(
        `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.dataLinkItem}`,
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
        `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.dataLinkItem}/${id}`
    ).pipe(
      map(data =>void 0)
    );
  }
  /**
   * creer une relation item
   */
  createRelationItem(relationId: string,item:Omit<IRelationItem,'id'>): Observable<void> {
    return this.http.post<IRelationData>(
        `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.dataLinkItem}/${relationId}/create`,
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
        `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.dataLinkItem}/${relationId}/update`,
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
        `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.dataLinkItem}/${relationId}/relation-item/${itemId}`
    ).pipe(
      map(data =>void 0)
    );
  }

  deleteSymbole(id:string): Observable<void>
  {
    return this.http.delete(
      `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.symbols}/${id}`
    ).pipe(
      map(data => void 0)
    );
  }

  addSymboleImg(id: string, file: File): Observable<{ id: string; url: string; modificationDate: Date }>
  {
    const formData = new FormData();
    formData.append('file', file);
    const symbolPath = this.configService.getConfig()?.paths.symbols;
    const imgPath = this.configService.getConfig()?.paths.imgUpload
    return this.http.post<{ id: string; url: string; modificationDate: Date }>(
      `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.symbols}/${id}/${imgPath}`,
      formData
    );
  }

  editSymbol(symbol:Partial<ISymbol>): Observable<void>
  {
    return this.http.put(
      `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.symbols}/${symbol.id}`,
      symbol
    ).pipe(
      map(data => void 0)
    );
  }

  createSymbole(symbol:Omit<IBaseSymbol,'id'>): Observable<void>
  {
    return this.http.post(
      `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.symbols}`,
      symbol
    ).pipe(
      map(data => void 0)
    );
  }

  deleteFiliere(id:string): Observable<void>
  {
    return this.http.delete(
      `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.filieres}/${id}`
    ).pipe(
      map(data => void 0)
    );
  }

  editFiliere(filiere:Partial<IFiliere>): Observable<void>
  {
    return this.http.put(
      `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.filieres}/${filiere.id}`,
      filiere
    ).pipe(
      map(data => void 0)
    );
  }

  createFiliere(filiere:Omit<IBaseFiliere,'id'>): Observable<void>
  {
    return this.http.post(
      `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.filieres}`,
      filiere
    ).pipe(
      map(data => void 0)
    );
  }

  // Signification
  createSignification(signification:Omit<IBaseSignification,'id'>): Observable<void>
  {
    return this.http.post(
      `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.significations}`,
      signification
    ).pipe(
      map(data => void 0)
    );
  }

  editSignification(signification:Partial<IBaseSignification>): Observable<void>
  {
    return this.http.put(
      `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.significations}/${signification.id}`,
      signification
    ).pipe(
      map(data => void 0)
    );
  }

  deleteSignification(id:string): Observable<void>
  {
    return this.http.delete(
      `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.significations}/${id}`
    ).pipe(
      map(data => void 0)
    );
  }

  // Position
  createPosition(position:Omit<IBasePosition,'id'>): Observable<void>
  {
    return this.http.post(
      `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.positions}`,
      position
    ).pipe(
      map(data => void 0)
    );
  }

  editPosition(position:Partial<IBasePosition>): Observable<void>
  {
    return this.http.put(
      `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.positions}/${position.id}`,
      position
    ).pipe(
      map(data => void 0)
    );
  }

  deletePosition(id:string): Observable<void>
  {
    return this.http.delete(
      `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.positions}/${id}`
    ).pipe(
      map(data => void 0)
    );
  }

  // Placement
  createPlacement(placement:Omit<IBasePlacement,'id'>): Observable<void>
  {
    return this.http.post(
      `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.placements}`,
      placement
    ).pipe(
      map(data => void 0)
    );
  }

  editPlacement(placement:Partial<IBasePlacement>): Observable<void>
  {
    return this.http.put(
      `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.placements}/${placement.id}`,
      placement
    ).pipe(
      map(data => void 0)
    );
  }

  deletePlacement(id:string): Observable<void>
  {
    return this.http.delete(
      `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.placements}/${id}`
    ).pipe(
      map(data => void 0)
    );
  }

  // Symbole Accessoire
  createSymboleAccessoire(symboleAccessoire:Omit<IBaseSymbolAcessory,'id'>): Observable<void>
  {
    return this.http.post(
      `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.symbolAccessories}`,
      symboleAccessoire
    ).pipe(
      map(data => void 0)
    );
  }

  editSymboleAccessoire(symboleAccessoire:Partial<IBaseSymbolAcessory>): Observable<void>
  {
    return this.http.put(
      `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.symbolAccessories}/${symboleAccessoire.id}`,
      symboleAccessoire
    ).pipe(
      map(data => void 0)
    );
  }

  deleteSymboleAccessoire(id:string): Observable<void>
  {
    return this.http.delete(
      `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.symbolAccessories}/${id}`
    ).pipe(
      map(data => void 0)
    );
  }

  // Color
  createColor(color:Omit<IBaseColor,'id'>): Observable<void>
  {
    return this.http.post(
      `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.colors}`,
      color
    ).pipe(
      map(data => void 0)
    );
  }

  editColor(color:Partial<IBaseColor>): Observable<void>
  {
    return this.http.put(
      `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.colors}/${color.id}`,
      color
    ).pipe(
      map(data => void 0)
    );
  }

  deleteColor(id:string): Observable<void>
  {
    return this.http.delete(
      `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.colors}/${id}`
    ).pipe(
      map(data => void 0)
    );
  }

  // Circulaire
  createCirculaire(circulaire:Omit<IBaseCirculaire,'id'>): Observable<void>
  {
    return this.http.post(
      `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.circulaires}`,
      circulaire
    ).pipe(
      map(data => void 0)
    );
  }

  editCirculaire(circulaire:Partial<IBaseCirculaire>): Observable<void>
  {
    return this.http.put(
      `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.circulaires}/${circulaire.id}`,
      circulaire
    ).pipe(
      map(data => void 0)
    );
  }

  deleteCirculaire(id:string): Observable<void>
  {
    return this.http.delete(
      `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.circulaires}/${id}`
    ).pipe(
      map(data => void 0)
    );
  }

  // Circulaire Color
  createCirculaireColor(circulaireColor:Omit<IBaseCirculaireColor,'id'>): Observable<void>
  {
    return this.http.post(
      `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.circulaireColors}`,
      circulaireColor
    ).pipe(
      map(data => void 0)
    );
  }

  editCirculaireColor(circulaireColor:Partial<IBaseCirculaireColor>): Observable<void>
  {
    return this.http.put(
      `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.circulaireColors}/${circulaireColor.id}`,
      circulaireColor
    ).pipe(
      map(data => void 0)
    );
  }

  deleteCirculaireColor(id:string): Observable<void>
  {
    return this.http.delete(
      `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.circulaireColors}/${id}`
    ).pipe(
      map(data => void 0)
    );
  }

  // Symbole Sens
  createSymboleSens(symboleSens:Omit<IBaseSymbolSens,'id'>): Observable<void>
  {
    return this.http.post(
      `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.symbolSens}`,
      symboleSens
    ).pipe(
      map(data => void 0)
    );
  }

  editSymboleSens(symboleSens:Partial<IBaseSymbolSens>): Observable<void>
  {
    return this.http.put(
      `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.symbolSens}/${symboleSens.id}`,
      symboleSens
    ).pipe(
      map(data => void 0)
    );
  }

  deleteSymboleSens(id:string): Observable<void>
  {
    return this.http.delete(
      `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.symbolSens}/${id}`
    ).pipe(
      map(data => void 0)
    );
  }

  getOccurenceRelationFiliere(id:string):Observable<IOccurence[]>
  {
     return this.http.get<IOccurence[]>(
      `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.filieres}/${this.configService.getConfig()?.paths.occurence}/${id}`
    )
  }
  getOccurenceRelationSymbole(id:string):Observable<IOccurence[]>
  {
    return this.http.get<IOccurence[]>(
      `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.symbols}/${this.configService.getConfig()?.paths.occurence}/${id}`
    )
  }
  getOccurenceRelationSignification(id:string):Observable<IOccurence[]>
  {
    return this.http.get<IOccurence[]>(
      `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.significations}/${this.configService.getConfig()?.paths.occurence}/${id}`
    )
  }
  getOccurenceRelationPosition(id:string):Observable<IOccurence[]>
  {
    return this.http.get<IOccurence[]>(
      `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.positions}/${this.configService.getConfig()?.paths.occurence}/${id}`
    )
  }
  getOccurenceRelationPlacement(id:string):Observable<IOccurence[]>
  {
    return this.http.get<IOccurence[]>(
      `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.placements}/${this.configService.getConfig()?.paths.occurence}/${id}`
    )
  }
  getOccurenceRelationSymbolaccessoir(id:string):Observable<IOccurence[]>
  {
    return this.http.get<IOccurence[]>(
      `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.symbolAccessories}/${this.configService.getConfig()?.paths.occurence}/${id}`
    )
  }
  getOccurenceRelationColor(id:string):Observable<IOccurence[]>
  {
    return this.http.get<IOccurence[]>(
      `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.colors}/${this.configService.getConfig()?.paths.occurence}/${id}`
    )
  }
  getOccurenceRelationCirculaire(id:string):Observable<IOccurence[]>
  {
    return this.http.get<IOccurence[]>(
      `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.circulaires}/${this.configService.getConfig()?.paths.occurence}/${id}`
    )
  }
  getOccurenceRelationCirculaireColor(id:string):Observable<IOccurence[]>
  {
    return this.http.get<IOccurence[]>(
      `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.circulaireColors}/${this.configService.getConfig()?.paths.occurence}/${id}`
    )
  }
  getOccurenceRelationSymboleSens(id:string):Observable<IOccurence[]>
  {
    return this.http.get<IOccurence[]>(
      `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.symbolSens}/${this.configService.getConfig()?.paths.occurence}/${id}`
    )
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
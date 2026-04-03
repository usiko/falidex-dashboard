import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
import { IRelationData } from '../../models/data/base-relations.models';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly basePath = '/mockdata';

  constructor(private http: HttpClient) {}

  // ==================== Items ====================

  /**
   * Récupère la liste des circulaires
   */
  getCirculaires(): Observable<IBaseCirculaire[]> {
    return this.http.get<IBaseCirculaire[]>(`${this.basePath}/items/circulaires.json`);
  }

  /**
   * Récupère la liste des associations circulaires-colors
   */
  getCirculairesColors(): Observable<IBaseCirculaireColor[]> {
    return this.http.get<IBaseCirculaireColor[]>(`${this.basePath}/items/circulaires-colors.json`);
  }

  /**
   * Récupère la liste des couleurs
   */
  getColors(): Observable<IBaseColor[]> {
    return this.http.get<IBaseColor[]>(`${this.basePath}/items/colors.json`);
  }

  /**
   * Récupère la liste des filières
   */
  getFilieres(): Observable<IBaseFiliere[]> {
    return this.http.get<IBaseFiliere[]>(`${this.basePath}/items/filieres.json`);
  }

  /**
   * Récupère la liste des placements
   */
  getPlacements(): Observable<IBasePlacement[]> {
    return this.http.get<IBasePlacement[]>(`${this.basePath}/items/placements.json`);
  }

  /**
   * Récupère la liste des positions
   */
  getPositions(): Observable<IBasePosition[]> {
    return this.http.get<IBasePosition[]>(`${this.basePath}/items/positions.json`);
  }

  /**
   * Récupère la liste des significations
   */
  getSignifications(): Observable<IBaseSignification[]> {
    return this.http.get<IBaseSignification[]>(`${this.basePath}/items/significations.json`);
  }

  /**
   * Récupère la liste des symboles
   */
  getSymboles(): Observable<IBaseSymbol[]> {
    return this.http.get<IBaseSymbol[]>(`${this.basePath}/items/symboles.json`);
  }

  /**
   * Récupère la liste des symboles sens
   */
  getSymbolesSens(): Observable<IBaseSymbolSens[]> {
    return this.http.get<IBaseSymbolSens[]>(`${this.basePath}/items/symboles-sens.json`);
  }

  /**
   * Récupère la liste des symboles accessoires
   */
  getSymbolesAccessoires(): Observable<IBaseSymbolAcessory[]> {
    return this.http.get<IBaseSymbolAcessory[]>(`${this.basePath}/items/symbole-accessoire.json`);
  }

  // ==================== Relations ====================

  /**
   * Récupère la liste des relations disponibles
   */
  getListRelations(): Observable<{ name: string; id: string; lastUpdate: string }[]> {
    return this.http.get<{ name: string; id: string; lastUpdate: string }[]>(`${this.basePath}/relations/list-relations.json`);
  }

  /**
   * Récupère les données de relation nationale
   */
  getRelationNational(): Observable<IRelationData> {
    return this.http.get<IRelationData>(`${this.basePath}/relations/national.json`);
  }

  /**
   * Récupère les données de relation Toulon
   */
  getRelationToulon(): Observable<IRelationData> {
    return this.http.get<IRelationData>(`${this.basePath}/relations/toulon.json`);
  }

  /**
   * Récupère les données d'une relation spécifique par son ID
   */
  getRelationById(relationId: string): Observable<IRelationData> {
    return this.http.get<IRelationData>(`${this.basePath}/relations/${relationId}.json`);
  }
}
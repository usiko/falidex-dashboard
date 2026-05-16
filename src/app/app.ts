import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { concatMap, forkJoin, from, map, mergeMap, toArray } from 'rxjs';
import { TopBarComponent } from './components/feature/dashboard/smart/top-bar/top-bar.component';
import { DataService } from './services/data/data.service';
import { CirculaireColorStore } from './stores/circulaires-colors/circulaires-colors.store';
import { CirculaireStore } from './stores/circulaires/circulaires.store';
import { CodeSpeStore } from './stores/codes-spe/codes-spe.store';
import { ColorStore } from './stores/colors/colors.store';
import { FiliereStore } from './stores/filieres/filieres.store';
import { linkStore } from './stores/links/links.store';
import { PlacementStore } from './stores/placements/placements.store';
import { PositionStore } from './stores/positions/positions.store';
import { RelationDataStore } from './stores/relations/relations.store';
import { SelectedRelationStore } from './stores/selected-relation/selected-relation.store';
import { SignificationStore } from './stores/significations/significations.store';
import { SymbolAccessoryStore } from './stores/symbols-accessory/symbols-accessory.store';
import { SymbolSensStore } from './stores/symbols-sens/symbols-sens.store';
import { SymbolStore } from './stores/symbols/symbols.store';
import { AuthService } from './services/auth/auth.service';
import { Synchronizer } from './synchonizer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TopBarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('falidex-dashboard');

  private readonly dataService = inject(DataService);
  private readonly circulaireStore = inject(CirculaireStore);
  private readonly filiereStore = inject(FiliereStore);
  private readonly symbolStore = inject(SymbolStore);
  private readonly significationStore = inject(SignificationStore);
  private readonly placementStore = inject(PlacementStore);
  private readonly positionStore = inject(PositionStore);
  private readonly colorStore = inject(ColorStore);
  private readonly circulaireColorStore = inject(CirculaireColorStore);
  private readonly symbolSensStore = inject(SymbolSensStore);
  private readonly symbolAccessoryStore = inject(SymbolAccessoryStore);
  private readonly codeSpeStore = inject(CodeSpeStore);
  private readonly relationDataStore = inject(RelationDataStore);
  private readonly linkStore = inject(linkStore);
  private readonly selectedRelationStore = inject(SelectedRelationStore);
  private readonly authService = inject(AuthService);
  private readonly synchronizer = inject(Synchronizer);


  ngOnInit(): void {
    // Initialiser l'utilisateur depuis le storage au démarrage
    this.authService.initializeUser().subscribe();
    
    // Charger les données (pas besoin d'être loggé)
    this.loadAllData();
    
    // Écouter tous les événements via le Synchronizer
    this.synchronizer.listenEvents();
  }

  private loadAllData(): void {
    // Mettre tous les stores en loading
    this.circulaireStore.setLoading(true);
    this.filiereStore.setLoading(true);
    this.symbolStore.setLoading(true);
    this.significationStore.setLoading(true);
    this.placementStore.setLoading(true);
    this.positionStore.setLoading(true);
    this.colorStore.setLoading(true);
    this.circulaireColorStore.setLoading(true);
    this.symbolSensStore.setLoading(true);
    this.symbolAccessoryStore.setLoading(true);
    this.codeSpeStore.setLoading(true);
    this.relationDataStore.setLoading(true);
    this.linkStore.setLoading(true);

    // Charger toutes les données en parallèle
    this.authService.authToken().pipe(mergeMap(()=>{
        return     forkJoin({
      circulaires: this.dataService.getCirculaires(),
      filieres: this.dataService.getFilieres(),
      symbols: this.dataService.getSymboles(),
      significations: this.dataService.getSignifications(),
      placements: this.dataService.getPlacements(),
      positions: this.dataService.getPositions(),
      colors: this.dataService.getColors(),
      circulairesColors: this.dataService.getCirculairesColors(),
      symbolsSens: this.dataService.getSymbolesSens(),
      symbolsAccessory: this.dataService.getSymbolesAccessoires(),
      listRelations: this.dataService.getListRelations(),
            
    })
    }))
    .pipe(mergeMap((data)=>{
        return from(data.listRelations).pipe(
            concatMap(item => this.dataService.getRelationById(item.id)),
            toArray(),
            map(relations => ({ ...data, relations }))
        );
    }))
    .subscribe({
      next: (data) => {
        // Remplir les stores avec les données
        this.circulaireStore.set(data.circulaires);
        this.filiereStore.set(data.filieres);
        this.symbolStore.set(data.symbols);
        this.significationStore.set(data.significations);
        this.placementStore.set(data.placements);
        this.positionStore.set(data.positions);
        this.colorStore.set(data.colors);
        this.circulaireColorStore.set(data.circulairesColors);
        this.symbolSensStore.set(data.symbolsSens);
        this.symbolAccessoryStore.set(data.symbolsAccessory);
        this.relationDataStore.set(data.relations);

        // Stopper le loading
        this.circulaireStore.setLoading(false);
        this.filiereStore.setLoading(false);
        this.symbolStore.setLoading(false);
        this.significationStore.setLoading(false);
        this.placementStore.setLoading(false);
        this.positionStore.setLoading(false);
        this.colorStore.setLoading(false);
        this.circulaireColorStore.setLoading(false);
        this.symbolSensStore.setLoading(false);
        this.symbolAccessoryStore.setLoading(false);
        this.codeSpeStore.setLoading(false);
        this.relationDataStore.setLoading(false);
        this.linkStore.setLoading(false);

        // Initialiser la relation sélectionnée par défaut avec la première relation
        const relations = data.relations;
        if (relations.length > 0 && relations[0].id) {
          this.selectedRelationStore.setSelectedRelationId(relations[0].id,relations[0].editable,relations[0].national);
          this.linkStore.set(relations[0].relations);
        }

        console.log('✅ Toutes les données ont été chargées dans les stores');
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des données:', error);
        this.circulaireStore.setLoading(false);
        this.filiereStore.setLoading(false);
        this.symbolStore.setLoading(false);
        this.significationStore.setLoading(false);
        this.placementStore.setLoading(false);
        this.positionStore.setLoading(false);
        this.colorStore.setLoading(false);
        this.circulaireColorStore.setLoading(false);
        this.symbolSensStore.setLoading(false);
        this.symbolAccessoryStore.setLoading(false);
        this.codeSpeStore.setLoading(false);
        this.relationDataStore.setLoading(false);
        this.linkStore.setLoading(false);
      }
    });
  }
}

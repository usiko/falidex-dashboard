import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { forkJoin } from 'rxjs';
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
import { ConfigService } from './services/config/config.service';

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
  private readonly config = inject(ConfigService)


  ngOnInit(): void {
    this.config.load().subscribe()
    this.loadAllData();
  }

  private loadAllData(): void {
    // Charger toutes les données en parallèle
    forkJoin({
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
      relationNational: this.dataService.getRelationNational(),
      relationToulon: this.dataService.getRelationToulon()
    }).subscribe({
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
        this.relationDataStore.set([data.relationNational, data.relationToulon]);

        // Initialiser la relation sélectionnée par défaut avec la première relation
        const relations = [data.relationNational, data.relationToulon];
        if (relations.length > 0 && relations[0].id) {
          this.selectedRelationStore.setSelectedRelationId(relations[0].id,!!relations[0].editable,!!relations[0].national);
          this.linkStore.set(relations[0].relations);
        }

        console.log('✅ Toutes les données ont été chargées dans les stores');
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des données:', error);
      }
    });
  }
}

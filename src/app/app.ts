import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { forkJoin, map, mergeMap, pipe } from 'rxjs';
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
import { SnackbarService } from './services/snackbar/snackbar.service';

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
  private readonly snackbarService = inject(SnackbarService);


  ngOnInit(): void {
    // Initialiser l'utilisateur depuis le storage au démarrage
    this.authService.initializeUser().subscribe();
    
    // Charger les données (pas besoin d'être loggé)
    this.loadAllData();
    
    // Écouter les événements du relation store
    this.setupRelationStoreListeners();
    
    // Écouter les événements du link store
    this.setupLinkStoreListeners();
  }

  private loadAllData(): void {
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
        const obs = data.listRelations.map(item=>{
            return this.dataService.getRelationById(item.id)
        })
        return forkJoin(obs).pipe(map((relations)=>{
            return {
                ...data,
                relations
            }
        }))
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
      }
    });
  }

  private setupRelationStoreListeners(): void {
    const events = this.relationDataStore.getEvents();

    // Écouter les événements de création
    events.onCreate$?.subscribe(({ id, entity, send }) => {
      if (send) {
        this.dataService.createRelation(entity).subscribe({
          next: () => {
            console.log('✅ Relation créée:', id);
            this.snackbarService.success('Relation créée avec succès');
            this.reloadCurrentRelation()
          },
          error: (err) => {
            console.error('❌ Erreur lors de la création de la relation:', err);
            this.snackbarService.error('Erreur lors de la création de la relation');
            this.reloadCurrentRelation()
          }
        });
      }
    });

    // Écouter les événements de suppression
    events.onRemove$?.subscribe(({ id, send }) => {
      if (send) {
        this.dataService.deleteRelation(id).subscribe({
          next: () => {
            console.log('✅ Relation supprimée:', id);
            this.snackbarService.success('Relation supprimée avec succès');
            this.reloadCurrentRelation()
          },
          error: (err) => {
            console.error('❌ Erreur lors de la suppression de la relation:', err);
            this.snackbarService.error('Erreur lors de la suppression de la relation');
            this.reloadCurrentRelation()
          }
        });
      }
    });

    // Écouter les événements de mise à jour
    events.onUpdate$?.subscribe(({ id, changes, old,send }) => {
      const updatedRelation = { ...old, ...changes };
      if(send)
      {
        this.dataService.updateRelation(updatedRelation).subscribe({
        next: () => {
          console.log('✅ Relation mise à jour:', id);
          this.snackbarService.success('Relation mise à jour avec succès');
          this.reloadCurrentRelation()
        },
        error: (err) => {
          console.error('❌ Erreur lors de la mise à jour de la relation:', err);
          this.snackbarService.error('Erreur lors de la mise à jour de la relation');
          this.reloadCurrentRelation()
        }
      });
      }
    });
  }

  private setupLinkStoreListeners(): void {
    const events = this.linkStore.getEvents();

    // Écouter les événements de création
    events.onCreate$?.subscribe(({ id, entity, send }) => {
      if (send) {
        const relationId = this.selectedRelationStore.selectedRelationId();
        if (relationId) {
          this.dataService.createRelationItem(relationId, entity).subscribe({
            next: () => {
              console.log('✅ Relation item créé:', id);
              this.snackbarService.success('Lien créé avec succès');
              this.reloadCurrentLink()
            },
            error: (err) => {
              console.error('❌ Erreur lors de la création du relation item:', err);
              this.snackbarService.error('Erreur lors de la création du lien');
              this.reloadCurrentLink()
            }
          });
        }
      }
    });

    // Écouter les événements de suppression
    events.onRemove$?.subscribe(({ id, send }) => {
      if (send) {
        const relationId = this.selectedRelationStore.selectedRelationId();
        if (relationId) {
          this.dataService.deleteRelationItem(relationId, id).subscribe({
            next: () => {
              console.log('✅ Relation item supprimé:', id);
              this.snackbarService.success('Lien supprimé avec succès');
              this.reloadCurrentLink()
            },
            error: (err) => {
              console.error('❌ Erreur lors de la suppression du relation item:', err);
              this.snackbarService.error('Erreur lors de la suppression du lien');
              this.reloadCurrentLink()
            }
          });
        }
      }
    });

    // Écouter les événements de mise à jour
    events.onUpdate$?.subscribe(({ id, changes, old, send }) => {
      if (send) {
        const relationId = this.selectedRelationStore.selectedRelationId();
        if (relationId) {
          const updatedItem = { ...old, ...changes };
          this.dataService.updateRelationItem(relationId, updatedItem).subscribe({
            next: () => {
              console.log('✅ Relation item mis à jour:', id);
              this.snackbarService.success('Lien mis à jour avec succès');
               this.reloadCurrentLink()
            },
            error: (err) => {
              console.error('❌ Erreur lors de la mise à jour du relation item:', err);
              this.snackbarService.error('Erreur lors de la mise à jour du lien');
              // Restaurer l'ancienne valeur si l'API échoue
               this.reloadCurrentLink()
            }
          });
        }
      }
    });
  }

  reloadCurrentLink()
  {
    let currentId = this.selectedRelationStore.selectedRelationId();
    if (currentId)
    {
        this.dataService.getRelationById(currentId).subscribe((data)=>{
            this.linkStore.set(data.relations)
        })
    }

  }
  reloadCurrentRelation()
  {
    let currentId = this.selectedRelationStore.selectedRelationId();
    if (currentId)
    {
        this.dataService.getRelationById(currentId).subscribe((data)=>{
            this.relationDataStore.update(currentId,{
                annee:data.annee,
                editable:data.editable,
                name:data.name,
                national:data.national,
                ville:data.ville,
                specificites:data.specificites,
                default:data.default
            },false)
        })
    }

  }
}

import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { IBaseFiliere, IBaseSymbol, IBaseSymbolSens, IBaseSymbolAcessory, IBaseCirculaire, IBaseSignification, IBasePosition, IBasePlacement } from '../../../../../models/data/base-data-models';
import { ColorBadgeComponent, ColorBadgeData } from '../../../../shared/color-badge/color-badge.component';
import { IRelationItem } from '../../../../../models/data/base-relations.models';
import { SymbolsSensCollectionComponent } from '../../../../collection/symbols-sens/symbols-sens-collection.component';
import { SymbolsAccessoryCollectionComponent } from '../../../../collection/symbols-accessory/symbols-accessory-collection.component';
import { CirculairesCollectionComponent } from '../../../../collection/circulaires/circulaires-collection.component';
import { FilieresCollectionComponent } from '../../../../collection/filieres/filieres-collection.component';
import { SignificationsCollectionComponent } from '../../../../collection/significations/significations-collection.component';
import { PositionsCollectionComponent } from '../../../../collection/positions/positions-collection.component';
import { PlacementsCollectionComponent } from '../../../../collection/placements/placements-collection.component';
import { CollectionDialogComponent, CollectionDialogData } from '../../../../shared/collection-dialog/collection-dialog.component';
import { CirculaireColorStore } from '../../../../../stores/circulaires-colors/circulaires-colors.store';
import { ColorStore } from '../../../../../stores/colors/colors.store';
import { FiliereStore } from '../../../../../stores/filieres/filieres.store';
import { SymbolSensStore } from '../../../../../stores/symbols-sens/symbols-sens.store';
import { SymbolAccessoryStore } from '../../../../../stores/symbols-accessory/symbols-accessory.store';
import { CirculaireStore } from '../../../../../stores/circulaires/circulaires.store';
import { SignificationStore } from '../../../../../stores/significations/significations.store';
import { PositionStore } from '../../../../../stores/positions/positions.store';
import { PlacementStore } from '../../../../../stores/placements/placements.store';
import { SelectedRelationStore } from '../../../../../stores/selected-relation/selected-relation.store';

type RelationMode = 'filiere' | 'signification';

@Component({
  selector: 'app-symbole-edit-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    ColorBadgeComponent
  ],
  templateUrl: './symbole-edit-form.component.html',
  styleUrl: './symbole-edit-form.component.scss'
})
export class SymboleEditFormComponent {
  symbole = input<IBaseSymbol>();
  relation = input<IRelationItem>();
  editable = input<boolean>(true);
  
  // Output pour la validation
  validated = output<IRelationItem | null>();
  
  // Spécificité
  protected isSpecificite = signal<boolean>(false);
  
  // Absent (pour filière)
  protected isAbsent = signal<boolean>(false);
  
  // Blame (pour signification)
  protected isBlame = signal<boolean>(false);
  
  // Sélections communes
  protected selectedSymboleSens = signal<IBaseSymbolSens | null>(null);
  protected selectedSymboleAccessory = signal<IBaseSymbolAcessory | null>(null);
  
  // Sélections mode filière
  protected selectedFiliere = signal<IBaseFiliere | null>(null);
  protected selectedCirculaire = signal<IBaseCirculaire | null>(null);
  
  // Sélections mode signification
  protected selectedSignification = signal<IBaseSignification | null>(null);
  protected selectedPosition = signal<IBasePosition | null>(null);
  protected selectedPlacement = signal<IBasePlacement | null>(null);
  
  // Computed pour déterminer le mode actif
  protected relationMode = computed<RelationMode | null>(() => {
    if (this.selectedFiliere() || this.selectedCirculaire()) {
      return 'filiere';
    }
    if (this.selectedSignification()) {
      return 'signification';
    }
    return null;
  });
  
  // Valeurs fixes pour le mode filière
  protected readonly filierePosition = 'sur circulaire';
  protected readonly filierePlacement = 'libre sous conditions';
  
  // Stores pour les dépendances
  private dialog = inject(MatDialog);
  protected selectedRelationStore = inject(SelectedRelationStore);
  private circulaireColorStore = inject(CirculaireColorStore);
  private colorStore = inject(ColorStore);
  private filiereStore = inject(FiliereStore);
  private symbolSensStore = inject(SymbolSensStore);
  private symbolAccessoryStore = inject(SymbolAccessoryStore);
  private circulaireStore = inject(CirculaireStore);
  private significationStore = inject(SignificationStore);
  private positionStore = inject(PositionStore);
  private placementStore = inject(PlacementStore);
  
  constructor() {
    // Initialiser les sélections à partir de la relation existante
    effect(() => {
      const relation = this.relation();
      if (!relation) return;
      
      // Initialiser la spécificité
      this.isSpecificite.set(relation.spe ?? false);
      
      // Initialiser absent
      this.isAbsent.set(relation.absent ?? false);
      
      // Initialiser blame
      this.isBlame.set(relation.blame ?? false);
      
      // Déterminer le mode en fonction de la relation
      if (relation.filiereId) {
        // Charger la filière
        const filiere = this.filiereStore.getById(relation.filiereId)();
        if (filiere) this.selectedFiliere.set(filiere);
        
        // Charger la circulaire
        if (relation.circulaireId) {
          const circulaire = this.circulaireStore.getById(relation.circulaireId)();
          if (circulaire) this.selectedCirculaire.set(circulaire);
        }
      } else if (relation.significationId) {
        // Charger la signification
        const signification = this.significationStore.getById(relation.significationId)();
        if (signification) this.selectedSignification.set(signification);
        
        // Charger position et placement pour mode signification
        if (relation.positionId) {
          const position = this.positionStore.getById(relation.positionId)();
          if (position) this.selectedPosition.set(position);
        }
        if (relation.placementId) {
          const placement = this.placementStore.getById(relation.placementId)();
          if (placement) this.selectedPlacement.set(placement);
        }
      }
      
      // Charger le symbole sens
      if (relation.symboleSensId) {
        const symbolSens = this.symbolSensStore.getById(relation.symboleSensId)();
        if (symbolSens) this.selectedSymboleSens.set(symbolSens);
      }
      
      // Charger le symbole accessoire
      if (relation.symboleAccessoryId) {
        const symbolAccessory = this.symbolAccessoryStore.getById(relation.symboleAccessoryId)();
        if (symbolAccessory) this.selectedSymboleAccessory.set(symbolAccessory);
      }
    });
  }
  
  // Computed pour récupérer les couleurs du circulaire sélectionné
  protected selectedCirculaireColors = computed((): ColorBadgeData[] => {
    const circulaire = this.selectedCirculaire();
    if (!circulaire) return [];
    
    const circulaireColors = this.circulaireColorStore.entities().filter(
      cc => cc.circulaireId === circulaire.id
    );
    const colors: ColorBadgeData[] = [];
    
    circulaireColors.forEach(cc => {
      cc.colorIds.forEach(colorId => {
        const color = this.colorStore.getById(colorId)();
        if (color && color.name && color.colorData) {
          colors.push({
            id: color.id,
            name: color.name,
            colorData: color.colorData
          });
        }
      });
    });
    
    return colors;
  });
  
  // Computed pour vérifier si le formulaire est valide
  protected isFormValid = computed(() => {
    const symbole = this.symbole();
    if (!symbole) return false;
    
    const mode = this.relationMode();
    if (!mode) return false;
    
    if (mode === 'filiere') {
      return !!this.selectedFiliere() && !!this.selectedCirculaire();
    } else {
      return !!this.selectedSignification();
    }
  });
  
  // Méthode pour retirer la sélection de filière
  protected clearFiliere(): void {
    this.selectedFiliere.set(null);
    this.selectedCirculaire.set(null);
    this.isAbsent.set(false); // Réinitialiser le toggle absent
  }
  
  // Méthode pour retirer la sélection de signification
  protected clearSignification(): void {
    this.selectedSignification.set(null);
    this.selectedPosition.set(null);
    this.selectedPlacement.set(null);
    this.isBlame.set(false); // Réinitialiser le toggle blame
  }
  
  // Handlers de sélection pour le mode filière
  protected openFiliereDialog(): void {
    const dialogRef = this.dialog.open<CollectionDialogComponent<IBaseFiliere>, CollectionDialogData, IBaseFiliere | null>(
      CollectionDialogComponent,
      {
        data: {
          title: 'Sélectionner une filière',
          collectionComponent: FilieresCollectionComponent
        },
        width: '700px'
      }
    );

    const subscription = dialogRef.componentInstance.itemSelected.subscribe((filiere: IBaseFiliere) => {
      this.selectedFiliere.set(filiere);
      dialogRef.close(filiere);
      subscription.unsubscribe();
    });
  }
  
  protected openCirculaireDialog(): void {
    const dialogRef = this.dialog.open<CollectionDialogComponent<IBaseCirculaire>, CollectionDialogData, IBaseCirculaire | null>(
      CollectionDialogComponent,
      {
        data: {
          title: 'Sélectionner une circulaire',
          collectionComponent: CirculairesCollectionComponent
        },
        width: '700px'
      }
    );

    const subscription = dialogRef.componentInstance.itemSelected.subscribe((circulaire: IBaseCirculaire) => {
      this.selectedCirculaire.set(circulaire);
      dialogRef.close(circulaire);
      subscription.unsubscribe();
    });
  }
  
  // Handlers de sélection pour le mode signification
  protected openSignificationDialog(): void {
    const dialogRef = this.dialog.open<CollectionDialogComponent<IBaseSignification>, CollectionDialogData, IBaseSignification | null>(
      CollectionDialogComponent,
      {
        data: {
          title: 'Sélectionner une signification',
          collectionComponent: SignificationsCollectionComponent
        },
        width: '700px'
      }
    );

    const subscription = dialogRef.componentInstance.itemSelected.subscribe((signification: IBaseSignification) => {
      this.selectedSignification.set(signification);
      dialogRef.close(signification);
      subscription.unsubscribe();
    });
    
    const createSubscription = dialogRef.componentInstance.itemCreated.subscribe((searchTerm: string) => {
      // Créer une nouvelle signification avec le terme recherché
      const newId = this.significationStore.create({ content: searchTerm });
      const newSignification = this.significationStore.getById(newId)();
      if (newSignification) {
        this.selectedSignification.set(newSignification);
        dialogRef.close(newSignification);
      }
      createSubscription.unsubscribe();
    });
  }
  
  // Handlers de sélection pour position et placement (mode signification)
  protected openPositionDialog(): void {
    const dialogRef = this.dialog.open<CollectionDialogComponent<IBasePosition>, CollectionDialogData, IBasePosition | null>(
      CollectionDialogComponent,
      {
        data: {
          title: 'Sélectionner une position',
          collectionComponent: PositionsCollectionComponent
        },
        width: '700px'
      }
    );

    const subscription = dialogRef.componentInstance.itemSelected.subscribe((position: IBasePosition) => {
      this.selectedPosition.set(position);
      dialogRef.close(position);
      subscription.unsubscribe();
    });
  }
  
  protected openPlacementDialog(): void {
    const dialogRef = this.dialog.open<CollectionDialogComponent<IBasePlacement>, CollectionDialogData, IBasePlacement | null>(
      CollectionDialogComponent,
      {
        data: {
          title: 'Sélectionner un décernement',
          collectionComponent: PlacementsCollectionComponent
        },
        width: '700px'
      }
    );

    const subscription = dialogRef.componentInstance.itemSelected.subscribe((placement: IBasePlacement) => {
      this.selectedPlacement.set(placement);
      dialogRef.close(placement);
      subscription.unsubscribe();
    });
    
    const createSubscription = dialogRef.componentInstance.itemCreated.subscribe((searchTerm: string) => {
      // Créer un nouveau décernement avec le terme recherché
      const newId = this.placementStore.create({ name: searchTerm });
      const newPlacement = this.placementStore.getById(newId)();
      if (newPlacement) {
        this.selectedPlacement.set(newPlacement);
        dialogRef.close(newPlacement);
      }
      createSubscription.unsubscribe();
    });
  }
  
  protected onPositionSelect(position: IBasePosition): void {
    this.selectedPosition.set(position);
  }
  
  protected onPlacementSelect(placement: IBasePlacement): void {
    this.selectedPlacement.set(placement);
  }
  
  protected clearPosition(): void {
    this.selectedPosition.set(null);
  }
  
  protected clearPlacement(): void {
    this.selectedPlacement.set(null);
  }
  
  // Handlers de sélection communs
  protected openSymboleSensDialog(): void {
    const dialogRef = this.dialog.open<CollectionDialogComponent<IBaseSymbolSens>, CollectionDialogData, IBaseSymbolSens | null>(
      CollectionDialogComponent,
      {
        data: {
          title: 'Sélectionner un symbole sens',
          collectionComponent: SymbolsSensCollectionComponent
        },
        width: '700px'
      }
    );

    const subscription = dialogRef.componentInstance.itemSelected.subscribe((symboleSens: IBaseSymbolSens) => {
      this.selectedSymboleSens.set(symboleSens);
      dialogRef.close(symboleSens);
      subscription.unsubscribe();
    });
  }
  
  protected openSymboleAccessoryDialog(): void {
    const dialogRef = this.dialog.open<CollectionDialogComponent<IBaseSymbolAcessory>, CollectionDialogData, IBaseSymbolAcessory | null>(
      CollectionDialogComponent,
      {
        data: {
          title: 'Sélectionner un symbole accessoire',
          collectionComponent: SymbolsAccessoryCollectionComponent
        },
        width: '700px'
      }
    );

    const subscription = dialogRef.componentInstance.itemSelected.subscribe((symboleAccessory: IBaseSymbolAcessory) => {
      this.selectedSymboleAccessory.set(symboleAccessory);
      dialogRef.close(symboleAccessory);
      subscription.unsubscribe();
    });
    
    const createSubscription = dialogRef.componentInstance.itemCreated.subscribe((searchTerm: string) => {
      // Créer un nouveau symbole accessoire avec le terme recherché
      const newId = this.symbolAccessoryStore.create({ name: searchTerm });
      const newSymbolAccessory = this.symbolAccessoryStore.getById(newId)();
      if (newSymbolAccessory) {
        this.selectedSymboleAccessory.set(newSymbolAccessory);
        dialogRef.close(newSymbolAccessory);
      }
      createSubscription.unsubscribe();
    });
  }
  
  protected onSymboleSensSelect(symboleSens: IBaseSymbolSens): void {
    this.selectedSymboleSens.set(symboleSens);
  }
  
  protected onSymboleAccessorySelect(symboleAccessory: IBaseSymbolAcessory): void {
    this.selectedSymboleAccessory.set(symboleAccessory);
  }
  
  // Méthodes pour retirer les sélections optionnelles
  protected clearSymboleSens(): void {
    this.selectedSymboleSens.set(null);
  }
  
  protected clearSymboleAccessory(): void {
    this.selectedSymboleAccessory.set(null);
  }
  
  // Gestion de la validation du formulaire
  protected onSubmit(): void {
    const symbole = this.symbole();
    const mode = this.relationMode();
    
    if (!symbole || !mode || !this.isFormValid()) {
      return;
    }
    
    const relationData: IRelationItem = {
      id: this.relation()?.id || '',
      symboleId: symbole.id,
      symboleSensId: this.selectedSymboleSens()?.id,
      symboleAccessoryId: this.selectedSymboleAccessory()?.id,
      spe: this.isSpecificite(),
      note: undefined
    };
    
    if (mode === 'filiere') {
      relationData.filiereId = this.selectedFiliere()?.id;
      relationData.circulaireId = this.selectedCirculaire()?.id;
      relationData.significationId = undefined;
      // Pour mode filière, envoyer les valeurs fixes
      relationData.positionId = 'position-3'; // sur circulaire
      relationData.placementId = 'placement-1'; // libre sous conditions
      // Ajouter le champ absent uniquement pour mode filière
      relationData.absent = this.isAbsent();
    } else {
      relationData.significationId = this.selectedSignification()?.id;
      relationData.filiereId = undefined;
      relationData.circulaireId = undefined;
      // Pour mode signification, on envoie les sélections
      relationData.positionId = this.selectedPosition()?.id;
      relationData.placementId = this.selectedPlacement()?.id;
      // Ajouter le champ blame uniquement pour mode signification
      relationData.blame = this.isBlame();
    }
    
    this.validated.emit(relationData);
  }
  
  protected onCancel(): void {
    this.validated.emit(null);
  }
}

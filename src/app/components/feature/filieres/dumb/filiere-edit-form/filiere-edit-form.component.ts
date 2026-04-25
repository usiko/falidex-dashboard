import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { IBaseFiliere, IBaseSymbol, IBaseSymbolSens, IBaseSymbolAcessory, IBaseCirculaire, IBaseCirculaireColor, IBaseColor } from '../../../../../models/data/base-data-models';
import { ColorBadgeComponent, ColorBadgeData } from '../../../../shared/color-badge/color-badge.component';
import { IRelationItem } from '../../../../../models/data/base-relations.models';
import { SymbolsCollectionComponent } from '../../../../collection/symbols/symbols-collection.component';
import { SymbolsSensCollectionComponent } from '../../../../collection/symbols-sens/symbols-sens-collection.component';
import { SymbolsAccessoryCollectionComponent } from '../../../../collection/symbols-accessory/symbols-accessory-collection.component';
import { CirculairesCollectionComponent } from '../../../../collection/circulaires/circulaires-collection.component';
import { CollectionDialogComponent, CollectionDialogData } from '../../../../shared/collection-dialog/collection-dialog.component';
import { CirculaireColorStore } from '../../../../../stores/circulaires-colors/circulaires-colors.store';
import { ColorStore } from '../../../../../stores/colors/colors.store';
import { SymbolStore } from '../../../../../stores/symbols/symbols.store';
import { SymbolSensStore } from '../../../../../stores/symbols-sens/symbols-sens.store';
import { SymbolAccessoryStore } from '../../../../../stores/symbols-accessory/symbols-accessory.store';
import { CirculaireStore } from '../../../../../stores/circulaires/circulaires.store';

@Component({
  selector: 'app-filiere-edit-form',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    SymbolsSensCollectionComponent,
    SymbolsAccessoryCollectionComponent,
    ColorBadgeComponent
  ],
  templateUrl: './filiere-edit-form.component.html',
  styleUrl: './filiere-edit-form.component.scss'
})
export class FiliereEditFormComponent {
  filiere = input<IBaseFiliere>();
  relation = input<IRelationItem>();
  
  // Output pour la validation
  validated = output<IRelationItem | null>();
  
  // Valeurs fixes non modifiables
  protected readonly position = 'sur circulaire';
  protected readonly decernement = 'libre sous conditions';
  
  // Sélections
  protected selectedSymbole = signal<IBaseSymbol | null>(null);
  protected selectedSymboleSens = signal<IBaseSymbolSens | null>(null);
  protected selectedSymboleAccessory = signal<IBaseSymbolAcessory | null>(null);
  protected selectedCirculaire = signal<IBaseCirculaire | null>(null);
  
  // Stores pour les dépendances
  private dialog = inject(MatDialog);
  private circulaireColorStore = inject(CirculaireColorStore);
  private colorStore = inject(ColorStore);
  private symbolStore = inject(SymbolStore);
  private symbolSensStore = inject(SymbolSensStore);
  private symbolAccessoryStore = inject(SymbolAccessoryStore);
  private circulaireStore = inject(CirculaireStore);
  
  constructor() {
    // Initialiser les sélections à partir de la relation existante
    effect(() => {
      const relation = this.relation();
      if (!relation) return;
      
      // Charger le symbole
      if (relation.symboleId) {
        const symbol = this.symbolStore.getById(relation.symboleId)();
        if (symbol) this.selectedSymbole.set(symbol);
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
      
      // Charger la circulaire
      if (relation.circulaireId) {
        const circulaire = this.circulaireStore.getById(relation.circulaireId)();
        if (circulaire) this.selectedCirculaire.set(circulaire);
      }
    });
  }
  
  // Computed pour les circulaire colors liées à la circulaire sélectionnée
  protected circulaireColors = computed(() => {
    const circulaire = this.selectedCirculaire();
    if (!circulaire) return [];
    
    return this.circulaireColorStore.entities().filter(
      cc => cc.circulaireId === circulaire.id
    );
  });
  
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
  
  // Computed pour afficher une ligne circulaire + circulaire-color + colors
  protected circulaireDisplay = computed(() => {
    const circulaire = this.selectedCirculaire();
    if (!circulaire) return null;
    
    const circulaireColors = this.circulaireColors();
    const allColors = this.colorStore.entities();
    
    return circulaireColors.map(cc => ({
      circulaireColor: cc,
      colors: cc.colorIds.map(colorId => 
        allColors.find(c => c.id === colorId)
      ).filter(c => c !== undefined)
    }));
  });
  
  // Handlers de sélection
  protected openSymboleDialog(): void {
    const dialogRef = this.dialog.open<CollectionDialogComponent<IBaseSymbol>, CollectionDialogData, IBaseSymbol | null>(
      CollectionDialogComponent,
      {
        data: {
          title: 'Sélectionner un symbole',
          collectionComponent: SymbolsCollectionComponent
        },
        width: '700px'
      }
    );

    // Écouter l'événement de sélection du dialog
    const subscription = dialogRef.componentInstance.itemSelected.subscribe((symbole: IBaseSymbol) => {
      this.selectedSymbole.set(symbole);
      dialogRef.close(symbole);
      subscription.unsubscribe();
    });
  }
  
  protected onSymboleSensSelect(symboleSens: IBaseSymbolSens): void {
    this.selectedSymboleSens.set(symboleSens);
  }
  
  protected onSymboleAccessorySelect(symboleAccessory: IBaseSymbolAcessory): void {
    this.selectedSymboleAccessory.set(symboleAccessory);
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

    // Écouter l'événement de sélection du dialog
    const subscription = dialogRef.componentInstance.itemSelected.subscribe((circulaire: IBaseCirculaire) => {
      this.selectedCirculaire.set(circulaire);
      dialogRef.close(circulaire);
      subscription.unsubscribe();
    });
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
    const symbole = this.selectedSymbole();
    const circulaire = this.selectedCirculaire();
    const filiere = this.filiere();
    
    // Validation : symbole et circulaire sont obligatoires
    if (!symbole || !circulaire || !filiere) {
      return;
    }
    
    const relationData: IRelationItem = {
      id: this.relation()?.id || '', // Garder l'id existant ou chaîne vide pour création
      filiereId: filiere.id,
      symboleId: symbole.id,
      circulaireId: circulaire.id,
      symboleSensId: this.selectedSymboleSens()?.id,
      symboleAccessoryId: this.selectedSymboleAccessory()?.id,
      positionId: 'position-3', // sur circulaire (valeur fixe)
      placementId: 'placement-1', // libre sous conditions (valeur fixe)
      significationId: undefined,
      spe: false,
      note: undefined
    };
    
    this.validated.emit(relationData);
  }
  
  protected onCancel(): void {
    this.validated.emit(null);
  }
}

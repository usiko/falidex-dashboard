import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  IBaseFiliere, IBaseSymbol, IBaseSymbolSens, IBaseSymbolAcessory,
  IBaseCirculaire, IBaseSignification, IBasePosition, IBasePlacement
} from '../../../models/data/base-data-models';
import { IRelationItem } from '../../../models/data/base-relations.models';
import { ColorBadgeComponent, ColorBadgeData } from '../color-badge/color-badge.component';
import { CollectionDialogComponent, CollectionDialogData } from '../collection-dialog/collection-dialog.component';
import { SymbolsCollectionComponent } from '../../collection/symbols/symbols-collection.component';
import { BlobImagePipe } from '../../pipe/img-url.pipe';
import { FilieresCollectionComponent } from '../../collection/filieres/filieres-collection.component';
import { CirculairesCollectionComponent } from '../../collection/circulaires/circulaires-collection.component';
import { SignificationsCollectionComponent } from '../../collection/significations/significations-collection.component';
import { PositionsCollectionComponent } from '../../collection/positions/positions-collection.component';
import { PlacementsCollectionComponent } from '../../collection/placements/placements-collection.component';
import { SymbolsSensCollectionComponent } from '../../collection/symbols-sens/symbols-sens-collection.component';
import { SymbolsAccessoryCollectionComponent } from '../../collection/symbols-accessory/symbols-accessory-collection.component';
import { linkStore } from '../../../stores/links/links.store';
import { SymbolStore } from '../../../stores/symbols/symbols.store';
import { FiliereStore } from '../../../stores/filieres/filieres.store';
import { CirculaireStore } from '../../../stores/circulaires/circulaires.store';
import { CirculaireColorStore } from '../../../stores/circulaires-colors/circulaires-colors.store';
import { ColorStore } from '../../../stores/colors/colors.store';
import { SignificationStore } from '../../../stores/significations/significations.store';
import { PositionStore } from '../../../stores/positions/positions.store';
import { PlacementStore } from '../../../stores/placements/placements.store';
import { SymbolSensStore } from '../../../stores/symbols-sens/symbols-sens.store';
import { SymbolAccessoryStore } from '../../../stores/symbols-accessory/symbols-accessory.store';
import { SelectedRelationStore } from '../../../stores/selected-relation/selected-relation.store';

export type CollectionName =
  | 'symbole' | 'filiere' | 'circulaire'
  | 'signification' | 'position' | 'placement'
  | 'symboleSens' | 'symboleAccessory';

type RelationMode = 'filiere' | 'signification';

@Component({
  selector: 'app-item-relation-form',
  standalone: true,
  imports: [
    BlobImagePipe,
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    ColorBadgeComponent
  ],
  templateUrl: './item-relation-form.component.html',
  styleUrl: './item-relation-form.component.scss'
})
export class ItemRelationFormComponent {
  /** Id de la relation existante (mode édition). Null/undefined → mode création. */
  id = input<string | null>();
  /** Collections verrouillées : ni bouton "Retirer" ni bouton "Sélectionner" ne s'affichent. */
  lockedCollections = input<Partial<Record<CollectionName, boolean>>>({});
  /** Ids initiaux pour les champs en mode création (ex: contexte filière ou symbole). */
  contextIds = input<Partial<Record<CollectionName, string>>>({});
  editable = input<boolean>(true);

  validated = output<IRelationItem | null>();

  // ── Toggles ──────────────────────────────────────────────────────────────
  protected isSpecificite = signal<boolean>(false);
  protected isAbsent      = signal<boolean>(false);
  protected isBlame       = signal<boolean>(false);

  // ── Sélections ───────────────────────────────────────────────────────────
  protected selectedSymbole          = signal<IBaseSymbol | null>(null);
  protected selectedSymboleSens      = signal<IBaseSymbolSens | null>(null);
  protected selectedSymboleAccessory = signal<IBaseSymbolAcessory | null>(null);
  protected selectedFiliere          = signal<IBaseFiliere | null>(null);
  protected selectedCirculaire       = signal<IBaseCirculaire | null>(null);
  protected selectedSignification    = signal<IBaseSignification | null>(null);
  protected selectedPosition         = signal<IBasePosition | null>(null);
  protected selectedPlacement        = signal<IBasePlacement | null>(null);

  protected readonly filierePosition  = 'sur circulaire';
  protected readonly filierePlacement = 'libre sous conditions';

  // ── Stores ───────────────────────────────────────────────────────────────
  private readonly linksStore          = inject(linkStore);
  private readonly symboleStore        = inject(SymbolStore);
  private readonly filiereStore        = inject(FiliereStore);
  private readonly circulaireStore     = inject(CirculaireStore);
  private readonly circulaireColorStore= inject(CirculaireColorStore);
  private readonly colorStore          = inject(ColorStore);
  private readonly significationStore  = inject(SignificationStore);
  private readonly positionStore       = inject(PositionStore);
  private readonly placementStore      = inject(PlacementStore);
  private readonly symbolSensStore     = inject(SymbolSensStore);
  private readonly symbolAccessoryStore= inject(SymbolAccessoryStore);
  private readonly dialog              = inject(MatDialog);
  private readonly location            = inject(Location);
  protected readonly selectedRelationStore = inject(SelectedRelationStore);

  protected readonly hasRelationSelected = computed(
    () => !!this.selectedRelationStore.selectedRelationId()
  );

  protected goBack(): void { this.location.back(); }

  // ── Computed ─────────────────────────────────────────────────────────────
  protected readonly relation = computed(() => {
    const id = this.id();
    if (!id) return undefined;
    return this.linksStore.getById(id)();
  });

  protected readonly locked = computed(() => this.lockedCollections());

  protected readonly relationMode = computed<RelationMode | null>(() => {
    if (this.selectedFiliere() || this.selectedCirculaire()) return 'filiere';
    if (this.selectedSignification()) return 'signification';
    return null;
  });

  /** True si le choix filière/signification est imposé par un verrou. */
  protected readonly modeForced = computed(() =>
    !!(this.locked().filiere || this.locked().signification)
  );

  protected readonly selectedCirculaireColors = computed((): ColorBadgeData[] => {
    const circulaire = this.selectedCirculaire();
    if (!circulaire) return [];
    const colors: ColorBadgeData[] = [];
    this.circulaireColorStore.entities()
      .filter(cc => cc.circulaireId === circulaire.id)
      .forEach(cc => cc.colorIds.forEach(colorId => {
        const color = this.colorStore.getById(colorId)();
        if (color?.name && color.colorData) {
          colors.push({ id: color.id, name: color.name, colorData: color.colorData });
        }
      }));
    return colors;
  });

  protected readonly isLoading = computed(() =>
   {
    return  this.symboleStore.loading() ||
            this.filiereStore.loading() ||
            this.circulaireStore.loading() ||
            this.significationStore.loading() ||
            this.positionStore.loading() ||
            this.placementStore.loading() ||
            this.symbolSensStore.loading() ||
            this.symbolAccessoryStore.loading();
   }
  );

  protected readonly isFormValid = computed(() => {
    if (!this.selectedSymbole()) return false;
    const mode = this.relationMode();
    if (!mode) return false;
    if (mode === 'filiere') return !!this.selectedFiliere() && !!this.selectedCirculaire();
    return !!this.selectedSignification();
  });

  // ── Init effect ──────────────────────────────────────────────────────────
  constructor() {
    effect(() => {
      const relation = this.relation();

      if (relation) {
        // Mode édition : pré-remplir depuis la relation existante
        this.isSpecificite.set(relation.spe ?? false);
        this.isAbsent.set(relation.absent ?? false);
        this.isBlame.set(relation.blame ?? false);

        if (relation.symboleId) {
          const s = this.symboleStore.getById(relation.symboleId)();
          if (s) this.selectedSymbole.set(s);
        }
        if (relation.filiereId) {
          const f = this.filiereStore.getById(relation.filiereId)();
          if (f) this.selectedFiliere.set(f);
          if (relation.circulaireId) {
            const c = this.circulaireStore.getById(relation.circulaireId)();
            if (c) this.selectedCirculaire.set(c);
          }
        } else if (relation.significationId) {
          const sig = this.significationStore.getById(relation.significationId)();
          if (sig) this.selectedSignification.set(sig);
          if (relation.positionId) {
            const pos = this.positionStore.getById(relation.positionId)();
            if (pos) this.selectedPosition.set(pos);
          }
          if (relation.placementId) {
            const pla = this.placementStore.getById(relation.placementId)();
            if (pla) this.selectedPlacement.set(pla);
          }
        }
        if (relation.symboleSensId) {
          const ss = this.symbolSensStore.getById(relation.symboleSensId)();
          if (ss) this.selectedSymboleSens.set(ss);
        }
        if (relation.symboleAccessoryId) {
          const sa = this.symbolAccessoryStore.getById(relation.symboleAccessoryId)();
          if (sa) this.selectedSymboleAccessory.set(sa);
        }
        return;
      }

      // Mode création : pré-remplir depuis contextIds
      const ctx = this.contextIds();
      if (ctx.symbole && !this.selectedSymbole()) {
        const s = this.symboleStore.getById(ctx.symbole)();
        if (s) this.selectedSymbole.set(s);
      }
      if (ctx.filiere && !this.selectedFiliere()) {
        const f = this.filiereStore.getById(ctx.filiere)();
        if (f) this.selectedFiliere.set(f);
      }
      if (ctx.circulaire && !this.selectedCirculaire()) {
        const c = this.circulaireStore.getById(ctx.circulaire)();
        if (c) this.selectedCirculaire.set(c);
      }
      if (ctx.signification && !this.selectedSignification()) {
        const sig = this.significationStore.getById(ctx.signification)();
        if (sig) this.selectedSignification.set(sig);
      }
      if (ctx.position && !this.selectedPosition()) {
        const pos = this.positionStore.getById(ctx.position)();
        if (pos) this.selectedPosition.set(pos);
      }
      if (ctx.placement && !this.selectedPlacement()) {
        const pla = this.placementStore.getById(ctx.placement)();
        if (pla) this.selectedPlacement.set(pla);
      }
      if (ctx.symboleSens && !this.selectedSymboleSens()) {
        const ss = this.symbolSensStore.getById(ctx.symboleSens)();
        if (ss) this.selectedSymboleSens.set(ss);
      }
      if (ctx.symboleAccessory && !this.selectedSymboleAccessory()) {
        const sa = this.symbolAccessoryStore.getById(ctx.symboleAccessory)();
        if (sa) this.selectedSymboleAccessory.set(sa);
      }
    });
  }

  // ── Clears ───────────────────────────────────────────────────────────────
  protected clearFiliere(): void {
    this.selectedFiliere.set(null);
    this.selectedCirculaire.set(null);
    this.isAbsent.set(false);
  }
  protected clearSignification(): void {
    this.selectedSignification.set(null);
    this.selectedPosition.set(null);
    this.selectedPlacement.set(null);
    this.isBlame.set(false);
  }
  protected clearPosition():         void { this.selectedPosition.set(null); }
  protected clearPlacement():        void { this.selectedPlacement.set(null); }
  protected clearSymboleSens():      void { this.selectedSymboleSens.set(null); }
  protected clearSymboleAccessory(): void { this.selectedSymboleAccessory.set(null); }

  // ── Dialogs ──────────────────────────────────────────────────────────────
  protected openSymboleDialog(): void {
    const ref = this.dialog.open<CollectionDialogComponent<IBaseSymbol>, CollectionDialogData>(
      CollectionDialogComponent,
      { data: { title: 'Choisir un symbole', collectionComponent: SymbolsCollectionComponent }, width: '700px' }
    );
    const sub = ref.componentInstance.itemSelected.subscribe((s: IBaseSymbol) => {
      this.selectedSymbole.set(s); ref.close(s); sub.unsubscribe();
    });
  }

  protected openFiliereDialog(): void {
    const ref = this.dialog.open<CollectionDialogComponent<IBaseFiliere>, CollectionDialogData>(
      CollectionDialogComponent,
      { data: { title: 'Sélectionner une filière', collectionComponent: FilieresCollectionComponent }, width: '700px' }
    );
    const sub = ref.componentInstance.itemSelected.subscribe((f: IBaseFiliere) => {
      this.selectedFiliere.set(f); ref.close(f); sub.unsubscribe();
    });
  }

  protected openCirculaireDialog(): void {
    const ref = this.dialog.open<CollectionDialogComponent<IBaseCirculaire>, CollectionDialogData>(
      CollectionDialogComponent,
      { data: { title: 'Sélectionner une circulaire', collectionComponent: CirculairesCollectionComponent }, width: '700px' }
    );
    const sub = ref.componentInstance.itemSelected.subscribe((c: IBaseCirculaire) => {
      this.selectedCirculaire.set(c); ref.close(c); sub.unsubscribe();
    });
  }

  protected openSignificationDialog(): void {
    const ref = this.dialog.open<CollectionDialogComponent<IBaseSignification>, CollectionDialogData>(
      CollectionDialogComponent,
      { data: { title: 'Sélectionner une signification', collectionComponent: SignificationsCollectionComponent }, width: '700px' }
    );
    const sub = ref.componentInstance.itemSelected.subscribe((s: IBaseSignification) => {
      this.selectedSignification.set(s); ref.close(s); sub.unsubscribe();
    });
    const createSub = ref.componentInstance.itemCreated.subscribe((term: string) => {
      const newId = this.significationStore.create({ content: term });
      const newSig = this.significationStore.getById(newId)();
      if (newSig) { this.selectedSignification.set(newSig); ref.close(newSig); }
      createSub.unsubscribe();
    });
  }

  protected openPositionDialog(): void {
    const ref = this.dialog.open<CollectionDialogComponent<IBasePosition>, CollectionDialogData>(
      CollectionDialogComponent,
      { data: { title: 'Sélectionner une position', collectionComponent: PositionsCollectionComponent }, width: '700px' }
    );
    const sub = ref.componentInstance.itemSelected.subscribe((p: IBasePosition) => {
      this.selectedPosition.set(p); ref.close(p); sub.unsubscribe();
    });
  }

  protected openPlacementDialog(): void {
    const ref = this.dialog.open<CollectionDialogComponent<IBasePlacement>, CollectionDialogData>(
      CollectionDialogComponent,
      { data: { title: 'Sélectionner un décernement', collectionComponent: PlacementsCollectionComponent }, width: '700px' }
    );
    const sub = ref.componentInstance.itemSelected.subscribe((p: IBasePlacement) => {
      this.selectedPlacement.set(p); ref.close(p); sub.unsubscribe();
    });
    const createSub = ref.componentInstance.itemCreated.subscribe((term: string) => {
      const newId = this.placementStore.create({ name: term });
      const newPla = this.placementStore.getById(newId)();
      if (newPla) { this.selectedPlacement.set(newPla); ref.close(newPla); }
      createSub.unsubscribe();
    });
  }

  protected openSymboleSensDialog(): void {
    const ref = this.dialog.open<CollectionDialogComponent<IBaseSymbolSens>, CollectionDialogData>(
      CollectionDialogComponent,
      { data: { title: 'Sélectionner un symbole sens', collectionComponent: SymbolsSensCollectionComponent }, width: '700px' }
    );
    const sub = ref.componentInstance.itemSelected.subscribe((s: IBaseSymbolSens) => {
      this.selectedSymboleSens.set(s); ref.close(s); sub.unsubscribe();
    });
  }

  protected openSymboleAccessoryDialog(): void {
    const ref = this.dialog.open<CollectionDialogComponent<IBaseSymbolAcessory>, CollectionDialogData>(
      CollectionDialogComponent,
      { data: { title: 'Sélectionner un symbole accessoire', collectionComponent: SymbolsAccessoryCollectionComponent }, width: '700px' }
    );
    const sub = ref.componentInstance.itemSelected.subscribe((s: IBaseSymbolAcessory) => {
      this.selectedSymboleAccessory.set(s); ref.close(s); sub.unsubscribe();
    });
    const createSub = ref.componentInstance.itemCreated.subscribe((term: string) => {
      const newId = this.symbolAccessoryStore.create({ name: term });
      const newAcc = this.symbolAccessoryStore.getById(newId)();
      if (newAcc) { this.selectedSymboleAccessory.set(newAcc); ref.close(newAcc); }
      createSub.unsubscribe();
    });
  }

  // ── Submit / Cancel ───────────────────────────────────────────────────────
  protected onSubmit(): void {
    const symbole = this.selectedSymbole();
    const mode    = this.relationMode();
    if (!symbole || !mode || !this.isFormValid()) return;

    const data: IRelationItem = {
      id:                  this.id() || '',
      symboleId:           symbole.id,
      symboleSensId:       this.selectedSymboleSens()?.id,
      symboleAccessoryId:  this.selectedSymboleAccessory()?.id,
      spe:                 this.isSpecificite(),
      note:                undefined
    };

    if (mode === 'filiere') {
      data.filiereId      = this.selectedFiliere()?.id;
      data.circulaireId   = this.selectedCirculaire()?.id;
      data.significationId = undefined;
      data.positionId     = 'position-3';
      data.placementId    = 'placement-1';
      data.absent         = this.isAbsent();
    } else {
      data.significationId = this.selectedSignification()?.id;
      data.filiereId       = undefined;
      data.circulaireId    = undefined;
      data.positionId      = this.selectedPosition()?.id;
      data.placementId     = this.selectedPlacement()?.id;
      data.blame           = this.isBlame();
    }

    this.validated.emit(data);
  }

  protected onCancel(): void {
    this.validated.emit(null);
  }
}

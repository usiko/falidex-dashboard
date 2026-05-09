import { Injectable, inject } from "@angular/core";
import { DataService } from "./services/data/data.service";
import { CirculaireStore } from "./stores/circulaires/circulaires.store";
import { CirculaireColorStore } from "./stores/circulaires-colors/circulaires-colors.store";
import { ColorStore } from "./stores/colors/colors.store";
import { FiliereStore } from "./stores/filieres/filieres.store";
import { PlacementStore } from "./stores/placements/placements.store";
import { PositionStore } from "./stores/positions/positions.store";
import { SignificationStore } from "./stores/significations/significations.store";
import { SymbolStore } from "./stores/symbols/symbols.store";
import { SymbolAccessoryStore } from "./stores/symbols-accessory/symbols-accessory.store";
import { SymbolSensStore } from "./stores/symbols-sens/symbols-sens.store";
import { RelationDataStore } from "./stores/relations/relations.store";
import { linkStore } from "./stores/links/links.store";
import { SelectedRelationStore } from "./stores/selected-relation/selected-relation.store";
import { SnackbarService } from "./services/snackbar/snackbar.service";
import { forkJoin, map, mergeMap } from "rxjs";

@Injectable({
    providedIn: 'root',
})
export class Synchronizer {
  private readonly dataService = inject(DataService);
  private readonly circulaireStore = inject(CirculaireStore);
  private readonly circulaireColorStore = inject(CirculaireColorStore);
  private readonly colorStore = inject(ColorStore);
  private readonly filiereStore = inject(FiliereStore);
  private readonly placementStore = inject(PlacementStore);
  private readonly positionStore = inject(PositionStore);
  private readonly significationStore = inject(SignificationStore);
  private readonly symbolStore = inject(SymbolStore);
  private readonly symbolAccessoryStore = inject(SymbolAccessoryStore);
  private readonly symbolSensStore = inject(SymbolSensStore);
  private readonly relationDataStore = inject(RelationDataStore);
  private readonly linkStore = inject(linkStore);
  private readonly selectedRelationStore = inject(SelectedRelationStore);
  private readonly snackbarService = inject(SnackbarService);

  /**
   * Initialise l'écoute de tous les événements des stores
   */
  listenEvents(): void {
    this.listenRelationEvents();
    this.listenLinkEvents();
    this.listenFiliereEvents();
    this.listenSymbolEvents();
    this.listenSignificationEvents();
    this.listenPositionEvents();
    this.listenPlacementEvents();
    this.listenSymbolAccessoryEvents();
    this.listenColorEvents();
    this.listenCirculaireEvents();
    this.listenCirculaireColorEvents();
    this.listenSymbolSensEvents();
  }

  // ==================== Relations ====================

  private listenRelationEvents(): void {
    const events = this.relationDataStore.getEvents();

    // Création de relation
    events.onCreate$?.subscribe(({ id, entity, send }) => {
      if (send) {
        this.dataService.createRelation(entity).subscribe({
          next: (createdRelation) => {
            console.log('✅ Relation créée:', createdRelation.id);
            this.snackbarService.success('Relation créée avec succès');
            // Recharger toutes les relations
            this.reloadAllRelations();
            // Sélectionner la nouvelle relation comme active
            this.selectedRelationStore.setSelectedRelationId(
              createdRelation.id,
              createdRelation.editable,
              createdRelation.national
            );
            // Charger les liens de cette nouvelle relation
            this.linkStore.set(createdRelation.relations || []);
          },
          error: (err) => {
            console.error('❌ Erreur lors de la création de la relation:', err);
            this.snackbarService.error('Erreur lors de la création de la relation');
            this.reloadCurrentRelation();
          }
        });
      }
    });

    // Suppression de relation
    events.onRemove$?.subscribe(({ id, send }) => {
      if (send) {
        this.dataService.deleteRelation(id).subscribe({
          next: () => {
            console.log('✅ Relation supprimée:', id);
            this.snackbarService.success('Relation supprimée avec succès');
            this.reloadAllRelations();
          },
          error: (err) => {
            console.error('❌ Erreur lors de la suppression de la relation:', err);
            this.snackbarService.error('Erreur lors de la suppression de la relation');
            this.reloadAllRelations();
          }
        });
      }
    });

    // Mise à jour de relation
    events.onUpdate$?.subscribe(({ id, changes, old, send }) => {
      const updatedRelation = { ...old, ...changes };
      if (send && Object.keys(changes).length > 0) {
        this.dataService.updateRelation(updatedRelation).subscribe({
          next: () => {
            console.log('✅ Relation mise à jour:', id);
            this.snackbarService.success('Relation mise à jour avec succès');
            this.reloadCurrentRelation();
          },
          error: (err) => {
            console.error('❌ Erreur lors de la mise à jour de la relation:', err);
            this.snackbarService.error('Erreur lors de la mise à jour de la relation');
            this.reloadCurrentRelation();
          }
        });
      }
    });
  }

  // ==================== Links ====================

  private listenLinkEvents(): void {
    const events = this.linkStore.getEvents();

    // Création de lien
    events.onCreate$?.subscribe(({ id, entity, send }) => {
      if (send) {
        const relationId = this.selectedRelationStore.selectedRelationId();
        if (relationId) {
          this.dataService.createRelationItem(relationId, entity).subscribe({
            next: () => {
              console.log('✅ Lien créé:', id);
              this.snackbarService.success('Lien créé avec succès');
              this.reloadCurrentLink();
            },
            error: (err) => {
              console.error('❌ Erreur lors de la création du lien:', err);
              this.snackbarService.error('Erreur lors de la création du lien');
              this.reloadCurrentLink();
            }
          });
        }
      }
    });

    // Suppression de lien
    events.onRemove$?.subscribe(({ id, send }) => {
      if (send) {
        const relationId = this.selectedRelationStore.selectedRelationId();
        if (relationId) {
          this.dataService.deleteRelationItem(relationId, id).subscribe({
            next: () => {
              console.log('✅ Lien supprimé:', id);
              this.snackbarService.success('Lien supprimé avec succès');
              this.reloadCurrentLink();
            },
            error: (err) => {
              console.error('❌ Erreur lors de la suppression du lien:', err);
              this.snackbarService.error('Erreur lors de la suppression du lien');
              this.reloadCurrentLink();
            }
          });
        }
      }
    });

    // Mise à jour de lien
    events.onUpdate$?.subscribe(({ id, changes, old, send }) => {
      if (send && Object.keys(changes).length > 0) {
        const relationId = this.selectedRelationStore.selectedRelationId();
        if (relationId) {
          const updatedItem = { ...old, ...changes };
          this.dataService.updateRelationItem(relationId, updatedItem).subscribe({
            next: () => {
              console.log('✅ Lien mis à jour:', id);
              this.snackbarService.success('Lien mis à jour avec succès');
              this.reloadCurrentLink();
            },
            error: (err) => {
              console.error('❌ Erreur lors de la mise à jour du lien:', err);
              this.snackbarService.error('Erreur lors de la mise à jour du lien');
              this.reloadCurrentLink();
            }
          });
        }
      }
    });
  }

  // ==================== Filières ====================

  private listenFiliereEvents(): void {
    const events = this.filiereStore.getEvents();

    events.onCreate$?.subscribe(({ id, entity, send }) => {
      if (send) {
        this.dataService.createFiliere(entity).subscribe({
          next: () => {
            console.log('✅ Filière créée:', id);
            this.snackbarService.success('Filière créée avec succès');
            this.reloadFilieres();
          },
          error: (err) => {
            console.error('❌ Erreur lors de la création de la filière:', err);
            this.snackbarService.error('Erreur lors de la création de la filière');
            this.reloadFilieres();
          }
        });
      }
    });

    events.onRemove$?.subscribe(({ id, send }) => {
      if (send) {
        this.dataService.deleteFiliere(id).subscribe({
          next: () => {
            console.log('✅ Filière supprimée:', id);
            this.snackbarService.success('Filière supprimée avec succès');
            this.reloadFilieres();
          },
          error: (err) => {
            console.error('❌ Erreur lors de la suppression de la filière:', err);
            this.snackbarService.error('Erreur lors de la suppression de la filière');
            this.reloadFilieres();
          }
        });
      }
    });

    events.onUpdate$?.subscribe(({ id, changes, old, send }) => {
      if (send && Object.keys(changes).length > 0) {
        const updated = { id, ...changes };
        this.dataService.editFiliere(updated).subscribe({
          next: () => {
            console.log('✅ Filière mise à jour:', id);
            this.snackbarService.success('Filière mise à jour avec succès');
            this.reloadFilieres();
          },
          error: (err) => {
            console.error('❌ Erreur lors de la mise à jour de la filière:', err);
            this.snackbarService.error('Erreur lors de la mise à jour de la filière');
            this.reloadFilieres();
          }
        });
      }
    });
  }

  // ==================== Symboles ====================

  private listenSymbolEvents(): void {
    const events = this.symbolStore.getEvents();

    events.onCreate$?.subscribe(({ id, entity, send }) => {
      if (send) {
        this.dataService.createSymbole(entity).subscribe({
          next: () => {
            console.log('✅ Symbole créé:', id);
            this.snackbarService.success('Symbole créé avec succès');
            this.reloadSymboles();
          },
          error: (err) => {
            console.error('❌ Erreur lors de la création du symbole:', err);
            this.snackbarService.error('Erreur lors de la création du symbole');
            this.reloadSymboles();
          }
        });
      }
    });

    events.onRemove$?.subscribe(({ id, send }) => {
      if (send) {
        this.dataService.deleteSymbole(id).subscribe({
          next: () => {
            console.log('✅ Symbole supprimé:', id);
            this.snackbarService.success('Symbole supprimé avec succès');
            this.reloadSymboles();
          },
          error: (err) => {
            console.error('❌ Erreur lors de la suppression du symbole:', err);
            this.snackbarService.error('Erreur lors de la suppression du symbole');
            this.reloadSymboles();
          }
        });
      }
    });

    events.onUpdate$?.subscribe(({ id, changes, old, send }) => {
      if (send && Object.keys(changes).length > 0) {
        const updated = { id, ...changes };
        this.dataService.editSymbol(updated).subscribe({
          next: () => {
            console.log('✅ Symbole mis à jour:', id);
            this.snackbarService.success('Symbole mis à jour avec succès');
            this.reloadSymboles();
          },
          error: (err) => {
            console.error('❌ Erreur lors de la mise à jour du symbole:', err);
            this.snackbarService.error('Erreur lors de la mise à jour du symbole');
            this.reloadSymboles();
          }
        });
      }
    });
  }

  // ==================== Significations ====================

  private listenSignificationEvents(): void {
    const events = this.significationStore.getEvents();

    events.onCreate$?.subscribe(({ id, entity, send }) => {
      if (send) {
        this.dataService.createSignification(entity).subscribe({
          next: () => {
            console.log('✅ Signification créée:', id);
            this.snackbarService.success('Signification créée avec succès');
            this.reloadSignifications();
          },
          error: (err) => {
            console.error('❌ Erreur lors de la création de la signification:', err);
            this.snackbarService.error('Erreur lors de la création de la signification');
            this.reloadSignifications();
          }
        });
      }
    });

    events.onRemove$?.subscribe(({ id, send }) => {
      if (send) {
        this.dataService.deleteSignification(id).subscribe({
          next: () => {
            console.log('✅ Signification supprimée:', id);
            this.snackbarService.success('Signification supprimée avec succès');
            this.reloadSignifications();
          },
          error: (err) => {
            console.error('❌ Erreur lors de la suppression de la signification:', err);
            this.snackbarService.error('Erreur lors de la suppression de la signification');
            this.reloadSignifications();
          }
        });
      }
    });

    events.onUpdate$?.subscribe(({ id, changes, old, send }) => {
      if (send && Object.keys(changes).length > 0) {
        const updated = { id, ...changes };
        this.dataService.editSignification(updated).subscribe({
          next: () => {
            console.log('✅ Signification mise à jour:', id);
            this.snackbarService.success('Signification mise à jour avec succès');
            this.reloadSignifications();
          },
          error: (err) => {
            console.error('❌ Erreur lors de la mise à jour de la signification:', err);
            this.snackbarService.error('Erreur lors de la mise à jour de la signification');
            this.reloadSignifications();
          }
        });
      }
    });
  }

  // ==================== Positions ====================

  private listenPositionEvents(): void {
    const events = this.positionStore.getEvents();

    events.onCreate$?.subscribe(({ id, entity, send }) => {
      if (send) {
        this.dataService.createPosition(entity).subscribe({
          next: () => {
            console.log('✅ Position créée:', id);
            this.snackbarService.success('Position créée avec succès');
            this.reloadPositions();
          },
          error: (err) => {
            console.error('❌ Erreur lors de la création de la position:', err);
            this.snackbarService.error('Erreur lors de la création de la position');
            this.reloadPositions();
          }
        });
      }
    });

    events.onRemove$?.subscribe(({ id, send }) => {
      if (send) {
        this.dataService.deletePosition(id).subscribe({
          next: () => {
            console.log('✅ Position supprimée:', id);
            this.snackbarService.success('Position supprimée avec succès');
            this.reloadPositions();
          },
          error: (err) => {
            console.error('❌ Erreur lors de la suppression de la position:', err);
            this.snackbarService.error('Erreur lors de la suppression de la position');
            this.reloadPositions();
          }
        });
      }
    });

    events.onUpdate$?.subscribe(({ id, changes, old, send }) => {
      if (send && Object.keys(changes).length > 0) {
        const updated = { id, ...changes };
        this.dataService.editPosition(updated).subscribe({
          next: () => {
            console.log('✅ Position mise à jour:', id);
            this.snackbarService.success('Position mise à jour avec succès');
            this.reloadPositions();
          },
          error: (err) => {
            console.error('❌ Erreur lors de la mise à jour de la position:', err);
            this.snackbarService.error('Erreur lors de la mise à jour de la position');
            this.reloadPositions();
          }
        });
      }
    });
  }

  // ==================== Placements ====================

  private listenPlacementEvents(): void {
    const events = this.placementStore.getEvents();

    events.onCreate$?.subscribe(({ id, entity, send }) => {
      if (send) {
        this.dataService.createPlacement(entity).subscribe({
          next: () => {
            console.log('✅ Placement créé:', id);
            this.snackbarService.success('Placement créé avec succès');
            this.reloadPlacements();
          },
          error: (err) => {
            console.error('❌ Erreur lors de la création du placement:', err);
            this.snackbarService.error('Erreur lors de la création du placement');
            this.reloadPlacements();
          }
        });
      }
    });

    events.onRemove$?.subscribe(({ id, send }) => {
      if (send) {
        this.dataService.deletePlacement(id).subscribe({
          next: () => {
            console.log('✅ Placement supprimé:', id);
            this.snackbarService.success('Placement supprimé avec succès');
            this.reloadPlacements();
          },
          error: (err) => {
            console.error('❌ Erreur lors de la suppression du placement:', err);
            this.snackbarService.error('Erreur lors de la suppression du placement');
            this.reloadPlacements();
          }
        });
      }
    });

    events.onUpdate$?.subscribe(({ id, changes, old, send }) => {
      if (send && Object.keys(changes).length > 0) {
        const updated = { id, ...changes };
        this.dataService.editPlacement(updated).subscribe({
          next: () => {
            console.log('✅ Placement mis à jour:', id);
            this.snackbarService.success('Placement mis à jour avec succès');
            this.reloadPlacements();
          },
          error: (err) => {
            console.error('❌ Erreur lors de la mise à jour du placement:', err);
            this.snackbarService.error('Erreur lors de la mise à jour du placement');
            this.reloadPlacements();
          }
        });
      }
    });
  }

  // ==================== Symboles Accessoires ====================

  private listenSymbolAccessoryEvents(): void {
    const events = this.symbolAccessoryStore.getEvents();

    events.onCreate$?.subscribe(({ id, entity, send }) => {
      if (send) {
        this.dataService.createSymboleAccessoire(entity).subscribe({
          next: () => {
            console.log('✅ Symbole accessoire créé:', id);
            this.snackbarService.success('Symbole accessoire créé avec succès');
            this.reloadSymbolesAccessoires();
          },
          error: (err) => {
            console.error('❌ Erreur lors de la création du symbole accessoire:', err);
            this.snackbarService.error('Erreur lors de la création du symbole accessoire');
            this.reloadSymbolesAccessoires();
          }
        });
      }
    });

    events.onRemove$?.subscribe(({ id, send }) => {
      if (send) {
        this.dataService.deleteSymboleAccessoire(id).subscribe({
          next: () => {
            console.log('✅ Symbole accessoire supprimé:', id);
            this.snackbarService.success('Symbole accessoire supprimé avec succès');
            this.reloadSymbolesAccessoires();
          },
          error: (err) => {
            console.error('❌ Erreur lors de la suppression du symbole accessoire:', err);
            this.snackbarService.error('Erreur lors de la suppression du symbole accessoire');
            this.reloadSymbolesAccessoires();
          }
        });
      }
    });

    events.onUpdate$?.subscribe(({ id, changes, old, send }) => {
      if (send && Object.keys(changes).length > 0) {
        const updated = { id, ...changes };
        this.dataService.editSymboleAccessoire(updated).subscribe({
          next: () => {
            console.log('✅ Symbole accessoire mis à jour:', id);
            this.snackbarService.success('Symbole accessoire mis à jour avec succès');
            this.reloadSymbolesAccessoires();
          },
          error: (err) => {
            console.error('❌ Erreur lors de la mise à jour du symbole accessoire:', err);
            this.snackbarService.error('Erreur lors de la mise à jour du symbole accessoire');
            this.reloadSymbolesAccessoires();
          }
        });
      }
    });
  }

  // ==================== Couleurs ====================

  private listenColorEvents(): void {
    const events = this.colorStore.getEvents();

    events.onCreate$?.subscribe(({ id, entity, send }) => {
      if (send) {
        this.dataService.createColor(entity).subscribe({
          next: () => {
            console.log('✅ Couleur créée:', id);
            this.snackbarService.success('Couleur créée avec succès');
            this.reloadColors();
          },
          error: (err) => {
            console.error('❌ Erreur lors de la création de la couleur:', err);
            this.snackbarService.error('Erreur lors de la création de la couleur');
            this.reloadColors();
          }
        });
      }
    });

    events.onRemove$?.subscribe(({ id, send }) => {
      if (send) {
        this.dataService.deleteColor(id).subscribe({
          next: () => {
            console.log('✅ Couleur supprimée:', id);
            this.snackbarService.success('Couleur supprimée avec succès');
            this.reloadColors();
          },
          error: (err) => {
            console.error('❌ Erreur lors de la suppression de la couleur:', err);
            this.snackbarService.error('Erreur lors de la suppression de la couleur');
            this.reloadColors();
          }
        });
      }
    });

    events.onUpdate$?.subscribe(({ id, changes, old, send }) => {
      if (send && Object.keys(changes).length > 0) {
        const updated = { id, ...changes };
        this.dataService.editColor(updated).subscribe({
          next: () => {
            console.log('✅ Couleur mise à jour:', id);
            this.snackbarService.success('Couleur mise à jour avec succès');
            this.reloadColors();
          },
          error: (err) => {
            console.error('❌ Erreur lors de la mise à jour de la couleur:', err);
            this.snackbarService.error('Erreur lors de la mise à jour de la couleur');
            this.reloadColors();
          }
        });
      }
    });
  }

  // ==================== Circulaires ====================

  private listenCirculaireEvents(): void {
    const events = this.circulaireStore.getEvents();

    events.onCreate$?.subscribe(({ id, entity, send }) => {
      if (send) {
        this.dataService.createCirculaire(entity).subscribe({
          next: () => {
            console.log('✅ Circulaire créée:', id);
            this.snackbarService.success('Circulaire créée avec succès');
            this.reloadCirculaires();
          },
          error: (err) => {
            console.error('❌ Erreur lors de la création de la circulaire:', err);
            this.snackbarService.error('Erreur lors de la création de la circulaire');
            this.reloadCirculaires();
          }
        });
      }
    });

    events.onRemove$?.subscribe(({ id, send }) => {
      if (send) {
        this.dataService.deleteCirculaire(id).subscribe({
          next: () => {
            console.log('✅ Circulaire supprimée:', id);
            this.snackbarService.success('Circulaire supprimée avec succès');
            this.reloadCirculaires();
          },
          error: (err) => {
            console.error('❌ Erreur lors de la suppression de la circulaire:', err);
            this.snackbarService.error('Erreur lors de la suppression de la circulaire');
            this.reloadCirculaires();
          }
        });
      }
    });

    events.onUpdate$?.subscribe(({ id, changes, old, send }) => {
      if (send && Object.keys(changes).length > 0) {
        const updated = { id, ...changes };
        this.dataService.editCirculaire(updated).subscribe({
          next: () => {
            console.log('✅ Circulaire mise à jour:', id);
            this.snackbarService.success('Circulaire mise à jour avec succès');
            this.reloadCirculaires();
          },
          error: (err) => {
            console.error('❌ Erreur lors de la mise à jour de la circulaire:', err);
            this.snackbarService.error('Erreur lors de la mise à jour de la circulaire');
            this.reloadCirculaires();
          }
        });
      }
    });
  }

  // ==================== Circulaire-Colors ====================

  private listenCirculaireColorEvents(): void {
    const events = this.circulaireColorStore.getEvents();

    events.onCreate$?.subscribe(({ id, entity, send }) => {
      if (send) {
        this.dataService.createCirculaireColor(entity).subscribe({
          next: () => {
            console.log('✅ Association circulaire-couleur créée:', id);
            this.snackbarService.success('Association créée avec succès');
            this.reloadCirculairesColors();
          },
          error: (err) => {
            console.error('❌ Erreur lors de la création de l\'association:', err);
            this.snackbarService.error('Erreur lors de la création de l\'association');
            this.reloadCirculairesColors();
          }
        });
      }
    });

    events.onRemove$?.subscribe(({ id, send }) => {
      if (send) {
        this.dataService.deleteCirculaireColor(id).subscribe({
          next: () => {
            console.log('✅ Association circulaire-couleur supprimée:', id);
            this.snackbarService.success('Association supprimée avec succès');
            this.reloadCirculairesColors();
          },
          error: (err) => {
            console.error('❌ Erreur lors de la suppression de l\'association:', err);
            this.snackbarService.error('Erreur lors de la suppression de l\'association');
            this.reloadCirculairesColors();
          }
        });
      }
    });

    events.onUpdate$?.subscribe(({ id, changes, old, send }) => {
      if (send && Object.keys(changes).length > 0) {
        const updated = { id, ...changes };
        this.dataService.editCirculaireColor(updated).subscribe({
          next: () => {
            console.log('✅ Association circulaire-couleur mise à jour:', id);
            this.snackbarService.success('Association mise à jour avec succès');
            this.reloadCirculairesColors();
          },
          error: (err) => {
            console.error('❌ Erreur lors de la mise à jour de l\'association:', err);
            this.snackbarService.error('Erreur lors de la mise à jour de l\'association');
            this.reloadCirculairesColors();
          }
        });
      }
    });
  }

  // ==================== Symboles Sens ====================

  private listenSymbolSensEvents(): void {
    const events = this.symbolSensStore.getEvents();

    events.onCreate$?.subscribe(({ id, entity, send }) => {
      if (send) {
        this.dataService.createSymboleSens(entity).subscribe({
          next: () => {
            console.log('✅ Symbole sens créé:', id);
            this.snackbarService.success('Symbole sens créé avec succès');
            this.reloadSymbolesSens();
          },
          error: (err) => {
            console.error('❌ Erreur lors de la création du symbole sens:', err);
            this.snackbarService.error('Erreur lors de la création du symbole sens');
            this.reloadSymbolesSens();
          }
        });
      }
    });

    events.onRemove$?.subscribe(({ id, send }) => {
      if (send) {
        this.dataService.deleteSymboleSens(id).subscribe({
          next: () => {
            console.log('✅ Symbole sens supprimé:', id);
            this.snackbarService.success('Symbole sens supprimé avec succès');
            this.reloadSymbolesSens();
          },
          error: (err) => {
            console.error('❌ Erreur lors de la suppression du symbole sens:', err);
            this.snackbarService.error('Erreur lors de la suppression du symbole sens');
            this.reloadSymbolesSens();
          }
        });
      }
    });

    events.onUpdate$?.subscribe(({ id, changes, old, send }) => {
      if (send && Object.keys(changes).length > 0) {
        const updated = { id, ...changes };
        this.dataService.editSymboleSens(updated).subscribe({
          next: () => {
            console.log('✅ Symbole sens mis à jour:', id);
            this.snackbarService.success('Symbole sens mis à jour avec succès');
            this.reloadSymbolesSens();
          },
          error: (err) => {
            console.error('❌ Erreur lors de la mise à jour du symbole sens:', err);
            this.snackbarService.error('Erreur lors de la mise à jour du symbole sens');
            this.reloadSymbolesSens();
          }
        });
      }
    });
  }

  // ==================== Helpers ====================

  private reloadCurrentLink(): void {
    const currentId = this.selectedRelationStore.selectedRelationId();
    if (currentId) {
      this.dataService.getRelationById(currentId).subscribe((data) => {
        this.linkStore.set(data.relations);
      });
    }
  }

  private reloadCurrentRelation(): void {
    const currentId = this.selectedRelationStore.selectedRelationId();
    if (currentId) {
      this.dataService.getRelationById(currentId).subscribe((data) => {
        this.relationDataStore.update(currentId, {
          annee: data.annee,
          editable: data.editable,
          name: data.name,
          national: data.national,
          ville: data.ville,
          specificites: data.specificites,
          default: data.default
        }, false);
      });
    }
  }

  private reloadAllRelations(): void {
    this.dataService.getListRelations().pipe(
      mergeMap((listRelations) => {
        const obs = listRelations.map(item => this.dataService.getRelationById(item.id));
        return forkJoin(obs);
      })
    ).subscribe((relations) => {
      this.relationDataStore.set(relations);
    });
  }

  private reloadFilieres(): void {
    this.dataService.getFilieres().subscribe((data) => {
      this.filiereStore.set(data);
    });
  }

  private reloadSymboles(): void {
    this.dataService.getSymboles().subscribe((data) => {
      this.symbolStore.set(data);
    });
  }

  private reloadSignifications(): void {
    this.dataService.getSignifications().subscribe((data) => {
      this.significationStore.set(data);
    });
  }

  private reloadPositions(): void {
    this.dataService.getPositions().subscribe((data) => {
      this.positionStore.set(data);
    });
  }

  private reloadPlacements(): void {
    this.dataService.getPlacements().subscribe((data) => {
      this.placementStore.set(data);
    });
  }

  private reloadSymbolesAccessoires(): void {
    this.dataService.getSymbolesAccessoires().subscribe((data) => {
      this.symbolAccessoryStore.set(data);
    });
  }

  private reloadColors(): void {
    this.dataService.getColors().subscribe((data) => {
      this.colorStore.set(data);
    });
  }

  private reloadCirculaires(): void {
    this.dataService.getCirculaires().subscribe((data) => {
      this.circulaireStore.set(data);
    });
  }

  private reloadCirculairesColors(): void {
    this.dataService.getCirculairesColors().subscribe((data) => {
      this.circulaireColorStore.set(data);
    });
  }

  private reloadSymbolesSens(): void {
    this.dataService.getSymbolesSens().subscribe((data) => {
      this.symbolSensStore.set(data);
    });
  }
}
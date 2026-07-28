import { Injectable } from '@angular/core';
import Ajv, { ValidateFunction } from 'ajv';
import importJsonSchema from './import-json-schema.json';
import { ImportBatch } from './import-batch.model';

export interface ImportBatchParseResult {
  batch: ImportBatch | null;
  errors: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ImportBatchValidatorService {
  private readonly ajv = new Ajv({ allErrors: true, strict: false });
  private readonly validateBatch: ValidateFunction = this.ajv.compile(importJsonSchema);

  parse(jsonText: string): ImportBatchParseResult {
    if (!jsonText.trim()) {
      return { batch: null, errors: ["Collez le JSON généré par l'IA avant de valider."] };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch (error) {
      return { batch: null, errors: [`JSON invalide : ${(error as Error).message}`] };
    }

    const valid = this.validateBatch(parsed);
    if (!valid) {
      const errors = (this.validateBatch.errors ?? []).map(
        (err) => `${err.instancePath || '(racine)'} ${err.message ?? 'erreur inconnue'}`
      );
      return { batch: null, errors };
    }

    return { batch: parsed as ImportBatch, errors: [] };
  }
}

import { Mix, Production, Sale, Note, Ingredient } from '../../../types';
import { generateRawMaterialsTables } from './rawMaterials';
import { generateOperationsTables } from './operations';
import { generateInventoryTables } from './inventory';
import { generateNotesTable } from './notes';

export {
  generateRawMaterialsTables,
  generateOperationsTables,
  generateInventoryTables,
  generateNotesTable,
};

// Types for table generation functions
export interface TableGeneratorProps {
  ingredients?: Ingredient[];
  mixes?: Mix[];
  productions?: Production[];
  sales?: Sale[];
  notes?: Note[];
  date?: string;
}
import { Note } from '../../../types';
import { TableData } from '../types';
import { COLORS } from '../constants';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export const generateNotesTable = (notes: Note[]): TableData[] => {
  const today = new Date().toDateString();
  const todayNotes = notes.filter(note => new Date(note.date).toDateString() === today);

  return [{
    title: 'ملاحظات اليوم',
    headers: ['الوقت', 'الملاحظة'],
    rows: todayNotes.map(note => [
      format(new Date(note.date), 'p', { locale: ar }),
      note.content
    ]),
    total: `${todayNotes.length} ملاحظة`,
    color: COLORS.DANGER
  }];
};
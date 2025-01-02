import { Note } from '../../../types';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export const generateNotesTable = (notes: Note[], date: string) => {
  const todayNotes = notes.filter(
    note => new Date(note.date).toDateString() === date
  );

  return {
    table: {
      headerRows: 1,
      body: [
        ['الملاحظة', 'الوقت'],
        ...todayNotes.map(note => [
          note.content,
          format(new Date(note.date), 'p', { locale: ar }),
        ]),
      ],
    },
    layout: 'lightHorizontalLines',
  };
};
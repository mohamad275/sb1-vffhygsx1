import React, { useState, useEffect } from 'react';
import { CollapsibleTable } from './CollapsibleTable';
import { TableCell } from '../ui/TableCell';
import { TableActions } from '../ui/TableActions';
import { DeleteConfirmationModal } from '../modals/DeleteConfirmationModal';
import { Note } from '../../types';
import { useDailyNotes } from '../../hooks/useDailyNotes';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Props {
  title: string;
}

export const NotesTable: React.FC<Props> = ({ title }) => {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { notes, loading, error, deleteNote, fetchNotes } = useDailyNotes();

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleDelete = (note: Note) => {
    setSelectedNote(note);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedNote) return;
    
    const success = await deleteNote(selectedNote.id);
    if (success) {
      setSelectedNote(null);
      setIsDeleteModalOpen(false);
      fetchNotes(); // Refresh notes after deletion
    }
  };

  return (
    <>
      <CollapsibleTable
        title={title}
        total={`${notes.length} ملاحظة`}
        headers={['التاريخ', 'الملاحظة', 'الإجراءات']}
      >
        {notes.map((note) => (
          <tr key={note.id}>
            <TableCell>
              {format(new Date(note.created_at), 'p', { locale: ar })}
            </TableCell>
            <TableCell>{note.content}</TableCell>
            <TableCell>
              <TableActions
                onDelete={() => handleDelete(note)}
                disabled={loading}
              />
            </TableCell>
          </tr>
        ))}
      </CollapsibleTable>

      {selectedNote && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedNote(null);
          }}
          onConfirm={handleConfirmDelete}
          title="حذف ملاحظة"
          message="هل أنت متأكد من حذف هذه الملاحظة؟"
          isDeleting={loading}
        />
      )}

      {error && (
        <div className="text-red-600 text-sm mt-2">{error}</div>
      )}
    </>
  );
};
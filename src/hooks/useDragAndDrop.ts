import { useState } from 'react';

interface DragState {
  draggedTaskId: string | null;
  draggedFromColumn: string | null;
  isDraggingOver: string | null;
}

export const useDragAndDrop = ( onTaskMove: (taskId: string, newStatus: string, options?: { optimistic?: boolean }) => void) => {
  const [dragState, setDragState] = useState<DragState>({
    draggedTaskId: null,
    draggedFromColumn: null,
    isDraggingOver: null,
  });

  const handleDragStart = (e: React.DragEvent, taskId: string, currentStatus: string) => {
  setDragState({ draggedTaskId: taskId, draggedFromColumn: currentStatus, isDraggingOver: null });
  e.dataTransfer.setData('text/plain', taskId);
  e.dataTransfer.effectAllowed = 'move';

  // 👇 Custom drag image (optional)
  const crt = e.currentTarget.cloneNode(true) as HTMLElement;
  crt.style.position = 'absolute';
  crt.style.top = '-999px';
  crt.style.left = '-999px';
  document.body.appendChild(crt);
  e.dataTransfer.setDragImage(crt, 0, 0);
};


  const handleDragEnd = (e: React.DragEvent) => {
    setDragState({
      draggedTaskId: null,
      draggedFromColumn: null,
      isDraggingOver: null,
    });
    
    // Reset visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragState(prev => ({
      ...prev,
      isDraggingOver: columnId,
    }));
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're leaving the column entirely
    if (e.currentTarget === e.target) {
      setDragState(prev => ({
        ...prev,
        isDraggingOver: null,
      }));
    }
  };

 const handleDrop = (e: React.DragEvent, targetStatus: string) => {
  e.preventDefault();
  const taskId = e.dataTransfer.getData('text/plain');

  if (taskId && dragState.draggedFromColumn !== targetStatus) {
    // 🚀 Optimistically update UI right here
    onTaskMove(taskId, targetStatus, { optimistic: true });
  }

  setDragState({
    draggedTaskId: null,
    draggedFromColumn: null,
    isDraggingOver: null,
  });
};


  return {
    dragState,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
  };
};
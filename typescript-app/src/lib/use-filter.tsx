import { useState, useCallback } from "react";

interface Column {
  id: string;
  label?: string;
  hidden?: boolean;
}

interface UseFilterProps {
  columns: Column[];
  storageKey: string;
}

interface UseFilterReturn {
  visibleColumns: { [key: string]: boolean };
  columnOrder: string[];
  handleColumnVisibilityChange: (columnId: string, visible: boolean) => void;
  handleColumnOrderChange: (newOrder: string[]) => void;
}

const getInitialColumnVisibility = (columns: Column[], savedOrder: string[] | null): { [key: string]: boolean } => {
  const initialVisibility: { [key: string]: boolean } = {};

  if (!savedOrder) {
    columns.forEach((column) => {
      if (!column.hidden) {
        initialVisibility[column.id] = true;
      }
    });
    return initialVisibility;
  }

  columns.forEach((column) => {
    if (!column.hidden) {
      initialVisibility[column.id] = savedOrder.includes(column.id);
    }
  });

  return initialVisibility;
};

const getInitialColumnOrder = (columns: Column[], savedOrder: string[] | null): string[] => {
  if (savedOrder && savedOrder.length > 0) {
    const validOrder = savedOrder.filter((id) => columns.some((col) => col.id === id && !col.hidden));
    if (validOrder.length > 0) {
      return validOrder;
    }
  }

  return columns.filter((column) => !column.hidden).map((column) => column.id);
};

const loadSavedColumnOrder = (storageKey: string): string[] | null => {
  try {
    const savedOrder = localStorage.getItem(storageKey);
    if (!savedOrder) return null;

    const parsedOrder = JSON.parse(savedOrder);
    if (!Array.isArray(parsedOrder) || parsedOrder.length === 0) return null;

    return parsedOrder;
  } catch (e) {
    console.error("Error loading saved column order:", e);
    return null;
  }
};

export const useFilter = ({ columns, storageKey }: UseFilterProps): UseFilterReturn => {
  const savedOrder = loadSavedColumnOrder(storageKey);

  const [visibleColumns, setVisibleColumns] = useState(() => getInitialColumnVisibility(columns, savedOrder));

  const [columnOrder, setColumnOrder] = useState(() => getInitialColumnOrder(columns, savedOrder));

  const handleColumnVisibilityChange = useCallback(
    (columnId: string, visible: boolean) => {
      setVisibleColumns((prev) => {
        const newVisibility = { ...prev };
        newVisibility[columnId] = visible;

        const newOrder = Object.entries(newVisibility)
          .filter(([_, isVisible]) => isVisible)
          .map(([id]) => id);

        if (newOrder.length > 0) {
          localStorage.setItem(storageKey, JSON.stringify(newOrder));
          setColumnOrder(newOrder);
        } else {
          localStorage.removeItem(storageKey);
          setColumnOrder([]);
        }

        return newVisibility;
      });
    },
    [storageKey]
  );

  const handleColumnOrderChange = useCallback(
    (newOrder: string[]) => {
      if (newOrder.length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(newOrder));
        setVisibleColumns((prev) => {
          const newVisibility = { ...prev };
          columns.forEach((column) => {
            if (!column.hidden) {
              newVisibility[column.id] = newOrder.includes(column.id);
            }
          });
          return newVisibility;
        });
      } else {
        localStorage.removeItem(storageKey);
        setVisibleColumns((prev) => {
          const newVisibility = { ...prev };
          columns.forEach((column) => {
            if (!column.hidden) {
              newVisibility[column.id] = false;
            }
          });
          return newVisibility;
        });
        setColumnOrder([]);
      }
      setColumnOrder(newOrder);
    },
    [columns, storageKey]
  );

  return {
    visibleColumns,
    columnOrder,
    handleColumnVisibilityChange,
    handleColumnOrderChange,
  };
};

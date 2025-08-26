import FilterListIcon from "@mui/icons-material/FilterList";
import { Button, Popover, FormGroup, FormControlLabel, Checkbox, Box, Typography } from "@mui/material";
import { useState } from "react";

interface FilterButtonProps {
  columns: { label: string; id: string; hidden?: boolean }[];
  onColumnVisibilityChange: (columnId: string, visible: boolean) => void;
  visibleColumns: { [key: string]: boolean };
  onColumnOrderChange: (orderedColumns: string[]) => void;
  columnOrder: string[];
}

const FilterButton = ({ columns, onColumnVisibilityChange, visibleColumns, onColumnOrderChange, columnOrder }: FilterButtonProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCheckboxChange = (columnId: string, checked: boolean) => {
    onColumnVisibilityChange(columnId, checked);

    // Update column order
    if (checked) {
      // Add to the end of the order if newly checked
      if (!columnOrder.includes(columnId)) {
        onColumnOrderChange([...columnOrder, columnId]);
      }
    } else {
      // Remove from order if unchecked
      onColumnOrderChange(columnOrder.filter((id) => id !== columnId));
    }
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Button
        variant="contained"
        startIcon={<FilterListIcon />}
        onClick={handleClick}
        sx={{
          backgroundColor: "white",
          color: "black",
          textTransform: "none",
          "&:hover": {
            backgroundColor: "#f0f0f0",
          },
        }}
      >
        Filter
      </Button>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Box sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Select columns to display
          </Typography>
          <FormGroup>
            {columns.map(
              (column) =>
                !column.hidden && (
                  <FormControlLabel
                    key={column.id}
                    control={<Checkbox checked={visibleColumns[column.id] ?? true} onChange={(e) => handleCheckboxChange(column.id, e.target.checked)} />}
                    label={column.label}
                  />
                )
            )}
          </FormGroup>
        </Box>
      </Popover>
    </>
  );
};

export default FilterButton;

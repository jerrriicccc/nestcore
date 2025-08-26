import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import Paper from "@mui/material/Paper";
import { useState, FormEvent } from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";

interface SearchPaneProps {
  onSearch: (searchTerm: string) => void;
}

export default function SearchPane({ onSearch }: SearchPaneProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleReset = () => {
    setSearchTerm("");
    onSearch("");
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      elevation={3}
      sx={{
        display: "flex",
        alignItems: "center",
        padding: "4px 12px",
        borderRadius: "30px",
        maxWidth: 500,
        margin: "auto",
        backgroundColor: "#f9f9f9",
      }}
    >
      <Box sx={{ display: "flex", width: "100%", alignItems: "center" }}>
        <TextField
          variant="standard"
          fullWidth
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            disableUnderline: true,
            startAdornment: (
              <InputAdornment position="start">
                <IconButton onClick={handleReset}>
                  <SearchIcon sx={{ color: "gray" }} />
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              paddingY: "4px",
              fontSize: "0.95rem",
            },
          }}
        />

        {searchTerm.trim() && (
          <Button
            type="submit"
            variant="contained"
            sx={{
              ml: 1,
              backgroundColor: "gray",
              "&:hover": {
                backgroundColor: "lightgray",
              },
              borderRadius: "20px",
              textTransform: "none",
              height: "30px",
            }}
          >
            Search
          </Button>
        )}
      </Box>
    </Paper>
  );
}

import { DateInput, TextInput } from "../../components/form/Input";
import { useState, FormEvent } from "react";
import { Box, Button, Paper } from "@mui/material";

interface AppointmentSearchProps {
  onSearch: (searchTerm: string) => void;
}

const AppointmentSearch: React.FC<AppointmentSearchProps> = ({ onSearch }) => {
  const [formData, setFormData] = useState({
    from_datecreated: "",
    to_datecreated: "",
    lastname: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Build search term from form data
    const searchParams: string[] = [];

    if (formData.from_datecreated?.trim()) {
      searchParams.push(`from_datecreated:${formData.from_datecreated.trim()}`);
    }
    if (formData.to_datecreated?.trim()) {
      searchParams.push(`to_datecreated:${formData.to_datecreated.trim()}`);
    }
    if (formData.lastname?.trim()) {
      searchParams.push(`lastname:${formData.lastname.trim()}`);
    }

    const searchTerm = searchParams.join("|");
    if (searchTerm) {
      onSearch(searchTerm);
    }
  };

  const handleClear = () => {
    setFormData({
      from_datecreated: "",
      to_datecreated: "",
      lastname: "",
    });
    onSearch("");
  };

  const hasFilters = formData.from_datecreated || formData.to_datecreated || formData.lastname;

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      elevation={3}
      sx={{
        display: "flex",
        flexDirection: "column",
        padding: 3,
        borderRadius: 2,
        maxWidth: "auto",
        margin: "0 20px 20px 20px",
        backgroundColor: "#f9f9f9",
      }}
    >
      <DateInput label="From Date Created" name="from_datecreated" data={formData.from_datecreated} onChange={handleInputChange} />
      <DateInput label="To Date Created" name="to_datecreated" data={formData.to_datecreated} onChange={handleInputChange} />
      <TextInput label="lastname" name="lastname" data={formData.lastname} onChange={handleInputChange} />

      <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
        {hasFilters && (
          <Button
            type="button"
            variant="outlined"
            sx={{
              borderRadius: "20px",
              textTransform: "none",
            }}
            onClick={handleClear}
          >
            Clear
          </Button>
        )}
        <Button
          type="submit"
          variant="contained"
          sx={{
            backgroundColor: "gray",
            "&:hover": {
              backgroundColor: "darkgray",
            },
            borderRadius: "20px",
            textTransform: "none",
          }}
        >
          Search
        </Button>
      </Box>
    </Paper>
  );
};

export default AppointmentSearch;

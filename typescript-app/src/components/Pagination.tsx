import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

interface PaginationMeta {
  datacount: number;
  pagelimit: number;
  page: number;
  totalpages: number;
}

interface PaginationProps {
  settings?: PaginationMeta;
  // page: number;
  disabled?: boolean;
}

const Paginations = ({ settings, disabled }: PaginationProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const count = settings?.totalpages || 1;
  const pages = Number(searchParams.get("page")) || 1;

  const handlePageChange = useCallback(
    (event: React.ChangeEvent<unknown>, newPage: number) => {
      setSearchParams((prev) => {
        prev.set("page", String(newPage));
        return prev;
      });
    },
    [setSearchParams]
  );

  return (
    <Stack spacing={2}>
      <Pagination
        count={count}
        page={pages}
        onChange={handlePageChange}
        disabled={disabled}
        showFirstButton
        showLastButton
        color="standard"
        sx={{
          "& .MuiPaginationItem-root.Mui-selected": {
            color: "white",
            backgroundColor: "#6a6a6a",
            fontWeight: "bold",
          },
        }}
      />
    </Stack>
  );
};

export default Paginations;

import React, { useContext } from "react";
import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { AppContext } from "../context/app.context";

export default function Search() {
  const { search, setSearch } = useContext(AppContext);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTerm = event.target.value;
    setSearch(newTerm);
  };

  return (
    <TextField
      className="w-64"
      variant="outlined"
      size="small"
      placeholder="Search..."
      value={search}
      onChange={handleSearchChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
    />
  );
}

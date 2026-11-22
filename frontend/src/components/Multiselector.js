import React, { useState } from "react";
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormControl,
  FormLabel,
} from "@mui/material";

const MultiSelectCheckbox = (options, selectedOptions, setSelectedOptions) => {
//   const [selectedOptions, setSelectedOptions] = useState([]);

//   const options = ["Option 1", "Option 2", "Option 3", "Option 4"];

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    if (checked) {
      setSelectedOptions((prev) => [...prev, name]);
    } else {
      setSelectedOptions((prev) => prev.filter((option) => option !== name));
    }
  };

  return (
    <FormControl component="fieldset">
      <FormLabel component="legend">Select Options</FormLabel>
      <FormGroup>
        {options.map((option) => (
          <FormControlLabel
            key={option}
            control={
              <Checkbox
                checked={selectedOptions.includes(option)}
                onChange={handleCheckboxChange}
                name={option}
              />
            }
            label={option}
          />
        ))}
      </FormGroup>
    </FormControl>
  );
};

export default MultiSelectCheckbox;

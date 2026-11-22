import React from "react"; 
import { Select, FormControl, Box, MenuItem, ListItemText } from "@mui/material"; 

export default function DashboardFilter({ duration, setDuration }) {   
  const DashboardFilters = [     
    { name: "last 3 months", duration: 3 },     
    { name: "last 6 months", duration: 6 },     
    { name: "last year", duration: 12 },   
  ]; 

  return (     
    <Box>         
      <FormControl           
        sx={{             
          minWidth: 154,             
          height: 45,             
          margin: "0px 5px",             
          borderColor: "#B0D9C3",           
        }}         
      >           
        <Select             
          value={duration}   
          defaultValue={12}          
          onChange={(e) => setDuration(e.target.value)}             
          sx={{               
            color: "#049A77",               
            backgroundColor: "#ffffff",               
            p: 2,               
            border: "0.1px solid #B0D9C3",             
          }}           
        >             
          {DashboardFilters.map((item) => (               
            <MenuItem key={item.duration} value={item.duration}>                 
              <ListItemText               
                primary={item.name}                 
                sx={{                   
                  color: "#049A77",                   
                  borderColor: duration === item.duration ? "#049A77" : "transparent",                   
                  marginTop: "5px",                 
                }}                 
              />               
            </MenuItem>             
          ))}           
        </Select>         
      </FormControl>       
    </Box>     
  ); 
}

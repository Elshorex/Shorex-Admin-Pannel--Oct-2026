import axios from "axios";
export const baseURL = {
  dev:"https://www.coffee-hi.com/shx/",
  UAT:"https://www.coffee-hi.com/final-shx/",
  // PRO:"https://admin.shorex.app/shorex-Backend/"
  // PRO:"http://localhost:3001/",
  // PRO:"http://localhost:3000/",
  // PRO:"https://hr2pqgcg-3000.asse.devtunnels.ms/",
  // PRO:"https://p6qvgvwh-3000.asse.devtunnels.ms/",
  PRO:"https://backend.shorexapp.cloud/",
  // PRO:"https://tc7gprgl-3001.asse.devtunnels.ms/"
  // PRO:"https://shorex-backend.vercel.app/"
} ;

export default axios.create({
  baseURL: baseURL.PRO
});


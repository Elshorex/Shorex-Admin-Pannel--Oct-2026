
// import { getDocument } from "pdfjs-dist/legacy/build/pdf.js";

// export const extractPdfPlaceholders = async (req, res) => {
//   try {
//     const templatePath = path.join(__dirname, "src", "templates", "contract.pdf");
//     if (!fs.existsSync(templatePath)) {
//       return res.status(404).json({ error: "Template PDF not found" });
//     }

//     const templateBuffer = fs.readFileSync(templatePath);
//     const templateBytes = new Uint8Array(templateBuffer);

//     const loadingTask = getDocument({ data: templateBytes });
//     const pdf = await loadingTask.promise;
//     const page = await pdf.getPage(1);
//     const textContent = await page.getTextContent();

//     const mergedItems = [];
//     let currentLine = [];
//     let lastY = null;

//     // group items by line (approximate by Y coordinate)
//     for (const item of textContent.items) {
//       const [a, b, c, d, x, y] = item.transform;
//       if (lastY === null || Math.abs(lastY - y) < 3) {
//         currentLine.push(item);
//         lastY = y;
//       } else {
//         mergedItems.push(currentLine);
//         currentLine = [item];
//         lastY = y;
//       }
//     }
//     if (currentLine.length) mergedItems.push(currentLine);

//     const placeholders = [];

//     mergedItems.forEach((line) => {
//       const fullLine = line.map((i) => i.str).join("");
//       const match = fullLine.match(/{{\s*[\w.]+\s*}}/g);
//       if (match) {
//         match.forEach((placeholder) => {
//           // find first fragment where placeholder starts
//           const found = line.find((i) => fullLine.includes(placeholder));
//           if (found) {
//             const [a, b, c, d, x, y] = found.transform;
//             placeholders.push({
//               placeholder,
//               coordinates: { x, y },
//               rawTransform: found.transform,
//             });
//           }
//         });
//       }
//     });

//     console.table(
//       placeholders.map((p) => ({
//         placeholder: p.placeholder,
//         x: Math.round(p.coordinates.x),
//         y: Math.round(p.coordinates.y),
//       }))
//     );

//     return placeholders;
//   } catch (err) {
//     console.error("Placeholder extraction error:", err);
//     res.status(500).json({ error: err.message });
//   }
// };




// const extractPdfPlaceholders = async (templatePath) => {
//   try {
//     if (!fs.existsSync(templatePath)) {
//       throw new Error("Template PDF not found");
//     }  

//     const templateBuffer = fs.readFileSync(templatePath);
//     const templateBytes = new Uint8Array(templateBuffer);

//     const loadingTask = getDocument({ data: templateBytes });
//     const pdf = await loadingTask.promise;
//     const page = await pdf.getPage(1);
//     const textContent = await page.getTextContent();

//     const mergedItems = [];
//     let currentLine = [];
//     let lastY = null;

//     // ✅ Group text fragments by line
//     for (const item of textContent.items) {
//       const [a, b, c, d, x, y] = item.transform;

//       if (lastY === null || Math.abs(lastY - y) < 2.5) {
//         currentLine.push(item);
//         lastY = y;
//       } else {
//         mergedItems.push(currentLine);
//         currentLine = [item];
//         lastY = y;
//       }
//     }
//     if (currentLine.length) mergedItems.push(currentLine);

//     const placeholders = [];

//     mergedItems.forEach((line) => {
//       const lineText = line.map(i => i.str).join("");
//       const found = lineText.match(/{{\s*[\w.]+\s*}}/g);
//       if (found) {
//         found.forEach((placeholder) => {
//           const item = line.find(i => lineText.includes(placeholder));
//           if (item) {
//             const [a, b, c, d, x, y] = item.transform;
//             placeholders.push({
//               placeholder,
//               x: Math.round(x),
//               y: Math.round(y)
//             });
//           }
//         });
//       }
//     });

//     console.log("✅ PLACEHOLDERS FOUND:");
//     console.table(placeholders);

//     return placeholders;
//   } catch (err) {
//     console.error("extractPdfPlaceholders() Error:", err);
//     return [];
//   }
// };
import fs from "fs";
import path from "path";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { checkExistThenGet } from "../../helpers/CheckMethods.js";
import Request from "../../models/request.model/request.model.js";
import userModel from "../../models/user.model/user.model.js";

const __dirname = path.resolve();
let populateQuery = [
  { path: "provider", model: "user" },
  { path: "driver", model: "user" },
  { path: "storeKeeper", model: "user" }, // ✅ add this
  { path: "createdBy", model: "user" },
  { path: "vehicle", model: "vehicle" },
  {
    path: "customer",
    model: "user",
    populate: [
      { path: "country", model: "country" },
      { path: "region", model: "region" },
      { path: "city", model: "city" },
      { path: "areas", model: "area" },
    ],
  },
  { path: "warehouse", model: "warehouse" },
  { path: "product", model: "product" },
  // { path: "rewardedProducts", model: "rewardedProduct" },
  {
    path: "rewardedProducts",
    populate: { path: "product", model: "rewardedProduct" }, // ✅ Correct nesting
  },
  { path: "country", model: "country" },
  { path: "region", model: "region" },
  { path: "city", model: "city" },
  { path: "areas", model: "area" },
];

export const fillPdfTemplate = async (req, res) => {
  try {
    const { requestId } = req.body;

    // ✅ Fetch request data
    const request = await checkExistThenGet(requestId, Request, {
      deleted: false,
      populate: populateQuery,
    });

    // ✅ Load PDF template
    const templatePath = path.join(__dirname, "src", "templates", "RequestHistoryPDF.pdf");
    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({ error: "Template PDF not found" });
    }

    const templateBuffer = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(templateBuffer);
    const firstPage = pdfDoc.getPages()[0];
    const font = await pdfDoc.embedFont(StandardFonts.Courier);
    const fontSize = 10;

    // ✅ Hardcoded text coordinates
    const positions = {
      orderNo: { x: 77, y: 570 },
      customerId: { x: 77, y: 537 },
      customerName: { x: 77, y: 499 },
      customerAddress: { x: 77, y: 470 },
      quantity: { x: 77, y: 356 },
      gainedPoints: { x: 387, y: 323 },
      returnableValue: { x: 378, y: 266 },
      driverNote: { x: 77, y: 153 },
      dateTime: { x: 77, y: 98 },
    };

    // ✅ Helper to draw text
    const writeText = (key, value, offsetX = 0, offsetY = 0) => {
      const coords = positions[key];
      if (!coords || !value) return;
      firstPage.drawText(String(value), {
        x: coords.x + offsetX,
        y: coords.y + offsetY,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
    };

    // ✅ Format Date
    const date = request.completedDate || new Date();
    const formatted =
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0") +
      " " +
      String(date.getHours()).padStart(2, "0") +
      ":" +
      String(date.getMinutes()).padStart(2, "0");

    // ✅ Write fields
    writeText("orderNo", request.requestId, 250, 3);
    writeText("customerId", request.customer._id || "", 150, 3);
    writeText("customerName", request.customer.name || "", 70, 3);
    writeText("customerAddress", request.customer.location || "", 30, 3);
    writeText("quantity", request.quantity || 0, 320, 3);
    writeText("gainedPoints", request.gainedPoints || 0, 0, 3);
    writeText("returnableValue", request.rewardSum || "", 0, 3);
    writeText("driverNote", request.note || "", 50, 3);
    writeText("dateTime", formatted, 150, 3);

    // ✅ Save PDF (to /tmp only)
    const pdfBytes = await pdfDoc.save();
    const outputPath = path.join("/tmp", "filled-contract.pdf");
    fs.writeFileSync(outputPath, pdfBytes);

    res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="filled-contract.pdf"',
      "Content-Length": pdfBytes.length,
    });
    res.end(Buffer.from(pdfBytes));

  } catch (err) {
    console.error("PDF Generation Error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const PdfCertificateTemplate = async (req, res) => {


  try {
    let userId = req.user._id;
    const user = await checkExistThenGet(userId, userModel, {deleted: false});
    // ✅ Load PDF template
    const templatePath = path.join(__dirname, "src", "templates", "shorexCertificate.pdf");
    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({ error: "Template PDF not found" });
    }

    const templateBuffer = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(templateBuffer);
    const firstPage = pdfDoc.getPages()[0];
    const font = await pdfDoc.embedFont(StandardFonts.Courier);
    const fontSize = 10;

    // ✅ Hardcoded text coordinates
    const positions = {
      businessName: { x: 108, y: 628 },
      name: { x: 108, y: 614 },
      lastName: { x: 108, y: 600 },
      licenseNumber: { x: 108, y: 586 },
      referenceNumber: { x: 99, y: 386 },
    };

    // ✅ Helper to draw text
    const writeText = (key, value, offsetX = 0, offsetY = 0) => {
      const coords = positions[key];
      if (!coords || !value) return;
      firstPage.drawText(String(value), {
        x: coords.x + offsetX,
        y: coords.y + offsetY,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
    };

    // ✅ Format Date
    const date = user.createdAt || new Date();
    // ✅ Write fields
    writeText("businessName", user.bussinessName, 70, 1);
    writeText("name", user.name || "", 50, 1);
    writeText("lastName", "Last Name", 50, 1);
    writeText("licenseNumber", user.licenceNumber || "", 100, 1);
    writeText("referenceNumber",   
      String(date.getDate()).padStart(2, "0")  + 
      String(date.getMonth() + 1).padStart(2, "0")  + 
      date.getFullYear()  +  user._id || 0, 20, 3);
   
    // ✅ Save PDF (to /tmp only)
    const pdfBytes = await pdfDoc.save();
    const outputPath = path.join("/tmp", "filled-shorexCertificate.pdf");
    fs.writeFileSync(outputPath, pdfBytes);

    res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="filled-shorexCertificate.pdf"',
      "Content-Length": pdfBytes.length,
    });
    res.end(Buffer.from(pdfBytes));

  } catch (err) {
    console.error("PDF Generation Error:", err);
    res.status(500).json({ error: err.message });
  }

};


export const PdfContractTemplate = async (req, res) => {


  try {
    let userId = req.user._id;
    const user = await checkExistThenGet(userId, userModel, {deleted: false});
    // ✅ Load PDF template
    const templatePath = path.join(__dirname, "src", "templates", "contract.pdf");
    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({ error: "Template PDF not found" });
    }

    const templateBuffer = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(templateBuffer);
    const firstPage = pdfDoc.getPages()[0];
    const font = await pdfDoc.embedFont(StandardFonts.Courier);
    const fontSize = 10;

    
    // ✅ Hardcoded text coordinates
    const positions = {
      businessName: { x: 77, y: 574 },
      firstName1: { x: 113, y: 280 },
      firstName: { x: 315, y: 574 },
      address1: { x: 113, y: 255 },
      address: { x: 313, y: 564  },
      licenseNumber: { x: 120, y: 562 },
      date: { x: 435, y: 300 },
    };

    // ✅ Helper to draw text
    const writeText = (key, value, offsetX = 0, offsetY = 0) => {
      const coords = positions[key];
      if (!coords || !value) return;
      firstPage.drawText(String(value), {
        x: coords.x + offsetX,
        y: coords.y + offsetY,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
    };

    // ✅ Format Date
     const date = user.createdAt || new Date();

    // ✅ Write fields
    writeText("businessName", user.bussinessName, 0, 1);
    writeText("firstName1", user.name  || "", 0, 1);
    writeText("firstName", user.name  || "", 0, 1);
    writeText("address1", user.location || "", 0, 1);
    writeText("address", user.location, 0, 1);
    writeText("licenseNumber",user.licenceNumber|| "", 0, 1);
    writeText("date",   
      String(date.getDate()).padStart(2, "0")  + "-"+
      String(date.getMonth() + 1).padStart(2, "0")  + "-" +
      date.getFullYear(),0,1);

   
    // ✅ Save PDF (to /tmp only)
    const pdfBytes = await pdfDoc.save();
    const outputPath = path.join("/tmp", "filled-contract.pdf");
    fs.writeFileSync(outputPath, pdfBytes);

    res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="filled-contract.pdf"',
      "Content-Length": pdfBytes.length,
    });
    res.end(Buffer.from(pdfBytes));

  } catch (err) {
    console.error("PDF Generation Error:", err);
    res.status(500).json({ error: err.message });
  }

};



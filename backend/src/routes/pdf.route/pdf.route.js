import express from "express";
import { requireAuth } from "../../services/passport.js";
import {fillPdfTemplate, PdfCertificateTemplate, PdfContractTemplate} from "../../controllers/pdf.controller/pdf.controller.js";

const router = express.Router();

// POST /api/document/generate
// router.post("/generate",requireAuth,pdf.validateGeneratePDF(),pdf.generateDocument);
router.post("/generate",requireAuth,fillPdfTemplate);
router.post("/certificate",requireAuth,PdfCertificateTemplate);
router.post("/contract",requireAuth,PdfContractTemplate);

export default router;

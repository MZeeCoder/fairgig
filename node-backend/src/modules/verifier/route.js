import express from 'express';
import VerifierController from './controller.js';
const router = express.Router();

// 1. GET all pending shifts
router.get('/shifts/pending', VerifierController.fetchPending);

// 2. GET all history (non-pending) shifts
router.get('/shifts/history', VerifierController.fetchHistory);

// 3. PATCH (Update) the status of a shift
router.patch('/shifts/:id/status', VerifierController.updateStatus);

export default router;
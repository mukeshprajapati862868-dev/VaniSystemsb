const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const candidateController = require('../controllers/candidateController');

const router = express.Router();

// Ensure upload folder exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'candidates');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const safeName = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
    cb(null, safeName);
  }
});

const upload = multer({ storage })

// POST /api/candidates/register
router.post('/register', upload.single('image'), [
  body('applicantName').trim().notEmpty().withMessage('Applicant name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('mobile').matches(/^[0-9]{10}$/).withMessage('Valid 10-digit mobile number is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  candidateController.registerCandidate(req, res);
});

// GET /api/candidates
router.get('/', (req, res) => {
  candidateController.getCandidates(req, res);
});

// DELETE /api/candidates/:id
router.delete('/:id', (req, res) => {
  candidateController.deleteCandidate(req, res);
});

// PUT /api/candidates/:id/payment-status
router.put('/:id/payment-status', [
  body('paymentStatus').trim().notEmpty().withMessage('Payment status is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  candidateController.updatePaymentStatus(req, res);
});

module.exports = router;

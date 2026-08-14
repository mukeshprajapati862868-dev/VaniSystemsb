const express = require('express');
const {
  body,
  validationResult
} = require('express-validator');

const candidateController = require('../controllers/candidateController');

const router = express.Router();

// ======================================================
// POST /api/candidates/register
// ======================================================

router.post(
  '/register',

  [
    body('applicantName')
      .trim()
      .notEmpty()
      .withMessage('Applicant name is required'),

    body('email')
      .trim()
      .isEmail()
      .withMessage('Valid email is required'),

    body('mobile')
      .trim()
      .matches(/^[0-9]{10}$/)
      .withMessage(
        'Valid 10-digit mobile number is required'
      )
  ],

  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      return await candidateController.registerCandidate(
        req,
        res
      );

    } catch (error) {
      console.error(
        'Candidate registration route error:',
        error
      );

      return res.status(500).json({
        success: false,
        error:
          error.message ||
          'Candidate registration failed'
      });
    }
  }
);

// ======================================================
// GET /api/candidates
// ======================================================

router.get(
  '/',
  async (req, res) => {
    try {
      return await candidateController.getCandidates(
        req,
        res
      );
    } catch (error) {
      console.error(
        'Get candidates route error:',
        error
      );

      return res.status(500).json({
        success: false,
        error:
          error.message ||
          'Unable to get candidates'
      });
    }
  }
);

// ======================================================
// DELETE /api/candidates/:id
// ======================================================

router.delete(
  '/:id',
  async (req, res) => {
    try {
      return await candidateController.deleteCandidate(
        req,
        res
      );
    } catch (error) {
      console.error(
        'Delete candidate route error:',
        error
      );

      return res.status(500).json({
        success: false,
        error:
          error.message ||
          'Unable to delete candidate'
      });
    }
  }
);

// ======================================================
// PUT /api/candidates/:id/payment-status
// ======================================================

router.put(
  '/:id/payment-status',

  [
    body('paymentStatus')
      .trim()
      .notEmpty()
      .withMessage(
        'Payment status is required'
      )
  ],

  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      return await candidateController.updatePaymentStatus(
        req,
        res
      );

    } catch (error) {
      console.error(
        'Update payment status route error:',
        error
      );

      return res.status(500).json({
        success: false,
        error:
          error.message ||
          'Unable to update payment status'
      });
    }
  }
);

module.exports = router;

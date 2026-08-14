const Candidate = require('../models/Candidate');

// ======================================================
// REGISTER CANDIDATE
// POST /api/candidates/register
// ======================================================

exports.registerCandidate = async (req, res) => {
  try {
    console.log(
      '======================================'
    );

    console.log(
      'CANDIDATE REGISTRATION REQUEST'
    );

    console.log(
      '======================================'
    );

    const body = req.body || {};

    const candidatePayload = {
      candidateId: body.candidateId,

      applyFor: body.applyFor,

      applicantName: body.applicantName,

      fatherName: body.fatherName,

      motherName: body.motherName,

      dob: body.dob,

      gender: body.gender,

      caste: body.caste,

      mobile: body.mobile,

      aadhar: body.aadhar,

      email: body.email,

      country:
        body.country || 'India',

      state: body.state,

      city: body.city,

      address: body.address,

      pinCode: body.pinCode,

      qualification: body.qualification,

      status:
        body.status || 'Registered',

      paymentStatus:
        body.paymentStatus || 'Pending',

      registrationDate:
        body.registrationDate ||
        new Date().toISOString(),

      registrationNo:
        body.registrationNo
    };

    // ==================================================
    // REQUIRED FIELD CHECK
    // ==================================================

    if (
      !candidatePayload.applicantName ||
      !candidatePayload.email ||
      !candidatePayload.mobile
    ) {
      return res.status(400).json({
        success: false,
        error:
          'Applicant name, email and mobile are required'
      });
    }

    // ==================================================
    // NORMALIZE EMAIL
    // ==================================================

    candidatePayload.email =
      String(candidatePayload.email)
        .trim()
        .toLowerCase();

    // ==================================================
    // CHECK EXISTING EMAIL
    // ==================================================

    const exists =
      await Candidate.findOne({
        email: candidatePayload.email
      });

    if (exists) {
      return res.status(400).json({
        success: false,
        error:
          'Candidate already registered with this email'
      });
    }

    // ==================================================
    // GENERATE UNIQUE REGISTRATION NUMBER
    // ==================================================

    let registrationNumber =
      candidatePayload.registrationNo;

    if (!registrationNumber) {
      registrationNumber =
        `DCPU/${new Date().getFullYear()}/${Date.now()
          .toString()
          .slice(-6)}`;
    }

    // ==================================================
    // CHECK REGISTRATION NUMBER
    // ==================================================

    const registrationExists =
      await Candidate.findOne({
        registrationNumber
      });

    if (registrationExists) {
      registrationNumber =
        `DCPU/${new Date().getFullYear()}/${Date.now()}`;
    }

    candidatePayload.registrationNumber =
      registrationNumber;

    // ==================================================
    // REGISTRATION NO
    // ==================================================

    if (
      !candidatePayload.registrationNo
    ) {
      candidatePayload.registrationNo =
        registrationNumber;
    }

    // ==================================================
    // CREATE CANDIDATE
    // ==================================================

    const candidate =
      await Candidate.create(
        candidatePayload
      );

    console.log(
      'Candidate registered successfully:',
      candidate._id
    );

    // ==================================================
    // SUCCESS
    // ==================================================

    return res.status(201).json({
      success: true,

      message:
        'Candidate registered successfully',

      data: candidate
    });

  } catch (error) {

    console.error(
      '======================================'
    );

    console.error(
      'CANDIDATE REGISTER ERROR'
    );

    console.error(
      error
    );

    console.error(
      error.stack
    );

    console.error(
      '======================================'
    );

    // ==================================================
    // DUPLICATE KEY
    // ==================================================

    if (error.code === 11000) {

      const duplicateField =
        Object.keys(
          error.keyPattern || {}
        )[0] || 'registrationNumber';

      return res.status(400).json({
        success: false,
        error:
          `${duplicateField} already exists`
      });
    }

    return res.status(500).json({
      success: false,
      error:
        error.message ||
        'Candidate registration failed'
    });
  }
};

// ======================================================
// GET ALL CANDIDATES
// GET /api/candidates
// ======================================================

exports.getCandidates = async (
  req,
  res
) => {
  try {

    const candidates =
      await Candidate
        .find()
        .sort({
          createdAt: -1
        });

    return res.status(200).json({
      success: true,
      count: candidates.length,
      data: candidates
    });

  } catch (error) {

    console.error(
      'Get candidates error:',
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error.message ||
        'Unable to get candidates'
    });
  }
};

// ======================================================
// DELETE CANDIDATE
// DELETE /api/candidates/:id
// ======================================================

exports.deleteCandidate = async (
  req,
  res
) => {
  try {

    const candidate =
      await Candidate.findByIdAndDelete(
        req.params.id
      );

    if (!candidate) {
      return res.status(404).json({
        success: false,
        error:
          'Candidate not found'
      });
    }

    return res.status(200).json({
      success: true,
      message:
        'Candidate deleted successfully'
    });

  } catch (error) {

    console.error(
      'Delete candidate error:',
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error.message ||
        'Unable to delete candidate'
    });
  }
};

// ======================================================
// UPDATE PAYMENT STATUS
// PUT /api/candidates/:id/payment-status
// ======================================================

exports.updatePaymentStatus = async (
  req,
  res
) => {
  try {

    const candidate =
      await Candidate.findById(
        req.params.id
      );

    if (!candidate) {
      return res.status(404).json({
        success: false,
        error:
          'Candidate not found'
      });
    }

    const {
      paymentStatus
    } = req.body || {};

    if (!paymentStatus) {
      return res.status(400).json({
        success: false,
        error:
          'Payment status is required'
      });
    }

    candidate.paymentStatus =
      paymentStatus;

    await candidate.save();

    return res.status(200).json({
      success: true,
      message:
        'Payment status updated successfully',
      data: candidate
    });

  } catch (error) {

    console.error(
      'Update candidate payment status error:',
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error.message ||
        'Unable to update payment status'
    });
  }
};

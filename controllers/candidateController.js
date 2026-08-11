const Candidate = require('../models/Candidate');

// Register a new candidate
exports.registerCandidate = async (req, res) => {
  try {
    const candidatePayload = {
      candidateId: req.body.candidateId,
      applyFor: req.body.applyFor,
      applicantName: req.body.applicantName,
      fatherName: req.body.fatherName,
      motherName: req.body.motherName,
      dob: req.body.dob,
      gender: req.body.gender,
      caste: req.body.caste,
      mobile: req.body.mobile,
      aadhar: req.body.aadhar,
      email: req.body.email,
      country: req.body.country || 'India',
      state: req.body.state,
      city: req.body.city,
      address: req.body.address,
      pinCode: req.body.pinCode,
      qualification: req.body.qualification,
      status: req.body.status || 'Registered',
      paymentStatus: req.body.paymentStatus || 'Pending',
      registrationDate: req.body.registrationDate || new Date().toISOString(),
      registrationNo: req.body.registrationNo,
    };

    if (!candidatePayload.email || !candidatePayload.mobile || !candidatePayload.applicantName) {
      return res.status(400).json({ success: false, error: 'Applicant name, email and mobile are required' });
    }

    // Prevent duplicate email registrations
    const exists = await Candidate.findOne({ email: candidatePayload.email });
    if (exists) {
      return res.status(400).json({ success: false, error: 'Candidate already registered with this email' });
    }

    // Generate a unique registration number if not provided
    const registrationNumber = candidatePayload.registrationNumber || `DCPU/${new Date().getFullYear()}/${Date.now().toString().slice(-6)}`;
    candidatePayload.registrationNumber = registrationNumber;
    if (!candidatePayload.registrationNo) {
      candidatePayload.registrationNo = registrationNumber;
    }

    if (req.file) {
      candidatePayload.image = {
        path: `/uploads/candidates/${req.file.filename}`,
        filename: req.file.filename
      };
    }

    const candidate = await Candidate.create(candidatePayload);

    res.status(201).json({ success: true, message: 'Candidate registered', data: candidate });
  } catch (error) {
    console.error('Candidate register error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: candidates });
  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);
    if (!candidate) {
      return res.status(404).json({ success: false, error: 'Candidate not found' });
    }
    res.status(200).json({ success: true, message: 'Candidate deleted' });
  } catch (error) {
    console.error('Delete candidate error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ success: false, error: 'Candidate not found' });
    }
    const { paymentStatus } = req.body;
    candidate.paymentStatus = paymentStatus || candidate.paymentStatus;
    await candidate.save();
    res.status(200).json({ success: true, data: candidate });
  } catch (error) {
    console.error('Update candidate payment status error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

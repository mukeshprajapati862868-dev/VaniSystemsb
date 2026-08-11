const mongoose = require('mongoose');

const CandidateSchema = new mongoose.Schema({
  candidateId: { type: String, trim: true },
  registrationNumber: { type: String, required: true, unique: true, trim: true },
  registrationNo: { type: String, trim: true },
  applyFor: { type: String, trim: true },
  applicantName: { type: String, trim: true },
  fatherName: { type: String, trim: true },
  motherName: { type: String, trim: true },
  dob: { type: String, trim: true },
  gender: { type: String, trim: true },
  caste: { type: String, trim: true },
  mobile: { type: String, trim: true },
  aadhar: { type: String, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  country: { type: String, trim: true, default: 'India' },
  state: { type: String, trim: true },
  city: { type: String, trim: true },
  address: { type: String, trim: true },
  pinCode: { type: String, trim: true },
  qualification: { type: String, trim: true },
  status: { type: String, trim: true, default: 'Registered' },
  paymentStatus: { type: String, trim: true, default: 'Pending' },
  image: {
    path: { type: String },
    filename: { type: String }
  },
  registrationDate: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Candidate', CandidateSchema);

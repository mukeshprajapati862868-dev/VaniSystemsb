// // const Candidate = require('../models/Candidate');

// // // Register a new candidate
// // exports.registerCandidate = async (req, res) => {
// //   try {
// //     const candidatePayload = {
// //       candidateId: req.body.candidateId,
// //       applyFor: req.body.applyFor,
// //       applicantName: req.body.applicantName,
// //       fatherName: req.body.fatherName,
// //       motherName: req.body.motherName,
// //       dob: req.body.dob,
// //       gender: req.body.gender,
// //       caste: req.body.caste,
// //       mobile: req.body.mobile,
// //       aadhar: req.body.aadhar,
// //       email: req.body.email,
// //       country: req.body.country || 'India',
// //       state: req.body.state,
// //       city: req.body.city,
// //       address: req.body.address,
// //       pinCode: req.body.pinCode,
// //       qualification: req.body.qualification,
// //       status: req.body.status || 'Registered',
// //       paymentStatus: req.body.paymentStatus || 'Pending',
// //       registrationDate: req.body.registrationDate || new Date().toISOString(),
// //       registrationNo: req.body.registrationNo,
// //     };

// //     if (!candidatePayload.email || !candidatePayload.mobile || !candidatePayload.applicantName) {
// //       return res.status(400).json({ success: false, error: 'Applicant name, email and mobile are required' });
// //     }

// //     // Prevent duplicate email registrations
// //     const exists = await Candidate.findOne({ email: candidatePayload.email });
// //     if (exists) {
// //       return res.status(400).json({ success: false, error: 'Candidate already registered with this email' });
// //     }

// //     // Generate a unique registration number if not provided
// //     const registrationNumber = candidatePayload.registrationNumber || `DCPU/${new Date().getFullYear()}/${Date.now().toString().slice(-6)}`;
// //     candidatePayload.registrationNumber = registrationNumber;
// //     if (!candidatePayload.registrationNo) {
// //       candidatePayload.registrationNo = registrationNumber;
// //     }

// //     if (req.file) {
// //       candidatePayload.image = {
// //         path: `/uploads/candidates/${req.file.filename}`,
// //         filename: req.file.filename
// //       };
// //     }

// //     const candidate = await Candidate.create(candidatePayload);

// //     res.status(201).json({ success: true, message: 'Candidate registered', data: candidate });
// //   } catch (error) {
// //     console.error('Candidate register error:', error);
// //     res.status(500).json({ success: false, error: 'Server error' });
// //   }
// // };

// // exports.getCandidates = async (req, res) => {
// //   try {
// //     const candidates = await Candidate.find().sort({ createdAt: -1 });
// //     res.status(200).json({ success: true, data: candidates });
// //   } catch (error) {
// //     console.error('Get candidates error:', error);
// //     res.status(500).json({ success: false, error: 'Server error' });
// //   }
// // };

// // exports.deleteCandidate = async (req, res) => {
// //   try {
// //     const candidate = await Candidate.findByIdAndDelete(req.params.id);
// //     if (!candidate) {
// //       return res.status(404).json({ success: false, error: 'Candidate not found' });
// //     }
// //     res.status(200).json({ success: true, message: 'Candidate deleted' });
// //   } catch (error) {
// //     console.error('Delete candidate error:', error);
// //     res.status(500).json({ success: false, error: 'Server error' });
// //   }
// // };

// // exports.updatePaymentStatus = async (req, res) => {
// //   try {
// //     const candidate = await Candidate.findById(req.params.id);
// //     if (!candidate) {
// //       return res.status(404).json({ success: false, error: 'Candidate not found' });
// //     }
// //     const { paymentStatus } = req.body;
// //     candidate.paymentStatus = paymentStatus || candidate.paymentStatus;
// //     await candidate.save();
// //     res.status(200).json({ success: true, data: candidate });
// //   } catch (error) {
// //     console.error('Update candidate payment status error:', error);
// //     res.status(500).json({ success: false, error: 'Server error' });
// //   }
// // };

// const Candidate = require("../models/Candidate");

// // ======================================================
// // GENERATE UNIQUE VSPL REGISTRATION NUMBER
// // FORMAT:
// // VSPL123456
// // ======================================================

// const generateUniqueRegistrationNumber =
//   async () => {
//     let registrationNumber;
//     let exists = true;

//     while (exists) {
//       const randomNumber =
//         Math.floor(
//           100000 +
//             Math.random() * 900000
//         ).toString();

//       registrationNumber =
//         `VSPL${randomNumber}`;

//       exists =
//         await Candidate.exists({
//           registrationNumber,
//         });
//     }

//     return registrationNumber;
//   };

// // ======================================================
// // REGISTER NEW CANDIDATE
// // ======================================================

// exports.registerCandidate =
//   async (req, res) => {
//     try {
//       // ==================================================
//       // GENERATE REGISTRATION NUMBER
//       // ==================================================

//       const registrationNumber =
//         await generateUniqueRegistrationNumber();

//       // ==================================================
//       // GENERATE CANDIDATE ID
//       // ==================================================

//       const candidateId =
//         req.body.candidateId ||
//         `CAND-${Date.now()}-${Math.floor(
//           1000 +
//             Math.random() * 9000
//         )}`;

//       // ==================================================
//       // COMPLETE CANDIDATE PAYLOAD
//       // ==================================================

//       const candidatePayload = {
//         candidateId,

//         registrationNumber,

//         registrationNo:
//           registrationNumber,

//         applyFor:
//           req.body.applyFor,

//         applicantName:
//           req.body.applicantName,

//         fatherName:
//           req.body.fatherName,

//         motherName:
//           req.body.motherName,

//         dob:
//           req.body.dob,

//         gender:
//           req.body.gender,

//         caste:
//           req.body.caste,

//         mobile:
//           req.body.mobile,

//         aadhar:
//           req.body.aadhar,

//         email:
//           req.body.email
//             ?.trim()
//             .toLowerCase(),

//         country:
//           req.body.country ||
//           "India",

//         state:
//           req.body.state,

//         city:
//           req.body.city,

//         address:
//           req.body.address,

//         pinCode:
//           req.body.pinCode,

//         qualification:
//           req.body.qualification,

//         status:
//           req.body.status ||
//           "Registered",

//         paymentStatus:
//           "Pending",

//         registrationDate:
//           req.body.registrationDate ||
//           new Date().toISOString(),
//       };

//       // ==================================================
//       // REQUIRED VALIDATION
//       // ==================================================

//       if (
//         !candidatePayload.email ||
//         !candidatePayload.mobile ||
//         !candidatePayload.applicantName
//       ) {
//         return res.status(400).json({
//           success: false,
//           error:
//             "Applicant name, email and mobile are required",
//         });
//       }

//       // ==================================================
//       // DUPLICATE EMAIL CHECK
//       // ==================================================

//       const exists =
//         await Candidate.findOne({
//           email:
//             candidatePayload.email,
//         });

//       if (exists) {
//         return res.status(400).json({
//           success: false,
//           error:
//             "Candidate already registered with this email",
//         });
//       }

//       // ==================================================
//       // IMAGE
//       // ==================================================

//       if (req.file) {
//         candidatePayload.image = {
//           path: `/uploads/candidates/${req.file.filename}`,
//           filename:
//             req.file.filename,
//         };
//       }

//       // ==================================================
//       // CREATE CANDIDATE
//       // ==================================================

//       const candidate =
//         await Candidate.create(
//           candidatePayload
//         );

//       // ==================================================
//       // SUCCESS RESPONSE
//       // ==================================================

//       return res.status(201).json({
//         success: true,

//         message:
//           "Candidate registered successfully",

//         data: candidate,
//       });
//     } catch (error) {
//       console.error(
//         "Candidate register error:",
//         error
//       );

//       // ==================================================
//       // DUPLICATE REGISTRATION NUMBER
//       // ==================================================

//       if (
//         error.code === 11000
//       ) {
//         return res.status(409).json({
//           success: false,
//           error:
//             "Registration number already exists. Please try again.",
//         });
//       }

//       return res.status(500).json({
//         success: false,
//         error:
//           "Server error",
//       });
//     }
//   };

// // ======================================================
// // GET ALL CANDIDATES
// // ======================================================

// exports.getCandidates =
//   async (req, res) => {
//     try {
//       const candidates =
//         await Candidate.find()
//           .sort({
//             createdAt: -1,
//           });

//       return res.status(200).json({
//         success: true,
//         data: candidates,
//       });
//     } catch (error) {
//       console.error(
//         "Get candidates error:",
//         error
//       );

//       return res.status(500).json({
//         success: false,
//         error:
//           "Server error",
//       });
//     }
//   };

// // ======================================================
// // GET CANDIDATE BY REGISTRATION NUMBER
// // ======================================================

// exports.getCandidateByRegistrationNumber =
//   async (req, res) => {
//     try {
//       const registrationNumber =
//         String(
//           req.params.registrationNumber ||
//             ""
//         )
//           .trim()
//           .toUpperCase();

//       if (!registrationNumber) {
//         return res.status(400).json({
//           success: false,
//           error:
//             "Registration number is required",
//         });
//       }

//       const candidate =
//         await Candidate.findOne({
//           $or: [
//             {
//               registrationNumber,
//             },
//             {
//               registrationNo:
//                 registrationNumber,
//             },
//           ],
//         });

//       if (!candidate) {
//         return res.status(404).json({
//           success: false,
//           error:
//             "Candidate not found",
//         });
//       }

//       return res.status(200).json({
//         success: true,
//         data: candidate,
//       });
//     } catch (error) {
//       console.error(
//         "Get candidate by registration number error:",
//         error
//       );

//       return res.status(500).json({
//         success: false,
//         error:
//           "Server error",
//       });
//     }
//   };

// // ======================================================
// // DELETE CANDIDATE
// // ======================================================

// exports.deleteCandidate =
//   async (req, res) => {
//     try {
//       const candidate =
//         await Candidate.findByIdAndDelete(
//           req.params.id
//         );

//       if (!candidate) {
//         return res.status(404).json({
//           success: false,
//           error:
//             "Candidate not found",
//         });
//       }

//       return res.status(200).json({
//         success: true,
//         message:
//           "Candidate deleted",
//       });
//     } catch (error) {
//       console.error(
//         "Delete candidate error:",
//         error
//       );

//       return res.status(500).json({
//         success: false,
//         error:
//           "Server error",
//       });
//     }
//   };

// // ======================================================
// // UPDATE PAYMENT STATUS
// // ======================================================

// exports.updatePaymentStatus =
//   async (req, res) => {
//     try {
//       const candidate =
//         await Candidate.findById(
//           req.params.id
//         );

//       if (!candidate) {
//         return res.status(404).json({
//           success: false,
//           error:
//             "Candidate not found",
//         });
//       }

//       const {
//         paymentStatus,
//       } = req.body;

//       if (
//         !paymentStatus
//       ) {
//         return res.status(400).json({
//           success: false,
//           error:
//             "Payment status is required",
//         });
//       }

//       candidate.paymentStatus =
//         paymentStatus;

//       await candidate.save();

//       return res.status(200).json({
//         success: true,
//         data: candidate,
//       });
//     } catch (error) {
//       console.error(
//         "Update candidate payment status error:",
//         error
//       );

//       return res.status(500).json({
//         success: false,
//         error:
//           "Server error",
//       });
//     }
//   };
// const Candidate = require('../models/Candidate');

// // Register a new candidate
// exports.registerCandidate = async (req, res) => {
//   try {
//     const candidatePayload = {
//       candidateId: req.body.candidateId,
//       applyFor: req.body.applyFor,
//       applicantName: req.body.applicantName,
//       fatherName: req.body.fatherName,
//       motherName: req.body.motherName,
//       dob: req.body.dob,
//       gender: req.body.gender,
//       caste: req.body.caste,
//       mobile: req.body.mobile,
//       aadhar: req.body.aadhar,
//       email: req.body.email,
//       country: req.body.country || 'India',
//       state: req.body.state,
//       city: req.body.city,
//       address: req.body.address,
//       pinCode: req.body.pinCode,
//       qualification: req.body.qualification,
//       status: req.body.status || 'Registered',
//       paymentStatus: req.body.paymentStatus || 'Pending',
//       registrationDate: req.body.registrationDate || new Date().toISOString(),
//       registrationNo: req.body.registrationNo,
//     };

//     if (!candidatePayload.email || !candidatePayload.mobile || !candidatePayload.applicantName) {
//       return res.status(400).json({ success: false, error: 'Applicant name, email and mobile are required' });
//     }

//     // Prevent duplicate email registrations
//     const exists = await Candidate.findOne({ email: candidatePayload.email });
//     if (exists) {
//       return res.status(400).json({ success: false, error: 'Candidate already registered with this email' });
//     }

//     // Generate a unique registration number if not provided
//     const registrationNumber = candidatePayload.registrationNumber || `DCPU/${new Date().getFullYear()}/${Date.now().toString().slice(-6)}`;
//     candidatePayload.registrationNumber = registrationNumber;
//     if (!candidatePayload.registrationNo) {
//       candidatePayload.registrationNo = registrationNumber;
//     }

//     if (req.file) {
//       candidatePayload.image = {
//         path: `/uploads/candidates/${req.file.filename}`,
//         filename: req.file.filename
//       };
//     }

//     const candidate = await Candidate.create(candidatePayload);

//     res.status(201).json({ success: true, message: 'Candidate registered', data: candidate });
//   } catch (error) {
//     console.error('Candidate register error:', error);
//     res.status(500).json({ success: false, error: 'Server error' });
//   }
// };

// exports.getCandidates = async (req, res) => {
//   try {
//     const candidates = await Candidate.find().sort({ createdAt: -1 });
//     res.status(200).json({ success: true, data: candidates });
//   } catch (error) {
//     console.error('Get candidates error:', error);
//     res.status(500).json({ success: false, error: 'Server error' });
//   }
// };

// exports.deleteCandidate = async (req, res) => {
//   try {
//     const candidate = await Candidate.findByIdAndDelete(req.params.id);
//     if (!candidate) {
//       return res.status(404).json({ success: false, error: 'Candidate not found' });
//     }
//     res.status(200).json({ success: true, message: 'Candidate deleted' });
//   } catch (error) {
//     console.error('Delete candidate error:', error);
//     res.status(500).json({ success: false, error: 'Server error' });
//   }
// };

// exports.updatePaymentStatus = async (req, res) => {
//   try {
//     const candidate = await Candidate.findById(req.params.id);
//     if (!candidate) {
//       return res.status(404).json({ success: false, error: 'Candidate not found' });
//     }
//     const { paymentStatus } = req.body;
//     candidate.paymentStatus = paymentStatus || candidate.paymentStatus;
//     await candidate.save();
//     res.status(200).json({ success: true, data: candidate });
//   } catch (error) {
//     console.error('Update candidate payment status error:', error);
//     res.status(500).json({ success: false, error: 'Server error' });
//   }
// };

const Candidate = require("../models/Candidate");

// ======================================================
// GENERATE UNIQUE VSPL REGISTRATION NUMBER
// FORMAT:
// VSPL123456
// ======================================================

const generateUniqueRegistrationNumber =
  async () => {
    let registrationNumber;
    let exists = true;

    while (exists) {
      const randomNumber =
        Math.floor(
          100000 +
            Math.random() * 900000
        ).toString();

      registrationNumber =
        `VSPL${randomNumber}`;

      exists =
        await Candidate.exists({
          registrationNumber,
        });
    }

    return registrationNumber;
  };

// ======================================================
// REGISTER NEW CANDIDATE
// ======================================================

exports.registerCandidate =
  async (req, res) => {
    try {
      // ==================================================
      // GENERATE REGISTRATION NUMBER
      // ==================================================

      const registrationNumber =
        await generateUniqueRegistrationNumber();

      // ==================================================
      // GENERATE CANDIDATE ID
      // ==================================================

      const candidateId =
        req.body.candidateId ||
        `CAND-${Date.now()}-${Math.floor(
          1000 +
            Math.random() * 9000
        )}`;

      // ==================================================
      // COMPLETE CANDIDATE PAYLOAD
      // ==================================================

      const candidatePayload = {
        candidateId,

        registrationNumber,

        registrationNo:
          registrationNumber,

        applyFor:
          req.body.applyFor,

        applicantName:
          req.body.applicantName,

        fatherName:
          req.body.fatherName,

        motherName:
          req.body.motherName,

        dob:
          req.body.dob,

        gender:
          req.body.gender,

        caste:
          req.body.caste,

        mobile:
          req.body.mobile,

        aadhar:
          req.body.aadhar,

        email:
          req.body.email
            ?.trim()
            .toLowerCase(),

        country:
          req.body.country ||
          "India",

        state:
          req.body.state,

        city:
          req.body.city,

        address:
          req.body.address,

        pinCode:
          req.body.pinCode,

        qualification:
          req.body.qualification,

        status:
          req.body.status ||
          "Registered",

        paymentStatus:
          "Pending",

        registrationDate:
          req.body.registrationDate ||
          new Date().toISOString(),
      };

      // ==================================================
      // REQUIRED VALIDATION
      // ==================================================

      if (
        !candidatePayload.email ||
        !candidatePayload.mobile ||
        !candidatePayload.applicantName
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Applicant name, email and mobile are required",
        });
      }

      // ==================================================
      // DUPLICATE EMAIL CHECK
      // ==================================================

      const exists =
        await Candidate.findOne({
          email:
            candidatePayload.email,
        });

      if (exists) {
        return res.status(400).json({
          success: false,
          error:
            "Candidate already registered with this email",
        });
      }

      // ==================================================
      // IMAGE
      // ==================================================

      if (req.file) {
        candidatePayload.image = {
          path: `/uploads/candidates/${req.file.filename}`,
          filename:
            req.file.filename,
        };
      }

      // ==================================================
      // CREATE CANDIDATE
      // ==================================================

      const candidate =
        await Candidate.create(
          candidatePayload
        );

      // ==================================================
      // SUCCESS RESPONSE
      // ==================================================

      return res.status(201).json({
        success: true,

        message:
          "Candidate registered successfully",

        data: candidate,
      });
    } catch (error) {
      console.error(
        "Candidate register error:",
        error
      );

      // ==================================================
      // DUPLICATE REGISTRATION NUMBER
      // ==================================================

      if (
        error.code === 11000
      ) {
        return res.status(409).json({
          success: false,
          error:
            "Registration number already exists. Please try again.",
        });
      }

      return res.status(500).json({
        success: false,
        error:
          "Server error",
      });
    }
  };

// ======================================================
// GET ALL CANDIDATES
// ======================================================

exports.getCandidates =
  async (req, res) => {
    try {
      const candidates =
        await Candidate.find()
          .sort({
            createdAt: -1,
          });

      return res.status(200).json({
        success: true,
        data: candidates,
      });
    } catch (error) {
      console.error(
        "Get candidates error:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          "Server error",
      });
    }
  };

// ======================================================
// GET CANDIDATE BY REGISTRATION NUMBER
// ======================================================

exports.getCandidateByRegistrationNumber =
  async (req, res) => {
    try {
      const registrationNumber =
        String(
          req.params.registrationNumber ||
            ""
        )
          .trim()
          .toUpperCase();

      if (!registrationNumber) {
        return res.status(400).json({
          success: false,
          error:
            "Registration number is required",
        });
      }

      const candidate =
        await Candidate.findOne({
          $or: [
            {
              registrationNumber,
            },
            {
              registrationNo:
                registrationNumber,
            },
          ],
        });

      if (!candidate) {
        return res.status(404).json({
          success: false,
          error:
            "Candidate not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: candidate,
      });
    } catch (error) {
      console.error(
        "Get candidate by registration number error:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          "Server error",
      });
    }
  };

// ======================================================
// DELETE CANDIDATE
// ======================================================

exports.deleteCandidate =
  async (req, res) => {
    try {
      const candidate =
        await Candidate.findByIdAndDelete(
          req.params.id
        );

      if (!candidate) {
        return res.status(404).json({
          success: false,
          error:
            "Candidate not found",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Candidate deleted",
      });
    } catch (error) {
      console.error(
        "Delete candidate error:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          "Server error",
      });
    }
  };

// ======================================================
// UPDATE PAYMENT STATUS
// ======================================================

exports.updatePaymentStatus =
  async (req, res) => {
    try {
      const candidateId =
        String(
          req.params.id ||
          ""
        ).trim();

      if (!candidateId) {
        return res.status(400).json({
          success: false,
          error:
            "Candidate ID is required",
        });
      }

      const {
        paymentStatus,
      } = req.body || {};

      if (!paymentStatus) {
        return res.status(400).json({
          success: false,
          error:
            "Payment status is required",
        });
      }

      const normalizedPaymentStatus =
        String(paymentStatus)
          .trim()
          .toLowerCase();

      const allowedPaymentStatuses = [
        "pending",
        "unpaid",
        "paid",
      ];

      if (
        !allowedPaymentStatuses.includes(
          normalizedPaymentStatus
        )
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Invalid payment status. Allowed values are Pending, Unpaid or Paid",
        });
      }

      const finalPaymentStatus =
        normalizedPaymentStatus === "paid"
          ? "Paid"
          : normalizedPaymentStatus === "unpaid"
            ? "Unpaid"
            : "Pending";

      const candidate =
        await Candidate.findById(
          candidateId
        );

      if (!candidate) {
        return res.status(404).json({
          success: false,
          error:
            "Candidate not found",
        });
      }

      candidate.paymentStatus =
        finalPaymentStatus;

      // ==================================================
      // UPDATE ONLY PAYMENT STATUS
      // ==================================================
      // This avoids running validation on all old
      // candidate fields when only payment status changes.
      // ==================================================

      const updateResult =
        await Candidate.updateOne(
          {
            _id: candidateId,
          },
          {
            $set: {
              paymentStatus:
                finalPaymentStatus,
            },
          }
        );

      if (
        !updateResult ||
        updateResult.matchedCount === 0
      ) {
        return res.status(404).json({
          success: false,
          error:
            "Candidate not found",
        });
      }

      const updatedCandidate =
        await Candidate.findById(
          candidateId
        );

      return res.status(200).json({
        success: true,

        message:
          "Payment status updated successfully",

        data:
          updatedCandidate ||
          candidate,
      });

    } catch (error) {
      console.error(
        "Update candidate payment status error:",
        error
      );

      return res.status(500).json({
        success: false,

        error:
          error.message ||
          "Server error",
      });
    }
  };

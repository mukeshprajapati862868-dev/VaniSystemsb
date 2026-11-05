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
//       const candidateId =
//         String(
//           req.params.id ||
//           ""
//         ).trim();

//       if (!candidateId) {
//         return res.status(400).json({
//           success: false,
//           error:
//             "Candidate ID is required",
//         });
//       }

//       const {
//         paymentStatus,
//       } = req.body || {};

//       if (!paymentStatus) {
//         return res.status(400).json({
//           success: false,
//           error:
//             "Payment status is required",
//         });
//       }

//       const normalizedPaymentStatus =
//         String(paymentStatus)
//           .trim()
//           .toLowerCase();

//       const allowedPaymentStatuses = [
//         "pending",
//         "unpaid",
//         "paid",
//       ];

//       if (
//         !allowedPaymentStatuses.includes(
//           normalizedPaymentStatus
//         )
//       ) {
//         return res.status(400).json({
//           success: false,
//           error:
//             "Invalid payment status. Allowed values are Pending, Unpaid or Paid",
//         });
//       }

//       const finalPaymentStatus =
//         normalizedPaymentStatus === "paid"
//           ? "Paid"
//           : normalizedPaymentStatus === "unpaid"
//             ? "Unpaid"
//             : "Pending";

//       const candidate =
//         await Candidate.findById(
//           candidateId
//         );

//       if (!candidate) {
//         return res.status(404).json({
//           success: false,
//           error:
//             "Candidate not found",
//         });
//       }

//       candidate.paymentStatus =
//         finalPaymentStatus;

//       // ==================================================
//       // UPDATE ONLY PAYMENT STATUS
//       // ==================================================
//       // This avoids running validation on all old
//       // candidate fields when only payment status changes.
//       // ==================================================

//       const updateResult =
//         await Candidate.updateOne(
//           {
//             _id: candidateId,
//           },
//           {
//             $set: {
//               paymentStatus:
//                 finalPaymentStatus,
//             },
//           }
//         );

//       if (
//         !updateResult ||
//         updateResult.matchedCount === 0
//       ) {
//         return res.status(404).json({
//           success: false,
//           error:
//             "Candidate not found",
//         });
//       }

//       const updatedCandidate =
//         await Candidate.findById(
//           candidateId
//         );

//       return res.status(200).json({
//         success: true,

//         message:
//           "Payment status updated successfully",

//         data:
//           updatedCandidate ||
//           candidate,
//       });

//     } catch (error) {
//       console.error(
//         "Update candidate payment status error:",
//         error
//       );

//       return res.status(500).json({
//         success: false,

//         error:
//           error.message ||
//           "Server error",
//       });
//     }
//   };







const Candidate = require("../models/Candidate");
const nodemailer = require("nodemailer");

// ======================================================
// EMAIL HTML ESCAPE HELPER
// ======================================================

const escapeHtml = (value = "") => {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// ======================================================
// CREATE EMAIL TRANSPORTER
// SAME SMTP SETTINGS AS FORGOT PASSWORD
// ======================================================

const createEmailTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  const smtpHost =
    process.env.EMAIL_HOST || "smtp.gmail.com";

  const smtpPort =
    Number(process.env.EMAIL_PORT) || 587;

  if (!emailUser || !emailPass) {
    throw new Error("Email SMTP credentials are missing.");
  }

  if (![465, 587].includes(smtpPort)) {
    throw new Error("Invalid SMTP port. Use 465 or 587.");
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,

    auth: {
      user: emailUser,
      pass: emailPass,
    },

    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });
};

// ======================================================
// SEND CANDIDATE REGISTRATION CONFIRMATION EMAIL
// ======================================================

const sendCandidateRegistrationEmail = async (candidate) => {
  const emailUser = process.env.EMAIL_USER;

  const transporter = createEmailTransporter();

  await transporter.verify();

  const applicantName =
    escapeHtml(candidate.applicantName);

  const registrationNumber =
    escapeHtml(candidate.registrationNumber);

  const applyFor =
    escapeHtml(candidate.applyFor || "Job Application");

  const candidateEmail =
    escapeHtml(candidate.email);

  const mobile =
    escapeHtml(candidate.mobile);

  const mailOptions = {
    from: {
      name: "Vani Systems",
      address: emailUser,
    },

    // EMAIL ONLY TO REGISTERED CANDIDATE
    to: candidate.email,

    replyTo: emailUser,

    subject: `Thank You for Applying - Registration No. ${candidate.registrationNumber}`,

    text: `
Dear ${candidate.applicantName},

Thank you for applying for the ${candidate.applyFor || "Job Application"} at Vani Systems.

Your application has been successfully submitted and your registration is confirmed.

YOUR REGISTRATION DETAILS

Registration Number: ${candidate.registrationNumber}
Candidate ID: ${candidate.candidateId}
Applicant Name: ${candidate.applicantName}
Applied For: ${candidate.applyFor || "Job Application"}
Email: ${candidate.email}
Mobile: ${candidate.mobile}

Please keep your Registration Number safe for future reference.

Our team has received your application. Further communication regarding your application will be shared through the registered contact details.

Thank you for your interest in Vani Systems.

Regards,
HR Team
Vani Systems Pvt. Ltd.
https://vanisystems.in

This is an automatic registration confirmation email.
    `,

    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>Job Application Confirmation</title>
</head>

<body style="
  margin:0;
  padding:20px;
  background:#f4f6f9;
  font-family:Arial,Helvetica,sans-serif;
">

  <div style="
    max-width:600px;
    margin:20px auto;
    background:#ffffff;
    border:1px solid #e5e7eb;
    border-radius:10px;
    overflow:hidden;
  ">

    <div style="
      background:#173b68;
      padding:25px 20px;
      text-align:center;
      color:#ffffff;
    ">

      <h2 style="
        margin:0;
        font-size:25px;
      ">
        VANI SYSTEMS
      </h2>

      <p style="
        margin:10px 0 0;
        font-size:14px;
      ">
        Job Application Confirmation
      </p>

    </div>

    <div style="
      padding:25px 22px;
      color:#333333;
    ">

      <h2 style="
        color:#198754;
        font-size:21px;
        margin-top:0;
      ">
        Thank You for Applying!
      </h2>

      <p style="
        font-size:15px;
        line-height:1.7;
      ">
        Dear <strong>${applicantName}</strong>,
      </p>

      <p style="
        font-size:15px;
        line-height:1.7;
      ">
        Thank you for applying for the
        <strong>${applyFor}</strong>
        at Vani Systems.
      </p>

      <p style="
        font-size:15px;
        line-height:1.7;
      ">
        Your job application has been successfully
        submitted and your registration is confirmed.
      </p>

      <div style="
        margin:25px 0;
        padding:20px;
        background:#f0f5ff;
        border:1px solid #d6e4ff;
        border-radius:8px;
        text-align:center;
      ">

        <p style="
          margin:0 0 10px;
          font-size:14px;
          color:#555555;
        ">
          YOUR REGISTRATION NUMBER
        </p>

        <h2 style="
          margin:0;
          color:#173b68;
          font-size:27px;
          letter-spacing:2px;
        ">
          ${registrationNumber}
        </h2>

        <p style="
          margin:10px 0 0;
          font-size:12px;
          color:#555555;
        ">
          Please keep this number safe for future reference.
        </p>

      </div>

      <h3 style="
        color:#173b68;
        font-size:17px;
      ">
        Application Details
      </h3>

      <table style="
        width:100%;
        border-collapse:collapse;
        font-size:14px;
      ">

        <tr>
          <td style="padding:11px;border:1px solid #dddddd;">
            <strong>Registration Number</strong>
          </td>

          <td style="padding:11px;border:1px solid #dddddd;">
            ${registrationNumber}
          </td>
        </tr>

        <tr>
          <td style="padding:11px;border:1px solid #dddddd;">
            <strong>Candidate ID</strong>
          </td>

          <td style="padding:11px;border:1px solid #dddddd;">
            ${escapeHtml(candidate.candidateId)}
          </td>
        </tr>

        <tr>
          <td style="padding:11px;border:1px solid #dddddd;">
            <strong>Applicant Name</strong>
          </td>

          <td style="padding:11px;border:1px solid #dddddd;">
            ${applicantName}
          </td>
        </tr>

        <tr>
          <td style="padding:11px;border:1px solid #dddddd;">
            <strong>Applied For</strong>
          </td>

          <td style="padding:11px;border:1px solid #dddddd;">
            ${applyFor}
          </td>
        </tr>

        <tr>
          <td style="padding:11px;border:1px solid #dddddd;">
            <strong>Email</strong>
          </td>

          <td style="padding:11px;border:1px solid #dddddd;">
            ${candidateEmail}
          </td>
        </tr>

        <tr>
          <td style="padding:11px;border:1px solid #dddddd;">
            <strong>Mobile</strong>
          </td>

          <td style="padding:11px;border:1px solid #dddddd;">
            ${mobile}
          </td>
        </tr>

      </table>

      <p style="
        font-size:14px;
        line-height:1.7;
        margin-top:25px;
      ">
        Our team has received your application.
        Further communication regarding your application
        will be shared through your registered contact details.
      </p>

      <p style="
        font-size:15px;
        line-height:1.7;
        margin-top:25px;
      ">
        Regards,<br>
        <strong>HR Team</strong><br>
        Vani Systems Pvt. Ltd.
      </p>

    </div>

    <div style="
      background:#f1f3f5;
      padding:16px;
      text-align:center;
      font-size:12px;
      color:#666666;
    ">

      <p style="margin:5px 0;">
        Vani Systems Pvt. Ltd.
      </p>

      <p style="margin:5px 0;">
        <a
          href="https://vanisystems.in"
          style="color:#173b68;text-decoration:none;"
        >
          www.vanisystems.in
        </a>
      </p>

      <p style="margin:5px 0;">
        This is an automatic registration confirmation email.
      </p>

    </div>

  </div>

</body>
</html>
    `,
  };

  const mailResult =
    await transporter.sendMail(mailOptions);

  if (
    !mailResult.accepted ||
    mailResult.accepted.length === 0 ||
    (mailResult.rejected && mailResult.rejected.length > 0)
  ) {
    throw new Error(
      "Candidate confirmation email was not accepted."
    );
  }

  return mailResult;
};

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
      // SEND REGISTRATION CONFIRMATION EMAIL
      // TO CANDIDATE ONLY
      // ==================================================

      let emailSent = false;
      let emailError = null;

      try {
        const mailResult =
          await sendCandidateRegistrationEmail(
            candidate
          );

        emailSent = true;

        console.log(
          "Candidate registration email accepted:",
          candidate.email,
          "Registration:",
          candidate.registrationNumber,
          "Message ID:",
          mailResult.messageId
        );

      } catch (mailError) {
        emailSent = false;
        emailError = mailError.message;

        console.error(
          "Candidate registration email error:",
          mailError
        );
      }

      // ==================================================
      // SUCCESS RESPONSE
      // ==================================================

      return res.status(201).json({
        success: true,

        message: emailSent
          ? "Candidate registered successfully. Confirmation email has been sent."
          : "Candidate registered successfully, but confirmation email could not be sent.",

        emailSent: emailSent,

        ...(emailSent
          ? {}
          : {
              emailError: emailError,
            }),

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

// const ContactQuery = require("../models/ContactQuery");

// // ===============================
// // CREATE CONTACT QUERY
// // ===============================
// const createContactQuery = async (req, res) => {
//   try {
//     const {
//       name,
//       email,
//       description,
//       contactNo,
//     } = req.body;

//     // Required field validation
//     if (!name || !email || !description || !contactNo) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are required.",
//       });
//     }

//     const contactQuery = new ContactQuery({
//       name: name.trim(),
//       email: email.trim().toLowerCase(),
//       description: description.trim(),
//       contactNo: contactNo.trim(),
//     });

//     const savedQuery = await contactQuery.save();

//     return res.status(201).json({
//       success: true,
//       message: "Your query has been submitted successfully.",
//       data: savedQuery,
//     });
//   } catch (error) {
//     console.error("Contact Query Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to submit your query.",
//       error: error.message,
//     });
//   }
// };


// // ===============================
// // GET ALL CONTACT QUERIES
// // ===============================
// const getContactQueries = async (req, res) => {
//   try {
//     const queries = await ContactQuery.find().sort({
//       _id: -1,
//     });

//     return res.status(200).json({
//       success: true,
//       count: queries.length,
//       data: queries,
//     });
//   } catch (error) {
//     console.error("Get Contact Queries Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch contact queries.",
//       error: error.message,
//     });
//   }
// };

// module.exports = {
//   createContactQuery,
//   getContactQueries,
// };




const ContactQuery = require("../models/ContactQuery");
const nodemailer = require("nodemailer");

// =====================================================
// HELPER: HTML ESCAPE
// =====================================================

const escapeHtml = (value = "") => {
  return String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });
};

// =====================================================
// HELPER: EMAIL TRANSPORTER
// Uses existing Forgot Password SMTP configuration
// =====================================================

const createEmailTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    throw new Error("EMAIL_USER or EMAIL_PASS is missing");
  }

  const smtpHost = process.env.EMAIL_HOST || "smtp.gmail.com";
  const smtpPort = Number(process.env.EMAIL_PORT) || 587;

  if (![465, 587].includes(smtpPort)) {
    throw new Error("Invalid SMTP port configuration");
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

// =====================================================
// CREATE CONTACT QUERY
// POST /api/contact-queries
// =====================================================

const createContactQuery = async (req, res) => {
  let savedQuery = null;

  try {
    const {
      name,
      email,
      description,
      contactNo,
    } = req.body;

    // -------------------------------------------------
    // REQUIRED FIELD VALIDATION
    // -------------------------------------------------

    if (
      !name ||
      !email ||
      !description ||
      !contactNo
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // -------------------------------------------------
    // NORMALIZE DATA
    // -------------------------------------------------

    const normalizedName = String(name).trim();
    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedDescription = String(description).trim();
    const normalizedContactNo = String(contactNo).trim();

    if (
      !normalizedName ||
      !normalizedEmail ||
      !normalizedDescription ||
      !normalizedContactNo
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // -------------------------------------------------
    // SAVE CONTACT QUERY IN MONGODB
    // -------------------------------------------------

    const contactQuery = new ContactQuery({
      name: normalizedName,
      email: normalizedEmail,
      description: normalizedDescription,
      contactNo: normalizedContactNo,
    });

    savedQuery = await contactQuery.save();

    console.log("CONTACT QUERY SAVED SUCCESSFULLY");
    console.log("Contact Query ID:", savedQuery._id);

    // -------------------------------------------------
    // SEND CONFIRMATION EMAIL TO CUSTOMER ONLY
    // -------------------------------------------------

    let emailSent = false;

    try {
      const emailUser = process.env.EMAIL_USER;

      const transporter = createEmailTransporter();

      const safeName = escapeHtml(normalizedName);
      const safeEmail = escapeHtml(normalizedEmail);
      const safeContactNo = escapeHtml(normalizedContactNo);
      const safeDescription = escapeHtml(normalizedDescription);

      const mailOptions = {
        from: {
          name: "Vani Systems",
          address: emailUser,
        },

        // Email goes ONLY to the customer
        to: normalizedEmail,

        subject: "Contact Query Received - Vani Systems",

        text: `
Hello ${normalizedName},

Thank you for contacting Vani Systems.

We have successfully received your query.

Your submitted details:

Name: ${normalizedName}
Email: ${normalizedEmail}
Contact Number: ${normalizedContactNo}

Message:
${normalizedDescription}

Our team will review your query.

Thank you,
Vani Systems Team
        `,

        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact Query Confirmation</title>
</head>

<body style="
  margin:0;
  padding:20px;
  background:#f4f6f9;
  font-family:Arial,sans-serif;
">

  <div style="
    max-width:600px;
    margin:20px auto;
    background:#ffffff;
    padding:30px;
    border-radius:10px;
    border:1px solid #e5e7eb;
  ">

    <h2 style="color:#102a43;">
      Thank You for Contacting Vani Systems!
    </h2>

    <p>Hello ${safeName},</p>

    <p>
      Thank you for contacting Vani Systems.
      We have successfully received your query.
    </p>

    <p>
      Your submitted details are:
    </p>

    <div style="
      background:#f8fafc;
      padding:18px;
      border-radius:8px;
      border:1px solid #e5e7eb;
    ">

      <p>
        <strong>Name:</strong> ${safeName}
      </p>

      <p>
        <strong>Email:</strong> ${safeEmail}
      </p>

      <p>
        <strong>Contact Number:</strong> ${safeContactNo}
      </p>

      <p>
        <strong>Your Message:</strong>
      </p>

      <p style="
        white-space:pre-wrap;
        word-break:break-word;
      ">
        ${safeDescription}
      </p>

    </div>

    <p style="margin-top:22px;">
      Our team will review your query and get back to you.
    </p>

    <hr style="
      border:none;
      border-top:1px solid #eeeeee;
      margin:25px 0;
    ">

    <p style="color:#777;">
      Best regards,<br>
      <strong>Vani Systems Team</strong>
    </p>

  </div>

</body>
</html>
        `,
      };

      // Verify SMTP connection
      await transporter.verify();

      // Send email
      const mailResult = await transporter.sendMail(mailOptions);

      // Check recipient acceptance
      const acceptedEmails = (mailResult.accepted || []).map(
        (item) => String(item.address || item).toLowerCase()
      );

      const rejectedEmails = (mailResult.rejected || []).map(
        (item) => String(item.address || item).toLowerCase()
      );

      const recipientAccepted = acceptedEmails.includes(
        normalizedEmail
      );

      const recipientRejected = rejectedEmails.includes(
        normalizedEmail
      );

      if (recipientAccepted && !recipientRejected) {
        emailSent = true;

        console.log("CONTACT CONFIRMATION EMAIL SENT");
        console.log("Recipient:", normalizedEmail);
        console.log("Message ID:", mailResult.messageId);
        console.log("SMTP Response:", mailResult.response);
      } else {
        console.error(
          "Customer email was not accepted by SMTP:",
          normalizedEmail
        );
      }

    } catch (mailError) {
      // Email failure must not delete the saved contact query
      console.error(
        "CONTACT CONFIRMATION EMAIL FAILED:",
        mailError.message
      );
    }

    // -------------------------------------------------
    // FINAL RESPONSE
    // -------------------------------------------------

    return res.status(201).json({
      success: true,

      message: emailSent
        ? "Your query has been submitted successfully. A confirmation email has been sent to you."
        : "Your query has been submitted successfully, but the confirmation email could not be sent.",

      emailSent,

      data: savedQuery,
    });

  } catch (error) {
    console.error("Contact Query Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit your query.",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL CONTACT QUERIES
// GET /api/contact-queries
// Existing Admin Data API
// =====================================================

const getContactQueries = async (req, res) => {
  try {
    const queries = await ContactQuery.find().sort({
      _id: -1,
    });

    return res.status(200).json({
      success: true,
      count: queries.length,
      data: queries,
    });

  } catch (error) {
    console.error("Get Contact Queries Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch contact queries.",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORT CONTROLLERS
// =====================================================

module.exports = {
  createContactQuery,
  getContactQueries,
};

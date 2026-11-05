
const ContactQuery = require("../models/ContactQuery");
const nodemailer = require("nodemailer");

// =====================================================
// HTML ESCAPE HELPER
// =====================================================

const escapeHtml = (value = "") => {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// =====================================================
// EMAIL TRANSPORTER
// Uses the same SMTP environment variables as Forgot Password
// =====================================================

const createEmailTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  const smtpHost = process.env.EMAIL_HOST || "smtp.gmail.com";
  const smtpPort = Number(process.env.EMAIL_PORT) || 587;

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

// =====================================================
// SEND CONTACT CONFIRMATION EMAIL TO CUSTOMER ONLY
// =====================================================

const sendContactConfirmationEmail = async (customer) => {
  const emailUser = process.env.EMAIL_USER;

  const transporter = createEmailTransporter();

  await transporter.verify();

  const safeName = escapeHtml(customer.name);
  const safeEmail = escapeHtml(customer.email);
  const safeContactNo = escapeHtml(customer.contactNo);
  const safeDescription = escapeHtml(customer.description);

  const mailOptions = {
    from: {
      name: "Vani Systems",
      address: emailUser,
    },

    // Email goes ONLY to the customer
    to: customer.email,

    replyTo: emailUser,

    subject: "Your Contact Form Has Been Submitted Successfully",

    text: `
Hello ${customer.name},

Thank you for contacting Vani Systems.

Your Contact Form has been submitted successfully.

Your submitted details:

Name: ${customer.name}
Email: ${customer.email}
Contact Number: ${customer.contactNo}
Message: ${customer.description}

Our team has received your query and will get back to you if required.

Thank you,
Vani Systems
https://vanisystems.in
    `,

    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact Form Confirmation</title>
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
    border-radius:10px;
    overflow:hidden;
    border:1px solid #e5e7eb;
  ">

    <div style="
      background:#173b68;
      padding:25px 20px;
      text-align:center;
      color:#ffffff;
    ">
      <h2 style="margin:0;font-size:24px;">
        VANI SYSTEMS
      </h2>

      <p style="margin:10px 0 0;font-size:14px;">
        Contact Form Confirmation
      </p>
    </div>

    <div style="padding:25px 22px;color:#333333;">

      <h2 style="
        color:#198754;
        font-size:21px;
        margin-top:0;
      ">
        Your Data Has Been Submitted Successfully!
      </h2>

      <p style="font-size:15px;line-height:1.7;">
        Hello <strong>${safeName}</strong>,
      </p>

      <p style="font-size:15px;line-height:1.7;">
        Thank you for contacting Vani Systems.
        We have successfully received your Contact Form submission.
      </p>

      <h3 style="
        font-size:17px;
        color:#173b68;
        margin-top:25px;
      ">
        Your Submitted Details
      </h3>

      <table style="
        width:100%;
        border-collapse:collapse;
        font-size:14px;
      ">

        <tr>
          <td style="padding:11px;border:1px solid #dddddd;">
            <strong>Name</strong>
          </td>
          <td style="padding:11px;border:1px solid #dddddd;">
            ${safeName}
          </td>
        </tr>

        <tr>
          <td style="padding:11px;border:1px solid #dddddd;">
            <strong>Email</strong>
          </td>
          <td style="padding:11px;border:1px solid #dddddd;">
            ${safeEmail}
          </td>
        </tr>

        <tr>
          <td style="padding:11px;border:1px solid #dddddd;">
            <strong>Contact Number</strong>
          </td>
          <td style="padding:11px;border:1px solid #dddddd;">
            ${safeContactNo}
          </td>
        </tr>

        <tr>
          <td style="padding:11px;border:1px solid #dddddd;">
            <strong>Message</strong>
          </td>
          <td style="
            padding:11px;
            border:1px solid #dddddd;
            word-break:break-word;
          ">
            ${safeDescription}
          </td>
        </tr>

      </table>

      <p style="
        font-size:14px;
        line-height:1.7;
        margin-top:25px;
      ">
        Our team has received your query. Thank you for
        getting in touch with us.
      </p>

      <p style="
        font-size:15px;
        line-height:1.6;
        margin-top:25px;
      ">
        Regards,<br>
        <strong>Vani Systems Team</strong>
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
        This is an automatic confirmation email.
      </p>
    </div>

  </div>

</body>
</html>
    `,
  };

  const mailResult = await transporter.sendMail(mailOptions);

  if (
    !mailResult.accepted ||
    mailResult.accepted.length === 0 ||
    (mailResult.rejected && mailResult.rejected.length > 0)
  ) {
    throw new Error("Customer confirmation email was not accepted.");
  }

  return mailResult;
};

// =====================================================
// CREATE CONTACT QUERY
// SAVE DATA + SEND EMAIL TO CUSTOMER
// =====================================================

const createContactQuery = async (req, res) => {
  try {
    const { name, email, description, contactNo } = req.body;

    // Validate required fields
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

    // Normalize customer data
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

    // =================================================
    // STEP 1: SAVE CONTACT QUERY IN MONGODB
    // =================================================

    const contactQuery = new ContactQuery({
      name: normalizedName,
      email: normalizedEmail,
      description: normalizedDescription,
      contactNo: normalizedContactNo,
    });

    const savedQuery = await contactQuery.save();

    console.log(
      "Contact query saved successfully:",
      savedQuery._id
    );

    // =================================================
    // STEP 2: SEND CONFIRMATION EMAIL TO CUSTOMER ONLY
    // =================================================

    let emailSent = false;
    let emailMessage = "";

    try {
      const mailResult = await sendContactConfirmationEmail({
        name: normalizedName,
        email: normalizedEmail,
        description: normalizedDescription,
        contactNo: normalizedContactNo,
      });

      emailSent = true;

      console.log(
        "Contact confirmation email accepted for customer:",
        normalizedEmail,
        "Message ID:",
        mailResult.messageId
      );

    } catch (emailError) {
      emailSent = false;

      emailMessage = emailError.message;

      console.error(
        "Contact confirmation email error:",
        emailError
      );
    }

    // =================================================
    // STEP 3: SEND API RESPONSE
    // =================================================

    return res.status(201).json({
      success: true,

      message: emailSent
        ? "Your query has been submitted successfully. Confirmation email has been sent to your email address."
        : "Your query has been submitted successfully, but confirmation email could not be sent.",

      emailSent: emailSent,

      ...(emailSent
        ? {}
        : {
            emailError: emailMessage,
          }),

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
// ADMIN DATA - KEEP EXISTING FUNCTIONALITY
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

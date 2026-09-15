const ContactQuery = require("../models/ContactQuery");

// ===============================
// CREATE CONTACT QUERY
// ===============================
const createContactQuery = async (req, res) => {
  try {
    const {
      name,
      email,
      description,
      contactNo,
    } = req.body;

    // Required field validation
    if (!name || !email || !description || !contactNo) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const contactQuery = new ContactQuery({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      description: description.trim(),
      contactNo: contactNo.trim(),
    });

    const savedQuery = await contactQuery.save();

    return res.status(201).json({
      success: true,
      message: "Your query has been submitted successfully.",
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


// ===============================
// GET ALL CONTACT QUERIES
// ===============================
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

module.exports = {
  createContactQuery,
  getContactQueries,
};
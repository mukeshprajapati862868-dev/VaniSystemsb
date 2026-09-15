const express = require("express");

const {
  createContactQuery,
  getContactQueries,
} = require("../controllers/contactQueryController");

const router = express.Router();

// Create contact query
router.post("/", createContactQuery);

// Get all contact queries
router.get("/", getContactQueries);

module.exports = router;
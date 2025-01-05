const mongoose = require("mongoose");

const TestingSchema = new mongoose.Schema({
  username: String,
  name: String,
  email: String,
  password: String,
});

const TestingModel = mongoose.model("testing", TestingSchema);

module.exports = TestingModel;

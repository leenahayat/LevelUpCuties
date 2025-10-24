// userModel.js
const mongoose = require('mongoose');

// Define the schema for the User model
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true // Removes whitespace from both ends of a string
    },
    email: {
        type: String,
        required: true,
        unique: true, // Ensures no two users have the same email
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    }
    // You can add more fields here like 'habits', 'progress', etc.
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps
});

// Create and export the Mongoose model
const User = mongoose.model('User', userSchema);
module.exports = User;
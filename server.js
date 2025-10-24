const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');


dotenv.config();


const User = require('./models/User.js'); 


const habitProgressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    month: { type: String, required: true }, 
  
    progress: { type: [Object], required: true }, 
    updatedAt: { type: Date, default: Date.now },
});
const HabitProgress = mongoose.model('HabitProgress', habitProgressSchema);


const feedbackSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String }, 
    type: { type: String, required: true, enum: ['idea', 'bug', 'general'] },
    message: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now }
});
const Feedback = mongoose.model('Feedback', feedbackSchema);


const app = express();
const PORT = process.env.PORT || 3000;


const mongoUri = process.env.MONGO_URL || process.env.MONGO_URI; 

if (!mongoUri) {
    console.error("\nCRITICAL ERROR: MongoDB connection string is MISSING.");
    console.error("Please ensure your .env file contains: MONGO_URL=\"mongodb+srv://...\"\n");
    process.exit(1); 
}

mongoose.connect(mongoUri)
    .then(() => console.log('MongoDB connected successfully.'))
    .catch(err => {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    });

app.use(session({
    secret: process.env.SESSION_SECRET || 'a-very-secret-key-for-cuties',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        
        if (req.originalUrl.startsWith('/api/')) {
            return res.status(401).json({ success: false, message: 'Unauthorized. Please sign in.' });
        }
       
        return res.redirect('/signin.html?message=You must be logged in.');
    }
    next();
};



app.post('/register', async (req, res) => {
    const { username, email, password, confirm_password } = req.body;

    if (password !== confirm_password) {
        return res.status(400).send('Passwords do not match. Please go back and try again.');
    }
    
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).send('User with that email already exists. <a href="/signin.html">Sign In?</a>');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        await newUser.save();
        
        req.session.userId = newUser._id;
        
        res.redirect('/signin.html');
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).send('An error occurred during registration. Please try again.');
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).send('Invalid email or password. <a href="/signup.html">Sign Up?</a>');
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).send('Invalid email or password. <a href="/signup.html">Sign Up?</a>');
        }

        req.session.userId = user._id;

     
        res.redirect('/tracker2.html'); 

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send('An error occurred during login. Please try again.');
    }
});


app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/tracker.html');
        }
        res.redirect('/');
    });
});


app.get('/check-auth', (req, res) => {
    if (req.session.userId) {
        res.json({ isAuthenticated: true, userId: req.session.userId });
    } else {
        res.json({ isAuthenticated: false });
    }
});


app.get('/api/user/profile', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId).select('username'); 
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        res.json({ success: true, username: user.username });
        
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ success: false, message: 'Server error fetching user details.' });
    }
});



app.post('/api/tracker/save', requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;
     
        const { month, progress } = req.body; 

        if (!month || !progress) {
            return res.status(400).json({ success: false, message: 'Missing month or progress data.' });
        }

        const result = await HabitProgress.findOneAndUpdate(
            { userId: userId, month: month }, 
            { progress: progress, updatedAt: Date.now() }, 
            { upsert: true, new: true }
        );

        res.status(200).json({ success: true, message: "Progress saved successfully!" });

    } catch (error) {
        console.error("Error saving progress:", error);
        res.status(500).json({ success: false, message: "Server error during save." });
    }
});

app.get('/api/tracker/load/:month', requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;
        const month = req.params.month; 

        const record = await HabitProgress.findOne({ userId: userId, month: month });

        if (record) {
            res.status(200).json({ success: true, progress: record.progress });
        } else {
            
            res.status(200).json({ success: true, progress: [] });
        }

    } catch (error) {
        console.error("Error loading progress:", error);
        res.status(500).json({ success: false, message: "Server error during load." });
    }
});


app.post('/submit-feedback', requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;
      
        const { type, message } = req.body; 

        if (!type || !message) {
            return res.status(400).send('Feedback type and message are required.');
        }

       
        const user = await User.findById(userId).select('username');
        
        
        const newFeedback = new Feedback({
            userId: userId,
            username: user ? user.username : 'Unknown User', 
            type: type,
            message: message,
        });

        await newFeedback.save();
        console.log(`New Feedback received (Type: ${type})`);

     
        res.redirect('/tracker2.html?feedback=success'); 

    } catch (error) {
        console.error("Error submitting feedback:", error);
        res.redirect('/tracker2.html?feedback=error');
    }
});



app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
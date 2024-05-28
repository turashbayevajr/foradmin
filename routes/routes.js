const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const Participant = require('../models/participant');
const Event = require('../models/event');
const multer = require('multer');
const fs = require("fs");
const bcrypt = require('bcryptjs');
const basicAuth = require('express-basic-auth');

// const hashedPassword = bcrypt.hashSync('nnn', 10);

// Middleware to check basic authentication credentials
const checkAuth = basicAuth({
    users: { 'admin': 'qolym' }, // Username and hashed password
    challenge: true, // Send authentication challenge if credentials are missing
    unauthorizedResponse: 'Unauthorized', // Response for unauthorized access
});

// Image upload configuration using multer
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads');
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    },
});
const upload = multer({ storage: storage }).single("image");

// Route to add a new post
router.post('/add', upload, (req, res) => {
    const post = new Post({
        title: req.body.title,
        message: req.body.message,
        image: req.file.filename,
    });
    post.save((err) => {
        if (err) {
            return res.json({ message: err.message, type: 'danger' }); // Return to prevent further execution
        }
        req.session.message = {
            type: 'success',
            message: 'post added successfully'
        };
        res.redirect('/news');
    });
});
// Route to render the "Basty bet" page
router.get("/basty", (req, res) => {
    Post.find().exec((err, posts) => {
        if (err) {
            return res.json({ message: err.message }); // Return to prevent further execution
        }
        res.render('basty', {
            title1: 'Basty bet',
            posts: posts,
        });
    });
});
// Route to get all news (protected by basic authentication)
router.get("/news", checkAuth, (req, res) => {
    Post.find().exec((err, posts) => {
        if (err) {
            return res.json({ message: err.message }); // Return to prevent further execution
        }
        res.render('index', {
            title1: 'News Page',
            posts: posts,
        });
    });
});

// Route to render the "Add news" page (protected by basic authentication)
router.get("/add", checkAuth, (req, res) => {
    res.render('add_news', { title1: "Add news" });
});

// Route to edit a news item
router.get('/edit/:id', (req, res) => {
    let id = req.params.id;
    Post.findById(id, (err, post) => {
        if (err || !post) {
            return res.redirect('/news'); // Return to prevent further execution
        }
        res.render('edit_news', {
            title1: 'Edit News',
            post: post,
        });
    });
});

// Route to update a news item
router.post('/update/:id', upload, (req, res) => {
    let id = req.params.id;
    let new_image = '';
    if (req.file) {
        new_image = req.file.filename;
        try {
            fs.unlinkSync('./uploads/' + req.body.old_image);
        } catch (err) {
            console.log(err);
        }
    } else {
        new_image = req.body.old_image;
    }
    Post.findByIdAndUpdate(id, {
        message: req.body.message,
        title: req.body.title,
        image: new_image,
    }, (err, result) => {
        if (err) {
            return res.json({ message: err.message, type: 'danger' }); // Return to prevent further execution
        }
        req.session.message = {
            type: 'success',
            message: 'news updated successfully'
        };
        res.redirect('/news');
    });
});

// Route to delete a news item
router.get('/delete/:id', (req, res) => {
    let id = req.params.id;
    Post.findByIdAndRemove(id, (err, result) => {
        if (result.image != '') {
            try {
                fs.unlinkSync('./uploads/' + result.image);
            } catch (err) {
                console.log(err);
            }
        }
        if (err) {
            return res.json({ message: err.message }); // Return to prevent further execution
        }
        req.session.message = {
            type: 'success',
            message: 'news deleted successfully'
        };
        res.redirect('/news');
    });
});
// Event CRUD operations

router.get('/events/add', checkAuth, (req, res) => {
    res.render('add_event', { title1: "Add Event" });
});

router.post('/events/add', (req, res) => {
    const { name, description, date, place } = req.body;
    const event = new Event({
        name,
        description,
        date,
        place,
    });
    event.save((err) => {
        if (err) {
            return res.json({ message: err.message, type: 'danger' });
        }
        req.session.message = {
            type: 'success',
            message: 'Event added successfully'
        };
        res.redirect('/events');
    });
});

router.get('/events/edit/:id', checkAuth, (req, res) => {
    const eventId = req.params.id;
    Event.findById(eventId, (err, event) => {
        if (err || !event) {
            return res.redirect('/events');
        }
        res.render('edit_event', { title1: 'Edit Event', event });
    });
});

router.post('/events/update/:id', (req, res) => {
    const eventId = req.params.id;
    const { name, description, date, place } = req.body;
    Event.findByIdAndUpdate(eventId, { name, description, date, place }, (err, result) => {
        if (err) {
            return res.json({ message: err.message, type: 'danger' });
        }
        req.session.message = {
            type: 'success',
            message: 'Event updated successfully'
        };
        res.redirect('/events');
    });
});

router.get('/events/delete/:id', checkAuth, (req, res) => {
    const eventId = req.params.id;
    Event.findByIdAndRemove(eventId, (err, result) => {
        if (err) {
            return res.json({ message: err.message });
        }
        req.session.message = {
            type: 'success',
            message: 'Event deleted successfully'
        };
        res.redirect('/events');
    });
});

router.get('/events', checkAuth,(req, res) => {
    Event.find().exec((err, events) => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error' });
        }
        res.render('events', {
            title1: 'Events Page',
            events: events,
        });
    });
});
router.get('/baiqau', (req, res) => {
    Event.find().exec((err, events) => {
        if (err) {
            return res.json({ message: err.message });
        }
        res.render('event', {
            title1: 'Events Page',
            events: events,
        });
    });
});

// Participant registration routes

router.get('/participants/register/:eventId', (req, res) => {
    const eventId = req.params.eventId;
    res.render('participant_form', { eventId });
});

router.post('/participants/register', async (req, res) => {
    try {
        const { name, surname, phoneNumber, age, occupation, city, eventId } = req.body;
        const participant = new Participant({
            name,
            surname,
            phoneNumber,
            age,
            occupation,
            city,
            event: eventId,
        });
        await participant.save();

        // Update the corresponding event's participants array
        await Event.findByIdAndUpdate(eventId, { $push: { participants: participant._id } });

        req.session.message = {
            type: 'success',
            message: 'Participant registered successfully'
        };
        res.redirect(`/baiqau`);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
//participant display route
router.get('/participants', checkAuth, async (req, res) => {
    try {
        const events = await Event.find().populate('participants');
        res.render('participants', { events });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/home', checkAuth,(req, res) => {
    res.render('home', { title: 'Home Page' });
});
module.exports = router;

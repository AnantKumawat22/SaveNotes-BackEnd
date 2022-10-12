const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Notes = require('../models/Notes');
const { body, validationResult } = require('express-validator');

// ROUTE 1: Get all the Notes using: GET "/api/auth/fetchallnotes". Login required.
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        // Fetch and send all the notes corresponding to the user logged in.
        const notes = await Notes.find({ user: req.user.id });
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).send("Internal sever Error.");
        console.log(error.message);
    }
});

// ROUTE 2: Add a New Note using: POST "/api/auth/addnote". Login required.
router.post('/addnote', fetchuser, [
    body('title', "Title Cannot be Empty.").isLength({ min: 1 }),
    body('description', "Description Cannot be Empty.").isLength({ min: 1 }),
    body('tag', "Tag Cannot be Empty.").isLength({ min: 1 }),
], async (req, res) => {
    try {
        const { title, description, tag } = req.body;

        // If there are errors, return Bad request and the errors.
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            let msg = errors.errors[0].msg;
            return res.status(400).json({ success: false, msg });
        }

        // Create and Save New Note
        const note = new Notes({
            title, description, tag, user: req.user.id
        });
        const savedNote = await note.save();

        res.status(200).json({ note, success: true, msg: "New Note Added Successfully." });
    } catch (error) {
        res.status(500).send("Internal sever Error.");
        console.log(error.message);
    }
});

// ROUTE 3: Update an existing Note using: PUT "/api/auth/updatenote". Login required.
router.put('/updatenote/:id', fetchuser, [
    body('title', "Title Cannot be Empty.").isLength({ min: 1 }),
    body('description', "Description Cannot be Empty.").isLength({ min: 1 }),
    body('tag', "Tag Cannot be Empty.").isLength({ min: 1 }),
], async (req, res) => {
    const { title, description, tag } = req.body;
    
    // If there are errors, return Bad request and the errors.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let msg = errors.errors[0].msg;
        return res.status(400).json({ success: false, msg });
    }
    try {
        // Create a newNote object.
        const newNote = {};
        if (title) { newNote.title = title; }
        if (description) { newNote.description = description; }
        if (tag) { newNote.tag = tag; }

        // Find the note to be updated.
        let note = await Notes.findById(req.params.id);
        if (!note) { return res.status(404).json({success: false, msg: "Note Not Found."}); }

        // Check if the note user want to delete, is his/her note or user want to delete any other user's note.
        if (note.user.toString() !== req.user.id) {
            return res.status(401).json({success: false, msg: "Updation of this Note Not Allowed."});
        }

        // Find and Update the Note.
        note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
        res.status(200).json({ note, success: true, msg: "Note has been updated successfully." });
    } catch (error) {
        res.status(500).send("Internal sever Error.");
        console.log(error.message);
    }
});

// ROUTE 4: Delete an existing Note using: DELETE "/api/auth/deletenote". Login required.
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {
        // Find the note to be delete.
        let note = await Notes.findById(req.params.id);
        if (!note) { return res.status(400).json({ success: false, msg: "Note not Found.", }); }

        // Check if the note user want to delete, is his/her note or user want to delete any other user's note.
        if (note.user.toString() !== req.user.id) {
            res.status(401).json({ success: false, msg: "Not Allowed to delete this note.", });
        }

        // Find and Delete the Note.
        note = await Notes.findByIdAndDelete(req.params.id);
        res.status(200).json({ note, success: true, msg: "Note has been deleted successfully." });
    } catch (error) {
        res.status(500).send("Internal sever Error.");
        console.log(error.message);
    }
});

module.exports = router;
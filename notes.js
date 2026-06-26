const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));


// Home Page

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});


// Save Note

app.post("/save-note", (req, res) => {

    const noteData =
        `Date: ${req.body.date}\nNote: ${req.body.note}\n-------------------------\n`;

    fs.appendFileSync("notes.txt", noteData);

    res.send(`
        <h2>✅ Note Saved Successfully</h2>
        <a href="/">Back to Home</a>
    `);
});


// View Notes

app.get("/notes", (req, res) => {

    if (!fs.existsSync("notes.txt")) {
        return res.send("<h2>No Notes Found</h2>");
    }

    let notes = fs.readFileSync("notes.txt", "utf8")
        .split("-------------------------\n")
        .filter(note => note.trim() !== "");

    let notesHTML = "";

    notes.forEach((note, index) => {

        notesHTML += `
        <div class="note-card">

            <div class="note-content">
                <pre>${note}</pre>
            </div>

           <div class="actions">

    <a href="/edit/${index}" class="edit-btn">
        ✏️ Edit
    </a>

    <a href="/delete/${index}" class="delete-btn">
        🗑️ Delete
    </a>

</div>
        </div>
        `;
    });

    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>All Notes</title>
        <link rel="stylesheet" href="/style.css">
    </head>
    <body>

        <div class="main-box">

            <h1>📋 All Notes</h1>

            ${notesHTML}

            <a href="/" class="back-btn">
                Back to Home
            </a>

        </div>

    </body>
    </html>
    `);
});


// Delete Note

app.get("/delete/:id", (req, res) => {

    const id = parseInt(req.params.id);

    let notes = fs.readFileSync("notes.txt", "utf8")
        .split("-------------------------\n")
        .filter(note => note.trim() !== "");

    notes.splice(id, 1);

    let updatedNotes = "";

    notes.forEach(note => {
        updatedNotes += note + "-------------------------\n";
    });

    fs.writeFileSync("notes.txt", updatedNotes);

    res.redirect("/notes");
});


// Edit Note Page

app.get("/edit/:id", (req, res) => {

    const id = parseInt(req.params.id);

    let notes = fs.readFileSync("notes.txt", "utf8")
        .split("-------------------------\n")
        .filter(note => note.trim() !== "");

    const note = notes[id];

    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Edit Note</title>
        <link rel="stylesheet" href="/style.css">
    </head>
    <body>

        <div class="main-box">

            <h1>✏️ Edit Note</h1>

            <form action="/update/${id}" method="post">

                <textarea
                    name="updatedNote"
                    required>${note}</textarea>

                <br><br>

                <button type="submit" class="save-btn">
                    Update Note
                </button>

            </form>

            <a href="/notes" class="back-btn">
                Back
            </a>

        </div>

    </body>
    </html>
    `);
});


// Update Note

app.post("/update/:id", (req, res) => {

    const id = parseInt(req.params.id);

    let notes = fs.readFileSync("notes.txt", "utf8")
        .split("-------------------------\n")
        .filter(note => note.trim() !== "");

    notes[id] = req.body.updatedNote;

    let updatedNotes = "";

    notes.forEach(note => {
        updatedNotes += note + "-------------------------\n";
    });

    fs.writeFileSync("notes.txt", updatedNotes);

    res.redirect("/notes");
});


// Start Server

app.listen(3001, () => {
    console.log("Server running on port 3001");
});
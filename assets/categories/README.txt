Drop one icon per category here, named to match the category's "id" in
data/catalog.json:

    games.png
    utilities.png
    productivity.png
    graphics.png
    music.png
    video.png
    internet.png
    education.png
    development.png
    system.png
    personalization.png

Each category tile automatically looks up "assets/categories/<id>.png"
(see the "icon" field already set per category in catalog.json). Until a
given file exists, that category's tile shows a plain colored monogram
instead - never an emoji or generic stock icon.

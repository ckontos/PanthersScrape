// click handler for viewing saved articles
function getSaved() {
    $.getJSON("/saved", function(data) {

        console.log(data);

        $("#savedArticlesDiv").empty();

        for (var i = 0; i < data.length; i++) {

            $("#savedArticlesDiv").append(
                "<div class='card text-white bg-info mb-3'><div class='card-header'>" +
                "<h3 class='title'>" + data[i].title + "</h3>" + "<a class='link' href='" + data[i].link + "'>View Full Article " + "</a>" +
                "<br /><br />" +
                '<button type="button" data-id="' + data[i]._id +
                '" class="btn btn-secondary articleNotes" data-toggle="modal" data-target="#noteModal">Article Notes</button><vr> ' +
                '<button href="#" data-id="' + data[i]._id +
                '" class="btn btn-secondary deleteSaved">Delete from Saved</button></div></div>'
            );
        }
    });
}

getSaved();

// click handler for deleting article on saved page.
$(document).on("click", ".deleteSaved", function() {
    var thisId = $(this).attr("data-id");
    $.ajax({
            method: "POST",
            url: "/deleteSaved/" + thisId,
        })

        .done(function(data) {
            location.reload();
        });
});

///////////////////// All actions relating to the user clicking the articleNotes button ///////////////////////

// Whenever someone clicks a view-notes button
$(document).on("click", ".articleNotes", function() {
    // Empty the notes from the note section
    $("#notes").empty();
    $("#newNote").empty();
    // Save the id from the article
    var thisId = $(this).attr("data-id");

    // Now make an ajax call for the Article
    $.ajax({
            method: "GET",
            url: "/articles/" + thisId
        })
        // add the note information to the modal
        .done(function(data) {
            console.log(data);

            // Show the modal... and build its components
            // $("#noteModal").modal("show");

            // An input to enter a new title
            $("#newNote").append("<input id='title-input' name='title' placeholder='Title' >" + "<br>");
            // A textarea to add a new note body
            $("#newNote").append("<br><textarea id='body-input' name='body' placeholder='Note'></textarea>" + "<br>");
            // A button to submit a new note
            $("#newNote").append("<button data-id='" + data._id + "' class='saveNote btn btn-primary' data-dismiss='modal'>Save Note</button>");

            // If there's a note in the article
            if (data.note.length != 0) {
                for (var i = 0; i < data.note.length; i++) {
                    $("#notes").append(
                        "<h5>" + data.note[i].title + "</h5>" +
                        "<p>" + data.note[i].body + "</p>" +
                        "<button data-id='" + data.note[i]._id + "' articleId='" + thisId + "' class='deleteNote btn btn-danger' data-dismiss='modal'>Delete Note</button><br><br>"
                    );
                }
            }
            else {
                $("#notes").append("There are currently no notes for this article" + "<br>" + "<br>");

            }



        });
});

// When you click the save-note button
$(document).on("click", ".saveNote", function() {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");

    // Run a POST request
    $.ajax({
            method: "POST",
            url: "/articles/" + thisId,
            data: {
                // Value taken from title input
                title: $("#title-input").val(),
                // Value taken from note textarea
                body: $("#body-input").val()
            }
        })
        // With that done
        .done(function(data) {
            // Empty the notes section
            $("#notes").empty();
        });

    // remove the values entered in the input and textarea for note entry and hide the modal
    $("#title-input").val("");
    $("#body-input").val("");
    $("#noteModal").modal("show");
});

// When you click the delete-note button
$(document).on("click", ".deleteNote", function() {
    // Grab the id associated with this note  
    var thisId = $(this).attr("data-id");
    var articleId = $(this).attr("articleId");
    console.log("inside delete-note " + thisId + " " + articleId);
    // Run DELETE method
    $.ajax({
            method: "DELETE",
            url: "/notes/deleteNote/" + thisId + "/" + articleId,
        })
        .done(function(data) { // hide the modal
            $("#noteModal").modal("show");
            alert("Delete successful!");
            location.reload();

        });

});

//  code to close the modal
$("#closeModal").on("click", function(event) {
    $("#noteModal").modal("hide");
});

////////////// end of modal click handlers /////////////////////////////

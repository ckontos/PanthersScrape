function getArticles() {
    $.getJSON("/articles", function(data) {
        $("#savedArticles").hide();
        for (var i = 0; i < data.length; i++) {
            $("#articles").append("<div class='panel panel-default'><div class='panel-heading'> <p data-id='" + data[i]._id + "'>" + data[i].title + "<button class='pull-right saveArticle' data-id='" + data[i]._id + "'>Save Article</button></p></div>" + "<div class='panel-body'><a href='" + data[i].link + "'>Link to Article</a>");
        }
    });
}

getArticles();

// click function for saving article
$(document).on("click", ".saveArticle", function() {
    // Grab the id associated with button
    var thisId = $(this).attr("data-id");

    // Run POST method
    $.ajax({
            method: "POST",
            url: "/saved/" + thisId,
        })
        .done(function(data) {
            console.log("article saved: " + data);
            // location.reload();
        });
});

// click handler for scrape button
$("#scrapeWeb").on("click", function() {
    $("#articles").empty();
    // run a call to delete the articles
    $.ajax({
        method: "DELETE",
        url: "/articles/delete"
    }).done(function() {
        $.ajax({
            method: "GET",
            url: "/scrape"
        }).done(function(data) {
            console.log(data);
            location.reload();
        });
    });
});


//click function for the all articles button
$("#viewAllArticles").on("click", function() {
    // hide the saved ones
    $("#savedArticles").hide();
    $("#articles").show();
    // run getJson
    getArticles();
});

// click handler for viewing saved articles
$("#viewSavedArticles").on("click", function() {
    $.getJSON("/saved", function(data) {
        $("#articles").hide();
        $("#savedArticles").show();
        $("#savedArticles").empty();

        for (var i = 0; i < data.length; i++) {

            $("#savedArticles").append("<div class='panel panel-default'><div class='panel-heading'> <p data-id='" + data[i]._id + "'>" + data[i].title + "<button class='pull-right viewNotes' type='button' data-target='#noteModal' data-toggle='modal' data-id='" + data[i]._id + "'>" + "View Notes" + "</button>" + "<button class='pull-right deleteArticle' data-id='" + data[i]._id + "'>Delete Article</button></p></div>" + "<div class='panel-body'><a href='" + data[i].link + "'>Link to Article</a>");
        }
    });
});

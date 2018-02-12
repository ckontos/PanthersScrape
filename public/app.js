function getArticles() {
    $.getJSON("/articles", function(data) {
        for (var i = 0; i < data.length; i++) {
            $("#articleDiv").append(
                "<div class='card text-white bg-info mb-3'><div class='card-header'>" +
                "<h3 class='title'>" + data[i].title + "</h3>" + "<a class='link' href='" + data[i].link + "'>View Full Article " + "</a>" +
                "<br /><br />" +
                '<button href="#" class="btn btn-secondary saveArticle" data-id="' + data[i]._id + '">Save Article</button></div></div>'
            );
        }
    });
}
getArticles();


// click handler for scrape button
$(".scraperButton").on("click", function() {
    $("#articleDiv").empty();

    $.ajax({
        method: "DELETE",
        url: "/articles/deleteAll"
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

// click function for saving article
$(document).on("click", ".saveArticle", function() {

    var thisId = $(this).attr("data-id");

    $.ajax({
            method: "POST",
            url: "/saved/" + thisId,
        })
        .done(function(data) {
            console.log("article saved: " + JSON.stringify(data));
            alert("Article Saved!");
        });
});

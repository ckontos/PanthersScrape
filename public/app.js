$.getJSON("/articles", function(data) {
    for (var i = 0; i < data.length; i++) {
        $("#articles").append("<div class='panel panel-default'><div class='panel-heading' id='titlePan'> <p data-id='" + data[i]._id + "'>" + data[i].title + "<button class='pull-right' id='saveArticle'>Save Article</button></p></div>" + "<div class='panel-body'><a href='" + data[i].link + "'>Link to Article</a>");
    }
});

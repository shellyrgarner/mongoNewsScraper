$(document).ready(function () {

    $("#scrapeButton").on("click", function () {
        window.location.href = "/scrape";

    });
    $("#scraperModal").modal();


    $(document).on("click", ".saveArticleButton", function () {
        var thisId = $(this).attr("data-articleId");

        $.ajax({
            method: "POST",
            url: "/articles/" + thisId,
            data: { saved: true }
        }).then(function () {
            console.log("this article id: " + thisId + " was changed to true");
        })
    });

    $(document).on("click", ".deleteArticleButton", function () {
        var thisId = $(this).attr("data-articleId");

        $.ajax({
            method: "POST",
            url: "/articles/" + thisId,
            data: { saved: false }
        }).then(function () {
            console.log("this article id: " + thisId + " was changed to false");
            location.reload();
        })
    });

    var articleId = "";
    var noteId = "";

    // When the add note to article button is clicked, ajax call checks for existing notes and loads them
    $(document).on("click", ".noteArticleButton", function () {
        $("#notes").empty();
        $("#userNotes").val("");
        noteId = "0";
        articleId = $(this).attr("data-articleId");
        $("#noteModalTitle").text("Notes for article ID " + articleId);
        $.ajax({
            method: "GET",
            url: "/saved/" + articleId
        }).then(function (data) {
            console.log(data.note);
            if (data.note) {
                noteId = data.note._id;
                $("#notes").append(`<textarea readonly disabled class='notes' placeholder='this article does not have any notes yet'> ${data.note.body} </textarea> <button type='button' data-noteId= ${noteId} class='close noteDelete' aria-label='Close'><span aria-hidden='true'>&times;</span></button>`);
                $("#userNotes").val(data.note.body);
            };
        });
    });

    //Delete note associated with article
    $(document).on("click", ".noteDelete", function () {
        $.ajax({
            method: "DELETE",
            url: "/saved/" + articleId + "/" + noteId,
        }).then(function () {
            $("#notes").empty();
            $("#userNotes").val("");
            location.reload();
        });
    });

    // Save or update an article note
    $("#saveNoteButton").on("click", function () {
        var note = $("#userNotes").val();

        $.ajax({
            method: "POST",
            url: "/saved/" + articleId + "/" + noteId,
            data: { body: note }
        }).then(function () {
            console.log("Note has been saved to " + articleId);
            $("#userNotes").val("");
            location.reload();
        });
    });

});
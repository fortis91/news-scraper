$(document).on("click", "#scrape", function () {
    console.log('scrape');
    $.get("/scrape").then(function (data) {
        console.log('scrape');
        location.reload();
    });
});

$(document).on("click", "#submitButton", function (event) {
    event.preventDefault();
    let requestBody = {
        title: $("#title")
            .val()
            .trim(),
        body: $("#body")
            .val()
            .trim()
    };
    $.post(location.href, requestBody).then(function (data) {
        location.reload();
    });
});


$(document).on("click", ".deleteComment", function (event) {
    event.preventDefault();
    let commentID = $(this).attr("data-id");
    $.ajax({
        url: location.href + "/" + commentID,
        type: 'DELETE',
        success: function (result) {
            location.reload();
        }
    });
});


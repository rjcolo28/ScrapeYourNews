$.getJSON("/articles", function(data) {
    for (var i = 0; i < data.length; i++) {
      $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
    }
  });

  $(document).on("click", "p", function() {
    $("#comments").empty();
    var thisId = $(this).attr("data-id");
    $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    })
      .then(function(data) {
        console.log(data);
        $("#comments").append("<h2>" + data.title + "</h2>");
        $("#comments").append("<input id='titleinput' name='title' >");
        $("#comments").append("<textarea id='bodyinput' name='body'></textarea>");
        $("#comments").append("<button data-id='" + data._id + "' id='savecomment'>Save Note</button>");
        if (data.note) {
          $("#titleinput").val(data.note.title);
          $("#bodyinput").val(data.note.body);
        }
      });
  });
  
  $(document).on("click", "#savecomment", function() {
    var thisId = $(this).attr("data-id");
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        title: $("#titleinput").val(),
        body: $("#bodyinput").val()
      }
    })
      .then(function(data) {
        console.log(data);
        $("#comments").empty();
      });
    $("#titleinput").val("");
    $("#bodyinput").val("");
  });
  
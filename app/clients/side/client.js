$(document).ready(function(){
  var currentDocument = {title : {value : "Untitled document", lastUpdate : 0},abstract : {value : "Abstract of the document", lastUpdate : 0},authors : {lastUpdate: -1, JournalsList : [{type:"author",name : "Marcello Vitali-Rosati",uri : "lienverslabnf",affiliation:"Université de Montréal"},{type: "geek", name : "Arthur Juchereau",affiliation:"Université de Montréal/Pi.ninja"}]},body : {value : "", lastUpdate : -1},journals:{lastUpdate : 0, journalsList : [{type : "Online", name : "sens-public", url : "http://sens-public.org/article1059.html"}]}, lastUpdate : 0};


  //Document interraction

  $(window).on('hashchange', function() {
    hashControler();
  });
  hashControler();

/*202 Mckimmy*/

function hashControler(){
  console.log(window.location.hash);
  if(window.location.hash == "#reader"){
    $("#navDisplayMode > p").removeClass("active");
    $("#navDisplayMode > p[data-mode=reader]").addClass("active");
    $(".validatorEditable").attr("contentEditable",false);
    $(".editable").attr("contentEditable",false);
    $("#flexiDisplay").removeClass("writer").removeClass("validator").addClass("reader");

  }
  else if(window.location.hash == "#validator"){
    $("#navDisplayMode > p").removeClass("active");
    $("#navDisplayMode > p[data-mode=validator]").addClass("active");
    $(".editable").attr("contentEditable",true);
    $(".validatorEditable").attr("contentEditable",true);
    $("#flexiDisplay").removeClass("writer").addClass("validator").removeClass("reader");

  }
  else{
    $("#navDisplayMode > p").removeClass("active");
    $("#navDisplayMode > p[data-mode=writer]").addClass("active");
    $(".validatorEditable").attr("contentEditable",false);
    $(".editable").attr("contentEditable",true);
    $("#flexiDisplay").addClass("writer").removeClass("validator").removeClass("reader");
  }
}



  $("#navDisplayMode > p").on("click",function(){
    if($(this).data("mode") == "reader"){
      window.location.hash = "reader";
    }
    else if($(this).data("mode") == "writer"){
      window.location.hash = "writer";
    }
    else if($(this).data("mode") == "validator"){
    window.location.hash = "validator";
    }
  });




//Copy as plain text
var forEach = function (array, callback, scope) {
  for (var i = 0; i < array.length; i++) {
    callback.call(scope, i, array[i]); // passes back stuff we need
  }
};
var myNodeList = document.querySelectorAll(".editable");
forEach(myNodeList, function (index, value) {
    value.addEventListener("paste", function(e) {
        e.preventDefault();
        $textObject = $(e.clipboardData.getData("text/html"));
        console.log($textObject);
        var text = "";
        forEach($textObject, function(index,value){
          if(value.innerText){
          console.log(value.innerText);
          //TODO : GET innerHTML and do filters on it

          text += '<p>'+value.innerText+'</p>';
          }
        });
        console.log(text);
        //var text = e.clipboardData.getData("text/plain");
        document.execCommand("insertHTML", false, text);
    });
});


  //Socket management
    var socket = io.connect('http://10.12.58.96:8090');

    socket.on('announcements', function(data) {
        console.log('Got announcement:', data.message);
    });
    socket.on('initialise', function(data) {
      //title initialization
      drawTitle(data.currentDocument.title)

      //abstract ini
      drawAbstract(data.currentDocument.abstract);


      //Authors ini
      drawAuthors(data.currentDocument.authors);

      //Body populate
      drawBody(data.currentDocument.body);

      //Journals populate
      drawJournals(data.currentDocument.journals);

      $("#navOnlineStatus").html('Online').addClass("online");
    });

    socket.on('updateTitle', function(data){
        drawTitle(data);
    });

    socket.on('updateAbstract', function(data){
        drawAbstract(data);
    });

    socket.on('updateAuthors', function(data){
        drawAuthors(data);
    });


    socket.on('updateJournals', function(data){
        drawJournals(data);
    });

    socket.on('updateBody', function(data){
        drawBody(data);
    });


    socket.on('userCount', function(data) {
        if(data.clients > 1){
          $("#navUserCount").html(data.clients+' users connected');
        }
        else if(data.clients == 1){
          $("#navUserCount").html(data.clients+' user connected');
        }
        else{
          $("#navUserCount").html('No user connected');
        }
        console.log('Update number of user:', data.clients);
    });
    socket.on('newCover', function(data) {
        console.log('Update cover pic:', data.cover);
    });
    socket.on('newPicture', function(data) {
        console.log('Add pic:', data.picture);
        $item = $('<figure class="grid-item"><img src="/thumbs/'+data.picture+'" data-who="'+data.who+'" data-time="'+data.time+'"></figure>');
      $(".grid").prepend( $item );

    });

//title Handlers

    $("#documentTitle").on("focus",function(){
      if($(this).html() == "Untitled document"){
        $(this).html("");
      }
    });
    $("#documentTitle").on("focusout",function(){
      if($(this).html() == ""){
        $(this).html("Untitled document");
      }
    });
    $("#documentTitle").on("input",function(){
      if($(this).html() == "" || $(this).html() == "Untitled document"){
        $(this).addClass("toEdit");
      }
      else{
        $(this).removeClass("toEdit");
      }
        currentDocument.title.lastUpdate = Date.now();
        currentDocument.title.value = $(this).html();
        socket.emit("updateTitle",currentDocument.title);
    });

//Abstract Handlers

    $("#documentAbstract").on("focus",function(){
      if($(this).html() == "Abstract of the document"){
        $(this).html("");
      }
    });
    $("#documentAbstract").on("focusout",function(){
      if($(this).html() == ""){
        $(this).html("Abstract of the document");
      }
    });
    $("#documentAbstract").on("input",function(){
      if($(this).html() == "" || $(this).html() == "Abstract of the document"){
        $(this).addClass("toEdit");
      }
      else{
        $(this).removeClass("toEdit");
      }
        currentDocument.abstract.lastUpdate = Date.now();
        currentDocument.abstract.value = $(this).html();
        socket.emit("updateAbstract",currentDocument.abstract);
    });


    //update title method
    function drawTitle(newTitle){
      //abstract ini
      if(newTitle.lastUpdate > currentDocument.title.lastUpdate){
        $("#documentTitle").html(newTitle.value);
        if(newTitle.value == "" || newTitle.value == "Untitled document"){
          $("#documentTitle").addClass("toEdit");
        }
        else{
          $("#documentTitle").removeClass("toEdit");
        }
      }
    }



    //update abstract method
    function drawAbstract(newAbstract){
      //abstract ini
      if(newAbstract.lastUpdate > currentDocument.abstract.lastUpdate){
        $("#documentAbstract").html(newAbstract.value);
        if(newAbstract.value == "" || newAbstract.value == "Abstract of the document"){
          $("#documentAbstract").addClass("toEdit");
        }
        else{
          $("#documentAbstract").removeClass("toEdit");
        }
      }
    }

    //update authors method
    function drawAuthors(newAuthors,forced = false){
      console.log(currentDocument.authors);
      forced = typeof forced !== 'undefined' ? forced : false;
      if(newAuthors.lastUpdate > currentDocument.authors.lastUpdate || forced){
        currentDocument.authors = newAuthors;
        $("#authors").html("");
        for(i=0;i<newAuthors.authorsList.length;i++){
          $newInsert = $('<article class="author" data-id="'+i+'"><p class="name required validatorEditable toEdit">Name of the person</p><p class="uri validatorEditable toEdit">URI of the person</p><p class="affiliation validatorEditable toEdit required">affiliation</p><p class="role required validatorEditable toEdit">Role of the person</p><i class="fa fa-user-times clickable deleteAuthor" aria-hidden="true"></i></article>');
          if(typeof newAuthors.authorsList[i].name != "undefined" && newAuthors.authorsList[i].name != ""){
            $newInsert.children('.name').html(newAuthors.authorsList[i].name).removeClass("toEdit");
          }
          if(typeof newAuthors.authorsList[i].affiliation != "undefined" && newAuthors.authorsList[i].affiliation != ""){
            $newInsert.children('.affiliation').html(newAuthors.authorsList[i].affiliation).removeClass("toEdit");
          }
          if(typeof newAuthors.authorsList[i].type != "undefined" && newAuthors.authorsList[i].type != ""){
            $newInsert.children('.role').html(newAuthors.authorsList[i].type).removeClass("toEdit");
          }
          if(typeof newAuthors.authorsList[i].uri != "undefined" && newAuthors.authorsList[i].uri != ""){
            $newInsert.children('.uri').html(newAuthors.authorsList[i].uri).removeClass("toEdit");
          }
          $("#authors").append($newInsert);
        }
        $("#authors").append('<p class="clickable fa fa-user-plus" id="addAuthor">Add a person</p>');
      }
      $("#addAuthor").unbind("click");
      $("#addAuthor").on("click",function(){
        currentDocument.authors.lastUpdate = Date.now();
        var newAuthor = {};
        currentDocument.authors.authorsList.push(newAuthor);
        $("#addAuthor").before('<article class="author" data-id="'+i+'"><p class="name required validatorEditable toEdit" contentEditable="true">Name of the person</p><p class="uri validatorEditable toEdit" contentEditable="true">URI of the person</p><p class="affiliation validatorEditable toEdit required" contentEditable="true">Affiliation</p><p class="role required validatorEditable toEdit" contentEditable="true">Role of the person</p><i class="fa fa-user-times clickable deleteAuthor" aria-hidden="true"></i></article>');
        drawAuthors(currentDocument.authors,true);
        socket.emit("updateAuthors",currentDocument.authors);
      });

      $(".deleteAuthor").unbind("click").on("click",function(){
        console.log("deleting");
        currentDocument.authors.authorsList.splice($(this).parent("article").data("id"),1);
        currentDocument.authors.lastUpdate = Date.now();
        $(this).parent("article").remove();
        drawAuthors(currentDocument.authors,true);
        socket.emit("updateAuthors",currentDocument.authors);
      });

      //Update name of the author
      $("#authors > article > p.name").unbind("focus").on("focus",function(){
        if($(this).html() == "Name of the person"){
          $(this).html("");
          $(this).addClass("toEdit");
        }
      });
      $("#authors > article > p.name").unbind("focusout").on("focusout",function(){
        if($(this).html() == ""){
          $(this).html("Name of the person");
          $(this).addClass("toEdit");
        }
      });
      $("#authors > article > p.name").unbind("input");
      $("#authors > article > p.name").on("input",function(){
        if($(this).html != "Name of the person" || $(this).html() != ""){
          $(this).removeClass("toEdit");
        }
        currentDocument.authors.authorsList[$(this).parent("article").data("id")].name = $(this).html();
        currentDocument.authors.lastUpdate = Date.now();
        socket.emit("updateAuthors",currentDocument.authors);
      });

      $("#authors > article > p.uri").unbind("focus").on("focus",function(){
        if($(this).html() == "URI of the person"){
          $(this).html("");
          $(this).addClass("toEdit");
        }
      });
      $("#authors > article > p.uri").unbind("focusout").on("focusout",function(){
        if($(this).html() == ""){
          $(this).html("URI of the person");
          $(this).addClass("toEdit");
        }
      });
      $("#authors > article > p.uri").unbind("input");
      $("#authors > article > p.uri").on("input",function(){
        if($(this).html != "URI of the person" || $(this).html() != ""){
          $(this).removeClass("toEdit");
        }
        currentDocument.authors.authorsList[$(this).parent("article").data("id")].uri = $(this).html();
        currentDocument.authors.lastUpdate = Date.now();
        socket.emit("updateAuthors",currentDocument.authors);
      });


      $("#authors > article > p.affiliation").unbind("focus").on("focus",function(){
        if($(this).html() == "affiliation"){
          $(this).html("");
          $(this).addClass("toEdit");
        }
      });
      $("#authors > article > p.affiliation").unbind("focusout").on("focusout",function(){
        if($(this).html() == ""){
          $(this).html("affiliation");
          $(this).addClass("toEdit");
        }
      });
      $("#authors > article > p.affiliation").unbind("input");
      $("#authors > article > p.affiliation").on("input",function(){
        if($(this).html != "affiliation" || $(this).html() != ""){
          $(this).removeClass("toEdit");
        }
        currentDocument.authors.authorsList[$(this).parent("article").data("id")].affiliation = $(this).html();
        currentDocument.authors.lastUpdate = Date.now();
        socket.emit("updateAuthors",currentDocument.authors);
      });


      $("#authors > article > p.role").unbind("focus").on("focus",function(){
        if($(this).html() == "Role of the person"){
          $(this).html("");
          $(this).addClass("toEdit");
        }
      });
      $("#authors > article > p.role").unbind("focusout").on("focusout",function(){
        if($(this).html() == ""){
          $(this).html("Role of the person");
          $(this).addClass("toEdit");
        }
      });
      $("#authors > article > p.role").unbind("input");
      $("#authors > article > p.role").on("input",function(){
        if($(this).html != "Role of the person" || $(this).html() != ""){
          $(this).removeClass("toEdit");
        }
        currentDocument.authors.authorsList[$(this).parent("article").data("id")].type = $(this).html();
        currentDocument.authors.lastUpdate = Date.now();
        socket.emit("updateAuthors",currentDocument.authors);
      });
     hashControler();
    }

    function drawJournals(newJournals,forced = false){
      forced = typeof forced !== 'undefined' ? forced : false;
      if(newJournals.lastUpdate > currentDocument.journals.lastUpdate || forced){
        currentDocument.journals = newJournals;
        $("#journals").html("");
        for(i=0;i<newJournals.journalsList.length;i++){
          $newInsert = $('<article class="journal" data-id="'+i+'"><p class="name required validatorEditable toEdit">Name of the publication</p><p class="url validatorEditable toEdit">URL of publication</p><p class="type required validatorEditable toEdit">Type of journal</p><p class="director required validatorEditable toEdit">Director of the publication</p><i class="fa fa-minus-circle clickable deleteJournal" aria-hidden="true"></i></article>');
          if(typeof newJournals.journalsList[i].name != "undefined" && newJournals.journalsList[i].name != ""){
            $newInsert.children('.name').html(newJournals.journalsList[i].name).removeClass("toEdit");
          }
          if(typeof newJournals.journalsList[i].type != "undefined" && newJournals.journalsList[i].type != ""){
            $newInsert.children('.type').html(newJournals.journalsList[i].type).removeClass("toEdit");
          }
          if(typeof newJournals.journalsList[i].url != "undefined" && newJournals.journalsList[i].url != ""){
            $newInsert.children('.url').html(newJournals.journalsList[i].url).removeClass("toEdit");
          }
          if(typeof newJournals.journalsList[i].director != "undefined" && newJournals.journalsList[i].Director != ""){
            $newInsert.children('.director').html(newJournals.journalsList[i].director).removeClass("toEdit");
          }
          $("#journals").append($newInsert);
        }
        $("#journals").append('<p class="clickable fa fa-plus-circle" id="addJournal">Add a publication</p>');
      }
      $("#addJournal").unbind("click");
      $("#addJournal").on("click",function(){
        currentDocument.journals.lastUpdate = Date.now();
        var newJournal = {};
        currentDocument.journals.journalsList.push(newJournal);
        $("#addJournal").before('<article class="journal" data-id="'+i+'"><p class="name required validatorEditable toEdit">Name of the publication</p><p class="url validatorEditable toEdit">URL of publication</p><p class="type required validatorEditable toEdit">Type of journal</p><p class="director required validatorEditable toEdit">Director of the publication</p><i class="fa fa-minus-circle clickable deleteJournal" aria-hidden="true"></i></article>');
        drawjournals(currentDocument.journals,true);
        socket.emit("updateJournals",currentDocument.journals);
      });

      $(".deleteJournal").unbind("click").on("click",function(){
        console.log("deleting");
        currentDocument.journals.journalsList.splice($(this).parent("article").data("id"),1);
        currentDocument.journals.lastUpdate = Date.now();
        $(this).parent("article").remove();
        drawjournals(currentDocument.journals,true);
        socket.emit("updatejournals",currentDocument.journals);
      });

      //Update name of the Journal
      $("#journals > article > p.name").unbind("focus").on("focus",function(){
        if($(this).html() == "Name of the publication"){
          $(this).html("");
          $(this).addClass("toEdit");
        }
      });
      $("#journals > article > p.name").unbind("focusout").on("focusout",function(){
        if($(this).html() == ""){
          $(this).html("Name of the publication");
          $(this).addClass("toEdit");
        }
      });
      $("#journals > article > p.name").unbind("input");
      $("#journals > article > p.name").on("input",function(){
        if($(this).html != "Name of the publication" || $(this).html() != ""){
          $(this).removeClass("toEdit");
        }
        currentDocument.journals.journalsList[$(this).parent("article").data("id")].name = $(this).html();
        currentDocument.journals.lastUpdate = Date.now();
        socket.emit("updatejournals",currentDocument.journals);
      });

      $("#journals > article > p.uri").unbind("focus").on("focus",function(){
        if($(this).html() == "URL of publication"){
          $(this).html("");
          $(this).addClass("toEdit");
        }
      });
      $("#journals > article > p.uri").unbind("focusout").on("focusout",function(){
        if($(this).html() == ""){
          $(this).html("URL of publication");
          $(this).addClass("toEdit");
        }
      });
      $("#journals > article > p.uri").unbind("input");
      $("#journals > article > p.uri").on("input",function(){
        if($(this).html != "URL of publication" || $(this).html() != ""){
          $(this).removeClass("toEdit");
        }
        currentDocument.journals.journalsList[$(this).parent("article").data("id")].url = $(this).html();
        currentDocument.journals.lastUpdate = Date.now();
        socket.emit("updateJournals",currentDocument.journals);
      });


      $("#journals > article > p.director").unbind("focus").on("focus",function(){
        if($(this).html() == "Director of the publication"){
          $(this).html("");
          $(this).addClass("toEdit");
        }
      });
      $("#journals > article > p.affiliation").unbind("focusout").on("focusout",function(){
        if($(this).html() == ""){
          $(this).html("Director of the publication");
          $(this).addClass("toEdit");
        }
      });
      $("#journals > article > p.director").unbind("input");
      $("#journals > article > p.director").on("input",function(){
        if($(this).html != "Director of the publication" || $(this).html() != ""){
          $(this).removeClass("toEdit");
        }
        currentDocument.journals.journalsList[$(this).parent("article").data("id")].director = $(this).html();
        currentDocument.journals.lastUpdate = Date.now();
        socket.emit("updateJournals",currentDocument.journals);
      });


      $("#journals > article > p.type").unbind("focus").on("focus",function(){
        if($(this).html() == "Type of the publication"){
          $(this).html("");
          $(this).addClass("toEdit");
        }
      });
      $("#journals > article > p.type").unbind("focusout").on("focusout",function(){
        if($(this).html() == ""){
          $(this).html("Type of the publication");
          $(this).addClass("toEdit");
        }
      });
      $("#journals > article > p.type").unbind("input");
      $("#journals > article > p.type").on("input",function(){
        if($(this).html != "Type of the publication" || $(this).html() != ""){
          $(this).removeClass("toEdit");
        }
        currentDocument.journals.journalsList[$(this).parent("article").data("id")].type = $(this).html();
        currentDocument.journals.lastUpdate = Date.now();
        socket.emit("updateJournals",currentDocument.journals);
      });
     hashControler();
    }

    function drawBody(newBody){
      if(newBody.lastUpdate > currentDocument.body.lastUpdate){
        $('body > div.container.writer > section.main').html(newBody.value);
        $('body > div.container.writer > section.main').on("input",function(){
          $('body > div.container.writer > section.main > p').each(function(){
            var str = $(this).html();
            if(str.startsWith("# ")){
              $(this).removeClass("h2").removeClass("h3").addClass("h1").html(str.substring(2));
            }
            else if(str.startsWith("## ")){
              $(this).removeClass("h1").removeClass("h3").addClass("h2").html(str.substring(3));
            }
            else if(str.startsWith("### ")){
              $(this).removeClass("h1").removeClass("h2").addClass("h3").html(str.substring(4));
            }
            if(str.startsWith("#### ")){
             $(this).removeClass("h1").removeClass("h2").removeClass("h3").html(str.substring(5));
           }
          });


          currentDocument.body.value = $(this).html();
          currentDocument.body.lastUpdate = Date.now();
          socket.emit("updateBody",currentDocument.body);
        });
      }
    }


    $('body > div.container.writer > section.main').keydown(function(e) {
    // trap the return key being pressed
    if (e.keyCode == 13) {
      console.log("return key pressed");
      // insert 2 br tags (if only one br tag is inserted the cursor won't go to the second line)
      document.execCommand('insertParagraph', false);
      var quote = window.getSelection().focusNode.parentNode;
      $(quote).removeClass("h1");
      // prevent the default behaviour of return key pressed
      return false;
    }
  });

    function addUploadPicture(){
      $uploadPicture = $('<form class="uploadPicture" method="post" action="/upload/picture"><input type="file" name="picture" id="uploadPicture"  accept="image/*" capture></form>');
      $(".uploadPicture").remove();
      $("section#photos").children("article.coeurcoeurcoeur").after($uploadPicture);
      $('#uploadPicture').on('change', function(){
        var files = $(this).get(0).files;
        if (files.length > 0){
          // One or more files selected, process the file upload
            var formData = new FormData();
            // loop through all the selected files
            for (var i = 0; i < files.length; i++) {
              var file = files[i];
              // add the files to formData object for the data payload
              formData.append('uploads[]', file, file.name);
            }
            $.ajax({
            url: '/upload/picture',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(data){
                console.log('upload successful!');
            }
          });
        }
      });
    }

});

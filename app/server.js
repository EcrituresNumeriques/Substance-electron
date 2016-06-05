var fs = require("fs");
var express = require('express');
var xpr = express();
var path = require('path');
var formidable = require('formidable');
var server = require('http').Server(xpr);
var io = require('socket.io')(server);
var gm = require('gm');

var file = path.join(__dirname,"/data/");
var saveTo = path.join(file,"default.json");



function saveData(data){
    fs.writeFile(saveTo, JSON.stringify(data), function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The file was saved!");
  });
}

  var currentDocument = {title : {value : "Untitled document", lastUpdate : 0},abstract : {value : "Abstract of the document", lastUpdate : 0},authors : {lastUpdate: 1, authorsList : [{type:"author",name : "Marcello Vitali-Rosati",uri : "lienverslabnf",affiliation:"Université de Montréal"},{type: "geek", name : "Arthur Juchereau",affiliation:"Université de Montréal/Pi.ninja"}]},body : {value : '<p class="h1">Heading</p>', lastUpdate : 1},journals : {lastUpdate : 1, journalsList : [{type : "Online", name : "sens-public", url : "http://sens-public.org/article1059.html"}]}, lastUpdate : 1};



fs.readFile(saveTo,function(err,data){
  currentDocument = JSON.parse(data);
});

xpr.use('/side', express.static(__dirname + '/clients/side'));
xpr.use('/uploads', express.static(__dirname + '/clients/uploads'));
xpr.use('/thumbs', express.static(__dirname + '/clients/thumbs'));

xpr.get('/', function(req, res) {
    res.sendFile(__dirname + '/clients/index.html');
});

var clients = 0;
io.on('connection', function(socket) {
    socket.emit('initialise',{currentDocument : currentDocument});
    clients++;
    io.sockets.emit('userCount', {clients : clients});
    console.log('User connected ('+clients+' connected)');

    socket.on('updateTitle', function(data) {
      if(data.lastUpdate > currentDocument.title.lastUpdate){
        currentDocument.title.lastUpdate = data.lastUpdate;
        currentDocument.title.value = data.value;
        io.sockets.emit('updateTitle', currentDocument.title);
        console.log("title : "+currentDocument.title.value);
        saveData(currentDocument);
      }
      else{
        console.log("data perished");
      }
    });

    socket.on('updateAbstract', function(data) {
      if(data.lastUpdate > currentDocument.abstract.lastUpdate){
        currentDocument.abstract.lastUpdate = data.lastUpdate;
        currentDocument.abstract.value = data.value;
        io.sockets.emit('updateAbstract', currentDocument.abstract);
        console.log("Abstract : "+currentDocument.abstract.value);
        saveData(currentDocument);
      }
      else{
        console.log("data perished");
      }
    });


    socket.on('updateAuthors', function(data) {
      if(data.lastUpdate > currentDocument.authors.lastUpdate){
        currentDocument.authors = data;
        io.sockets.emit('updateAuthors', currentDocument.authors);
        console.log("Update authors"+JSON.stringify(currentDocument.authors));
        saveData(currentDocument);
      }
      else{
        console.log("data perished");
      }
    });

    socket.on('updateJournals', function(data) {
      if(data.lastUpdate > currentDocument.journals.lastUpdate){
        currentDocument.journals = data;
        io.sockets.emit('updateJournals', currentDocument.journals);
        console.log("Update Journals"+JSON.stringify(currentDocument.journals));
        saveData(currentDocument);
      }
      else{
        console.log("data perished");
      }
    });


    socket.on('updateBody', function(data) {
      if(data.lastUpdate > currentDocument.body.lastUpdate){
        currentDocument.body = data;
        io.sockets.emit('updateBody', currentDocument.body);
        //console.log("Update Body"+JSON.stringify(currentDocument.body));
      }
      else{
        console.log("data perished");
      }
    });

    socket.on('disconnect', function(data) {
      saveData(currentDocument);
        clients--;
        io.sockets.emit('userCount', {clients : clients});
        console.log('Client quit ('+clients+' connected)');
    });
});

function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 10; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}


server.listen(8090);
console.log('listening on 8090');

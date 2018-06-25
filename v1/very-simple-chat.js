(function () {

  var btnSubmit = $("#submit")
  var messageIn = $("#message-input");
  var messageBox = $(".messages");
  var btnStartOver = $("#start-over");
  var btnShowMore = $("#show-more");
  var startingMessage = $("#starting-message");
  var loadingMessage = $("#loading-message");
  var db = firebase.database();
  var messagesRf = db.ref("/messages");
  var msg;
  var limitOfLastMessages = 6;
  var lastKnownDomainValue = null;
  console.log("CONNECTED");



  function sendMessage() {
    msg = messageIn.val();
    if(msg != "") {
      messagesRf.push({
        message: msg,
        username: "Anonymous",
        time: firebase.database.ServerValue.TIMESTAMP,
      });
    }
    messageIn.val("");
  }


  messagesRf.orderByChild('time').limitToLast(limitOfLastMessages).once('value', function(snapshot) {
    if(snapshot.numChildren() > 0) {
      startingMessage.remove();
      loadingMessage.remove();
    }else {
      loadingMessage.text("No messages yet");
    }
    counter = 1;
    snapshot.forEach(function(childSnapshot) {
      if (counter == 1) {
        lastKnownDomainValue = childSnapshot.val().time;
        counter++;
      }
    });
  });

  var getPreviousMessages = function() {
    console.log("da",lastKnownDomainValue);
    messagesRf.orderByChild('time').endAt(lastKnownDomainValue).limitToLast(limitOfLastMessages).on('value', function(snapshot) {
      peddingChatList = [];
      counter = 1;
      snapshot.forEach(function(childSnapshot) {
        if (counter == 1) {
          lastKnownDomainValue = childSnapshot.val().time;
          counter++;
        }
        message = "<div class='message'>" + childSnapshot.val().message + "<div class='username'>by <em>" + snapshot.val().username + "<em></div></div>";
        peddingChatList.push(message);
      });
      peddingChatList.pop(0);
      messageBox.prepend(peddingChatList);
    });
  }






  messagesRf.orderByChild('time').limitToLast(limitOfLastMessages).on('child_added', function(snapshot) {
    if(snapshot.numChildren() > 0) {
      startingMessage.remove();
      loadingMessage.remove();
    }
    console.log(snapshot.val().message);
    messageBox.append("<div class='message'>" + snapshot.val().message + "<div class='username'>by <em>" + snapshot.val().username + "<em></div></div>");
    // messageBox.scrollTop(messageBox[0].scrollHeight);
    messageBox.stop().animate({
      scrollTop: messageBox[0].scrollHeight
    }, 500);

  });




  messagesRf.on('child_removed', function(snapshot) {
    messageBox.text("");
    messageBox.html(startingMessage);
    messageBox.append(loadingMessage);
  });

  messageIn.on("keydown", function(event) {
    if(event.keyCode == 13) {
      sendMessage();
    }
  });


  btnSubmit.on('click', function () {
    sendMessage();
  })

  btnStartOver.on('click', function () {
    messagesRf.remove()
      .then(function() {
        console.log("Remove succeeded.")
      })
      .catch(function(error) {
        console.log("Remove failed: " + error.message)
      });
  })

  btnShowMore.on('click', function() {
    var firstMsg = $('.message:first');

    // Where the page is currently:
    var curOffset = firstMsg.offset().top - messageBox.scrollTop();
    getPreviousMessages();

    messageBox.scrollTop(firstMsg.offset().top-curOffset);
    messageBox.stop().animate({
      scrollTop:0 ,
    }, 500);
  })

}());

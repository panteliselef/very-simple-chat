(function () {

  var btnSubmitLeft = $("#left-chat #submit");
  var btnSubmitRight = $("#right-chat #submit");
  var messageInLeft = $("#left-chat #message-input");
  var messageInRight = $("#right-chat #message-input");
  var messageBoxLeft = $("#left-chat .messages");
  var messageBoxRight = $("#right-chat .messages");
  var messageBoxBoth = $(".messages")
  var btnStartOver = $("#start-over");
  var btnShowMore = $("#show-more");
  var startingMessageLeft = $("#left-chat #starting-message");
  var loadingMessageLeft = $("#left-chat #loading-message");
  var startingMessageRight = $("#right-chat #starting-message");
  var loadingMessageRight = $("#right-chat #loading-message");
  var db = firebase.database();
  var messagesRf = db.ref("/messages");
  var msg;
  var limitOfLastMessages = 6;
  var lastKnownDomainValue = null;
  console.log("CONNECTED");



  function sendMessageFromLeft() {
    msg = messageInLeft.val();
    if(msg != "") {
      messagesRf.push({
        message: msg,
        username: "elefcodes",
        time: firebase.database.ServerValue.TIMESTAMP,
      });
    }
    messageInLeft.val("");
  }
  function sendMessageFromRight() {
    msg = messageInRight.val();
    if(msg != "") {
      messagesRf.push({
        message: msg,
        username: "john",
        time: firebase.database.ServerValue.TIMESTAMP,
      });
    }
    messageInRight.val("");
  }

  messagesRf.orderByChild('time').limitToLast(limitOfLastMessages).once('value', function(snapshot) {
    if(snapshot.numChildren() > 0) {
      startingMessageLeft.remove();
      loadingMessageLeft.remove();
      startingMessageRight.remove();
      loadingMessageRight.remove();
    }else {
      loadingMessageLeft.text("No messages yet");
      loadingMessageRight.text("No messages yet");
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
        if(snapshot.val().username == "elefcodes") {
          id='me';
        }else id = 'you'
        message = "<div id=" + id + "class=message>" + childSnapshot.val().message + "<div class='username'>by <em>" + snapshot.val().username + "<em></div></div>";
        peddingChatList.push(message);
      });
      peddingChatList.pop(0);
      messageBoxLeft.prepend(peddingChatList);
    });
  }





  // Get messages from left chat
  messagesRf.orderByChild('time').limitToLast(limitOfLastMessages).on('child_added', function(snapshot) {
    if(snapshot.numChildren() > 0) {
      startingMessageLeft.remove();
      loadingMessageLeft.remove();
      startingMessageRight.remove();
      loadingMessageRight.remove();
    }
    console.log(snapshot.val().message);
    if(snapshot.val().username == "elefcodes") {
      id='me';
    }else id = 'you'
    messageBoxLeft.append("<div id='" + id + "' class='message'>" + snapshot.val().message + "<div class='username'>by <em>" + snapshot.val().username + "<em></div></div>");
    // messageBox.scrollTop(messageBox[0].scrollHeight);
    messageBoxLeft.stop().animate({
      scrollTop: messageBoxLeft[0].scrollHeight
    }, 500);

  });

  // Get messages for right chat
  messagesRf.orderByChild('time').limitToLast(limitOfLastMessages).on('child_added', function(snapshot) {
    if(snapshot.numChildren() > 0) {
      startingMessageLeft.remove();
      loadingMessageLeft.remove();
      startingMessageRight.remove();
      loadingMessageRight.remove();
    }
    console.log(snapshot.val().message);
    if(snapshot.val().username != "elefcodes") {
      id='me';
    }else id = 'you'
    messageBoxRight.append("<div id='" + id + "' class='message'>" + snapshot.val().message + "<div class='username'>by <em>" + snapshot.val().username + "<em></div></div>");
    // messageBox.scrollTop(messageBox[0].scrollHeight);
    messageBoxRight.stop().animate({
      scrollTop: messageBoxRight[0].scrollHeight
    }, 500);

  });



  messagesRf.on('child_removed', function(snapshot) {
    messageBoxBoth.text("");
    messageBoxBoth.html(startingMessageLeft);
    messageBoxBoth.append(loadingMessageLeft);
  });

  messageInLeft.on("keydown", function(event) {
    if(event.keyCode == 13) {
      sendMessageFromLeft();
    }
  });
  messageInRight.on("keydown", function(event) {
    if(event.keyCode == 13) {
      sendMessageFromRight();
    }
  });


  btnSubmitLeft.on('click', function () {
    sendMessageFromLeft();
  })
  btnSubmitRight.on('click', function () {
    sendMessageFromRight();
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

  // btnShowMore.on('click', function() {
  //   var firstMsg = $('.message:first');
  //   // Where the page is currently:
  //   var curOffset = firstMsg.offset().top - messageBox.scrollTop();
  //   getPreviousMessages();
  //
  //   messageBox.scrollTop(firstMsg.offset().top-curOffset);
  //   messageBox.stop().animate({
  //     scrollTop:0 ,
  //   }, 500);
  // })

}());

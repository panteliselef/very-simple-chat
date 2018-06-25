(function () {

  var btnSubmit = $("#submit")
  var messageIn = $("#message-input");
  var messageBox = $(".messages");
  var btnStartOver = $("#start-over");
  var sideBar = $("#side-bar");
  var btnShowMore = $("#show-more");
  var startingMessage = $("#starting-message");
  var loadingMessage = $("#loading-message");
  var db = firebase.database();
  var messagesRf = db.ref("/messages");
  var chatsRf = db.ref("/chats");
  var dbUsers = db.ref("/users")
  var msg;
  var limitOfLastMessages = 6;
  var lastKnownDomainValue = null;
  var receiver = null;
  console.log("CONNECTED");





  // messagesRf.orderByChild('time').limitToLast(limitOfLastMessages).once('value', function(snapshot) {
  //   if(snapshot.numChildren() > 0) {
  //     startingMessage.remove();
  //     loadingMessage.remove();
  //   }else {
  //     loadingMessage.text("No messages yet");
  //   }
  //   counter = 1;
  //   snapshot.forEach(function(childSnapshot) {
  //     if (counter == 1) {
  //       lastKnownDomainValue = childSnapshot.val().time;
  //       counter++;
  //     }
  //   });
  // });

  // var getPreviousMessages = function() {
  //   console.log("da",lastKnownDomainValue);
  //   messagesRf.orderByChild('time').endAt(lastKnownDomainValue).limitToLast(limitOfLastMessages).on('value', function(snapshot) {
  //     peddingChatList = [];
  //     counter = 1;
  //     snapshot.forEach(function(childSnapshot) {
  //       if (counter == 1) {
  //         lastKnownDomainValue = childSnapshot.val().time;
  //         counter++;
  //       }
  //       message = "<div class='message'>" + childSnapshot.val().message + "<div class='username'>by <em>" + snapshot.val().username + "<em></div></div>";
  //       peddingChatList.push(message);
  //     });
  //     peddingChatList.pop(0);
  //     messageBox.prepend(peddingChatList);
  //   });
  // }






  // messagesRf.orderByChild('time').limitToLast(limitOfLastMessages).on('child_added', function(snapshot) {
  //   if(snapshot.numChildren() > 0) {
  //     startingMessage.remove();
  //     loadingMessage.remove();
  //   }
  //   console.log(snapshot.val().message);
  //   messageBox.append("<div class='message'>" + snapshot.val().message + "<div class='username'>by <em>" + snapshot.val().username + "<em></div></div>");
  //   // messageBox.scrollTop(messageBox[0].scrollHeight);
  //   messageBox.stop().animate({
  //     scrollTop: messageBox[0].scrollHeight
  //   }, 500);
  //
  // });

  //
  // messagesRf.on('child_removed', function(snapshot) {
  //   messageBox.text("");
  //   messageBox.html(startingMessage);
  //   messageBox.append(loadingMessage);
  // });



  // btnStartOver.on('click', function () {
  //   messagesRf.remove()
  //     .then(function() {
  //       console.log("Remove succeeded.")
  //     })
  //     .catch(function(error) {
  //       console.log("Remove failed: " + error.message)
  //     });
  // })
  //
  // btnShowMore.on('click', function() {
  //   var firstMsg = $('.message:first');
  //
  //   // Where the page is currently:
  //   var curOffset = firstMsg.offset().top - messageBox.scrollTop();
  //   getPreviousMessages();
  //
  //   messageBox.scrollTop(firstMsg.offset().top-curOffset);
  //   messageBox.stop().animate({
  //     scrollTop:0 ,
  //   }, 500);
  // })

  function createStruct(userId, receiverId, pushKey) {
    db.ref("/users/"+userId+"/friends").push({
      uid: receiverId,
      chatUid: pushKey,
    });
    db.ref("/users/"+receiverId+"/friends").push({
      uid: userId,
      chatUid: pushKey,
    });

    // db.ref("/messages/"+pushKey).push({
    //   time: firebase.database.ServerValue.TIMESTAMP,
    // });
  }


  function checkForFmsg(chatid,currUser) { // Check for first message
    db.ref("/messages/"+chatid).on('child_added',function(snapshot) {
      if(snapshot.val().username == currUser.email) {
        id='me';
      }else id = 'you'
      messageBox.append("<div id='"+id+"' class='message'>"+snapshot.val().message+"<div class='username'>by <em>"+ snapshot.val().username+"</em></div></div>");
      messageBox.stop().animate({
        scrollTop: messageBox[0].scrollHeight
      }, 500);
    });
  }


  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      console.log(user.email);
      dbUsers.once('value',function(snapshot) {
        console.log('ALL USERS: ');
        console.log(snapshot.key);
        snapshot.forEach(function(childSnapshot){
          if(user.uid != childSnapshot.key)
            sideBar.append("<div id='" + childSnapshot.key + "' class='user'>"+childSnapshot.val().email+"</div>")
        });
      })

      function checkFriendship() {

      }

      var receiver;
      // var tmp = "-L8qWhjLr4nQ5ipXXONL" ;
      var membersOfUser = db.ref("/members/"+user.uid);
      var newPostKey;
      var alreadyFr;
      var pendingMode;
      var tmp;
      sideBar.on('click', '.user', function(event) {
        event.stopImmediatePropagation();
        messageBox.html("");
        newPostKey = db.ref('messages').push().key;
        receiver = $(this).attr('id');
        alreadyFr = false;
        pendingMode = false;

        db.ref("/users/"+user.uid).once('value',function(snapshot) {
          if(snapshot.hasChild("friends")){
            snapshot.child('friends').forEach(function(childSnapshot) {
              if(childSnapshot.val().uid == receiver){
                alreadyFr = true;
                tmp = childSnapshot.val().chatUid;
                console.log("2 TMP:",tmp);
              }
            });
          }
          if(!alreadyFr) {
            pendingMode = true;
          }
        });
        console.log("TMP:", tmp);

        setTimeout(function() {
          db.ref("/messages/"+tmp).on('child_added',function(snapshot) {
            if(snapshot.val().username == user.email) {
              id='me';
            }else id = 'you'
            messageBox.append("<div id='"+id+"' class='message'>"+snapshot.val().message+"<div class='username'>by <em>"+ snapshot.val().username+"</em></div></div>");
            messageBox.stop().animate({
              scrollTop: messageBox[0].scrollHeight
            }, 500);
          });
        },1000);


      });





      messageIn.on("keydown", function(event) {

        if(event.keyCode == 13) {
          // sendMessage();
          console.log("pendingMode",pendingMode);

          msg = messageIn.val();
          if(msg != "") {


            if(pendingMode){
              createStruct(user.uid,receiver,newPostKey);
              tmp = newPostKey;
              pendingMode = false;
              setTimeout(function() {
                checkForFmsg(tmp,user);
              },1000);
            }



            db.ref("/messages/"+tmp).push({
              message: msg,
              username: user.email,
              time: firebase.database.ServerValue.TIMESTAMP,
            });
          }
          messageIn.val("");
        }
      });

      btnSubmit.on('click', function () {
        sendMessage();
      })


    } else {
      console.log("not logged in");
    }

  });


}());

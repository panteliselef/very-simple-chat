(function () {
  var config = {
    apiKey: "AIzaSyACmfp3YZEaKXhBiWFLW9eKfG6TC48PAg0",
    authDomain: "very-simple-chat.firebaseapp.com",
    databaseURL: "https://very-simple-chat.firebaseio.com",
    projectId: "very-simple-chat",
    storageBucket: "very-simple-chat.appspot.com",
    messagingSenderId: "339636890698"
  };
  firebase.initializeApp(config);
  var database = firebase.database();
  var usersRef = database.ref('users');


  //Get Element from login.html

  const txtEmail = $('#txtEmail');
  const emailsOptions = $('#emailsOptions');
  const txtPassword = $('#txtPassword');
  const txtUsername = $('#txtUsername');
  const btnLogin = $('#btnLogin');
  const btnSignUp = $('#btnSignUp');
  const btnLogout = $('#btnLogout');
  const btnSetUsername = $('#btnSetUsername');
  //Add login event

  btnLogin.on('click',function() {
    //Get email and password


    // const email = txtEmail.val();
    // const pass = txtPassword.val();
    // const auth = firebase.auth();

    const email = emailsOptions.val();
    const pass = "123456";
    const auth = firebase.auth();
    // Sign in
    const promise = auth.signInWithEmailAndPassword(email,pass);
    console.log(email);
    console.log(pass);
    promise.catch(function(e) {
       console.log(e.message)
    });

  });

  // Add sign up event

  btnSignUp.on('click',function() {
    //Get email and password
    //TODO: Check for valid email
    // const email = txtEmail.val();
    // const pass = txtPassword.val();

    const email = emailsOptions.val();
    const pass = "123456";
    const auth = firebase.auth();
    //Sign in
    const promise = auth.createUserWithEmailAndPassword(email,pass);
    promise.catch(function(e) {
       console.log(e.message)
    });
  });


  btnLogout.on('click',function() {
    firebase.auth().signOut();
    window.location.assign('index.html');
  });

  btnSetUsername.on('click', function() {
    const userName = txtUsername.val();
    var user = firebase.auth().currentUser;

    user.updateProfile({
      displayName: userName
    }).then(function() {
      // Update successful.
      alert(user.displayName);
    }).catch(function(error) {
      // An error happened.
    });
  });


  //Add realtime authentication listener

  firebase.auth().onAuthStateChanged(function(firebaseUser){
    if(firebaseUser) {
      database.ref("/").once('value',function(snapshot) {
        if(snapshot.child("users").hasChild(firebaseUser.uid) == false) {
          alert(firebaseUser.uid);
          database.ref("users/"+firebaseUser.uid).set({
            username: firebaseUser.displayName,
            email:  firebaseUser.email,
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
          });
        }

      });
      console.log("Logged in");
      btnLogout.removeClass('hide');
      btnSetUsername.removeClass('hide');
      txtEmail.css('display','none');
      txtPassword.css('display','none');
      txtUsername.removeClass('hide');
      btnLogin.addClass('hide');
      btnSignUp.addClass('hide');

      window.location.assign('test.html');
    }else {
      console.log('not logged in');
      btnLogout.addClass('hide');
    }
  });


}());

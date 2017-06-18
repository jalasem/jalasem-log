firebase.initializeApp({
  apiKey: "AIzaSyBco-cFBVvQna20M_VUmnfTxy4U2W0U3iI",
  authDomain: "jalasem-web-project.firebaseapp.com",
  databaseURL: "https://jalasem-web-project.firebaseio.com",
  projectId: "jalasem-web-project",
  storageBucket: "jalasem-web-project.appspot.com",
  messagingSenderId: "65952475723"
});

var auth = firebase.auth(),
  database = firebase.database(),
  storage = firebase.storage();

var rootRef = database.ref('jtl'),
  questionsRef = rootRef.child('questions'), challengesRef = rootRef.child('challenges');

function signInWithGithub() {
  var provider = new firebase.auth.GithubAuthProvider();
  provider.addScope('repo');
  firebase.auth().signInWithPopup(provider).then(function(result) {
    console.log(result);
    var token = result.credential.accessToken;
    var user = result.user;
    console.log(user);
  }).catch(function (error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    // ...
    if(errorCode == "auth/account-exists-with-different-credential") {
      Materialize.toast('Please login with the provider you registered with e.g If you registered with google, login with google', 9000);
    } else {
    Materialize.toast(errorMessage, 8000);
    }
  });
}

function signOut() {
  auth.signOut().then(function () {
    // Sign-out successful.
    Materialize.toast('Thank you, dont forget to log your progress tommorow', 5000);
  }).catch(function (error) {
    // An error happened.
  });
}

function submitLog() {
  var browniePoints = $('#browniePoint_input').val();
  var fccUsername = $('#fccUsername_input').val();

  var endpoint = "https://www.freecodecamp.com/api/users/about?username=" + fccUsername;

  fetch(endpoint)
    .then(
      function (response) {
        if (response.status !== 200) {
          console.log('Looks like there was a problem. Status Code: ' +
            response.status);
          return;
        }

        // Examine the text in the response
        response.json().then(function (data) {
          var actualBrowniePoint = data.about.browniePoints;
          if (actualBrowniePoint == browniePoints) {
            var studentRef = rootRef.child('students/' + auth.currentUser.uid);
            console.log('attempting to submit log');
            var dailySummary = $('#daily_summary_input').val();
            var question = $('#question_input_onLog').val() || null;
            var challenges = $('#challenges_input_onLog').val() || null;
            var name = auth.currentUser.displayName;
            var email = auth.currentUser.email;
            var thisTime = new Date().valueOf();
            var dailyRecord = {
              summary: dailySummary,
              question: question,
              challenges: challenges
            };

            studentRef.set({
              name: name,
              email: email,
              browniePoints: browniePoints
            }).then(function () {
              studentRef.child('summaries/' + thisTime).set(dailyRecord).then(function () {
                if (question && question.length > 2) {
                  questionsRef.push({
                    question: question,
                    questionaire: {
                      name: name,
                      email: email,
                      browniePoints: browniePoints
                    }
                  }).then(function () {
                    $('#browniePoint_input').val('');
                    $('#daily_summary_input').val('');
                    $('#question_input_onLog').val('');
                    $('#challenges_input_onLog').val('');

                    Materialize.toast('Today\'s log have been successfully updated!', 5000);
                  }).catch(function (error) {
                    Materialize.toast(error.message, 6500);
                  });
                } else {
                  Materialize.toast('Today\'s log have been successfully updated', 5000);
                }
              }).catch(function (error) {
                Materialize.toast(error.message, 6500);
              });
            }).catch(function (error) {
              Materialize.toast(error.message, 6500);
            });
          } else {
            $('#browniePoint_input').val('');
            $('#browniePoint_input').focus();
            Materialize.toast('You are just a bloody liar, enter your correct brownie point!', 6000);
          }
        });
      }
    )
    .catch(function (err) {
      console.log('Fetch Error :-S', err);
    });



}

auth.onAuthStateChanged(function (user) {
  if (user) {
    console.log(user);
    $('#auth-view, .view').addClass('hide');
    $('#main-view').removeClass('hide');
    // User is signed in.
    var displayName = user.displayName;
    var email = user.email;
    var emailVerified = user.emailVerified;
    var photoURL = user.photoURL;
    var isAnonymous = user.isAnonymous;
    var uid = user.uid;
    var providerData = user.providerData;
    // ...
    $('#newLogForm').submit(function (e) {
      e.preventDefault();
      submitLog();
    });
  } else {
    $('#main-view, .view').addClass('hide');
    $('#auth-view, .view.welcome').removeClass('hide');
    // User is signed out.
    // ...
  }
});


$(document).ready(function () {
  $('aside li').addClass('waves-effect waves-light');
  $('.view').addClass('hide');
  $('#auth-view .view.welcome').removeClass('hide'); // remove when auth is integrated
  $('.view.welcome button.enter, button.swap2signIn').click(function () {
    $('.view').addClass('hide');
    $('#auth-view .view.login_signup').removeClass('hide');
  });
  $('button.signup').click(function () {
    $('.view').addClass('hide');
    $('#auth-view .view.signup').removeClass('hide');
  });


  $('button.signInWithGithub').click(function () {
    signInWithGithub();
  });
  $('.doLogout').click(function () {
    signOut();
  });
});

// FIXME: Ensure to make urls relevant to each states within the app!
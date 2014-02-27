module.exports = function(curState, cb) {
    var Firebase = require('firebase');
    var myRootRef = new Firebase('https://crackling-fire-2902.firebaseio.com/Games/Game');
    //console.log(myRootRef);
    //myRootRef.set("hello world!");
    //var testkill = "test";

    myRootRef.once('value', function(snapshot) {
        //Firebase.goOffline();
        cb(snapshot.val().Beliefs.Param0);  // XXX.val() returns a useful object!
        //myRootRef.done();// done();
    });
};
module.exports = function(curState, cb) {
    var Firebase = require('firebase');
    var myRootRef = new Firebase('https://crackling-fire-2902.firebaseio.com/Games/Game');
    //console.log(myRootRef);
    //myRootRef.set("hello world!");

    myRootRef.once('value', function(snapshot) {
        cb(snapshot.val().Beliefs.Param0);  // XXX.val() returns a useful object!
    });
    //cb(myRootRef);
};
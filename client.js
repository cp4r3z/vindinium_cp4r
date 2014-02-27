#!/usr/bin/env node

var request = require('request');
var qs = require('qs');

var cp4rBot = require('./bot');

var beliefs = require('./Beliefs');

function start(serverUrl, key, mode, numTurns, bot, cb) {
  var state;
  
  // This is where you would inject the Firebase calls.
  
  // The callback would update a variable local to this function.
  
  if ('arena' === mode) {
    console.log('Connected and waiting for other players to join...');
  }
  getNewGameState(serverUrl, key, mode, numTurns, function(err, state) {
    if (err) {
      console.log("ERROR starting game:", err);
      return cb();
    }
    console.log('Playing at:', state['viewUrl']);
    
    // Ok, at this point the game has started.
    
    var teststring = 'test';
    console.time('Firebase');
    
    
    beliefs(teststring, function(huh) {
        console.log(huh);
        console.timeEnd('Firebase');
        
    });
    
    //console.timeEnd('Firebase');
    
    loop(key, state, bot, cb); // Passing in the private cb
    
  });
}

function getNewGameState(serverUrl, key, mode, numTurns, cb) {
  var params = {
    key: key
  };
  var apiEndpoint = '/api/arena';
  if ('training' === mode) {
    params.turns = numTurns;
    // Comment out map parameter for a random map
    params.map = 'm1';
    apiEndpoint = '/api/training';
  }
  request.post({
    url: serverUrl + apiEndpoint,
    body: qs.stringify(params),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }, function(err, res, body) {
    if (err || 200 !== res.statusCode) {
      cb(err || "Unable to start new game status code: " + res.statusCode +
        " " + body);
    } else {
      cb(null, JSON.parse(new Buffer(body, 'utf8').toString('utf8')));
    }
  });
}

function loop(key, state, bot, cb) {

  if (isFinished(state)) {
      
    cb();
  } else {
    process.stdout.write('.');
    var url = state['playUrl'];
    bot(state, function(dir) {
      state = move(url, key, dir, function(err, newState) {
        if (err) {
          console.log('ERROR:', err);
          cb();
        } else {
          loop(key, newState, bot, cb); //Again with the recursion. Why is this so confusing?
        }
      });
    });
  }
}

function isFinished(state) {
  return state && !! state.game &&
    true === state['game']['finished'];
}

function move(url, key, direction, cb) {
  request.post({
    url: url,
    body: qs.stringify({
      key: key,
      dir: direction
    }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }, function(err, res, body) {
    if (err || 200 !== res.statusCode) {
      cb(err || 'Unable to move status code:' + res.statusCode + ' ' + body);
    } else {
      cb(null, JSON.parse(new Buffer(body, 'utf8').toString('utf8')));
    }

  });
}

function usage() {
  console.log('Usage: client.js <key> <[training|arena]> <number-of-games|number-of-turns> [server-url]');
  console.log('Example: client.js mySecretKey training 20');
}

var argv = process.argv;
if (6 < argv.length) {
  usage();
  process.exit(1);
}
var key = argv[2];
var mode = argv[3];

var numberOfGames = parseInt(argv[4], 10);
var numberOfTurns = 300; // Ignored in arena mode

if ('training' === mode) {
  numberOfGames = 1;
  numberOfTurns = parseInt(argv[4], 10);
}

var serverUrl = 'http://vindinium.org';
if (6 === argv.length) {
  serverUrl = argv[5];
  //console.log(serverUrl);
}


var i = 0; // This is apparently running multiple games...

function playGame() {
  start(serverUrl, key, mode, numberOfTurns, cp4rBot, function() {
    console.log('Game Finished:', i + 1, '/', numberOfGames);
    i++;
    if (i < numberOfGames) {
      playGame(); // Recursion? Why not a dowhile?
    }
  });
}

playGame();
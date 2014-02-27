

// Global Variables

var board_size_zb;
var board_static_passable;

// What is module.exports? 
// cb is a callback?

module.exports = function(curState, cb) {
  
  var firstTurn = false;
  if (curState.game.turn === 0) firstTurn = true;
  
  console.log('Mein Leben: ' + curState.hero.life);
  console.log('Mein Geld:  ' + curState.hero.gold);
  
  // My location (Maybe NONE of this is necessary. I don't know how expensive the lookup is.)
  // curState.hero.pos.x  AND curState.hero.pos.y
  var me_id = curState.hero.id;
  var coor_me = [];
  coor_me[0] = curState.hero.pos.x;
  coor_me[1] = curState.hero.pos.y;
  
  var board = curState.game.board;
  
  // 
  
  // Intentions - Decision "Matrix"
  

  // Board String Crawler
  
  // string start with [x0,y0], then [x0,y1], then [x0,y2] ... [x0,yn],[x1,y0]...
  // Visually:
  //
  // [x0,y0] [x0,y1]
  // [x1,y0] [x1,y1]
  
  board_size_zb = board.size - 1; // Zero-based index of board outer dimensions - SET ONCE
  var board_test = Create2DArray(board_size_zb);
  board_static_passable = Create2DArray(board_size_zb);

  var board_string = board.tiles;
  
  var coor_mines_not_mine = [];

  var y_zb = 0; // y (zero based)
  var x_zb = 0; // x (zero based)

  for (var bsc_char_index = 0; bsc_char_index < board_string.length; bsc_char_index+=2) {
      
      var bsc_sub = board_string.substr(bsc_char_index,2); // 2 character Sub-string
      
      // Test board with everything.
      board_test[x_zb][y_zb] = bsc_sub;
      
      // Static "Passable" Board
      //if (firstTurn) {
          if (bsc_sub == '##') board_static_passable[x_zb][y_zb] = false;
          else board_static_passable[x_zb][y_zb] = true;
      //}
      
      // THIS IS SOOO TEST CODE:
      
      if (bsc_sub == '[]') board_static_passable[x_zb][y_zb] = false;
      
      //get locations of mines that I don't own
      
      if (bsc_sub.substr(0,1) == '$') {
          if (bsc_sub == '$' + me_id) {
              board_static_passable[x_zb][y_zb] = false; // OK NOW the board isn't static anymore. 
          }
          else {
              //console.log('hey i found a mine thats not mine')
              var m = [];
              m[0]=x_zb;
              m[1]=y_zb;
              coor_mines_not_mine.push(m);
          }
      }
      
      //get locations of mines I do own
      
      //get locations of taverns - again, static
      
      //get locations of other players?
      
      // Increment
      if (y_zb <board_size_zb) y_zb++; // Fill up the y index until the length of a board side.
      else {
          y_zb = 0; // Then increment the x index and set the y index back to 0.
          x_zb++;
      }
  }
  
  // get index of closest mine (not owned)
  
  // navigate to closest mine
  var direction_chosen;//= choose(dirs) // Eventually comment out the random thing.
  
  direction_chosen = GetDirectionString(GoToClosestFromPointA2Points(coor_me[0], coor_me[1],coor_mines_not_mine));
  
  console.log(direction_chosen);
  
  // This might not be necessary to run. Probably isn't.
  //var whattodo = [];
  //whattodo = PointA2PointB(coor_me[0], coor_me[1],4,0);
  
  //console.log(board_test[0][1]);
  //console.log(board_static_passable);
  //console.log(coor_mines_not_mine);
  console.log(board_test);
  
  
  // This sends the direction into the cb function... I think I said that right?
  
  cb(direction_chosen);
};

//agnostic helper function
function GetDirectionString(DirUnitVector) {
    
    var heading = 'Stay'; //Default Heading. We might want to change this.
    // North  =   -X
    // South  =   +X
    // East   =   +Y
    // West   =   -Y
    
    // Multiply x by 2 and add both numbers. So north = -2, south 2, east 1, west -1
    
    var transform = DirUnitVector[0] * 2 + DirUnitVector[1];
    
    switch (transform) {
    case -2:
        heading = "North";
        break;
    case -1:
        heading = "West";
        break;
    case 0:
        heading = "Stay";
        break;
    case 1:
        heading = "East";
        break;
    case 2:
        heading = "South";
        break;
    }
    
    return heading;
}

// Returns... //return distance and direction var r_array = [dir, dist];

// should it require the terrain board? and the yet to be created "avoid board"

function PointA2PointB(Ax, Ay, Bx, By) {
    // FOR NOW, shortest distance.
    
    var dist = 0;
    var dir = [];
    var P2P_array = Create2DArray(board_size_zb);
    var ArrivedAtB = false;

    var lastMarked = [];
    var currentDistance = 0;
    P2P_array[Ax][Ay] = currentDistance; // Start
    lastMarked.push([Ax,Ay]); // This works?
    
    while (!ArrivedAtB) {
        
        currentDistance++;
        var MarkedThisIteration = [];
        //foreach in last visited
        lastMarked.forEach(MarkNeighborsWithDistance);

        lastMarked = MarkedThisIteration;

        //ArrivedAtB = true; // For testing
    }
    //console.log(P2P_array);
    
    if (P2P_array[Bx][By] !== undefined) {
        dist = P2P_array[Bx][By]; 
        currentDistance = P2P_array[Bx][By]; // This might not be necessary but a good check.
        
        var BackAtA = false;
        var proposedDirection = [0,0];
        var currentLocation = [Bx,By];
        
        while (!BackAtA) {
            var PotentialBackSteps = GetAllAdjacent(currentLocation[0],currentLocation[1]);
            var foundNewStep = false;
            PotentialBackSteps.forEach(ChooseBackStep);
        }
        dir = proposedDirection;
        
    }
    else console.log('Something bad has happened. The destination wasnt evaluated.');
    
    function MarkNeighborsWithDistance(element, index, array) {
        
        var Neighbors = GetAllAdjacent(element[0],element[1]);
        Neighbors.forEach(MarkSingleNeighborWithDistance);
        //console.log('marked neighbors of ' + element);
    }
    
    function MarkSingleNeighborWithDistance(element, index, array) {
        
        if (P2P_array[element[0]][element[1]] === undefined) {
           //console.log('holy crap this worked?')
           P2P_array[element[0]][element[1]] = currentDistance;
           MarkedThisIteration.push([element[0],element[1]]);
           if (element[0] == Bx && element[1] == By) ArrivedAtB = true;
        }
    }
    
    function ChooseBackStep(element, index, array) {
        if (!foundNewStep) {
            if (P2P_array[element[0]][element[1]] == currentDistance - 1) {
                currentDistance = P2P_array[element[0]][element[1]] 
                proposedDirection = [currentLocation[0]-element[0], currentLocation[1]-element[1]]
                currentLocation = element;
                foundNewStep = true;
                if (element[0] == Ax && element[1] == Ay) BackAtA = true;
            }
        }
        
    }
    
    //var possibilities = GetAllAdjacent(Ax,Ay);
    // start by 
    
    // algorithm for finding neighbors (available moves)
    
    //return distance and direction
    var r_array = [dir, dist];
    return r_array;
}

// Returns an array of coors or an empty array. //Is it possible not to have neighbors? I kinda doubt it.
// requires the terrain array - Maybe we need a parameter to return Mines/Taverns/Heros as well.

function GetAllAdjacent(_x,_y) {
    var coor_adjacent = [];
    var x2 = _x;
    var y2 = _y;
    
    // Try North
    if (_x>0) {
        x2 = _x-1;
        PushIfPassable();
    }
    
    // Try South
    if (_x<board_size_zb) {
        x2 = _x+1;
        PushIfPassable();
    }
    
    x2 = _x;
    
    // Try West
    if (_y>0) {
        y2 = _y-1;
        PushIfPassable();
    }
    
    // Try East
    if (_y<board_size_zb) {
        y2 = _y+1;
        PushIfPassable();
    }
    
    y2 = _y; // Not necessary.

    function PushIfPassable() {
        var coor_x2y2 = [];
        if (board_static_passable[x2][y2]) {
                coor_x2y2[0]=x2;
                coor_x2y2[1]=y2;
                coor_adjacent.push(coor_x2y2);
            }
    }

    return coor_adjacent;
}

function GoToClosestFromPointA2Points(Ax,Ay,_Points) {
    
    var proposedDirection = 0;
    var currentShortestDistance = Math.pow(board_size_zb,2); // Sure, why not?
    
    _Points.forEach(DistanceCompare);
    //foreach point in points, get distance
    
    //if the distance is less than the previous, make that direction the proposed direction.
    
    //return index of points? NO
    //return direction
    return proposedDirection;
    
    function DistanceCompare(element) {
        var DirDist = PointA2PointB(Ax,Ay,element[0],element[1]);
        if (DirDist[1] < currentShortestDistance) {
            //console.log('found closer thing');
            currentShortestDistance = DirDist[1];
            proposedDirection = DirDist[0];
        }
    }
}

function choose(dirs) {
  return dirs[Math.floor(Math.random() * dirs.length)];
}

//Compares 2 one-dimensional arrays - Stolen from internet
function arraysIdentical(a, b) {
    var i = a.length;
    if (i != b.length) return false;
    while (i--) {
        if (a[i] !== b[i]) return false;
    }
    return true;
};

// Creates array (give it zero based index) - STOLE from Internet
function Create2DArray(rows_zb) {
  var arr = [];

  for (var i=0;i<=rows_zb;i++) {
     arr[i] = [];
  }

  return arr;
}
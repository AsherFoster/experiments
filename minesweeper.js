"use strict";

(function () {
  // Configurable variables
  var GRID_MARGIN_LEFT = 50;
  var GRID_MARGIN_TOP = 100;
  var SQUARE_SIZE = 25;
  var SQUARE_MARGIN = 7;
  var GRID_HEIGHT = 16;
  var GRID_WIDTH = 30;
  var MINE_COUNT = 99;
  var LONG_CLICK_TIME = 500;
  var DEBUG_MODE = false;
  var canvas = document.getElementById('game');
  var ctx = canvas.getContext('2d');
  var GAME_HEIGHT = canvas.height;
  var GAME_WIDTH = canvas.width;
  var GRID_SIZE = SQUARE_SIZE + SQUARE_MARGIN;
  var LEFT_CLICK = 0;
  var RIGHT_CLICK = 2;
  var start = 0;
  var solution = [];
  var state = []; // 0,1,2: unclicked, blank, flagged

  var bigText = '';
  var longClickTimer = null;
  var mouseDownPos = null; // Game functions

  function setup(width, height, mines) {
    start = Date.now();
    var places = shuffle(Array(height * width).fill(false, 0, height * width - mines).fill(true, height * width - mines)); // Create an array with randomly placed mines

    for (var y = 0; y < height; y++) {
      // Place into a 2d array, to setup state & solution
      state[y] = Array(width).fill(0);
      solution[y] = places.slice(y * width, y * width + width);
    }
  }

  function squareClick(button, x, y) {
    if (DEBUG_MODE) console.log('Square click: ', x, y);
    if (state[y][x] === 1 || state[y][x] === 2 && button === LEFT_CLICK) return; // Already clicked, or left clicking a flag? Ignore.

    if (button === RIGHT_CLICK) {
      // Toggle flag
      state[y][x] = state[y][x] === 2 ? 0 : 2;
    } else if (button === LEFT_CLICK) {
      if (solution[y][x]) {
        // Lose the game
        bigText = 'You lose.';
      } else {
        // Reveal
        state[y][x] = 1;
        if (!nearbyMines(x, y)) revealNear(x, y);
      }
    }

    if (countFlags() === MINE_COUNT) {
      // If all flags have been placed, check they are valid. if so, win the game
      var flatSolution = flatten(solution);
      var win = flatten(state).every(function (s, i) {
        return s !== 2 || flatSolution[i] === true;
      }); // If all flags are mines

      if (win) bigText = 'You win';else if (DEBUG_MODE) console.debug('Not all flags are valid');
    }
  }

  function nearbySquares(x, y) {
    var squares = [{
      x: x - 1,
      y: y - 1
    }, {
      x: x,
      y: y - 1
    }, {
      x: x + 1,
      y: y - 1
    }, {
      x: x - 1,
      y: y
    }, {
      x: x + 1,
      y: y
    }, {
      x: x - 1,
      y: y + 1
    }, {
      x: x,
      y: y + 1
    }, {
      x: x + 1,
      y: y + 1
    }];
    return squares.filter(function (_ref) {
      var x = _ref.x,
          y = _ref.y;
      return inGrid(x, y);
    });
  }

  function nearbyMines(x, y) {
    return nearbySquares(x, y).reduce(function (a, _ref2) {
      var x = _ref2.x,
          y = _ref2.y;
      return a + (solution[y][x] ? 1 : 0);
    }, 0);
  }

  function logMines() {
    console.log(solution.map(function (row) {
      return row.map(function (m) {
        return m ? '*' : '-';
      }).join(' ');
    }).join('\n'));
  }

  function countFlags() {
    return sum(flatten(state).map(function (s) {
      return s === 2 ? 1 : 0;
    }));
  }

  function inGrid(x, y) {
    return x >= 0 && y >= 0 && x < GRID_WIDTH && y < GRID_HEIGHT;
  }

  function revealNear(x, y) {
    // For each neighbour, check it's valid and if it's not revealed, reveal it and reveal it's neighbours if blank
    nearbySquares(x, y).forEach(function (_ref3) {
      var x = _ref3.x,
          y = _ref3.y;

      if (state[y][x] === 0) {
        state[y][x] = 1;

        if (!nearbyMines(x, y)) {
          revealNear(x, y);
        }
      }
    });
  }

  function squareAt(x, y) {
    var gridX = x - GRID_MARGIN_LEFT;
    var gridY = y - GRID_MARGIN_TOP;
    if (gridX % GRID_SIZE > SQUARE_SIZE || gridY % GRID_SIZE > SQUARE_SIZE) return null; // In margins

    var squareX = Math.floor(gridX / GRID_SIZE);
    var squareY = Math.floor(gridY / GRID_SIZE);
    if (!inGrid(squareX, squareY)) return null; // Outside of grid

    return [squareX, squareY];
  }

  function mouseDown(event) {
    var x = event.pageX - canvas.offsetLeft;
    var y = event.pageY - canvas.offsetTop;
    mouseDownPos = squareAt(x, y);
    setTimeout(function () {
      return longClick(x, y);
    }, LONG_CLICK_TIME);
  }

  function mouseUp(event) {
    var x = event.pageX - canvas.offsetLeft;
    var y = event.pageY - canvas.offsetTop;
    var mouseUpPos = squareAt(x, y);
    if (mouseUpPos !== mouseDownPos) return; // Todo finish click detection system

    click(x, y);
    if (longClickTimer) clearTimeout(longClickTimer);
  }

  function click(x, y, button) {
    // ^ if the position in the grid cell is greater than the size of the square in the cell
    squareClick(button, squareX, squareY);
  }

  function longClick(x, y) {
    console.log('Long click!');
  } // Render functions


  function draw() {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    drawStatus();
    drawGrid(GRID_MARGIN_LEFT, GRID_MARGIN_TOP);
    drawBigText();
    requestAnimationFrame(draw);
  }

  function drawGrid(marLeft, marTop) {
    for (var y = 0; y < GRID_HEIGHT; y++) {
      for (var x = 0; x < GRID_WIDTH; x++) {
        var xPos = x * GRID_SIZE + marLeft;
        var yPos = y * GRID_SIZE + marTop;
        drawMine(x, y, xPos, yPos);
      }
    }
  }

  function drawMine(x, y, xPos, yPos) {
    var mined = solution[y][x];
    var mineState = state[y][x];
    ctx.font = '24px monospace';

    switch (mineState) {
      case 0:
        if (DEBUG_MODE) ctx.fillStyle = mined ? 'red' : 'green';else ctx.fillStyle = 'grey';
        ctx.fillRect(xPos, yPos, SQUARE_SIZE, SQUARE_SIZE);
        break;

      case 1:
        ctx.strokeRect(xPos, yPos, SQUARE_SIZE, SQUARE_SIZE);
        var nearby = nearbyMines(x, y);
        ctx.fillStyle = 'black';
        ctx.fillText(nearby || '', xPos + 5, yPos + 20);
        break;

      case 2:
        ctx.fillStyle = 'black';
        ctx.fillText('🏳', xPos + 3, yPos + 20);
        break;
    }
  }

  function drawStatus() {
    ctx.fillStyle = 'black';
    ctx.font = '36px sans-serif';
    var delta = Math.round((Date.now() - start) / 1000);
    var time = Math.floor(delta / 60) + ':' + ("0" + delta % 60).slice(-2);
    var text = "Time: ".concat(time, "  - \uD83C\uDFF3: ").concat(MINE_COUNT - countFlags());
    ctx.fillText(text, 100, 50);
  }

  function drawBigText() {
    if (bigText) {
      ctx.font = '50px sans-serif';
      var textWidth = ctx.measureText(bigText).width;
      ctx.fillStyle = 'white';
      ctx.fillRect(330 - textWidth / 2, 300, textWidth + 50, 70);
      ctx.fillStyle = 'black';
      ctx.fillText(bigText, 350 - textWidth / 2, 355);
    }
  } // Event handlers


  canvas.addEventListener('mousedown', mouseDown);
  canvas.addEventListener('mouseup', mouseUp);
  canvas.addEventListener('contextmenu', preventDefault); // Start the game

  setup(GRID_WIDTH, GRID_HEIGHT, MINE_COUNT);
  if (DEBUG_MODE) logMines();
  draw(); // Helper functions

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var _ref4 = [a[j], a[i]];
      a[i] = _ref4[0];
      a[j] = _ref4[1];
    }

    return a;
  }

  function sum(arr) {
    return arr.reduce(function (a, b) {
      return a + b;
    }, 0);
  }

  function flatten(arr) {
    return arr.reduce(function (a, v) {
      return a.concat(v);
    }, []);
  }

  function preventDefault(e) {
    e.preventDefault();
  }
})();
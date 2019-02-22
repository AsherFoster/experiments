(function() {
  // Configurable variables
  const GRID_MARGIN_LEFT = 50;
  const GRID_MARGIN_TOP = 100;
  const SQUARE_SIZE = 25;
  const SQUARE_MARGIN = 7;

  const GRID_HEIGHT = 16;
  const GRID_WIDTH = 30;
  const MINE_COUNT = 99;

  const LONG_CLICK_TIME = 500;
  const DEBUG_MODE = false;

  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');

  const GAME_HEIGHT = canvas.height;
  const GAME_WIDTH = canvas.width;
  const GRID_SIZE = SQUARE_SIZE + SQUARE_MARGIN;

  const LEFT_CLICK = 0;
  const RIGHT_CLICK = 2;

  let start = 0;
  let solution = [];
  let state = []; // 0,1,2: unclicked, blank, flagged
  let bigText = '';
  let longClickTimer = null;
  let mouseDownPos = null;


  // Game functions
  function setup(width, height, mines) {
    start = Date.now();
    const places = shuffle(Array(height * width)
      .fill(false, 0, height * width - mines)
      .fill(true, height * width - mines)); // Create an array with randomly placed mines
    for(let y = 0; y < height; y++) { // Place into a 2d array, to setup state & solution
      state[y] = Array(width).fill(0);
      solution[y] = places.slice(y * width, y * width + width);
    }
  }
  function squareClick(button, x, y) {
    if(DEBUG_MODE) console.log('Square click: ', x, y);
    if(state[y][x] === 1 ||
      (state[y][x] === 2 && button === LEFT_CLICK)) return; // Already clicked, or left clicking a flag? Ignore.

    if(button === RIGHT_CLICK) { // Toggle flag
      state[y][x] = state[y][x] === 2 ? 0 : 2
    } else if(button === LEFT_CLICK) {
      if(solution[y][x]) { // Lose the game
        bigText = 'You lose.';
      } else { // Reveal
        state[y][x] = 1;
        if(!nearbyMines(x, y))
          revealNear(x, y);
      }
    }
    if(countFlags() === MINE_COUNT) { // If all flags have been placed, check they are valid. if so, win the game
      const flatSolution = flatten(solution);
      const win = flatten(state).every((s, i) => s !== 2 || flatSolution[i] === true); // If all flags are mines
      if(win)
        bigText = 'You win';
      else if(DEBUG_MODE)
        console.debug('Not all flags are valid');
    }
  }
  function nearbySquares(x, y) {
    let squares = [
      {x: x - 1, y: y - 1},
      {x: x, y: y - 1},
      {x: x + 1, y: y -1},
      {x: x - 1, y: y},
      {x: x + 1, y: y},
      {x: x - 1, y: y + 1},
      {x: x, y: y + 1},
      {x: x + 1, y: y+ 1}
    ];
    return squares.filter(({x, y}) => inGrid(x, y))
  }
  function nearbyMines(x, y) {
    return nearbySquares(x, y).reduce((a, {x, y}) => a + (solution[y][x] ? 1 : 0), 0);
  }
  function logMines() {
    console.log(solution.map(row => row.map(m => m ? '*' : '-').join(' ')).join('\n'));
  }
  function countFlags() {
    return sum(flatten(state).map(s => s === 2 ? 1 : 0));
  }
  function inGrid(x, y) {
    return x >= 0 && y >= 0 && x < GRID_WIDTH && y < GRID_HEIGHT
  }
  function revealNear(x, y) {
    // For each neighbour, check it's valid and if it's not revealed, reveal it and reveal it's neighbours if blank
    nearbySquares(x, y).forEach(({x, y}) => {
      if(state[y][x] === 0) {
        state[y][x] = 1;
        if(!nearbyMines(x, y)) {
          revealNear(x, y)
        }
      }
    })

  }
  function squareAt(x, y) {
    const gridX = x - GRID_MARGIN_LEFT;
    const gridY = y - GRID_MARGIN_TOP;
    if(gridX % GRID_SIZE > SQUARE_SIZE || gridY % GRID_SIZE > SQUARE_SIZE) return null; // In margins
    const squareX = Math.floor(gridX / GRID_SIZE);
    const squareY = Math.floor(gridY / GRID_SIZE);
    if(!inGrid(squareX, squareY)) return null; // Outside of grid
    return [squareX, squareY];
  }
  function mouseDown(event) {
    const x = event.pageX - canvas.offsetLeft;
    const y = event.pageY - canvas.offsetTop;
    mouseDownPos = squareAt(x, y);
    setTimeout(() => longClick(x, y), LONG_CLICK_TIME);
  }
  function mouseUp(event) {
    const x = event.pageX - canvas.offsetLeft;
    const y = event.pageY - canvas.offsetTop;
    const mouseUpPos = squareAt(x, y);
    if(mouseUpPos !== mouseDownPos) return; // Todo finish click detection system
    click(x, y);
    if(longClickTimer) clearTimeout(longClickTimer);
  }
  function click(x, y, button) {


    // ^ if the position in the grid cell is greater than the size of the square in the cell
    squareClick(button, squareX, squareY);
  }
  function longClick(x, y) {
    console.log('Long click!');
  }

  // Render functions
  function draw() {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    drawStatus();
    drawGrid(GRID_MARGIN_LEFT, GRID_MARGIN_TOP);
    drawBigText();
    requestAnimationFrame(draw);
  }
  function drawGrid(marLeft, marTop) {
    for(let y = 0; y < GRID_HEIGHT; y++) {
      for(let x = 0; x < GRID_WIDTH; x++) {
        const xPos = x * GRID_SIZE + marLeft;
        const yPos = y * GRID_SIZE + marTop;
        drawMine(x, y, xPos, yPos);
      }
    }
  }
  function drawMine(x, y, xPos, yPos) {
    const mined = solution[y][x];
    const mineState = state[y][x];
    ctx.font = '24px monospace';
    switch(mineState) {
      case 0:
        if(DEBUG_MODE)
          ctx.fillStyle = mined ? 'red' : 'green';
        else
          ctx.fillStyle = 'grey';
        ctx.fillRect(xPos, yPos, SQUARE_SIZE, SQUARE_SIZE);
        break;
      case 1:
        ctx.strokeRect(xPos, yPos, SQUARE_SIZE, SQUARE_SIZE);
        const nearby = nearbyMines(x, y);
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
    const delta = Math.round((Date.now() - start) / 1000);
    const time = Math.floor(delta / 60) + ':' + ("0" + (delta % 60)).slice(-2);
    const text = `Time: ${time}  - 🏳: ${MINE_COUNT - countFlags()}`;
    ctx.fillText(text, 100, 50)
  }
  function drawBigText() {
    if(bigText) {
      ctx.font = '50px sans-serif';
      const textWidth = ctx.measureText(bigText).width;
      ctx.fillStyle = 'white';
      ctx.fillRect(330 - textWidth/2, 300, textWidth + 50, 70);
      ctx.fillStyle = 'black';
      ctx.fillText(bigText, 350 - (textWidth / 2), 355);
    }
  }

  // Event handlers
  canvas.addEventListener('mousedown', mouseDown);
  canvas.addEventListener('mouseup', mouseUp);
  canvas.addEventListener('contextmenu', preventDefault);

  // Start the game
  setup(GRID_WIDTH, GRID_HEIGHT, MINE_COUNT);
  if(DEBUG_MODE) logMines();
  draw();

  // Helper functions
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function sum(arr) {
    return arr.reduce((a, b) => a + b, 0);
  }
  function flatten(arr) {
    return arr.reduce((a, v) => a.concat(v), []);
  }
  function preventDefault(e) {
    e.preventDefault();
  }
})();

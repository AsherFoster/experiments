(function () {
  const SPAWN_FREQ = 150;
  const STAR_SIZE = 3;
  const SPEED = 1 / 16;
  const DEPTH_RAMP = -0.8;
  const INITIAL_SIZE = document.body.offsetWidth * document.body.offsetHeight / 10000;

  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  let mouseX = 0;
  let mouseY = 0;
  let lastFrame = performance.now();

  const scene = new Set();

  function render() {
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; // We do fillRect rather than clearRect in order to smear and make trails
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';

    let deltaTime = -lastFrame + (lastFrame = performance.now()); // Weird way of doing subtraction so we only call perfnow once

    scene.forEach((s) => {
      s[0] += deltaTime * SPEED * ((s[2] * DEPTH_RAMP) + 1);
      s[1] += deltaTime * SPEED * ((s[2] * DEPTH_RAMP) + 1);
      // let x = s[0] + ((canvas.width / 2 - -mouseX) / canvas.width * 2) / (s[2] / 2 + 0.05);
      // let y = s[1] + ((canvas.height / 2 - -mouseY) / canvas.width * 2) / (s[2] / 2 + 0.05);
      let x = s[0];
      let y = s[1];
      ctx.beginPath();
      ctx.ellipse(x, y,
        (STAR_SIZE * (1.5 - s[2])),
        (STAR_SIZE * (1.5 - s[2])),
        0, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(render);
  }
  function crunch() {
    // Generate new star
    const point = Math.round(Math.random() * (canvas.height + canvas.width));
    if (point < canvas.height) {
      scene.add([-10, point, Math.random()]);
    } else {
      scene.add([point - canvas.height, -10, Math.random()]);
    }

    // Cull stars
    scene.forEach(s => {
      if (s[0] > canvas.width + 10|| s[1] > canvas.height + 10) scene.delete(s);
    });
    if (scene.size > INITIAL_SIZE * 3) console.error('Objects appear to be leaking');
  }

  function setup() {
    ctx.fillStyle = '#FFF';
    for (let i = 0; i < INITIAL_SIZE; i++) {
      scene.add([Math.random() * canvas.width, Math.random() * canvas.height, Math.random()])
    }
  }

  function layout() {
    canvas.height = canvas.offsetHeight;
    canvas.width = canvas.offsetWidth;
  }

  function mouseEvent(e) {
    mouseX = e.pageX;
    mouseY = e.pageY;
  }
  window.addEventListener('mousemove', mouseEvent);
  window.addEventListener('dragover', mouseEvent);
  window.addEventListener('touchstart', e => {
    mouseEvent(e.changedTouches[0])
  });
  window.addEventListener('touchmove', e => {
    mouseEvent(e.changedTouches[0])
  });
  window.addEventListener('resize', layout);
  layout();
  setup();
  render();
  setInterval(crunch, SPAWN_FREQ);
})();

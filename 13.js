// Handles loading and starting the <Insert witty thing here>
(function () {
  let player;
  const videoEl = document.getElementById('video');
  videoEl.src = 'https://www.youtube.com/embed/dQw4w9WgXcQ?enablejsapi=1&origin=' + window.location.origin;

  window.countdownComplete = function () {
    console.log('Countdown complete, playing');
    player.playVideo();
  };

  window.onYouTubeIframeAPIReady = () => {
    console.log('YT API Ready');
    player = new YT.Player('video', {
      videoId: 'dQw4w9WgXcQ', // Take a guess
      playerVars: {controls: 0},
      events: {
        onReady: onPlayerReady,
      }
    });
  };

  // 4. The API will call this function when the video player is ready.
  function onPlayerReady() {
    console.log('Player Ready');
    player.playVideo();
    player.pauseVideo();
    // player.setLoop(true);
  }
})();

// This IIFE handles the loading screen. Calls window.countdownComplete after a bit, and hides itself
(function () {
  const liveTime = new Date(Date.now() + 10 * 1000);
  const pixelSize = 2;

  const loadingWrapper = document.getElementById('loading');
  const canvas = document.getElementById('canvas');
  const countdownEl = document.getElementById('countdown');
  const ctx = canvas.getContext('2d', {alpha: false}); // Performance thing
  const neons = [
    '#FF0000',
    '#00FF00',
    '#0000FF',
    '#FF00AC'
  ];
  const offsets = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
  let height, width;
  let imageData, buff;
  // noinspection JSConsecutiveCommasInArrayLiteral
  let markers = [,,,,];
  let markerI = 0;
  let markerSize = 30;
  let intervals = [];
  let done = false;

  function updateCountdown() {
    const deltaMs = liveTime.getTime() - Date.now();
    if (deltaMs < 0) {
      countdownEl.innerText = 'now';
      intervals.forEach(i => clearInterval(i));
      done = true;
      loadingWrapper.style.display = 'none';
      countdownComplete();
    } else if (deltaMs < 60 * 1000) {
      countdownEl.innerText = (Math.round(deltaMs / 10) / 100).toFixed(2) + 's';
    }
  }

  function drawNoise() {
    let len = buff.length - 1;
    while(len--) buff[len] = Math.random() < 0.5 ? 0 : -1>>0;
    ctx.putImageData(imageData, 0, 0);
  }
  function drawMarkers() {
    const centerX = width - markerSize * 2;
    const centerY = height - markerSize * 2;
    markers.forEach((color, i) => {
      const [offsetX, offsetY] = offsets[i];
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.fillRect(centerX + (offsetX * markerSize/2), centerY + (offsetY * markerSize/2), markerSize, markerSize);
      ctx.fill();
    });
  }

  function layout() {
    height = canvas.height = Math.round(canvas.offsetHeight/pixelSize);
    width = canvas.width = Math.round(canvas.offsetWidth/pixelSize);
    imageData = ctx.createImageData(width, height);
    buff = new Uint32Array(imageData.data.buffer); // Get a 32 bit view...?
  }
  function changeMarkers() {
    markers[markerI] = neons[Math.floor(Math.random() * neons.length)];
    markerI = (markerI + 1) % markers.length;
  }

  function render() {
    drawNoise();
    drawMarkers();
    if (!done) requestAnimationFrame(render);
  }

  window.addEventListener('resize', layout);
  intervals.push(setInterval(changeMarkers, 500));
  intervals.push(setInterval(updateCountdown, 0));
  layout();
  render();
})();

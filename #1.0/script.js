let player;
let isRepeatEnabled = false; // リピート機能のフラグ

// YouTube IFrame APIのロード完了を待機
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '0',
    width: '0',
    playerVars: { autoplay: 0, controls: 0 },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
}

// 動画読み込みボタン
const loadVideoButton = document.getElementById('load-video');
loadVideoButton.addEventListener('click', () => {
  const url = document.getElementById('video-url').value;
  const videoId = extractVideoId(url);

  if (videoId) {
    player.loadVideoById(videoId);
    toggleControlButtons(true); // 動画がロードされたらボタンを有効化
  } else {
    alert('無効なURLです。');
  }
});

// 動画IDを抽出
function extractVideoId(url) {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// プレイヤー準備完了時の処理
function onPlayerReady(event) {
  const volumeSlider = document.getElementById('volume-slider');
  volumeSlider.addEventListener('input', () => {
    player.setVolume(volumeSlider.value * 100);
  });

  const progressBar = document.getElementById('progress-bar');
  progressBar.addEventListener('input', () => {
    const duration = player.getDuration();
    const seekTime = (progressBar.value / 100) * duration;
    player.seekTo(seekTime, true); // 指定位置にシーク
  });
}

// プレイヤーの状態変化時の処理
function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    updateProgressBar();
  } else if (event.data === YT.PlayerState.ENDED && isRepeatEnabled) {
    player.seekTo(0); // 再生位置を先頭に戻す
    player.playVideo(); // 再生を再開
  }
}

// リピートボタンの切り替え
const repeatButton = document.getElementById('repeat-button');
repeatButton.addEventListener('click', () => {
  isRepeatEnabled = !isRepeatEnabled;
  repeatButton.textContent = isRepeatEnabled ? '🔁 リピートON' : '🔁 リピートOFF';
});

// ボタンの有効/無効を切り替え
function toggleControlButtons(enabled) {
  document.getElementById('play-button').disabled = !enabled;
  document.getElementById('pause-button').disabled = !enabled;
  document.getElementById('stop-button').disabled = !enabled;
}

// 動画再生進捗の更新
function updateProgressBar() {
  const progressBar = document.getElementById('progress-bar');
  const currentTimeDisplay = document.getElementById('current-time');
  const durationDisplay = document.getElementById('duration');

  const currentTime = player.getCurrentTime();
  const duration = player.getDuration();

  if (duration > 0) {
    progressBar.value = (currentTime / duration) * 100;
  }

  currentTimeDisplay.textContent = formatTime(currentTime);
  durationDisplay.textContent = formatTime(duration);

  if (player.getPlayerState() === YT.PlayerState.PLAYING) {
    requestAnimationFrame(updateProgressBar); // 再帰的に呼び出し
  }
}

// 時間をフォーマット
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

// 再生・一時停止・停止ボタン
document.getElementById('play-button').addEventListener('click', () => player.playVideo());
document.getElementById('pause-button').addEventListener('click', () => player.pauseVideo());
document.getElementById('stop-button').addEventListener('click', () => {
  player.stopVideo();
  document.getElementById('progress-bar').value = 0;
  document.getElementById('current-time').textContent = '0:00';
});

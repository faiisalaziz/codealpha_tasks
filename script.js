const songs = [
  {
    title: "Midnight Echo",
    artist: "Nova Bloom",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    cover: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Neon Skyline",
    artist: "Aurora Lane",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    cover: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Sunset Drift",
    artist: "Harbor Kids",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80",
  },
];

const audioPlayer = document.getElementById("audioPlayer");
const songTitle = document.getElementById("songTitle");
const songArtist = document.getElementById("songArtist");
const coverArt = document.getElementById("coverArt");
const currentTimeEl = document.getElementById("currentTime");
const totalTimeEl = document.getElementById("totalTime");
const progressBar = document.getElementById("progressBar");
const volumeControl = document.getElementById("volumeControl");
const playlistContainer = document.getElementById("playlist");
const playPauseButton = document.getElementById("playPauseButton");
const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");
const autoplayToggle = document.getElementById("autoplayToggle");

let currentIndex = 0;
let isPlaying = false;
let autoplayEnabled = true;

function formatTime(timeValue) {
  if (!Number.isFinite(timeValue) || timeValue < 0) {
    return "0:00";
  }

  const minutes = Math.floor(timeValue / 60);
  const seconds = Math.floor(timeValue % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function renderPlaylist() {
  playlistContainer.innerHTML = songs
    .map(
      (song, index) => `
        <button class="playlist-item ${index === currentIndex ? "active" : ""}" data-index="${index}">
          <div class="song-meta">
            <strong>${song.title}</strong>
            <span>${song.artist}</span>
          </div>
          <span class="song-duration">${index === currentIndex ? "Now" : "Play"}</span>
        </button>
      `
    )
    .join("");

  playlistContainer.querySelectorAll(".playlist-item").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.index);
      loadSong(index, true);
    });
  });
}

function updateProgressUI() {
  if (!Number.isFinite(audioPlayer.duration) || audioPlayer.duration === 0) {
    progressBar.value = 0;
    return;
  }

  const percentage = (audioPlayer.currentTime / audioPlayer.duration) * 100;
  progressBar.value = percentage;
  currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
}

function updateVolumeUI() {
  audioPlayer.volume = Number(volumeControl.value) / 100;
}

function updateSongDetails() {
  const song = songs[currentIndex];
  songTitle.textContent = song.title;
  songArtist.textContent = song.artist;
  coverArt.src = song.cover;
  coverArt.alt = `${song.title} by ${song.artist}`;
  totalTimeEl.textContent = "0:00";
}

function loadSong(index, shouldPlay = false) {
  currentIndex = (index + songs.length) % songs.length;
  const selectedSong = songs[currentIndex];

  audioPlayer.src = selectedSong.src;
  audioPlayer.load();
  updateSongDetails();
  renderPlaylist();

  if (shouldPlay) {
    playSong();
  } else {
    pauseSong();
  }
}

function playSong() {
  audioPlayer.play();
  isPlaying = true;
  playPauseButton.textContent = "❚❚";
  playPauseButton.setAttribute("aria-label", "Pause song");
}

function pauseSong() {
  audioPlayer.pause();
  isPlaying = false;
  playPauseButton.textContent = "▶";
  playPauseButton.setAttribute("aria-label", "Play song");
}

function togglePlayback() {
  if (isPlaying) {
    pauseSong();
  } else {
    playSong();
  }
}

function nextSong() {
  loadSong(currentIndex + 1, true);
}

function previousSong() {
  loadSong(currentIndex - 1, true);
}

function toggleAutoplay() {
  autoplayEnabled = !autoplayEnabled;
  autoplayToggle.classList.toggle("active", autoplayEnabled);
  autoplayToggle.textContent = `Autoplay: ${autoplayEnabled ? "On" : "Off"}`;
}

playPauseButton.addEventListener("click", togglePlayback);
prevButton.addEventListener("click", previousSong);
nextButton.addEventListener("click", nextSong);
autoplayToggle.addEventListener("click", toggleAutoplay);

progressBar.addEventListener("input", (event) => {
  if (!Number.isFinite(audioPlayer.duration) || audioPlayer.duration === 0) {
    return;
  }

  const newTime = (Number(event.target.value) / 100) * audioPlayer.duration;
  audioPlayer.currentTime = newTime;
  currentTimeEl.textContent = formatTime(newTime);
});

volumeControl.addEventListener("input", () => {
  updateVolumeUI();
});

playlistContainer.addEventListener("click", (event) => {
  const button = event.target.closest(".playlist-item");
  if (!button) return;

  const index = Number(button.dataset.index);
  loadSong(index, true);
});

audioPlayer.addEventListener("loadedmetadata", () => {
  totalTimeEl.textContent = formatTime(audioPlayer.duration);
  updateProgressUI();
});

audioPlayer.addEventListener("timeupdate", updateProgressUI);

audioPlayer.addEventListener("ended", () => {
  if (autoplayEnabled) {
    nextSong();
  } else {
    pauseSong();
  }
});

volumeControl.value = 70;
updateVolumeUI();
renderPlaylist();
loadSong(0, false);

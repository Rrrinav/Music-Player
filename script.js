document.addEventListener("DOMContentLoaded", function () {
  // Your entire JavaScript code here

  console.log(`  

.▀█▀.█▄█.█▀█.█▄.█.█▄▀　█▄█.█▀█.█─█
─.█.─█▀█.█▀█.█.▀█.█▀▄　─█.─█▄█.█▄█
              
`);
  let songs;
  let currFolder = "Ghazals";
  let currentSong = new Audio(
    "http://127.0.0.1:5500/Songs/Memes/Choliya%20Ke%20Hook.mp3"
  );
  currentSong.loop = "true";


  async function get_Songs(folder) {
    try {
      currFolder = folder;
      let response = await fetch(`http://127.0.0.1:5500/Songs/${folder}/`);
      let data = await response.text();

      let songDiv = document.createElement("div");
      songDiv.innerHTML = data;

      let links = songDiv.getElementsByTagName("a");

      let songsList = [];
      for (let i = 0; i < links.length; ++i) {
        const element = links[i];
        if (element.href.endsWith(".mp3")) {
          const decodedName = decodeURIComponent(
            element.href.split(`/Songs/`)[1].replace(".mp3", " ").split("/")[1]
          );
          songsList.push(decodedName);
        }
      }

      return songsList;
    } catch (error) {
      console.error("Error fetching songs:", error);
    }
  }

  async function formatter(seconds) {
    const minutes = await Math.floor(seconds / 60);
    const remainingSeconds = await Math.floor(seconds % 60);
    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(remainingSeconds).padStart(2, "0")}`;
  }

  async function update_time() {
    if (!isNaN(currentSong.duration) && isFinite(currentSong.duration)) {
      const runtime = await formatter(currentSong.currentTime);
      const duration = await formatter(currentSong.duration);
      songPlaybarDuration.innerHTML = `${runtime} / ${duration}`;
    }
  }

  async function playMusic(track) {
    const trimmedTrack = track.trim();
    currentSong.src = "/Songs/" + currFolder + "/" + trimmedTrack + ".mp3";
    currentSong.play();
    play.src = "assets/pause.svg";
    document.querySelector("#songPlaybarTrname").innerHTML = trimmedTrack;
  }

  async function loadsongs(Folder) {
    try {
        console.log("click test")
        currFolder = Folder;
        songs = await get_Songs(Folder);

        let songsULCollection = document.getElementsByClassName("library-songList")[0];

        // Clear existing content
        songsULCollection.innerHTML = "";

        for (const song of songs) {
            songsULCollection.innerHTML += `<li>
                                              <div class="li-info-right">
                                                  <img src="assets/note.svg" alt="">
                                                  <div class="library-li-info">
                                                      <div class="name">
                                                          ${song}
                                                      </div>
                                                      <div class="artist">
                                                          Artist
                                                      </div>
                                                  </div>
                                              </div>
                                              <div class="play-li">
                                                  <img src="assets/bar-play-button.svg" alt="">
                                              </div>
                                          </li>`;
        }

        // Add event listener to the play button for each song
        songsULCollection.querySelectorAll(".play-li").forEach((playButton, index) => {
            playButton.addEventListener("click", () => {
                const songName = songs[index].trim();
                playMusic(songName);
            });
        });
    } catch (error) {
        console.error("Error in main:", error);
    }
}




  async function loadCards() {
    try {
      let response = await fetch(`http://127.0.0.1:5500/Songs/`);
      let data = await response.text();

      let cardContainer = document.querySelector(".card-container");
      cardContainer.innerHTML = "";

      let info = document.createElement("div");
      info.innerHTML = data;
      let anchors = info.getElementsByTagName("a");

      for (const anchor of anchors) {
        if (anchor.href.includes("/Songs/")) {
          let folder = anchor.href
            .split("/Songs/")
            .slice(-1)[0]
            .replaceAll("%20", " ")
            .replaceAll("/", "");
          let response = await fetch(
            `http://127.0.0.1:5500/Songs/${folder}/info.json`
          );
          let info = await response.json();

          cardContainer.innerHTML += `<div class="card-wrapper" data-folder="${folder}">
                    <div class="card p-1">
                        <img src="Songs/${folder}/cover.jpg" alt="">
                        <h4>${info.title}</h4>
                        <p>${info.description}</p>
                        <div class="play-button">
                            <img src="assets/play_button.svg" alt="">
                        </div>
                    </div>
                </div>`;
        }
      }

      // Add event listener for each card
      document.querySelectorAll(".card-wrapper").forEach((cardWrapper) => {
        cardWrapper.addEventListener("click", cardClickHandler);
      });

    } catch (error) {
      console.error("Error loading cards:", error);
    }
  }




function cardClickHandler(event) {
    console.log("ll")
const cardWrapper = event.currentTarget;
const folderName = cardWrapper.dataset.folder; // Extract folder name from the data-folder attribute

    // Call get_Songs with the extracted folder name
    if (folderName) {
console.log("kk")
        let folder = folderName;
        console.log(folder)
        currFolder = folder
        loadsongs(folder)
            .then((songs) => {
                console.log(`Songs for folder '${folderName}':`, songs);
                // You can update the UI or perform other actions with the songs data
            })
            .catch((error) => {
                console.error("Error fetching songs:", error);
            });
    }
}





  async function main() {
    loadCards();

    loadsongs(currFolder);

    play.addEventListener("click", () => {
      if (currentSong.paused) {
        currentSong.play();
        play.src = "assets/pause.svg";
      } else {
        currentSong.pause();
        play.src = "assets/bar-play-button.svg";
      }
    });

    currentSong.addEventListener("timeupdate", () => {
      update_time();
      document.querySelector(".circle").style.left =
        (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
      let seekPercent =
        (e.offsetX / e.target.getBoundingClientRect().width) * 100;
      currentSong.currentTime = (seekPercent * currentSong.duration) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
      document.querySelector(".left").style.left = "0%";
    });

    document.querySelector("#menu-close").addEventListener("click", () => {
      document.querySelector(".left").style.left = "-120%";
    });

    let back = document.getElementById("back");
    let forward = document.getElementById("forw");

    back.addEventListener("click", () => {
      const currentSongFilename = currentSong.src
        .split("/")
        .slice(-1)[0]
        .replace(".mp3", " ")
        .replaceAll("%20", " ");
      const index = songs.indexOf(currentSongFilename);

      if (index > 0) {
        const previousSong = songs[index - 1];
        playMusic(previousSong);
      } else {
        // If index is 0 or less, play the last song in the list
        const lastSong = songs[songs.length - 1];
        playMusic(lastSong);
      }
    });

    forward.addEventListener("click", () => {
      const currentSongFilename = currentSong.src
        .split("/")
        .slice(-1)[0]
        .replace(".mp3", " ")
        .replaceAll("%20", " ");
      const index = songs.indexOf(currentSongFilename);

      if (index < songs.length - 1) {
        // If there is a next song, play it
        const nextSong = songs[index + 1];
        playMusic(nextSong);
      } else {
        // If reaching the last song, play the first song
        const firstSong = songs[0];
        playMusic(firstSong);
      }
    });

    // Check if the volume is zero and update the volume icon accordingly
    document.querySelector("#vol-range").addEventListener("input", (e) => {
      const volumePercentage = e.target.value; // The slider value (0 to 100)
      const volumeValue = volumePercentage / 100; // Convert to a value between 0 and 1 (inverse for decreasing volume)
      currentSong.volume = volumeValue;
    });

    // Check if the volume is zero and update the volume icon accordingly
    currentSong.addEventListener("volumechange", () => {
      const volumeIcon = document.querySelector(".volume img");
      if (currentSong.volume === 0) {
        volumeIcon.src = "assets/volume-mute.svg";
      } else {
        volumeIcon.src = "assets/volume.svg";
      }
    });

    document.querySelector(".volume img").addEventListener("click", () => {
      if (currentSong.volume === 0) {
        // If currently muted, unmute
        currentSong.volume = 1;
        document.querySelector("#vol-range").value = "100";
      } else {
        // If not muted, mute
        currentSong.volume = 0;
      }
    });

    document.body.addEventListener("keydown", (e) => {
      if (e.code === "Space") {
        // Check if the pressed key is the spacebar
        e.preventDefault(); // Prevent the default behavior of the spacebar (e.g., scrolling the page)

        if (currentSong.paused) {
          currentSong.play();
          play.src = "assets/pause.svg";
        } else {
          currentSong.pause();
          play.src = "assets/bar-play-button.svg";
        }
      }
    });

    
  }

  main();
});

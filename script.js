document.addEventListener("DOMContentLoaded", function () {
    console.log(`
    .▀█▀.█▄█.█▀█.█▄.█.█▄▀　█▄█.█▀█.█─█
    ─.█.─█▀█.█▀█.█.▀█.█▀▄　─█.─█▄█.█▄█
`);

    let songs;
    let currFolder = "Bollywood";
    let currentSong = new Audio("https://rrrinav.github.io/Music-Player/Songs/Bollywood/Senorita.mp3");
    currentSong.loop = true;

    async function get_Songs(folder) {
        try {
            currFolder = folder;
            let response = await fetch(`https://rrrinav.github.io/Music-Player/Songs/${folder}/info.json`);
            let data = await response.json();

            let songsList = data.songs.map(song => song.name);
            return songsList;
        } catch (error) {
            console.error("Error fetching songs:", error);
        }
    }

    async function formatter(seconds) {
        const minutes = await Math.floor(seconds / 60);
        const remainingSeconds = await Math.floor(seconds % 60);
        return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
    }

    async function update_time() {
        if (!isNaN(currentSong.duration) && isFinite(currentSong.duration)) {
            const runtime = await formatter(currentSong.currentTime);
            const duration = await formatter(currentSong.duration);
            document.getElementById("songPlaybarDuration").innerHTML = `${runtime} / ${duration}`;
        }
    }

    async function playMusic(track) {
    const trimmedTrack = track.trim();
    currentSong.src = `https://rrrinav.github.io/Music-Player/Songs/${currFolder}/${trimmedTrack}.mp3`;

    // Wait for the "loadedmetadata" event before playing
    currentSong.addEventListener("loadedmetadata", () => {
        currentSong.play();
    });

    document.getElementById("play").src = "assets/pause.svg";
    document.getElementById("songPlaybarTrname").innerHTML = trimmedTrack;
}


    async function loadsongs(Folder) {
        try {
            currFolder = Folder;
            songs = await get_Songs(Folder);

            let songsULCollection = document.querySelector(".library-songList");

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
            console.error("Error in loadsongs:", error);
        }
    }

    async function loadCards() {
        try {
            let response = await fetch(`https://rrrinav.github.io/Music-Player/Songs/playlist_info.json`);
            let data = await response.json();

            let cardContainer = document.querySelector(".card-container");
            cardContainer.innerHTML = "";

            for (const playlist of data.playlists) {
                cardContainer.innerHTML += `<div class="card-wrapper" data-folder="${playlist.title}">
                                                <div class="card p-1">
                                                    <img src="https://rrrinav.github.io/Music-Player/Songs/${playlist.title}/cover.jpg" alt="">
                                                    <h4>${playlist.title}</h4>
                                                    <p>${playlist.description}</p>
                                                    <div class="play-button">
                                                        <img src="assets/play_button.svg" alt="">
                                                    </div>
                                                </div>
                                            </div>`;
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
        const cardWrapper = event.currentTarget;
        const folderName = cardWrapper.dataset.folder;

        // Call loadsongs with the extracted folder name
        if (folderName) {
            loadsongs(folderName)
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

        document.getElementById("play").addEventListener("click", () => {
            if (currentSong.paused) {
                currentSong.play();
                document.getElementById("play").src = "assets/pause.svg";
            } else {
                currentSong.pause();
                document.getElementById("play").src = "assets/bar-play-button.svg";
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
back.addEventListener("click", () => {
    const currentSongFilename = currentSong.src
        .split("/")
        .slice(-1)[0]
        .replace(".mp3", "")
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


        document.querySelector(".circle").addEventListener("mousedown", (e) => {
            e.preventDefault();

            const seekbar = document.querySelector(".seekbar");

            const moveCircle = (e) => {
                const percent =
                    ((e.clientX - seekbar.getBoundingClientRect().left) /
                        seekbar.getBoundingClientRect().width) *
                    100;
                currentSong.currentTime = (percent * currentSong.duration) / 100;
            };

            const removeListeners = () => {
                document.removeEventListener("mousemove", moveCircle);
                document.removeEventListener("mouseup", removeListeners);
            };

            document.addEventListener("mousemove", moveCircle);
            document.addEventListener("mouseup", removeListeners);
        });
    }

    main();
});

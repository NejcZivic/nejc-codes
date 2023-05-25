function BufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function changeImageSizes(size) {
    const song = document.getElementsByClassName('song');
    for (let i = 0; i < song.length; i++) {
        const element = song[i];
        switch (size) {
            case 150:
                element.className = 'song small'
                break;
            case 200:
                element.className = 'song smedium'
                break;
            case 300:
                element.className = 'song medium'
                break;
            case 400:
                element.className = 'song large'
                break;
        }
        const image = element.children[0].children[0];
        const playImage = element.children[0].children[1];
        image.width = size;
        playImage.width = size;
    }
}

window.onload = () => {
    try {
        const audio = new Audio()
        audio.id = `audio`;
        audio.type = 'audio/mp3';

        const playImageB = document.getElementById('playImage');
        const pauseImage = document.getElementById('pauseImage');
        const playButton = document.getElementById('play');

        const small = document.getElementById('small');
        const smedium = document.getElementById('smedium');
        const medium = document.getElementById('medium');
        const large = document.getElementById('large');

        small.onclick = () => {
            smedium.classList.remove('checked');
            medium.classList.remove('checked');
            large.classList.remove('checked');
            small.classList.add('checked');
            localStorage.setItem('size', 'small');

            const song = document.getElementById('test');
            song.className = 'testSong small'
            song.children[0].width = 150;
            changeImageSizes(150);
        }

        smedium.onclick = () => {
            small.classList.remove('checked');
            medium.classList.remove('checked');
            large.classList.remove('checked');
            smedium.classList.add('checked');
            localStorage.setItem('size', 'smedium');

            const song = document.getElementById('test');
            song.className = 'testSong smedium'
            song.children[0].width = 200;
            changeImageSizes(200);
        }

        medium.onclick = () => {
            small.classList.remove('checked');
            smedium.classList.remove('checked');
            large.classList.remove('checked');
            medium.classList.add('checked');
            localStorage.setItem('size', 'medium');

            const song = document.getElementById('test');
            song.className = 'testSong medium'
            song.children[0].width = 300;
            changeImageSizes(300);
        }

        large.onclick = () => {
            small.classList.remove('checked');
            smedium.classList.remove('checked');
            medium.classList.remove('checked');
            large.classList.add('checked');
            localStorage.setItem('size', 'large');

            const song = document.getElementById('test');
            song.className = 'testSong large'
            song.children[0].width = 400;
            changeImageSizes(400);
        }

        const settings = window.localStorage;
        let type = settings.getItem("size")
        let discord = settings.getItem("enabled")

        const enabled = document.getElementById('discord');
        const disabled = document.getElementById('discord2');

        enabled.onclick = () => {
            disabled.classList.remove('checked');
            enabled.classList.add('checked');
            localStorage.setItem('enabled', 'true');
            discord = "true";
        }

        disabled.onclick = () => {
            enabled.classList.remove('checked');
            disabled.classList.add('checked');
            localStorage.setItem('enabled', 'false');
            discord = "false";
        }

        if (type == undefined || type == null) {
            window.localStorage.setItem("size", "medium");
            type = "medium";
        }

        if (discord == undefined || discord == null) {
            window.localStorage.setItem("enabled", "true");
            discord = "true";
        }

        if (settings.getItem('enabled') == 'true') {
            document.getElementById('discord').classList.add('checked');
        } else {
            document.getElementById('discord2').classList.add('checked');
        }

        if (settings.getItem('size') == 'small') {
            document.getElementById('small').classList.add('checked');
            const song = document.getElementsByClassName('song');
            for (let i = 0; i < song.length; i++) {
                const element = song[i];
                element.className = 'song small'
                element.children[0].width = 150;
            }
        } else if (settings.getItem('size') == 'smedium') {
            document.getElementById('smedium').classList.add('checked');
            const song = document.getElementsByClassName('song');
            for (let i = 0; i < song.length; i++) {
                const element = song[i];
                element.className = 'song smedium'
                element.children[0].width = 200;
            }
        } else if (settings.getItem('size') == 'medium') {
            document.getElementById('medium').classList.add('checked');
            const song = document.getElementsByClassName('song');
            for (let i = 0; i < song.length; i++) {
                const element = song[i];
                element.className = 'song medium'
                element.children[0].width = 300;
            }
        } else if (settings.getItem('size') == 'large') {
            document.getElementById('large').classList.add('checked');
            const song = document.getElementsByClassName('song');
            for (let i = 0; i < song.length; i++) {
                const element = song[i];
                element.className = 'song large'
                element.children[0].width = 400;
            }
        }

        playButton.onclick = () => {
            if (playButton.classList.contains("pause")) {
                playButton.classList.remove("pause");
                if (playing) {
                    playImageB.style.display = 'block';
                    pauseImage.style.display = 'none';
                    audio.pause();
                    if (discord != "true") return;
                    window.electronAPI.pause(JSON.stringify({ paused: true }));
                }
            }
            else {
                playImageB.style.display = 'none';
                pauseImage.style.display = 'block';
                playButton.classList.add("pause");
                audio.play();
                if (discord != "true") return;
                window.electronAPI.pause(JSON.stringify({ paused: false, passed: audio.currentTime }));
            }
        }

        document.body.appendChild(audio);

        let playing;
        let itterator = 0;
        let selectedItterator = 0;
        let maxItterator;
        let shuffelItterator = 0;
        let shuffel = false;
        let loop = false;

        function makeMaxItterator(max) {
            maxItterator = Array.from(Array(max).keys());
            for (let i = maxItterator.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [maxItterator[i], maxItterator[j]] = [maxItterator[j], maxItterator[i]];
                console.log(maxItterator);
            }
        }

        window.electronAPI.songs(async (event, value) => {
            const data = JSON.parse(value);
            makeMaxItterator(data.max);
            const loader = document.getElementById('loader');
            const warning = document.getElementById('warning');
            const search = document.getElementById('search');

            search.style.display = 'block';
            loader.style.display = 'none';
            warning.style.display = 'none';

            for (const song of data.data) {
                itterator++;
                await new Promise((resolve) => setTimeout(resolve, 10));
                const songDiv = document.createElement('div');
                songDiv.classList.add('non-view');
                songDiv.id = itterator;

                setTimeout(() => {
                    songDiv.classList.remove('non-view');
                    songDiv.classList.add('song');
                    songDiv.classList.add(type);
                }, 100);

                const name = song.name;
                const artist = song.artist;

                const imageDiv = document.createElement('div');
                imageDiv.classList.add('image');
                const imageElement = document.createElement('img');
                imageElement.src = song.image;
                switch (type) {
                    case 'small':
                        imageElement.width = 150;
                        break;
                    case 'smedium':
                        imageElement.width = 200;
                        break;
                    case 'medium':
                        imageElement.width = 300;
                        break;
                    case 'large':
                        imageElement.width = 400;
                        break;
                }
                imageDiv.appendChild(imageElement);

                const playImage = document.createElement('img');
                playImage.src = '../imgs/play.png';
                playImage.classList.add('play');
                playImage.id = itterator;
                switch (type) {
                    case 'small':
                        playImage.width = 150;
                        break;
                    case 'smedium':
                        playImage.width = 200;
                        break;
                    case 'medium':
                        playImage.width = 300;
                        break;
                    case 'large':
                        playImage.width = 400;
                        break;
                }
                playImage.onclick = () => {
                    if (playing) {
                        audio.src = song.song;
                        playing.pause();
                        playing = audio;
                        playing.play();
                    }
                    else {
                        audio.src = song.song;
                        playing = audio;
                        playing.play();
                    }

                    if (!playButton.classList.contains("pause")) {
                        playButton.classList.add("pause");
                        playImageB.style.display = 'none';
                        pauseImage.style.display = 'block';
                    }

                    selectedItterator = playImage.id;

                    const playingImage = document.getElementById('currentlyPlayingImage');
                    const playingSong = document.getElementById('currentlyPlayingText');
                    const playingArtist = document.getElementById('currentlyPlayingText2');
                    const finalTimeText = document.getElementById('timeText2');

                    playingImage.src = song.image;
                    playingSong.innerText = name;
                    playingArtist.innerText = artist;

                    audio.onloadedmetadata = () => {
                        const seconds = Math.floor(audio.duration % 60);
                        const minutes = Math.floor(audio.duration / 60);

                        finalTimeText.innerText = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;

                        if (discord != "true") return;
                        window.electronAPI.rpc(JSON.stringify({
                            state: artist,
                            details: name,
                            audioDuration: audio.duration,
                            largeImage: song.image.replace(/\//g, '\\'),
                            largeText: "Currently Playing",
                        }));
                    }
                };

                imageDiv.appendChild(playImage);

                const nameDiv = document.createElement('div');
                nameDiv.classList.add('name');

                const artistDiv = document.createElement('div');
                artistDiv.classList.add('artist');

                switch (type) {
                    case 'small':
                        if (name.substring(0, 22) === name.toUpperCase().substring(0, 22) && name.length > 22) {
                            const nameElement = document.createElement('h2');
                            nameElement.innerText = name.substring(0, 19) + '...';
                            nameDiv.appendChild(nameElement);
                        }
                        else if (name.length > 25) {
                            const nameElement = document.createElement('h2');
                            nameElement.innerText = name.substring(0, 22) + '...';
                            nameDiv.appendChild(nameElement);
                        }
                        else {
                            const nameElement = document.createElement('h2');
                            nameElement.innerText = name;
                            nameDiv.appendChild(nameElement);
                        }

                        if (artist.substring(0, 22) === artist.toUpperCase().substring(0, 22) && artist.length > 22) {
                            const artistElement = document.createElement('h3');
                            artistElement.innerText = artist.substring(0, 19) + '...';
                            artistDiv.appendChild(artistElement);
                        }

                        else if (artist.length > 25) {
                            const artistElement = document.createElement('h3');
                            artistElement.innerText = artist.substring(0, 22) + '...';
                            artistDiv.appendChild(artistElement);
                        }

                        else {
                            const artistElement = document.createElement('h3');
                            artistElement.innerText = artist;
                            artistDiv.appendChild(artistElement);
                        }
                        break;
                    case 'smedium':
                        if (name.substring(0, 22) === name.toUpperCase().substring(0, 22) && name.length > 22) {
                            const nameElement = document.createElement('h2');
                            nameElement.innerText = name.substring(0, 19) + '...';
                            nameDiv.appendChild(nameElement);
                        }
                        else if (name.length > 25) {
                            const nameElement = document.createElement('h2');
                            nameElement.innerText = name.substring(0, 22) + '...';
                            nameDiv.appendChild(nameElement);
                        }
                        else {
                            const nameElement = document.createElement('h2');
                            nameElement.innerText = name;
                            nameDiv.appendChild(nameElement);
                        }

                        if (artist.substring(0, 22) === artist.toUpperCase().substring(0, 22) && artist.length > 22) {
                            const artistElement = document.createElement('h3');
                            artistElement.innerText = artist.substring(0, 19) + '...';
                            artistDiv.appendChild(artistElement);
                        }

                        else if (artist.length > 25) {
                            const artistElement = document.createElement('h3');
                            artistElement.innerText = artist.substring(0, 22) + '...';
                            artistDiv.appendChild(artistElement);
                        }

                        else {
                            const artistElement = document.createElement('h3');
                            artistElement.innerText = artist;
                            artistDiv.appendChild(artistElement);
                        }
                        break;
                    case 'medium':
                        if (name.substring(0, 22) === name.toUpperCase().substring(0, 22) && name.length > 22) {
                            const nameElement = document.createElement('h2');
                            nameElement.innerText = name.substring(0, 19) + '...';
                            nameDiv.appendChild(nameElement);
                        }
                        else if (name.length > 25) {
                            const nameElement = document.createElement('h2');
                            nameElement.innerText = name.substring(0, 22) + '...';
                            nameDiv.appendChild(nameElement);
                        }
                        else {
                            const nameElement = document.createElement('h2');
                            nameElement.innerText = name;
                            nameDiv.appendChild(nameElement);
                        }

                        if (artist == "") {
                            const artistElement = document.createElement('h3');
                            artistElement.innerText = 'Unknown';
                            artistDiv.appendChild(artistElement);
                        }
                        if (artist.length > 28) {
                            const artistElement = document.createElement('h3');
                            artistElement.innerText = artist.substring(0, 27) + '...';
                            artistDiv.appendChild(artistElement);
                        }
                        else {
                            const artistElement = document.createElement('h3');
                            artistElement.innerText = artist;
                            artistDiv.appendChild(artistElement);
                        }
                        break;
                    case 'large':
                        if (name.substring(0, 17) === name.toUpperCase().substring(0, 17) && name.length > 17) {
                            const nameElement = document.createElement('h2');
                            nameElement.innerText = name.substring(0, 14) + '...';
                            nameDiv.appendChild(nameElement);
                        }
                        else if (name.length > 20) {
                            const nameElement = document.createElement('h2');
                            nameElement.innerText = name.substring(0, 17) + '...';
                            nameDiv.appendChild(nameElement);
                        }
                        else {
                            const nameElement = document.createElement('h2');
                            nameElement.innerText = name;
                            nameDiv.appendChild(nameElement);
                        }

                        if (artist.substring(0, 22) === artist.toUpperCase().substring(0, 22) && artist.length > 22) {
                            const artistElement = document.createElement('h3');
                            artistElement.innerText = artist.substring(0, 19) + '...';
                            artistDiv.appendChild(artistElement);
                        }

                        else if (artist.length > 25) {
                            const artistElement = document.createElement('h3');
                            artistElement.innerText = artist.substring(0, 22) + '...';
                            artistDiv.appendChild(artistElement);
                        }

                        else {
                            const artistElement = document.createElement('h3');
                            artistElement.innerText = artist;
                            artistDiv.appendChild(artistElement);
                        }
                        break;
                }

                songDiv.appendChild(imageDiv);
                songDiv.appendChild(nameDiv);
                songDiv.appendChild(artistDiv);

                document.getElementById('songs').appendChild(songDiv);
            }
        });

        const search = document.getElementById('search');
        search.oninput = () => {
            const songs = document.getElementsByClassName('song');
            if (search.value === '') {
                for (const song of songs) {
                    song.style.display = 'block';
                }
            }

            else {
                for (const song of songs) {
                    const name = song.getElementsByClassName('name')[0].innerText;
                    const artist = song.getElementsByClassName('artist')[0].innerText;

                    if (name.toLowerCase().includes(search.value.toLowerCase()) || artist.toLowerCase().includes(search.value.toLowerCase())) {
                        song.style.display = 'block';
                    }
                    else {
                        song.style.display = 'none';
                    }
                }
            }
        }

        const next = document.getElementById('next');
        next.onclick = () => {
            if (shuffel) {
                if (shuffelItterator === maxItterator.length - 1) {
                    if (!loop) return;
                    shuffelItterator = 0;
                }
                else {
                    shuffelItterator++;
                }
                const song = document.getElementById(maxItterator[shuffelItterator]);

                if (song) {
                    song.childNodes[0].childNodes[1].click();
                }
                return;
            }

            selectedItterator++;
            if (selectedItterator > maxItterator.length) {
                if (!loop) return;
                selectedItterator = 2;
            }
            const song = document.getElementById(selectedItterator);

            if (song) {
                song.childNodes[0].childNodes[1].click();
            }
        }

        const previous = document.getElementById('previous');
        previous.onclick = () => {
            if (shuffel) {
                if (shuffelItterator === 0) {
                    shuffelItterator = maxItterator.length - 1;
                }
                else {
                    shuffelItterator--;
                }
                const song = document.getElementById(maxItterator[shuffelItterator]);

                if (song) {
                    song.childNodes[0].childNodes[1].click();
                }
                return;
            }

            selectedItterator--;
            if (selectedItterator < 1) {
                selectedItterator = maxItterator.length;
            }
            const song = document.getElementById(selectedItterator);

            if (song) {
                song.childNodes[0].childNodes[1].click();
            }
        }

        const time = document.getElementById('timeBarInner');
        const timeBar = document.getElementById('timeBar');
        const timeText = document.getElementById('timeText');

        audio.ontimeupdate = () => {
            time.style.width = (audio.currentTime / audio.duration) * 100 + '%';
            const minutes = Math.floor(audio.currentTime / 60);
            const seconds = Math.floor(audio.currentTime % 60);

            if (seconds < 10) {
                timeText.innerText = `${minutes}:0${seconds}`;
            }

            else {
                timeText.innerText = `${minutes}:${seconds}`;
            }
        }

        audio.onended = () => {
            next.click();
        }

        timeBar.onclick = (e) => {
            if (!playing) return;
            const rect = timeBar.getBoundingClientRect();
            const x = e.clientX - rect.left;
            audio.currentTime = (x / rect.width) * audio.duration;
            if (discord != "true") return;
            window.electronAPI.changeTime(JSON.stringify({ passed: audio.currentTime }));
        }

        const shuffleB = document.getElementById('shuffle');
        const shuffleActive = document.getElementById('shuffleActive');

        shuffleB.onclick = () => {
            shuffleB.style.display = 'none';
            shuffleActive.style.display = '';
            shuffel = true;
        }

        shuffleActive.onclick = () => {
            shuffleB.style.display = '';
            shuffleActive.style.display = 'none';
            shuffel = false;
        }

        const loopB = document.getElementById('loop');
        const loopActive = document.getElementById('loopActive');

        loopB.onclick = () => {
            loopB.style.display = 'none';
            loopActive.style.display = '';
            loop = true;
        }

        loopActive.onclick = () => {
            loopB.style.display = '';
            loopActive.style.display = 'none';
            loop = false;
        }

        const volume = document.getElementById('volume');
        const volumeBar = document.getElementById('volumeBar');
        const innerBar = document.getElementById('volumeBarInner');
        const mute = document.getElementById('mute');

        volume.onclick = () => {
            mute.style.display = '';
            volume.style.display = 'none';
            audio.muted = true;
        }

        mute.onclick = () => {
            mute.style.display = 'none';
            volume.style.display = '';
            audio.muted = false;
        }

        let mouseDown = false;

        volumeBar.onmousedown = () => {
            mouseDown = true;
        }

        volumeBar.onmouseup = () => {
            mouseDown = false;
        }

        volume.ontouchcancel = () => {
            mouseDown = false;
        }

        volumeBar.onmousemove = (e) => {
            if (mouseDown) {
                const rect = volumeBar.getBoundingClientRect();
                const x = e.clientX - rect.left;
                audio.volume = (x / rect.width);
                innerBar.style.width = audio.volume * 100 + '%';
            }
        }

        document.onkeydown = (e) => {
            if (e.key === ' ') {
                e.preventDefault();
                playButton.click();
            }
        }

        const settingsButton = document.getElementById('settings');

        settingsButton.onclick = () => {
            const settingsDiv = document.getElementById('hidden-settings');
            settingsDiv.style.display = 'block';
        }

        const closeSettings = document.getElementById('settingsS');

        closeSettings.onclick = () => {
            const settingsDiv = document.getElementById('hidden-settings');
            settingsDiv.style.display = 'none';
        }

    } catch (error) {
        console.log(error);
    }
}
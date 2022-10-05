const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

// 1. Render songs v
// 2. Scroll v
// 3. Play/ pause / seek(tua) v
// 4. CD rotate(quay) v
// 5. Next / prev v
// 6. Turn on / Turn off randomSong (chưa tối ưu việc random lại quá nhiều 1 bài) v
// 7. NextSong / repeat when ended v
// 8. Active currentSong v
// 9. Scroll active into view v
// 10. Play song when click

const PLAYER_STORAGE_KEY = 'F8_PLAYER';
const currentTime = $('.currentTime');
const durationTime = $('.durationTime');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const playList = $('.playlist');
const playBtn = $('.btn-toggle-play');
const cd = $('.cd');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const volumeIcon = $('.volume-change');
const volumeBar = $('.volume');

const songPlayedList = new Set();


const app = {
	currentIndex: 0,
	isPlaying: false,
	isRandom: false,
	isRepeat: false,
	isMute: false,
	currentVolume: 0.0,
	config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {
		currentVolume: 0.5,
		isMute: false,
		isRepeat: false,
		isRandom: false,
		currentIndex: 0,
	},
	setConfig: function (key, value) {
		this.config[key] = value;
		localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
	},

	songs: [
        {
			name: 'Jojo Bizarre Adventure',
			singer: 'Gogo theme',
			path: './music/audio/JoJo-Bizarre-Adventure.mp3',
			image: 'https://pbs.twimg.com/profile_images/1055432796137758720/m7-YLJa1.jpg',
		},
		{
			name: 'Waing For You',
			singer: 'Mono',
			path: './music/audio/Waiting For You.mp3',
			image: 'https://pbs.twimg.com/profile_images/1055432796137758720/m7-YLJa1.jpg',
		},
		{
			name: 'Như Những Phút Ban Đầu',
			singer: 'Hoài Lâm',
			path: './music/audio/nhuphutbandau.mp3',
			image:
				'https://pbs.twimg.com/profile_images/1055432796137758720/m7-YLJa1.jpg',
		},

		{
			name: '3107(Cover)',
			singer: '3107',
			path: './music/audio/3107-Cover-Music-30-365.mp3',
			image: 'https://pbs.twimg.com/profile_images/1055432796137758720/m7-YLJa1.jpg',
		},
		{
			name: 'Theres No One At All',
			singer: 'Sơn Tùng MTP',
			path: './music/audio/Theres-No-One-At-All-Son-Tung-M-TP.mp3',
			image: 'https://pbs.twimg.com/profile_images/1055432796137758720/m7-YLJa1.jpg',
		},
		{
			name: 'Buông Đôi Tay Nhau Ra',
			singer: 'Sơn Tùng MTP',
			path: './music/audio/Buong-Doi-Tay-Nhau-Ra-Son-Tung-M-TP.mp3',
			image: 'https://pbs.twimg.com/profile_images/1055432796137758720/m7-YLJa1.jpg',
		},
		{
			name: 'We Dont Talk Anymore',
			singer: 'Charlie Puth',
			path: './music/audio/We Don_t Talk Anymore - Charlie Puth_ Se.mp3',
			image: 'https://pbs.twimg.com/profile_images/1055432796137758720/m7-YLJa1.jpg',
		},
		{
			name: 'Anh Đã Quen Với Cô Đơn',
			singer: 'Soobin Hoàng Sơn',
			path: './music/audio/Anh-Da-Quen-Voi-Co-Don-Soobin-Hoang-Son.mp3',
			image: 'https://pbs.twimg.com/profile_images/1055432796137758720/m7-YLJa1.jpg',
		},
		{
			name: 'Lần Cuối',
			singer: 'Karik',
			path: './music/audio/Lan-Cuoi-Karik.mp3',
			image: 'https://pbs.twimg.com/profile_images/1055432796137758720/m7-YLJa1.jpg',
		},
		{
			name: 'Say Do You',
			singer: 'Tiên Tiên',
			path: './music/audio/Say-You-Do-Tien-Tien.mp3',
			image: 'https://pbs.twimg.com/profile_images/1055432796137758720/m7-YLJa1.jpg',
		},
		{
			name: 'Cơn Mưa Rào',
			singer: 'JSOL',
			path: './music/audio/Con-Mua-Rao-JSOL.mp3',
			image: 'https://pbs.twimg.com/profile_images/1055432796137758720/m7-YLJa1.jpg',
		},
		{
			name: 'Hồi ức',
			singer: 'Phan Mạnh Quỳnh',
			path: './music/audio/Hoi-Uc-Phan-Manh-Quynh.mp3',
			image: 'https://pbs.twimg.com/profile_images/1055432796137758720/m7-YLJa1.jpg',
		},
	
	],
	defineProperties: function () {
		Object.defineProperty(this, 'currentSong', {
			get: function () {
				return this.songs[this.currentIndex];
			},
		});
	},

	render: function () {
		const htmls = this.songs.map((song, index) => {
			return `
				<div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
					<div class="thumb"
						style="background-image: url('${song.image}')">
					</div>
					<div class="body">
						<h3 class="title">${song.name}</h3>
						<p class="author">${song.singer}</p>
					</div>
					<div class="option">
						<i class="fas fa-ellipsis-h"></i>
					</div>
				</div>
			`;
		});
		playList.innerHTML = htmls.join('');
	},

	// Lắng nghe sự kiện khi kéo tren document
	handleEvent: function () {
		const _this = this;
		const cdWidth = cd.offsetWidth;
		// Xử lý phóng to/ thu nhỏ cd
		document.onscroll = function () {
			// console.log(window.scrollY); // Cách 1: Tùy trình duyệt . có một số trình duyệt không hoạt động
			// console.log(document.documentElement.scrollTop); // Cách 2
			const scroll = window.screenY || document.documentElement.scrollTop;
			const newCdWidth = cdWidth - scroll;

			cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
			cd.style.opacity = newCdWidth / cdWidth;
		};

		// Xử lý khi click play
		playBtn.onclick = function () {
			if (!_this.isPlaying) audio.play();
			else audio.pause();
		};

		// Khi song được play
		audio.onplay = function () {
			playBtn.classList.add('playing');
			_this.isPlaying = true;
			cbThumbAnimation.play();
			_this.activeSong(); // intoScrollView đến song đã lưu
			if (_this.isMute) {
				audio.volume = 0;
				volumeBar.Value = 0;
			} else {
				audio.volume = _this.currentVolume;
				volumeBar.value = _this.currentVolume * 100;
			}
		};

		// Khi song bị pause
		audio.onpause = function () {
			playBtn.classList.remove('playing');
			_this.isPlaying = false;
			cbThumbAnimation.pause();
		};

		// Khi tiến độ bài hát thay đổi
		audio.ontimeupdate = function () {
			// Do khi vừa tải video thì nó là naN
			if (audio.duration) {
				const progressPercent = Math.floor((audio.currentTime / audio.duration) * 100);
				progress.value = progressPercent;
				currentTime.textContent = _this.timeFormat(this.currentTime);
				durationTime.textContent = _this.timeFormat(this.duration);
			}
		};

		// Xử lý khi tua song
		progress.onchange = function (e) {
			if (!_this.isPlaying) audio.play();
			const seekTime = (audio.duration / 100) * e.target.value;
			audio.currentTime = seekTime;
		};

		// CD rotate
		const cbThumbAnimation = cdThumb.animate([{ transform: 'rotate(360deg)' }], {
			duration: 10000,
			iterations: Infinity,
		});
		cbThumbAnimation.pause();

		// nextSong
		nextBtn.onclick = function () {
			if (_this.isRandom) {
				_this.randomSong();
			} else app.nextSong();
			_this.activeSong();
			audio.play();
		};

		// prevSong
		prevBtn.onclick = function () {
			if (_this.isRandom) {
				_this.randomSong();
			} else app.prevSong();
			_this.activeSong();
			audio.play();
		};

		// Turn on / Turn off randomSong
		randomBtn.onclick = function () {
			_this.isRandom = !_this.isRandom;
			_this.setConfig('isRandom', _this.isRandom);
			this.classList.toggle('active', _this.isRandom);
		};

		// Turn on / Turn off repeatSong
		repeatBtn.onclick = function () {
			_this.isRepeat = !_this.isRepeat;
			_this.setConfig('isRepeat', _this.isRepeat);
			this.classList.toggle('active', _this.isRepeat);
		};
		// auto nextSong when ended
		audio.onended = function () {
			if (_this.isRepeat) {
				audio.play();
			} else nextBtn.click();
		};

		// Lằng nghe hành vi click vào playList
		// Closest trả về một element là chính nó hoặc thẻ cha của nó
		// Nếu không tìm thấy thì return null
		playList.onclick = function (e) {
			const songNode = e.target.closest('.song:not(.active)'); // Song không có active
			if (songNode || e.target.closest('.option')) {
				// Xử lý khi click vào song
				if (songNode) {
					_this.currentIndex = Number(songNode.dataset.index);
					_this.loadCurrentSong();
					audio.play();
					_this.activeSong();
				}
			}
		};

		// Volume
		volumeIcon.onclick = function () {
			_this.isMute = !_this.isMute;
			// console.log({ volumeBar });
			_this.setConfig('isMute', _this.isMute);
			volumeIcon.classList.toggle('active', _this.isMute);
			if (_this.isMute) {
				audio.volume = 0;
				volumeBar.value = 0;
			} else {
				volumeBar.value = _this.currentVolume * 100;
				audio.volume = _this.currentVolume;
			}
		};

		volumeBar.onchange = function (e) {
			_this.currentVolume = e.target.value / 100;
			audio.volume = _this.currentVolume;
			_this.setConfig('currentVolume', _this.currentVolume);
			audio.play();
			if (audio.volume === 0) {
				volumeIcon.classList.add('active');
			} else {
				_this.isMute = false;
				_this.setConfig('isMute', _this.isMute);
				volumeIcon.classList.remove('active');
			}
		};
	},

	timeFormat(seconds) {
		const date = new Date(null);
		date.setSeconds(seconds);
		return date.toISOString().slice(14, 19);
	},

	nextSong: function () {
		this.previousIndex = this.currentIndex;
		this.currentIndex++;
		if (this.currentIndex >= this.songs.length) {
			this.currentIndex = 0;
		}
		this.loadCurrentSong();
	},

	prevSong: function () {
		this.previousIndex = this.currentIndex;
		this.currentIndex--;
		if (this.currentIndex < 0) {
			this.currentIndex = this.songs.length - 1;
		}
		this.loadCurrentSong();
	},

	randomSong: function () {
		this.previousIndex = this.currentIndex;
		let newIndex;
		do {
			newIndex = Math.floor(Math.random() * this.songs.length);
		} while (songPlayedList.has(newIndex));
		this.currentIndex = newIndex;
		this.loadCurrentSong();
		songPlayedList.add(newIndex);
		if (songPlayedList.size === this.songs.length) {
			songPlayedList.clear();
		}
		this.activeSong();
	},

	loadCurrentSong: function () {
		heading.textContent = this.currentSong.name;
		cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
		audio.src = this.currentSong.path;
	},

	loadConfig: function () {
		this.isRandom = this.config.isRandom;
		this.isRepeat = this.config.isRepeat;
		this.currentVolume = this.config.currentVolume;
		this.isMute = this.config.isMute;
		this.currentIndex = this.config.currentIndex;

		// Hiển thị trạng thái bang đầu của button repeat và random
		randomBtn.classList.toggle('active', this.isRandom);
		repeatBtn.classList.toggle('active', this.isRepeat);
		volumeIcon.classList.toggle('active', this.isMute);
	},

	activeSong: function () {
		const songs = $$('.song');
		songs.forEach((song, index) => {
			if (index === this.currentIndex) {
				song.classList.add('active');
				this.setConfig('currentIndex', this.currentIndex);
				setTimeout(() => {
					song.scrollIntoView({
						behavior: 'smooth',
						block: 'center',
						inline: 'center',
					});
				}, 300);
			} else song.classList.remove('active');
		});
	},
	start: function () {
		// Gán cấu hình đọc từ LOCAL_STORAGE_KEY từ config vào object app
		this.loadConfig();
		this.render();
		this.defineProperties();
		this.handleEvent();
		this.loadCurrentSong();
	},
};

app.start();



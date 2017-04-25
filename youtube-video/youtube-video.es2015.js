(() => {

	/* global YouTubeLoader, YT, window, document, HTMLElement, CustomEvent */

	class YouTubeVideo extends HTMLElement {

		constructor() {
			super();
		}


		connectedCallback() {

			const identifier = this.getAttribute('identifier');
			console.log('YouTubeVideo: Load video for identifier %o', identifier);
			if (!identifier) console.warn('YouTubeVideo: Identifier is missing on %o', this);
			else {
				this._identifier = identifier;
				this._setupVideo();
			}

			this._parent = this.parentElement;

			this._emitEvent('add-video', { element: this });

		}



		disconnectedCallback() {
			this._emitEvent('remove-video', { element: this }, this._parent);
			this._parent = undefined;
		}


		/**
		* Load YouTube API (through YouTubeLoader, register callback for initialization
		*/
		_setupVideo() {

			YouTubeLoader.load();
			YouTubeLoader.registerCallback(() => {
				this._replaceVideo();
			});

		}


		/**
		* Replace placeholder with video. Setup all event listeners. Store reference to 
		* YouTube Player in this._player.
		*/
		_replaceVideo() {
			
			// Create a temporary child that will be replaced by the video
			const temporaryChild = document.createElement('div');
			this.appendChild(temporaryChild);

			// Create options that we pass to the player
			const options = {
				videoId				: this._identifier
				, events			: {
					onReady			: () => {
						if (this.hasAttribute('muted')) this._player.mute();
						this._emitEvent('ready');
					}
					, onStateChange	: (ev) => {
						if (ev.data === YT.PlayerState.ENDED) this._emitEvent('end');
						else if (ev.data === YT.PlayerState.PLAYING) this._emitEvent('play');
						else if (ev.data === YT.PlayerState.PAUSED) this._emitEvent('pause');
					}
				}
			};


			// Get playerVars from attribute
			const playerVars = this._getPlayerVars();
			if (playerVars) options.playerVars = playerVars;

			// Setup and store player
			this._player = new YT.Player(temporaryChild, options);
			console.log('YouTubeVideo: Initialize player with options %o, element %o', options, temporaryChild);

		}



		/**
		* Get and validate attribute player-vars, return vars if set, else undefined. 
		* @returns {Object|undefined}
		*/
		_getPlayerVars() {

			if (!this.getAttribute('player-vars')) return;

			let playerVars;
			try {
				playerVars = JSON.parse(this.getAttribute('player-vars'));
			}
			catch(err) {
				console.error('YouTubeVideo: Could not set player-vars, value provided was invalid: %o', err);
				return;
			}

			if (!playerVars || typeof playerVars !== 'object') {
				console.error('YouTubeVideo: Invalid playerVars, must be an object: %o', playerVars);
				return;
			}

			return playerVars;

		}




		/***
		* Play video
		*/
		play() {
			console.log('YouTubeVideo: Play %o', this._identifier);
			if (this._player) this._player.playVideo();
			else console.warn('YouTubeVideo: Cannot play video until it\'s ready. Listen to the ready event before playing a video');
		}




		/***
		* Pause video
		*/
		pause() {
			console.log('YouTubeVideo: Pause %o', this._identifier);
			if (this._player) this._player.pauseVideo();
			else console.warn('YouTubeVideo: Cannot pause video until it\'s ready. Listen to the ready event before pausing a video');
		}


		/**
		* @returns {Boolean}
		*/
		isReady() {
			return !!this._player;
		}


		/**
		* Simply emits events
		* @param {String} type		Type of callbacks to execute
		* @param {Any} args			Arguments to pass to the callback
		*/
		_emitEvent(type, args, element) {
			console.log('YouTubeVideo: Emit event %o on %o', type, element);
			const event = new CustomEvent(type, { detail: args, bubbles: true });
			(element || this).dispatchEvent(event);
		}


	}

	window.YouTubeVideo = YouTubeVideo;
	window.customElements.define('youtube-video', YouTubeVideo);

})();



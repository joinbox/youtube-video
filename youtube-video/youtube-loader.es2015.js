(() => {

	/* global document, window */

	// Set to true as soon as we start loading; we don't want to have multiple 
	// script tags with the same source in the DOM
	let _isLoading = false;

	// Set to true as soon as the ready callback (onYouTubeIframeAPIReady) is fired
	let _isReady = false;

	// Callbacks registered through registerCallback
	const _callbacks = [];

	/**
	* Simple that loads the YouTube iFrame API. 
	* See https://developers.google.com/youtube/iframe_api_reference.
	*
	* Use like: 
	* YoutubeLoader.registerCallback(() => {});
	* YoutubeLoader.load();
	*/
	window.YouTubeLoader = {

		/**
		* Loads the YouTube iFrame API
		*/
		load: function() {

			console.log('YouTubeLoader: Load YouTube API');

			if (_isLoading) {
				console.log('YoutubeLoader: Already loading');
				return;
			}

			_isLoading = true;

			// Make primary callback available globally
			window.onYouTubeIframeAPIReady = this._loaded.bind(this);
			const tag = document.createElement('script');
			tag.setAttribute('src', 'https://www.youtube.com/iframe_api');

			// 1st Prio: Insert before first script tag
			const firstScriptTag = document.getElementsByTagName('script')[0];
			if (firstScriptTag) {
				firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
				return;
			}

			// 2nd Prio: Insert before last element in head
			const head = document.getElementsByTagName('head');
			if (head) {
				head.appendChild(tag);
				return;
			}

			const error = new Error('YouTubeLoader: No insertion point found; make sure your site has a <head> tag.');
			console.error(error);
			throw(error);


		}


		/**
		* Called through window.onYouTubeIframeAPIReady when YouTube API was loaded.
		*/
		, _loaded: function() {

			console.log('YouTubeLoader: API Loaded, call %o callbacks', _callbacks.length);
			this._isReady = true;
			_callbacks.forEach((callback) => callback());

		}


		/**
		* Register a function that will be called as soon as the YouTube API is ready
		* @param {Function} callback
		*/
		, registerCallback: function(callback) {

			console.log('YouTubeLoader: Callback registered');

			if (_isReady) {
				console.log('YouTubeLoader: Directly call callback, API is ready');
				callback();
				return;
			}

			_callbacks.push(callback);

		}


	};
})();

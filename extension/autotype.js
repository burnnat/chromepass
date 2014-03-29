var exports = window;

(function() {
	/**
	 * Simple merge sort implementation for stable sorting of DOM elements by tabindex.
	 */

	var insert = function(array, begin, end, v) {
		while (begin + 1 < end && array[begin + 1] < v) {
			array.swap(begin, begin + 1);
			++begin;
		}

		array[begin] = v;
	};

	var getTabIndex = function(el) {
		return parseInt(el.tabindex, 10);
	};

	var merge = function(array, begin, begin_right, end) {
		for (; begin < begin_right; ++begin) {
			if (getTabIndex(array[begin]) > getTabIndex(array[begin_right])) {
				var v = array[begin];
				array[begin] = array[begin_right];
				insert(array, begin_right, end, v);
			}
		}
	};

	var msort = function(array, begin, end) {
		var size = end - begin;

		if (size < 2) {
			return;
		}

		var begin_right = begin + Math.floor(size / 2);

		msort(array, begin, begin_right);
		msort(array, begin_right, end);
		merge(array, begin, begin_right, end);
	};

	var getNodeArray = function(selector) {
		return Array.prototype.slice.call(
			document.querySelectorAll(selector)
		);
	};

	var getFocusables = function() {
		var focusables = getNodeArray(
			'*[tabindex]:not(*[tabindex="0"])'
		);

		msort(focusables, 0, focusables.length);

		return focusables.concat(
			getNodeArray(
				'a[href],' +
				'area[href],' +
				'input:not(:disabled):not(*[type="hidden"]),' +
				'select:not(:disabled),' +
				'textarea:not(:disabled),' +
				'button:not(:disabled),' +
				'*[tabindex="0"]'
			)
		);
	};

	var inject = function(fn, callback) {
		var script = document.createElement('script');
		script.textContent = 'window.postMessage((' + fn + ')(),"*");';

		var listener = function(event) {
			window.removeEventListener('message', listener);
			callback(event.data);
		};

		window.addEventListener('message', listener);

		(document.head || document.documentElement).appendChild(script);
		script.parentNode.removeChild(script);
	};

	exports.autotype = function(data) {
		var focusables = getFocusables();
		var el = document.activeElement;

		var index = focusables.indexOf(el);
		var steps = data.text.split(/(\t|\n)/);

		steps.forEach(function(step) {
			switch (step) {
				case '\t':
					el = focusables[++index];
					el.focus();
					return;

				case '\n':
					var form = el.form;

					if (form) {
						var submitForm = function() {
							var submitEl = form.querySelector('input[type="submit"],input[type="image"]');

							if (submitEl) {
								// If the form contains a submit button or image, we want to use
								// that to submit the form, as it may have onclick listeners.
								submitEl.click();
							}
							else {
								// For forms without a submit element, we submit the form directly.
								// Normally one would simply call el.form.submit(), however in
								// the event that the form contains an element named "submit"
								// the submit function will be overshadowed - so we "borrow" the
								// submit function from a pristine form element instead.
								document.createElement('form').submit.call(form);
							}
						};

						// Get the onsubmit attribute, if the form has one
						var onsubmit = form.getAttribute('onsubmit');

						if (onsubmit) {
							// Execute onsubmit handler, then the default form submit if successful
							inject(
								new Function(onsubmit),
								function(result) {
									if (result !== false) {
										submitForm();
									}
								}
							);
						}
						else {
							submitForm();
						}
					}

					return;

				default:
					el.value = el.value + step;
					return;
			}
		});
	};
})();

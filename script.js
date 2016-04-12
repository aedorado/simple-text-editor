var notepad = document.getElementById('notepad');
var isfocus = false;
var focusOn;
var caretPos;

$(document).keydown(function(e) {
	// console.log(e.keyCode);
	
	getPositionDetails = function() {
		// Get the current cusor position
		var range = window.getSelection().getRangeAt(0)
		// Create a new range to deal with text before the cursor
		var pre_range = document.createRange();
		// Have this range select the entire contents of the editable div
		pre_range.selectNodeContents(focusOn);
		// Set the end point of this range to the start point of the cursor
		pre_range.setEnd(range.startContainer, range.startOffset);
		// Fetch the contents of this range (text before the cursor)
		var this_text = pre_range.cloneContents();
		// If the text's length is 0, we're at the start of the div.
		at_start = this_text.textContent.length === 0;
		// Rinse and repeat for text after the cursor to determine if we're at the end.
		var post_range = document.createRange();
		post_range.selectNodeContents(focusOn);
		post_range.setStart(range.endContainer, range.endOffset);
		var next_text = post_range.cloneContents();
		at_end = next_text.textContent.length === 0;
		// console.log(at_start, at_end);
	}

	placeCaretAtEnd = function(el) {
	    // if (typeof window.getSelection != "undefined"
	            // && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
	    el.focus();
	    // } 
	    // else if (typeof document.body.createTextRange != "undefined") {
	    //     var textRange = document.body.createTextRange();
	    //     textRange.moveToElementText(el);
	    //     textRange.collapse(false);
	    //     textRange.select();
	    // }
	}

	extractContentsFromCaret = function() {
	    var sel = window.getSelection();
	    if (sel.rangeCount) {
	        var selRange = sel.getRangeAt(0);
	        var blockEl = selRange.endContainer.parentNode;
	        if (blockEl) {
	            var range = selRange.cloneRange();
	            range.selectNodeContents(blockEl);
	            range.setStart(selRange.endContainer, selRange.endOffset);
	            return range.extractContents();
	        }
	    }
	}

	if (focusOn) {	
		if (e.keyCode == 13) {	// code for enter key
			e.preventDefault();
			var text = (extractContentsFromCaret().textContent);
			
			if (text.charAt(0) == ' ') {
				text = text.substring(1);
			}

			$('.added-last').removeClass('added-last');	
			// $('#notepad').append('<p class="notepad-paragraph added-last" contenteditable="true"></p>');
			$('<p class="notepad-paragraph added-last" contenteditable="true"></p>').insertAfter(focusOn);
			// $('.added-last').html(extractContentsFromCaret().textContent);
			$('.added-last').html(text);
			$('.added-last').on('focus', pfocus);
			$('.added-last').on('blur', pblur);
			$('.added-last').focus();
			// $('.added-last').text('');
		}

		getPositionDetails();
		if (at_start) {
			if (e.keyCode == 37) {	// LEFT key
				e.preventDefault();
				// console.log('change focus backwards');
				if (focusOn.previousSibling !== null) {
					focusOn = focusOn.previousSibling;
					placeCaretAtEnd(focusOn);
				}
			}

			if (e.keyCode == 8) { // BACKSPACE key
				e.preventDefault();
				focusOn = focusOn.previousSibling;
				focusOn.focus();	// bring focus to previous sibling

				var children = focusOn.childNodes;
				var textlast = children[children.length - 1];
				var position = textlast.textContent.length;
				console.log(position);

				focusOn.innerHTML += focusOn.nextSibling.innerHTML;	// append text
				notepad.removeChild(focusOn.nextSibling);
				// placeCaretAtEnd(focusOn);

				var range = document.createRange();
				range.setStart(textlast, position);
				range.setEnd(textlast, position);
				// console.log(range);

				var sel = window.getSelection();
				sel.removeAllRanges();
				sel.addRange(range);
				// console.log(position);
			}

		}

		if (at_end) {
			if (e.keyCode == 39) {	// RIGHT key
				// console.log('change focus forward');
				e.preventDefault();
				if (focusOn.nextSibling != null) {
					focusOn = focusOn.nextSibling;
					focusOn.focus();
				}
			}

			if (e.keyCode == 46) { // DELETE key
				e.preventDefault();
				
				var children = focusOn.childNodes;
				var textlast = children[children.length - 1];
				var position = textlast.textContent.length;
				console.log(position);

				focusOn.innerHTML += focusOn.nextSibling.innerHTML;
				notepad.removeChild(focusOn.nextSibling);

				var range = document.createRange();
				range.setStart(textlast, position);
				range.setEnd(textlast, position);
				// console.log(range);

				var sel = window.getSelection();
				sel.removeAllRanges();
				sel.addRange(range);
				// console.log(position);
			}

		}

	} else {
		console.log('NO FOCUS!');
	}
});

$('.added-last').on('focus', pfocus);
$('.added-last').on('blur', pblur);

function pfocus() {
	isfocus = true;
	focusOn = this;
}

function pblur() {
	isfocus = false;
	focusOn = undefined;
}

function caretPosition() {
    caretPos = (window.getSelection().getRangeAt(0).startOffset);
}

document.getElementById('checkEditable').addEventListener('click', function() { 
	var allParagraphs = document.querySelectorAll('p');
	if (this.checked) {
		for (var i = 0; i < allParagraphs.length; i++) {
			allParagraphs[i].setAttribute('contenteditable', true);
			allParagraphs[i].setAttribute('draggable', false);
		}
	} else {
		for (var i = 0; i < allParagraphs.length; i++) {
			allParagraphs[i].setAttribute('contenteditable', false);
			allParagraphs[i].setAttribute('draggable', true);
		}
	}
}, false);



/*

function setColor() {
    document.execCommand('styleWithCSS', false, true);
    document.execCommand('foreColor', false, "rgba(0,0,0,0.5)");
}

 */
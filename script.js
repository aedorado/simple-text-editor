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
	            return range.extractContents().textContent;
	        }
	    }
	}

	if (focusOn) {	
		if (e.keyCode == 13) {	// code for enter key
			e.preventDefault();
			var text = (extractContentsFromCaret());
			// var text = (extractContentsFromCaret().textContent);
			text = text.split('<').join('&lt;');
			text = text.split('>').join('&gt;');
			console.log(text);

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
			$('.added-last').on('dblclick', showTooltip);
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
$('.added-last').on('dblclick', showTooltip);

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

document.getElementById('check-editable').addEventListener('click', function() { 
	var allParagraphs = document.querySelectorAll('p');
	if (this.checked) {

		clearAllLinks();

		[].forEach.call(allParagraphs, function(para) {
			para.setAttribute('contenteditable', true);
			para.setAttribute('draggable', false);
		});
	} else {

		consolidateLinks();

		[].forEach.call(allParagraphs, function(para) {
			para.setAttribute('contenteditable', false);

			para.setAttribute('draggable', true);
  			para.addEventListener('dragstart', handleDragStart, false);
  			para.addEventListener('dragenter', handleDragEnter, false);
  			para.addEventListener('dragover', handleDragOver, false);
  			para.addEventListener('dragleave', handleDragLeave, false);
  			para.addEventListener('drop', handleDrop, false);
			para.addEventListener('dragend', handleDragEnd, false);
		});
	}
}, false);


var dragSrc = null;
function handleDragStart(e) {
	this.style.opacity = 0.4;
	dragSrc = this;
	console.log(dragSrc);
	e.dataTransfer.effectAllowed = 'move';
	e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragOver(e) {
	if (e.preventDefault) {
		e.preventDefault(); // Necessary. Allows us to drop.
	}
	e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.
	return false;
}

function handleDragEnter(e) {
	this.classList.add('over');
}

function handleDragLeave(e) {
	this.classList.remove('over');
}

function handleDrop(e) {
	// this / e.target is current target element.
	if (e.stopPropagation) {
		e.stopPropagation(); // stops the browser from redirecting.
	}

	// Don't do anything if dropping the same column we're dragging.
	if (dragSrc != this) {
		// Set the source column's HTML to the HTML of the column we dropped on.
		dragSrc.innerHTML = this.innerHTML;
		this.innerHTML = e.dataTransfer.getData('text/html');
	}

	return false;
}

function handleDragEnd(e) {
	// this/e.target is the source node.
	var allParagraphs = document.querySelectorAll('p');
	[].forEach.call(allParagraphs, function (para) {
		para.classList.remove('over');
		para.style.opacity = 1;
	});
}



var tooltip = document.getElementById('tooltip');
var selToChange = null;
function showTooltip(e) {
	tooltip.style.left = e.pageX;
	tooltip.style.top = e.pageY;
	tooltip.style.display = 'block';
	selToChange = window.getSelection();
	console.log(selToChange);
}

var tooltipOptions = document.querySelectorAll('.tooltip-option');
[].forEach.call(tooltipOptions, function(option) {
	option.addEventListener('click', function(e) {
		// e.preventDefault();
		console.log(selToChange);
		console.log(e.target.id);
		document.execCommand('bold');

		tooltip.style.display = 'none';
	}, false);
});



function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

/*

function setColor() {
    document.execCommand('styleWithCSS', false, true);
    document.execCommand('foreColor', false, "rgba(0,0,0,0.5)");
}

 */

var linksdiv = document.getElementById('links');
function consolidateLinks() {
	var allParagraphs = document.querySelectorAll('p');
	var content = '';
	[].forEach.call(allParagraphs, function(para) {
		content += para.innerHTML;
	});

	var links = content.match(/&lt;a&gt;.*?&lt;\/a&gt;/g) || [];
	[].forEach.call(links, function(link) {
		link = link.replace(/&lt;a&gt;/g, '');
		link = link.replace(/&lt;\/a&gt;/g, '');

		var newdiv = document.createElement('div');
		var newlink = document.createElement('a');
		newlink.appendChild(document.createTextNode(link));
		newdiv.appendChild(newlink);
		linksdiv.appendChild(newdiv);
		// console.log(link);
	});
	// for (i = 0; i < content.length; i++) {
		// console.log(content.charAt(i));
	// }

}

function clearAllLinks() {
	while (linksdiv.firstChild) {
	    linksdiv.removeChild(linksdiv.firstChild);
	}
}
var notepad = document.getElementById('notepad');
var isfocus = false;	// tells is there is focus on any of the paragraphs or not
var focusOn;
var caretPos;

document.getElementsByClassName('added-last')[0].addEventListener('focus', pfocus, false);
document.getElementsByClassName('added-last')[0].addEventListener('blur', pblur, false);
document.getElementsByClassName('added-last')[0].addEventListener('dblclick', showTooltip, false);

function pfocus() {
	isfocus = true;
	focusOn = this;	// save the element with focus
}

function pblur() {
	isfocus = false;
	focusOn = undefined;
}

document.addEventListener('keydown', function(e) {

	placeCaretAtEnd = function(el) {	// places the caret at the end to element el
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
	    el.focus();
	}

	// extracts content from the start of the caret till the end of the 
	extractContentsFromCaret = function() {
	    var sel = window.getSelection();
	    if (sel.rangeCount) {
	        var selRange = sel.getRangeAt(0);
	        var blockEl = selRange.endContainer.parentNode;
	        if (blockEl.tagName !== 'P') {		// this is the case when some style has been applied to the selection thus the
	        	blockEl = blockEl.nextSibling;	// 
	        }
	        if (blockEl) {
	        	var range = selRange.cloneRange();
	        	range.selectNodeContents(blockEl);
	        	range.setStart(selRange.endContainer, selRange.endOffset);
	        	return range.extractContents();
	        	// return range.extractContents().textContent;
	        }
	    }
	}

	// insert newNode after node
	insertAfter = function(newNode, node) {
    	node.parentNode.insertBefore(newNode, node.nextSibling);
	}

	// fucntion determines whether or not we are at the start or end of the current paragraph
	getPositionDetails = function() {
		var range = window.getSelection().getRangeAt(0);	// get the current cusor position
		var preRange = document.createRange();	// create a new range to deal with text before the caret
		preRange.selectNodeContents(focusOn);	// have this range select the entire contents of the editable div
		preRange.setEnd(range.startContainer, range.startOffset);	// set the end point of this range to the start point of the caret
		var this_text = preRange.cloneContents();	// fetch the contents of this range (text before the caret)
		at_start = this_text.textContent.length === 0;	// if the text's length is 0, we're at the start of the div.
		var postRange = document.createRange();	// repeat for text after the caret to determine if we're at the end.
		postRange.selectNodeContents(focusOn);
		postRange.setStart(range.endContainer, range.endOffset);
		var next_text = postRange.cloneContents();
		at_end = next_text.textContent.length === 0;
	}

	if (focusOn) {	
		if (e.keyCode == 13) {	// code for enter key
			e.preventDefault();
			var frag = (extractContentsFromCaret());

			if (frag.textContent.charAt(0) == ' ') {
				frag.textContent = frag.textContent.substring(1);
			}

			document.getElementsByClassName('added-last')[0].classList.remove('added-last');	
			var newp = document.createElement('p');
			newp.classList.add('notepad-paragraph');
			newp.classList.add('added-last');
			newp.setAttribute('contenteditable', 'true');
			insertAfter(newp, focusOn);
			document.getElementsByClassName('added-last')[0].appendChild(frag);
			newp.addEventListener('focus', pfocus, false);
			newp.addEventListener('blur', pblur, false);
			newp.addEventListener('dblclick', showTooltip, false);

			// add draggable eventListeners
			newp.addEventListener('dragstart', handleDragStart, false);
  			newp.addEventListener('dragenter', handleDragEnter, false);
  			newp.addEventListener('dragover', handleDragOver, false);
  			newp.addEventListener('dragleave', handleDragLeave, false);
  			newp.addEventListener('drop', handleDrop, false);
			newp.addEventListener('dragend', handleDragEnd, false);

			newp.focus();
		}

		getPositionDetails();	// check if caret is at start or end of the focusOn paragraph
		if (at_start) {			// if @ start
			if (e.keyCode == 37 || e.keyCode == 38) {	// LEFT key
				// console.log('change focus backwards');
				e.preventDefault();
				if (focusOn.previousSibling !== null) {
					focusOn = focusOn.previousSibling;	// change focus to the end of the previous paragraph
					placeCaretAtEnd(focusOn);
				}
			}

			// code to merge the bottom paragraph with the paragraph above
			if (e.keyCode == 8) { // BACKSPACE key
				e.preventDefault();
				focusOn = focusOn.previousSibling;
				focusOn.focus();	// bring focus to previous sibling

				var children = focusOn.childNodes;
				var textlast = children[children.length - 1];
				var position = textlast.textContent.length;

				focusOn.innerHTML += focusOn.nextSibling.innerHTML;	// append text
				notepad.removeChild(focusOn.nextSibling);

				var range = document.createRange();
				range.setStart(textlast, position);
				range.setEnd(textlast, position);

				var sel = window.getSelection();
				sel.removeAllRanges();
				sel.addRange(range);
			}

		}

		if (at_end) {
			if (e.keyCode == 39 || e.keyCode == 40) {	// RIGHT key
				// console.log('change focus forward');
				e.preventDefault();
				if (focusOn.nextSibling != null) {
					focusOn = focusOn.nextSibling;	// change focus to the end of the previous paragraph
					focusOn.focus();				// place caret at the start of the new focusOn paragraph
				}
			}

			if (e.keyCode == 46) { // DELETE key
				e.preventDefault();
				
				var children = focusOn.childNodes;
				var textlast = children[children.length - 1];
				var position = textlast.textContent.length;

				focusOn.innerHTML += focusOn.nextSibling.innerHTML;
				notepad.removeChild(focusOn.nextSibling);

				var range = document.createRange();
				range.setStart(textlast, position);
				range.setEnd(textlast, position);

				var sel = window.getSelection();
				sel.removeAllRanges();
				sel.addRange(range);
			}

		}

	}
}, false);

document.getElementById('check-editable').addEventListener('click', function() { 
	var allParagraphs = document.querySelectorAll('p');
	if (this.checked) {
		clearAllLinks();	// remove links from links div
		[].forEach.call(allParagraphs, function(para) {
			para.setAttribute('contenteditable', true);
			para.setAttribute('draggable', false);
		});
	} else {
		consolidateLinks();	// add links to linksdiv
		[].forEach.call(allParagraphs, function(para) {
			para.setAttribute('contenteditable', false);
			para.setAttribute('draggable', true);
		});
	}
}, false);


var dragSrc = null;
function handleDragStart(e) {
	this.style.opacity = 0.4;
	dragSrc = this;
	e.dataTransfer.effectAllowed = 'move';
	e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragOver(e) {
	if (e.preventDefault) {
		e.preventDefault(); // Necessary. Allows us to drop.
	}
	e.dataTransfer.dropEffect = 'move';  // Sse the section on the DataTransfer object.
	return false;
}

function handleDragEnter(e) {	// this/e.target is current target element.
	this.classList.add('over');
}

function handleDragLeave(e) {	// this/e.target is current target element.
	this.classList.remove('over');
}

function handleDrop(e) {	// this/e.target is current target element.
	if (e.stopPropagation) {
		e.stopPropagation(); // stops the browser from redirecting.
	}

	if (dragSrc != this) {	// don't do anything if dropping the same column we're dragging.
		// set the source column's HTML to the HTML of the column we dropped on.
		dragSrc.innerHTML = this.innerHTML;
		this.innerHTML = e.dataTransfer.getData('text/html');
	}

	return false;
}

function handleDragEnd(e) {
	// this/e.target is the source node.
	var allParagraphs = document.querySelectorAll('p');
	[].forEach.call(allParagraphs, function (para) {	// remove class over from all paragraphs
		para.classList.remove('over');
		para.style.opacity = 1;
	});
}


function showTooltip(e) {
	var tooltip = document.getElementById('tooltip');
	tooltip.style.left = e.pageX;		// set x coordinate
	tooltip.style.top = e.pageY;		// set y coordinate
	tooltip.style.display = 'block';	// display tooltip
	selToChange = window.getSelection();
}

var tooltipOptions = document.querySelectorAll('.tooltip-option');
[].forEach.call(tooltipOptions, function(option) {
	option.addEventListener('click', function(e) {	// addEventListener to all the tooltip options
		if (e.target.id === 'tooltip-bold') {
			document.execCommand('bold');
		} else if (e.target.id === 'tooltip-und') {
			document.execCommand('underline');
		} else if (e.target.id === 'tooltip-red') {
			//											textNode	SPAN OR P
			var parentNodeColor = window.getSelection().anchorNode.parentElement.style.color;
			if (parentNodeColor === '') {	// not already red
				document.execCommand('styleWithCSS', false, true);
				document.execCommand('foreColor', false, "rgb(255,0,0)");		// make it red
			} else {	// already red
				document.execCommand('styleWithCSS', false, true);				// remove red color
				document.execCommand('foreColor', false, "rgb(0,0,0)");					
			}
		}

		document.getElementById('tooltip').style.display = 'none';
	}, false);
});

// return all the text under the element el
function textUnder(el) {
	var n;
	var walk = document.createTreeWalker(el,NodeFilter.SHOW_TEXT, null, false);
	var text = [];
	while (n = walk.nextNode()) {
		text.push(n.textContent);
	}
	return text.join('');
}

// places all text of the form /<a>.*?<\/a>/ eg. <a>what is this</a> and places it in a dedicated links div
function consolidateLinks() {
	var linksdiv = document.getElementById('links');
	var allParagraphs = document.querySelectorAll('p');
	var content = '';
	// join the text of all the paragraphs
	[].forEach.call(allParagraphs, function(para) {
		content += textUnder(para);
	});

	var links = content.match(/<a>.*?<\/a>/g) || [];	// match with the pattern
	[].forEach.call(links, function(link) {		// foreach pattern found
		link = link.replace(/<a>/g, '');		// remove '<a>'
		link = link.replace(/<\/a>/g, '');		// remove '</a>'

		var newdiv = document.createElement('div');	// create div
		var newlink = document.createElement('a');	// create an anchor tag
		newlink.appendChild(document.createTextNode(link));	// append text in the anchor tag
		newdiv.appendChild(newlink);	// append anchor to new div
		linksdiv.appendChild(newdiv);	// append newdiv to linksdiv
	});
}

// function to remove all links from the linksdiv
function clearAllLinks() {
	var linksdiv = document.getElementById('links');
	while (linksdiv.firstChild) {
	    linksdiv.removeChild(linksdiv.firstChild);	// remove firstchild fo linksdiv
	}
}
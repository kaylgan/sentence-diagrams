//-------------------------------closures to avoid global variables-------------------------------
let getDraggable = (function() {
  let draggable = document.getElementById('draggable-1');
  return function() {
    return draggable;
  }
})();

let getInitX = (function(set = false, setValue = 0) {
  let initX = setValue;
  return function(setInner = set, setValueInner = setValue) {
    if (setInner === true) {
      initX = setValueInner;
    } else {
      return initX;
    }
  }
})();

let getInitY = (function(set = false, setValue = 0) {
  let initY = setValue;
  return function(setInner = set, setValueInner = setValue) {
    if (setInner === true) {
      initY = setValueInner;
    } else {
      return initY;
    }
  }
})();

let getCursorX = (function(set = false, setValue = 0) {
  let cursorX = setValue;
  return function(setInner = set, setValueInner = setValue) {
    if (setInner === true) {
      cursorX = setValueInner;
    } else {
      return cursorX;
    }
  }
})();

let getCursorY = (function(set = false, setValue = 0) {
  let cursorY = setValue;
  return function(setInner = set, setValueInner = setValue) {
    if (setInner === true) {
      cursorY = setValueInner;
    } else {
      return cursorY;
    }
  }
})();

let getMouseDown = (function(set = false, setValue = false) {
  let isMouseDown = false;
  return function(setInner = set, setValueInner = setValue) {
    if (setInner === true) {
      isMouseDown = setValueInner;
    } else {
      return isMouseDown;
    }
  }
})();

let getMouseOut = (function(set = false, setValue = false) {
  let isMouseOut = false;
  return function(setInner = set, setValueInner = setValue) {
    if (setInner === true) {
      isMouseOut = setValueInner;
    } else {
      return isMouseOut;
    }
  }
})();

let getEvent = (function(set = false, e = null) {
  let currentEvent = e;
  return function(setInner = set, eInner = e) {
    if (setInner === true) {
      currentEvent = eInner;
    } else {
      return currentEvent;
    }
  }
})();

let getElement = (function(set = false, elem = null) {
  let currentElement = elem;
  return function(setInner = set, elemInner = elem) {
    if (setInner === true) {
      currentElement = elemInner;
      currentElement.style.backgroundColor = 'red';
    } else {
      currentElement.style.backgroundColor = 'yellow';
      return currentElement;
    }
  }
})();


//-------------------------------event handlers for mouse press/movement-------------------------------
let mouseListener = (function() {
  let draggables = document.getElementsByClassName("draggable");
  for (let i = 0; i < draggables.length; i++) {
    draggables[i].addEventListener('click', function() {
      this.innerHTML = "clicked";
    }, false);

    draggables[i].addEventListener('mousedown', function(event) {
      // getElement(true, this); // to use with removeEventListener
      getElement(true, draggables[i]);
      getMouseDown(true, true); // isMouseDown = true
      getMouseOut(true, false); // isMouseOut = false;
      getEvent(true, event);
      event.preventDefault();

      // getInitX(true, this.offsetLeft); // initX = this.offsetLeft DOESN'T WORK WITH INLINE
    	// getInitY(true, this.offsetTop); // initY = this.offsetTop DOESN'T WORK WITH INLINE
      getInitX(true, 0); // initX = this.offsetLeft
    	getInitY(true, 0); // initY = this.offsetTop
      getCursorX(true, event.clientX); // cursorX = event.clientX
      getCursorY(true, event.clientY); // cursorY = event.clientY

    	this.addEventListener('mousemove', repositionElement, false);

      // repo passed in closure to include parameters: this.addEventListener('mouseout', function() { return repo(event, selectedElement); }, false);
      // removed because need non-anonymous for removeEventListener
      this.addEventListener('mouseout', repo, false);
      // this.addEventListener('mouseout', function repo() {
      //   getMouseOut(true, true); // isMouseOut = true;
      //   let currentEvent = getEvent();
      //   let selectedElement = getElement();
      //   // selectedElement.style.backgroundColor = 'orange';
      //
      //   window.addEventListener('mousemove', function winRepo() {
      //     if (getMouseDown() === true && getMouseOut() === true) {
      //       currentEvent.preventDefault();
      //       let e = window.event;
      //       selectedElement.style.left = getInitX() + e.clientX - getCursorX() + 'px';
      //       selectedElement.style.top = getInitY() + e.clientY - getCursorY() + 'px';
      //       // selectedElement.style.backgroundColor = 'green';
      //     }
      //   }, false);
      // }, false);

    	window.addEventListener('mouseup', function() {
        getMouseDown(true, false); // isMouseDown = false
        event.preventDefault();
    	  draggables[i].removeEventListener('mousemove', repositionElement, false);
        draggables[i].removeEventListener('mouseout', repo, false);

        getElement(true, null);
        draggables[i].style.backgroundColor = 'aqua';
    	}, false);

    }, false);
  }
})();

function repositionElement(event) {
  event.preventDefault();
  this.style.left = getInitX() + event.clientX - getCursorX() + 'px';
	this.style.top = getInitY() + event.clientY - getCursorY() + 'px';
}

// update object position if cursor accidentally goes outside element during move
function repo() {
  getMouseOut(true, true); // isMouseOut = true;
  let currentEvent = getEvent();
  let selectedElement = getElement();
  // selectedElement.style.backgroundColor = 'orange';

  window.addEventListener('mousemove', function() {
    if (getMouseDown() === true && getMouseOut()) {
      currentEvent.preventDefault();
      let e = window.event;
      selectedElement.style.left = getInitX() + e.clientX - getCursorX() + 'px';
      selectedElement.style.top = getInitY() + e.clientY - getCursorY() + 'px';
      // selectedElement.style.backgroundColor = 'green';
    }
  }, false);
}

// getDraggable().addEventListener('mousedown', function(event) {
//   getMouseDown(true, true); // isMouseDown = true
//   getMouseOut (true, false); // isMouseOut = false;
//   event.preventDefault();
//
//   // getInitX(true, this.offsetLeft); // initX = this.offsetLeft DOESN'T WORK WITH INLINE
// 	// getInitY(true, this.offsetTop); // initY = this.offsetTop DOESN'T WORK WITH INLINE
//   getInitX(true, 0); // initX = this.offsetLeft
// 	getInitY(true, 0); // initY = this.offsetTop
//   getCursorX(true, event.clientX); // cursorX = event.clientX
//   getCursorY(true, event.clientY); // cursorY = event.clientY
//
// 	this.addEventListener('mousemove', repositionElement, false);
//
// 	window.addEventListener('mouseup', function() {
//     getMouseDown(true, false); // isMouseDown = false
//     event.preventDefault();
// 	  getDraggable().removeEventListener('mousemove', repositionElement, false);
// 	}, false);
//
//   this.addEventListener('mouseout', function() {
//     getMouseOut(true, true); // isMouseOut = true;
//   }, false);
//
//   // update object position if cursor accidentally goes outside element during move
//   window.addEventListener('mousemove', function() {
//     if (getMouseDown() === true && getMouseOut() === true) {
//       event.preventDefault();
//       let e = window.event;
//       getDraggable().style.left = getInitX() + e.clientX - getCursorX() + 'px';
//     	getDraggable().style.top = getInitY() + e.clientY - getCursorY() + 'px';
//       getDraggable().style.backgroundColor = 'green';
//     }
//   }, false);
//
// }, false);

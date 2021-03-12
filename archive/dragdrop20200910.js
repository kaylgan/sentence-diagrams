//----------------------------------------WINDOW/ELEMENT CONFIGURATION FUNCTIONS----------------------------------------
// get initial viewport width for element arrangement
let initWinWidth = (function() {
  const maxWidth = 0.95*(window.innerWidth);
  document.getElementById("parent").style.width = maxWidth + "px";
  return function() { return maxWidth; }
})();

// get sibling element offsets for each draggable; for setting initial element position
let getOffset = (function(lookup = null, set = false, myMap = {}, addElmnt = null, addValues = []) {
  let offsetMap = {};
  let offset = 0;
  return function (lookupInner = lookup, setInner = set, mapInner = myMap, addElInner = null, addValInner = []) {
    if (setInner == true) { offsetMap = mapInner; }
    else if (lookupInner) { offset = offsetMap.get(lookupInner); }
    else if (addElInner) { offsetMap.set(addElInner, addValInner); }
    return offset;
  }
})();

// get all elements, add listeners to them
function configureElements() {
  let elements = document.getElementsByClassName("draggable");
  arrangeElements(elements);
  for (let i = 0; i < elements.length; i++) { dragElement(elements[i]); }
  slider();
  colorPickers();
  taButtons();
  buttons();
  selectMultiple();
}

// add event listeners for draggables, slider, buttons
configureElements();

// align elements to siblings (absolute positioning for drag/drop)
function arrangeElements(elmntArray) {
  let offset = 0;
  let offsetY = 0;
  let margin = 5; // space between words
  let marginY = 10; // space between lines
  let maxContentWidth = initWinWidth();

  let offsetMap = new Map();
  offsetMap.set(elmntArray[0], [0, 0]);

  // start at 1; don't need to reposition first element
  for (let i = 1; i < elmntArray.length; i++) {
    offset += elmntArray[i].previousElementSibling.getBoundingClientRect().width + margin;
    if ((offset + elmntArray[i].getBoundingClientRect().width + margin) >= maxContentWidth) {
      offset = 0;
      offsetY += elmntArray[0].getBoundingClientRect().height + marginY;
    }

    elmntArray[i].style.left = offset + 'px';
    elmntArray[i].style.top = offsetY + 'px';
    offsetMap.set(elmntArray[i], [offset, offsetY]);
  }

  getOffset(null, true, offsetMap); // save offsets
}

// align added elements to existing ones
function arrangeNewElements(newElements) {
  let compareElement = newElements[0]; // get last offset from map
  let lastDraggable = null;
  while (compareElement.previousElementSibling) {
    if (compareElement.previousElementSibling.classList.contains("draggable")) {
      lastDraggable = compareElement.previousElementSibling;
      break;
    }
    compareElement = compareElement.previousElementSibling;
  }

  if (!lastDraggable) {
    // window has been cleared
    arrangeElements(newElements);
  } else {
    // window hasn't been cleared
    let offset = getOffset(lastDraggable)[0];
    let offsetY = getOffset(lastDraggable)[1];
    let margin = 5; // space between words
    let marginY = 10; // space between lines
    let maxContentWidth = initWinWidth();

    // compute offset for first new element based on last draggable
    offset += lastDraggable.getBoundingClientRect().width + margin;
    if ((offset + lastDraggable.getBoundingClientRect().width + margin) >= maxContentWidth) {
      offset = 0;
      offsetY += lastDraggable.getBoundingClientRect().height + marginY;
    }

    newElements[0].style.left = offset + 'px';
    newElements[0].style.top = offsetY + 'px';
    getOffset(null, false, {}, newElements[0], [offset, offsetY]); // add to offset map

    // compute offsets for rest of new elements based on last sibling
    for (let i = 1; i < newElements.length; i++) {
      offset += newElements[i].previousElementSibling.getBoundingClientRect().width + margin;
      if ((offset + newElements[i].getBoundingClientRect().width + margin) >= maxContentWidth) {
        offset = 0;
        offsetY += elmntArray[0].getBoundingClientRect().height + marginY;
      }

      newElements[i].style.left = offset + 'px';
      newElements[i].style.top = offsetY + 'px';
      getOffset(null, false, {}, newElements[i], [offset, offsetY]); // add to offset map
    }
  }

  // make added elements draggable
  for (let i = 0; i < newElements.length; i++) {
    dragElement(newElements[i]);
  }
}

// set up slider for resizing elements
function slider() {
  let rangeslider = document.getElementById("lineSizeSlider");
  let rangeValue = document.getElementById("rangeValue");
  rangeslider.value = 260;
  rangeslider.oninput = function() {
    let currentElement = lastSelectedElement();
    let initialWidth = currentElement.getBoundingClientRect.width;
    let offset = 0;
    if (currentElement) {
      if (currentElement.classList.contains("addedLine") || currentElement.classList.contains("addedPlatform")) {
        currentElement.style.height = this.value + 'px';
      } else {
        currentElement.style.width = this.value + 'px';
      }
      rangeValue.innerHTML = this.value;
    }
  }
}

//----------------------------------------COLOR PICKER FUNCTIONS----------------------------------------
// add event listeners for color pickers
function colorPickers() {
  let textPickerHidden = document.getElementById("textColor");
  textPickerHidden.value = "black";
  textPickerHidden.addEventListener("input", updateOneText, false);
  textPickerHidden.addEventListener("change", function() { document.getElementById("colorText").classList.remove("pressed"); }, false);
  textPickerHidden.select(); // if browser doesn't use color well

  let linePickerHidden = document.getElementById("lineColor");
  linePickerHidden.value = "black";
  linePickerHidden.addEventListener("input", updateOneLine, false);
  linePickerHidden.addEventListener("change", function() { document.getElementById("colorLine").classList.remove("pressed"); }, false);
  linePickerHidden.select(); // if browser doesn't use color well
}

// get or set the line color
let currentLineColor = (function(color = "black", set = false) {
  let lineColor = "black";
  return function(color = "black", setInner = false) {
    if (setInner == true) { lineColor = color; }
    return lineColor;
  }
})();

// get or set the text color
let currentTextColor = (function(color = "black", set = false) {
  let txtColor = "black";
  return function(color = "black", setInner = false) {
    if (setInner == true) { txtColor = color; }
    return txtColor;
  }
})();

// change the text color for a single element
function updateOneText(event) {
  let currentElement = lastSelectedElement();
  if (currentElement) {
    currentElement.style.color = event.target.value;
    currentTextColor(event.target.value, true);
  }
}

// change the line color for a single element
function updateOneLine(event) {
  let currentElement = lastSelectedElement();
  if (currentElement) {
    currentElement.style.borderColor = event.target.value;
    currentElement.style.setProperty('--after-left', event.target.value);
    currentLineColor(event.target.value, true);
  }
}

//----------------------------------------BUTTON FUNCTIONS----------------------------------------
// remove all elements from diagram
function clearDraggables() {
  let elements = document.getElementsByClassName("draggable");
  while (elements.length > 0) {
    elements[0].parentNode.removeChild(elements[0]);
  }
}

// get text from text area
function taButtons() {
  let addButton = document.getElementById("addButton");
  let clearButton = document.getElementById("clearButton");
  let textArea = document.querySelector("textarea");
  textArea.value = "";

  clearButton.addEventListener("click", clearDraggables, false);

  addButton.addEventListener("click", function() {
    if (textArea.value) {
      let words = textArea.value.split(' ');

      let container = document.getElementById("parent");
      let elemArray = [];
      for (let i = 0; i < words.length; i++) {
        let element = document.createElement("span");
        element.innerHTML = words[i];
        element.classList.add("draggable");
        container.appendChild(element);
        elemArray.push(element);
      }
      arrangeNewElements(elemArray);
    } else {
      console.log("nothing to add");
    }
  }, false);
}

// remove pressed class from not-pressed buttons
function buttonHelper(item) {
  if (this != item) { document.getElementById(item).classList.remove("pressed"); }
}

// remove other styles from current element
function selectionStyleHelper(item) {
  let currentElement = lastSelectedElement();
  currentElement.classList.toggle(item);
  if (this != item) { currentElement.classList.remove(item); }
}

// set up buttons
function buttons() {
  let navItems = document.querySelectorAll("li p");
  let elements = document.getElementsByClassName("draggable");

  let buttonIds = ["verb", "object", "complement", "participle", "gerund"];
  let borderTypes = ["leftBorderLong", "leftBorder", "slantBorder", "roundBorder", "gerundBorder"];
  let alignIds = ["alignLeft", "alignCenter", "alignRight"];
  let alignSettings = ["lAlign", "cAlign", "rAlign"];

  for (let i=0; i < navItems.length; i++) {
    navItems[i].addEventListener('click', function() {
      let itemID = navItems[i].id;
      let currentElement = lastSelectedElement();

      //----------element MAY be selected or not----------
      function ttToggle() {
        let tooltips = document.getElementsByClassName("tooltiptext");

        if (navItems[i].classList.contains("pressed")) {
          for (let i = 0; i < navItems.length; i++) { navItems[i].classList.add("tooltip"); }
          for (let i = 0; i < tooltips.length; i++) { tooltips[i].hidden = false; }
        } else {
          for (let i = 0; i < navItems.length; i++) { navItems[i].classList.remove("tooltip"); }
          for (let i = 0; i < tooltips.length; i++) { tooltips[i].hidden = true; }
        }
      }

      if (!currentElement || itemID == "showTT" || itemID == "newLine" || itemID == "platform") {
        navItems[i].classList.toggle("pressed");
        let container = document.getElementById("parent");

        if (itemID == "showTT") {
          ttToggle();
        } else if (itemID == "newLine") {
          let line = document.createElement("div");
          line.classList.add("addedLine", "draggable");
          container.appendChild(line);
          setTimeout(function() { navItems[i].classList.remove("pressed"); }, 200);
          dragElement(line);
        } else if (itemID == "platform") {
          let platform = document.createElement("div");
          platform.classList.add("addedPlatform", "draggable");
          container.appendChild(platform);
          setTimeout(function() { navItems[i].classList.remove("pressed"); }, 200);
          dragElement(platform);
        }
      }

      //----------element MUST be selected----------
      if (currentElement && (itemID != "showTT") && (itemID != "newLine") && (itemID != "platform")) {
        // if needed, reset text from gerund
        let initialText = getInitialText();
        if (currentElement.innerHTML != initialText) {
          currentElement.innerHTML += "ing";
        }

        navItems[i].classList.toggle("pressed");
        document.getElementById("colorText").classList.remove("pressed");
        document.getElementById("colorLine").classList.remove("pressed");

        switch (itemID) {
          case ("alignLeft"):
            alignIds.forEach(buttonHelper, "alignLeft");
            alignSettings.forEach(selectionStyleHelper, "lAlign");
            break;
          case ("alignCenter"):
            alignIds.forEach(buttonHelper, "alignCenter");
            alignSettings.forEach(selectionStyleHelper, "cAlign");
            break;
          case ("alignRight"):
            alignIds.forEach(buttonHelper, "alignRight");
            alignSettings.forEach(selectionStyleHelper, "rAlign");
            break;
          case ("colorText"):
            navItems[i].classList.add("pressed");
            document.getElementById("textColor").click(); // click hidden color picker
            break;
          case ("allText"):
            navItems[i].classList.add("pressed");
            for (let i = 0; i < elements.length; i++) {
              elements[i].style.color = currentTextColor();
            }
            setTimeout(function() { navItems[i].classList.remove("pressed"); }, 200);
            break;
          case ("solidDashed"):
            if (currentElement.classList.contains("addedLine")) { currentElement.classList.toggle("dashedLeft"); }
            else { currentElement.classList.toggle("dashed"); }
            break;
          case ("colorLine"):
            navItems[i].classList.add("pressed");
            document.getElementById("lineColor").click(); // click hidden color picker
            break;
          case ("allLines"):
            navItems[i].classList.add("pressed");
            for (let i = 0; i < elements.length; i++) {
              elements[i].style.borderColor = currentLineColor();
              elements[i].style.setProperty('--after-left', currentLineColor());
            }
            setTimeout(function() { navItems[i].classList.remove("pressed"); }, 200);
            break;
          case ("verb"):
            buttonIds.forEach(buttonHelper, "verb");
            borderTypes.forEach(selectionStyleHelper, "leftBorderLong");
            break;
          case ("object"):
            buttonIds.forEach(buttonHelper, "object");
            if (currentElement.classList.contains("addedLine")) { currentElement.classList.toggle("leftBorderLine"); }
            else { borderTypes.forEach(selectionStyleHelper, "leftBorder"); }
            break;
          case ("complement"):
            buttonIds.forEach(buttonHelper, "complement");
            borderTypes.forEach(selectionStyleHelper, "slantBorder");
            break;
          case ("participle"):
            buttonIds.forEach(buttonHelper, "participle");
            borderTypes.forEach(selectionStyleHelper, "roundBorder");
            break;
          case ("gerund"):
            buttonIds.forEach(buttonHelper, "gerund");
            borderTypes.forEach(selectionStyleHelper, "gerundBorder");

            // only trim innerHTML if gerund button pressed, not unpressed
            if (currentElement.classList.contains("gerundBorder")) {
              let trimmed = currentElement.innerHTML.slice(0, -3);
              let ending = currentElement.innerHTML.slice(-3, currentElement.innerHTML.length+1);
              if (currentElement.innerHTML.length > 3 && ending == "ing") {
                currentElement.innerHTML = trimmed;
              }
            }
            break;
          default:
            // do nothing
        }
      } else {
        console.log("no element selected");
      }

    }, false);
  }
}

//----------------------------------------ELEMENT SELECT/DRAG FUNCTIONS----------------------------------------
// get location of element
function findPos(element) {
  let curleft = curtop = 0;
  let compareElement = element;
  let currentTag = element.tagName.toLowerCase();

  // if element is a blank line or platform, just compute parent offsetLeft
  if (currentTag != "div") {
    // compute parent offset
    if (compareElement.offsetParent) {
      do {
        curleft += compareElement.offsetLeft;
        curtop += compareElement.offsetTop;
      } while (compareElement = compareElement.offsetParent);
    }

    // subtract offset from element's siblings
    getOffset(element);
    curleft -= getOffset(element)[0];
    curtop -= getOffset(element)[1];
  } else {
    curleft += element.offsetParent.offsetLeft;
  }

  return { x: curleft, y: curtop };
}

// get the most recently dragged element
let lastSelectedElement = (function(set = false, setValue = null) {
  let currentElement = null;
  let navItems = document.getElementsByClassName("tooltip");

  return function(setInner = set, setValueInner = setValue) {
    if (setInner === true) {

      if (currentElement) {
        // if a new element is dragged, deselect the previous element
        currentElement.style.borderColor = currentLineColor();
        currentElement.style.setProperty('--after-left', currentLineColor());
      }

      if (setValueInner) {
        // update the currently selected element
        currentElement = setValueInner;
        getInitialText(true, currentElement.innerHTML);

        // if a new element is dragged, select it
        currentElement.style.borderColor = 'lightgreen';
        currentElement.style.setProperty('--after-left', 'lightgreen');

        // update pressed buttons to match new element's settings
        for (let i = 0; i < navItems.length; i++) {
          if (navItems[i].id != "showTT") { navItems[i].classList.remove("pressed"); } // unpress all element-associated buttons
        }

        let addedClasses = ["leftBorderLong", "leftBorder", "slantBorder", "roundBorder", "gerundBorder", "dashed", "lAlign", "cAlign", "rAlign"];
        let associatedButtons = ["verb", "object", "complement", "participle", "gerund", "solidDashed", "alignLeft", "alignCenter", "alignRight"];

        for (let i = 0; i < addedClasses.length; i++) {
          if (currentElement.classList.contains(addedClasses[i])) {
            document.getElementById(associatedButtons[i]).classList.add("pressed");
          }
        }
      } else {
        // if the window area is clicked, deselect the previous element
        if (currentElement) {
          currentElement.style.borderColor = currentLineColor();
          currentElement.style.setProperty('--after-left', currentLineColor());
        }

        for (let i = 0; i < navItems.length; i++) { navItems[i].classList.remove("pressed"); } // unpress all buttons
        currentElement = null;
      }

    } else {
      return currentElement; // if set is false, just return the last element selected
    }
  }
})();

// get initial element text so that gerund style doesn't alter it
let getInitialText = (function(set = false, setValue = '') {
  let initialText = '';
  return function(setInner = set, setValueInner = setValue) {
    if (setInner == true) { initialText = setValueInner; }
    return initialText;
  }
})();

// deselect all elements by double clicking window area
function deselectAll() {
  lastSelectedElement(true, null);
}

// move when user presses arrow keys
function arrowMovement() {
  let currentElement = lastSelectedElement();
  if (!currentElement) {
    console.log("no element selected.");
    return;
  }

  const key = event.key;
  switch (key) {
    case "ArrowLeft":
      event.preventDefault();
      currentElement.style.left = currentElement.offsetLeft - 1 + 'px';
      break;
    case "ArrowRight":
      event.preventDefault();
      currentElement.style.left = currentElement.offsetLeft + 1 + 'px';
      break;
    case "ArrowUp":
      event.preventDefault();
      currentElement.style.top = currentElement.offsetTop - 1 + 'px';
      break;
    case "ArrowDown":
      event.preventDefault();
      currentElement.style.top = currentElement.offsetTop + 1 + 'px';;
      break;
    default:
      console.log("not an arrow key");
  }
}

// apply event listeners for moving elements around
function dragElement(elmnt) {
  let elementX = 0, elementY = 0, cursorX = 0, cursorY = 0;

  let pos = findPos(elmnt); // get initial element position
  let currentRotation = 0; // inaccurate but suitable

  window.addEventListener('dblclick', deselectAll, false);
  elmnt.addEventListener('mousedown', dragMouseDown, false);
  elmnt.addEventListener('dblclick', rotate, false);
  document.body.addEventListener('keydown', arrowMovement, false);

  function dragMouseDown(e) {
    e.preventDefault();
    lastSelectedElement(true, elmnt); // set this element as the currently selected element

    elementX = e.clientX - pos.x;
    elementY = e.clientY - pos.y;

    // get new cursor position
    cursorX = e.clientX;
    cursorY = e.clientY;

    window.addEventListener('mouseup', closeDragElement, false);
    window.addEventListener('mousemove', elementDrag, false);
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();

    // update element position
    elmnt.style.left = elementX + e.clientX - cursorX + window.pageXOffset - 2 + 'px';
    elmnt.style.top = elementY + e.clientY - cursorY + window.pageYOffset - 7 + 'px';
  }

  // stop moving when mouse button is released
  function closeDragElement() {
    window.removeEventListener('mouseup', closeDragElement, false);
    window.removeEventListener('mousemove', elementDrag, false);
  }

  // rotate element 45 degrees when double clicked
  function rotate() {
    elmnt.style.transformOrigin = 'left';
    currentRotation += 45;
    if (currentRotation == 360) { currentRotation = 0; }
    if (currentRotation >= 135 && currentRotation < 270) { currentRotation = 270; }
    elmnt.style.transform = 'rotate(' + currentRotation + 'deg)';
  }
}

function dragMultiple2(elmnts) {
  let initialXOffsets = [];
  for (let i = 0; i < elmnts.length; i++) {
    initialXOffsets.push(elmnts[i].offsetLeft - elmnts[0].offsetLeft);
  }

  let initialYOffsets = [];
  for (let i = 0; i < elmnts.length; i++) {
    initialYOffsets.push(elmnts[i].offsetTop - elmnts[0].offsetTop);
  }

  elmnts[0].addEventListener('mousedown', dragMouseDownMult, false);

  function dragMouseDownMult(e) {
    window.addEventListener('mousemove', moveElements, false);
    window.addEventListener('dblclick', function() {
      window.removeEventListener('mousemove', moveElements, false);
      elmnts[0].removeEventListener('mousedown', dragMouseDownMult, false);
    }, true);
    let initialX = e.clientX;
    let initialY = e.clientY;

    function moveElements(e) {
      let newX = e.clientX;
      let newY = e.clientY;

      for (let i = 1; i < elmnts.length; i++) {
        elmnts[i].style.left = elmnts[0].offsetLeft + initialXOffsets[i] + 'px';
        elmnts[i].style.top = elmnts[0].offsetTop + initialYOffsets[i] + 'px';
        // if (initialX < newX) {
        //   // moving right
        //   elmnts[i].style.left = elmnts[0].offsetLeft + initialXOffsets[i] + 'px';
        //   elmnts[i].style.top = elmnts[0].offsetTop - initialYOffsets[i] + 'px';
        // } else {
        //   // moving left
        //   elmnts[i].style.left = elmnts[0].offsetLeft + initialXOffsets[i] + 'px';
        //   elmnts[i].style.top = elmnts[0].offsetTop - initialYOffsets[i] + 'px';
        // }

      }
    }
  }
}

// buggy, but less buggy than placeSelections
function dragMultiple(elmnts) {
  // oldRightB + newLeft - oldRight = newLeftB
  let oldRight = elmnts[0].getBoundingClientRect().right;
  let oldBottom = elmnts[0].getBoundingClientRect().bottom;

  let oldRights = [];
  let oldBottoms = [];
  for (let i = 0; i < elmnts.length; i++) {
    oldRights.push(elmnts[i].getBoundingClientRect().right);
    oldBottoms.push(elmnts[i].getBoundingClientRect().bottom);
  }

  elmnts[0].addEventListener('mousedown', dragMouseDownMult, false);

  function dragMouseDownMult() {
    let correctionFactorX = parseFloat(window.getComputedStyle(document.body).getPropertyValue('margin-left'));
    correctionFactorX += parseFloat(window.getComputedStyle(document.getElementById("parent")).getPropertyValue('margin-left'));
    let correctionFactorY = parseFloat(window.getComputedStyle(document.body).getPropertyValue('margin-top'));
    correctionFactorY += 3; // border width

    window.addEventListener('mousemove', moveElements, false);
    window.addEventListener('dblclick', function() {
      window.removeEventListener('mousemove', moveElements, false);
      elmnts[0].removeEventListener('mousedown', dragMouseDownMult, false);
    }, true);

    function moveElements() {
      console.log("in moveElements");
      let newLeft = elmnts[0].getBoundingClientRect().left;
      let newTop = elmnts[0].getBoundingClientRect().top;
      let wordSpace = 5;
      let xMovement = newLeft - oldRight;
      let yMovement = newTop - oldBottom;
      let widthDifference = elmnts[1].getBoundingClientRect().width - elmnts[0].getBoundingClientRect().width;
      let narrowerWidth = Math.min(elmnts[1].getBoundingClientRect().width, elmnts[0].getBoundingClientRect().width);

      if (elmnts[1].getBoundingClientRect().width >= elmnts[0].getBoundingClientRect().width) {
        elmnts[1].style.left = oldRights[1] + xMovement - widthDifference - narrowerWidth + 'px';
        elmnts[1].style.top = oldBottoms[1] + yMovement - elmnts[1].getBoundingClientRect().height + correctionFactorY + 'px';

        for (let i = 2; i < elmnts.length; i++) {
          elmnts[i].style.left = oldRights[i] + xMovement - elmnts[i].getBoundingClientRect().width + 'px';
          elmnts[i].style.top = oldBottoms[i] + yMovement - elmnts[i].getBoundingClientRect().height + correctionFactorY + 'px';
        }
      } else {
        for (let i = 1; i < elmnts.length; i++) {
          elmnts[i].style.left = oldRights[i] + xMovement - widthDifference - elmnts[i].getBoundingClientRect().width + 'px';
          elmnts[i].style.top = oldBottoms[i] + yMovement - elmnts[i].getBoundingClientRect().height + correctionFactorY + 'px';
        }
      }
    }

  }
}

// buggy
function placeSelections() {
  let parent = document.getElementById("parent");
  let selection = document.getElementById("selectionRectangle");
  let selRect = document.getElementById("selectionRectangle").getBoundingClientRect();
  console.log("placeSel coords: " + selRect.x + "," + selRect.y);

  let elmnts = selection.childNodes;

  for (let i = 0; i < elmnts.length; i+=2) {
    elmnts[i].style.left = elmnts[i].getBoundingClientRect().left + selRect.left + 'px';
    elmnts[i].style.top = elmnts[i].getBoundingClientRect().top + selRect.top + 'px';
    parent.appendChild(elmnts[i]);
  }

  for (let i = 1; i < elmnts.length; i+=2) {
    elmnts[i].style.left = elmnts[i].getBoundingClientRect().left + selRect.left - elmnts[i].getBoundingClientRect().width - (elmnts[i].getBoundingClientRect().width - elmnts[i-1].getBoundingClientRect().width) + 'px';
    elmnts[i].style.top = elmnts[i].getBoundingClientRect().top + selRect.top + 'px';
    parent.appendChild(elmnts[i]);
  }
}

// select multiple elements to be dragged in selection rectangle
function selectMultiple() {
  let selection = document.getElementById("selectionRectangle");
  let x1 = 0, y1 = 0, x2 = 0, y2 = 0;
  let selectedElements = [];
  let updatedCoords = false;

  // draw rectangle under cursor position rather than to the right of it
  let correctionFactorX = parseFloat(window.getComputedStyle(document.body).getPropertyValue('margin-left'));
  correctionFactorX += parseFloat(window.getComputedStyle(document.getElementById("parent")).getPropertyValue('margin-left'));
  let correctionFactorY = parseFloat(window.getComputedStyle(document.body).getPropertyValue('margin-top'));

  window.addEventListener('mousedown', startRect, true); // allow events to bubble up so multiple elements can be dragged right away

  window.addEventListener('dblclick', function() {
    x1 = 0, y1 = 0, x2 = 0, y2 = 0;
    closeDrag();
    selectedElements = [];
    selection.hidden = true;
    deselectAll();
  }, true);

  function resizeRect() {
    selection.style.left = Math.min(x1, x2) - correctionFactorX + 'px';
    selection.style.top = Math.min(y1, y2) - correctionFactorY + 'px';
    selection.style.width = Math.max(x1, x2) - Math.min(x1, x2) + 'px';
    selection.style.height = Math.max(y1, y2) - Math.min(y1, y2) + 'px';
  }

  // get initial cursor position and resize selection rectangle
  function startRect(e) {
    // check if an element is selected. if so, don't make selection rectangle
    if (lastSelectedElement() && selectedElements.length == 0) {
      console.log("dragging one element");
      closeDrag();
      return;
    } else if (selectedElements.length > 0) {
        selection.hidden = true;
        dragMultiple2(selectedElements);
        // dragMultiple(selectedElements);

        // for (let i = 0; i < selectedElements.length; i++) {
        //   selection.appendChild(selectedElements[i]);
        // }
        // dragElement(selection);
        // let selRect = selection.getBoundingClientRect();
        // console.log("start coords: " + selRect.x + "," + selRect.y);

        // window.addEventListener('dblclick', placeSelections, true);
    } else if (!lastSelectedElement() && selectedElements.length == 0) {
      console.log("no element selected. starting drag.");
      x1 = e.clientX;
      y1 = e.clientY;
      resizeRect();
      // selection.hidden = false;

      window.addEventListener('mousemove', endRect, false);
      window.addEventListener('mouseup', closeDrag, false);
    } else {
      console.log("error");
    }
  }
  // get new cursor position and resize selection rectangle
  function endRect(e) {
    if (lastSelectedElement() && (selectedElements.length == 0)) { return; }

    selection.hidden = false;
    x2 = e.clientX;
    y2 = e.clientY;
    resizeRect();

    // get all elements within the rectangle
    selectedElements = [];
    let draggables = document.getElementsByClassName("draggable");
    for (let i = 0; i < draggables.length; i++) {
      let rect1 = selection.getBoundingClientRect();
      let rect2 = draggables[i].getBoundingClientRect();
      let overlap = !(rect1.right < rect2.left || rect1.left > rect2.right || rect1.bottom < rect2.top || rect1.top > rect2.bottom);
      if (overlap) { selectedElements.push(draggables[i]); }
      else { console.log("no overlap"); }
    }

    if (selectedElements.length > 0) { lastSelectedElement(true, selectedElements[0]); }
  }

  // hide rectangle and remove event listeners
  function closeDrag() {
    window.removeEventListener('mousemove', endRect, false);
    window.removeEventListener('mouseup', closeDrag, false);
  }
}

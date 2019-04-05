// -----------------------
// insert firebase config below
const config = {
}
// initialize firebase app with config provided above
firebase.initializeApp(config);
// -----------------------
// rsvp collections
const rsvpRef = firebase.database().ref('rsvps');
// -----------------------
// start: helper functions
let templateRow, content;
function removeLast() {
  const children = content.children || [],
    index = (children.length || 0) - 1;
  if (children.length > 0) {
    children[index].classList.remove('last');
  }
}
function setLast() {
  const children = content.children || [],
    index = (children.length || 0) - 1;
  if (children.length > 0) {
    children[index].classList.add('last');
    // traverse and select the target
    let target = children[index];
    const idSerialized = target.querySelectorAll('input[type="hidden"]');
    const nameSerialized = target.querySelectorAll('input[type="text"]');
    const attendanceSerialized = target.querySelector('.attendance').querySelectorAll('input');
    const mealOptionSerialized = target.querySelector('.mealOptions').querySelectorAll('input');
    [...idSerialized].forEach(item => {
      item.setAttribute('name', `id${index + 1}`);
      item.setAttribute('value', Date.now());
    });
    [...nameSerialized].forEach(item => {
      item.setAttribute('name', `fullName${index + 1}`);
    });
    [...attendanceSerialized].forEach(item => {
      item.setAttribute('name', `attendance${index + 1}`);
    });
    [...mealOptionSerialized].forEach(item => {
      item.setAttribute('name', `mealChoice${index + 1}`);
    });
  }
}
// +
function add() {
  removeLast();
  const element = document.createElement('div');
  element.innerHTML = templateRow;
  element.classList.add('inputRow');
  if (content.children.length === 0) {
    element.classList.add('first');
  }
  content.appendChild(element);
  setLast();
}
// -
function retract(element) {
  const parent = element.parentNode.parentNode.parentNode;
  content.removeChild(parent);
  setLast();
}
// +/- logic:
// if guest is attending, avail the options to choose menu
// only show +/- if guest is attending. if not, hide it
function attending(element, value) {
  // console.log(element, value);
  const mealOptions = element.parentNode.parentNode.nextElementSibling;
  if (value > 0) {
    mealOptions.style.display = 'block';
  } else {
    mealOptions.style.display = 'none';
    // reset mealChoice or mealChoices to false
    const mealChoices = mealOptions.querySelectorAll('input[type="radio"]');
    mealChoices.forEach(mealChoice => {
      mealChoice.checked = false;
    });
  }
}
function checkValue(element) {
  if (element.value) {
    const form = document.getElementById('rsvpForm');
    form.querySelector('input[type="submit"]').removeAttribute('disabled');
  }
}
function startOver() {
  // display success message
  document.querySelector('.message').innerHTML = 'Your RSVP has been submitted!';
  // reset form
  document.getElementById('rsvpForm').reset();
  // remove form elements
  document.getElementById('guests').innerHTML = '';
  // disable form submission
  document.querySelector('input[type="submit"').disabled = true;
  // reinitialize form from beginning state
  add();
  // remove success message
  setTimeout(function () {
    document.querySelector('.message').innerHTML = '';
  }, 3000);
}
// end: helper functions
// ---------------------
// submitForm()
function submitForm(event) {
  event.preventDefault();
  // capture fields
  const guests = document.getElementById('guests');
  const elements = guests.querySelectorAll('input');
  const entries = [...elements];
  // check for valid elements
  const isValidElement = element => {
    return element.name && element.value;
  };
  const isValidValue = element => {
    return (!['radio'].includes(element.type) || element.checked);
  };
  const formToJSON = elements =>
    [].reduce.call(elements, (data, element) => {
      if (isValidElement(element) && isValidValue(element)) {
        data[element.name] = element.value;
      }
      return data;
    }, {});
  const singleJSONObj = formToJSON(entries);
  let response = Object.entries(singleJSONObj).reduce((object, [key, value]) => {
    let [name, number] = key.match(/\D+|\d+$/g);
    object[number] = { ...(object[number] || {}), [name]: value }
    return object;
  }, {});
  const dataToSubmit = Object.values(response);
  // firebase entry
  const newRSVPRef = rsvpRef.push();
  newRSVPRef.set(dataToSubmit);
  // for testing!
  // console.log(JSON.stringify(dataToSubmit));
  // ---------------------
  startOver();
}
//  addEventListener: submitForm
const form = document.getElementById('rsvpForm');
form.addEventListener('submit', submitForm);
// page load
window.addEventListener('load', function () {
  templateRow = document.getElementById('rowTemplate').innerHTML;
  content = document.getElementById('guests');
  add();
});
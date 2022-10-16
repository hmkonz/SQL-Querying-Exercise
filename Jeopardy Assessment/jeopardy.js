// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]
let categories = [];
let catId = [];
let catData = {};
const htmlBoard = document.querySelector("#jeopardy");
const tHead = document.querySelector("thead");
const tBody = document.querySelector("tbody");
const button = document.querySelector("#start");
const spinnerDiv = document.getElementById("spin-container");
const spinner = document.createElement("i");

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
  catId = [];
  const response1 = await axios.get(
    "http://jservice.io/api/categories?count=50"
  );

  for (let i = 0; i < response1.data.length; i++) {
    let randomCats = _.sample(response1.data);
    if (randomCats.clues_count >= 10) {
      if (!catId.includes(randomCats.id) && catId.length !== 6) {
        catId.push(randomCats.id);
      }
    }
  }
  return catId;
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
  categories = [];
  for (let i = 0; i < catId.length; i++) {
    let clue_array = [];
    let response2 = await axios.get(
      `http://jservice.io/api/category?id=${catId[i]}`
    );
    let title = response2.data.title;

    for (let j = 0; j < response2.data.clues.length; j++) {
      let randomClues = _.sample(response2.data.clues);
      let clues = {
        question: randomClues.question,
        answer: randomClues.answer,
        showing: null,
      };
      if (!clue_array.includes(clues) && clue_array.length !== 5) {
        clue_array.push(clues);
      }
    }
    catData = { title, clue_array };
    categories.push(catData);
  }
  return categories;
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

function fillTable() {
  tHead.innerHTML = "";
  tBody.innerHTML = "";
  // create HTML tablen- top row and cells

  //select table from html with id of "jeopardy"
  // const htmlBoard = document.querySelector("#jeopardy");
  // create row element 'tr' and set equal to 'topRow' for the top row
  const topRow = document.createElement("tr");
  // set class of topRow (top row element) to "top-row" for styling
  topRow.setAttribute("id", "top-row");
  // 'for' loop creates '$topCell' (table data cells 'td') of the top row 'topRow' by iterating 6 times (width of the board). Each iteration creates the 'td', sets its id equal to 'x' (from the 'for' loop), sets its text content to the category 'title' from the iterated over object in the array 'categories' and appends it to the top row ('$topRow'). Result is 6 'topCell' ('td's) in the top row, each with the text content of one of the 6 titles in the 'categories' array
  for (let x = 0; x < categories.length; x++) {
    // create table data cell element 'td' and set it equal to topCell for each of the 6 cells in the top row of the table
    const topCell = document.createElement("td");
    // set id of 'topCell' element to the value of x when it's iterating
    topCell.setAttribute("id", x);
    // for each iteration of the 6 objects in array 'categories', set the inner text of topCell to the object property 'title'
    topCell.innerText = categories[x].title;

    topRow.append(topCell);
  }

  tHead.append(topRow);
  // appends the top row ('topRow') to the gameboard (htmlBoard)
  htmlBoard.append(tHead);

  // create HTML table - body rows and cells

  // The outer 'for' loop creates the rows of the gameboard by iterating 5 times which is the height of the board. Each iteration creates a new row element 'tr' called 'row'. With every iteration, each row is appended to the gameboard ('htmlBoard').

  // The inner loop creates the columns (the table cells ('td') of each row) by iterating 6 times, which is the width of the board. Each 'cell' is then assigned an id that equals the index of y,x. Each "cell" is then appended to the row created in the outer loop.

  // Result is a board 'htmlBoard' with 5 rows and 6 columns
  let count = 200;
  for (let y = 0; y < 5; y++) {
    // create row element 'tr' and set it equal to bodyRow for the rows in the body of the table
    const bodyRow = document.createElement("tr");
    // loop creates each of the 5 rows of the table
    for (let x = 0; x < 6; x++) {
      // create table data cell element 'td' and set equal to bodyCell for each of the 5 rows in the body of the table
      const bodyCell = document.createElement("td");
      bodyCell.setAttribute("id", `${y}-${x}`);
      // for each iteration, set the inner text of each bodyCell to "?"
      bodyCell.innerText = `$${count}`;

      bodyRow.append(bodyCell);
    }

    count += 100;
    tBody.append(bodyRow);
    htmlBoard.append(tBody);

    bodyRow.addEventListener("click", handleClick);
  }
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
  // get x/y coordingates from id of clicked cell
  const cellId = evt.target.id;
  const x = cellId[2];
  const y = cellId[0];
  const cell = document.getElementById(`${y}-${x}`);

  if (categories[x].clue_array[y].showing == null) {
    cell.innerText = `${categories[x].clue_array[y].question}`;
    categories[x].clue_array[y].showing = "question";
  } else if (categories[x].clue_array[y].showing == "question") {
    cell.innerText = `${categories[x].clue_array[y].answer}`;
    categories[x].clue_array[y].showing = "answer";
  } else if (categories[x].clue_array[y].showing == "answer") {
    document.getElementById(`${y}-${x}`).style.pointerEvents = "none";
  }
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
  // assign class to 'spinner' because the contents of the div containing <i> ('spinnerDiv') was set to an empty string on page load
  spinner.setAttribute("class", "fa fa-spin fa-spinner");
  // select <body> element
  const body = document.querySelector("body");
  // append the spinner element <i> to div 'spinnnerDiv'
  spinnerDiv.append(spinner);
  // append div to its parent element (body)
  body.append(spinnerDiv);
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
  // select the div with an id of 'spin-container' that includes <i>, spinner element
  const spinContainer = document.querySelector("#spin-container");
  // assign class to 'spinContainer' so can set its display to 'none' in CSS
  spinContainer.className = "spin-container-hidden";
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
  let catId = await getCategoryIds();
  await getCategory(catId);
  hideLoadingView();
  fillTable();
}

/** On click of start / restart button, set up game. */
/** On page load, add event handler for clicking clues */

button.addEventListener("click", function () {
  showLoadingView();
  setupAndStart();
  button.innerText = "Restart Game";
});

window.addEventListener("load", function (event) {
  button.innerText = "Start Game!";
  spinnerDiv.innerHTML = "";
});

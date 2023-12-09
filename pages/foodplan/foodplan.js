import { API_URL } from "./../../settings.js";
import {
  handleHttpErrors,
  makeOptions,
  sanitizeStringWithTableRows,
  sanitizer,
} from "./../../utility.js";
import { selectedCards } from "../offers/offers.js";

const URL = API_URL + "/recipes";
export async function initFoodplan() {
  fetchRecipe(selectedCards);
  showSpinner();
}

async function fetchRecipe(selectedCards) {
  document.querySelector("#temptext").innerHTML =
    "Vent et øjeblik mens vi laver din opskrift!";
  document.querySelector(".recipe-container").innerHTML = "";
  document.querySelector("#recipe-modal-head").innerHTML = "";
  document.querySelector("#input-field-recipe").value = "";
  const saveButtonRecipe = document.querySelector("#save-button-recipe");
  const ingredients = selectedCardsToIngredients(selectedCards);
  const data = await fetch(URL, makeOptions("POST", ingredients, true)).then(
    (r) => handleHttpErrors(r)
  );

  hideSpinner();

  document.querySelector("#temptext").innerHTML = "Her er din nye opskrift!";
  document.querySelector(".recipe-container").innerHTML = sanitizer(
    data.answer
  );
  document.querySelector("#recipe-modal-head").innerHTML =
    "<h5>" + document.querySelector("#recipe-heading").innerHTML + "</h5>";
  var divChecker = document.querySelector(".recipe-container");
  var containsH3 = divChecker.querySelector("h3") !== null;
  if (containsH3) {
    saveButtonRecipe.style.display = "block";
  }
  document.querySelector("#input-field-recipe").value =
    document.querySelector("#recipe-heading").innerHTML;

  const recipeRequest = {
    recipeTitle: document.querySelector("#input-field-recipe").value,
    recipeBody: data.answer,
    offers: selectedCards,
  };
  document
    .querySelector("#save-recipe-db")
    .addEventListener("click", () => saveRecipe(recipeRequest));
}
function showSpinner() {
  var spinner = document.getElementById("spinner");
  spinner.style.display = "block";
}

function hideSpinner() {
  var spinner = document.getElementById("spinner");
  spinner.style.display = "none";
}
function selectedCardsToIngredients(selectedCards) {
  const ingredients = selectedCards.map((card) => card.description);
  return ingredients;
}
async function saveRecipe(recipeRequest) {
  document.querySelector("#inside-close").click();
  try {
    await fetch(URL + "/save-recipe", makeOptions("POST", recipeRequest, true)).then(
      (r) => handleHttpErrors(r)
    );
  } catch (error) {
    console.log(error);
  }
  router.navigate("/");
}

import { API_URL } from "../../settings.js";
import { handleHttpErrors, makeOptions, sanitizer } from "../../utility.js";
import { selectedOffers } from "../recipes-overview/recipes-overview.js";
const URL = API_URL + "/recipes";

export async function initCreateRecipe() {
  fetchRecipeAdmin(selectedOffers);
  showSpinner();
}

async function fetchRecipeAdmin(selectedOffers) {
  document.querySelector("#temptext").innerHTML =
    "Vent et øjeblik mens vi laver din opskrift!";
  document.querySelector(".recipe-container").innerHTML = "";
  const saveButtonRecipe = document.querySelector("#save-button-recipe");
  console.log(selectedOffers);

  const recipeDescriptions = selectedOffers.map((offer) => offer[7]);
  const data = await fetch(
    URL,
    makeOptions("POST", recipeDescriptions, true)
  ).then((r) => handleHttpErrors(r));

  hideSpinner();
  document.querySelector("#temptext").innerHTML = "Her er din nye opskrift!";
  document.querySelector(".recipe-container").innerHTML = sanitizer(
    data.answer
  );

  var divChecker = document.querySelector(".recipe-container");
  var containsH3 = divChecker.querySelector("h3") !== null;
  if (containsH3) {
    saveButtonRecipe.style.display = "block";
  }
  document.querySelector("#recipe-modal-head").innerHTML =
    "<h5>" + document.querySelector("#recipe-heading").innerHTML + "</h5>";
  document.querySelector("#input-field-recipe").value =
    document.querySelector("#recipe-heading").innerHTML;

  const recipeRequest = {
    recipeTitle: document.querySelector("#input-field-recipe").value,
    recipeBody: data.answer,
    offers: selectedOffers.map((offer) => ({
      id: offer[0],
      originalPrice: offer[1],
      newPrice: offer[2],
      discount: offer[3],
      percentDiscount: offer[4],
      product: { ean: offer[5] },
      request: { id: offer[6] },
    })),
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

function saveRecipe(recipeRequest) {
  fetch(URL + "/admin", makeOptions("POST", recipeRequest, true)).then((r) =>
    handleHttpErrors(r)
  );
  document.querySelector("#inside-close").click();
  console.log(recipeRequest);
  router.navigate("/recipes-overview");
}

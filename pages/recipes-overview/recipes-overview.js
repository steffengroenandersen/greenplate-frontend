import { API_URL } from "./../../settings.js";
import {
  handleHttpErrors,
  makeOptions,
  sanitizeStringWithTableRows,
} from "./../../utility.js";

export let ingredients = "";
export let selectedOffers = [];
var maxFields = 5;
var currentFields = 1;
/**
 * Initiates the recipes overview by fetching and displaying recipes.
 */
export async function initRecipesOverview() {
  // Fetch and display recipes
  getRecipes();
  createRecipe();
}

async function getRecipes() {
  // fetch recipes from database
  const recipes = await fetch(
    API_URL + "/recipes/admin",
    makeOptions("GET", null, true)
  ).then((r) => handleHttpErrors(r));

  // Map recipes to innerHTML
  const recipeRows = recipes
    .map(
      (recipe) => `
        <div class="custom-card mt-2">
            <div class="card-body">
                <h5 class="card-title">${recipe.recipeTitle}</h5>
                <p class="card-text">${recipe.recipeBody}<p>
                <button id="${recipe.id}_recipeid" href="#" class="card-link btn-warning">Ændre opskrift</button>
                <button id="${recipe.id}_recipeid" href="#" class="card-link btn-danger">Slet opskrift</button>
            </div>
        </div>
    `
    )
    .join("");

  document.querySelector("#recipe-section").innerHTML =
    sanitizeStringWithTableRows(recipeRows);

  // Setup event listeners on change or delete buttons
  const buttons = document.querySelectorAll(".custom-card button");
  buttons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const recipeId = event.target.id.split("_")[0];
      const action = event.target.textContent.trim().toLowerCase(); // "Ændre opskrift" or "Slet opskrift"

      if (action === "ændre opskrift") {
        // Handle change button click

        // Find the selected recipe based on the recipeId
        const selectedRecipe = recipes.find(
          (recipe) => recipe.id === parseInt(recipeId)
        );

        // Populate the modal with recipe information
        document.getElementById("modal-recipe-id").value = selectedRecipe.id;
        document.getElementById("recipe-name").value =
          selectedRecipe.recipeTitle;
        document.getElementById("recipe-body").value =
          selectedRecipe.recipeBody;

        // Open the modal
        const changeRecipeModal = new bootstrap.Modal(
          document.getElementById("changeRecipe")
        );
        changeRecipeModal.show();
      } else if (action === "slet opskrift") {
        // Handle delete button click

        // Find the selected recipe based on the recipeId
        const selectedRecipe = recipes.find(
          (recipe) => recipe.id === parseInt(recipeId)
        );

        // Populate the modal with recipe information
        document.getElementById("delete-modal-recipe-id").value =
          selectedRecipe.id;
        document.getElementById("delete-recipe-name").value =
          selectedRecipe.recipeTitle;
        document.getElementById("delete-recipe-body").value =
          selectedRecipe.recipeBody;

        // Open the modal
        const changeRecipeModal = new bootstrap.Modal(
          document.getElementById("deleteRecipe")
        );
        changeRecipeModal.show();
      }
    });
  });

  // Setup event listener for "Gem opskrift" button in the modal
  const saveButton = document.getElementById("save-recipe-button");
  saveButton.addEventListener("click", saveRecipe);

  // Setup event listener for "Slet opskrift" button in the modal
  const deleteButton = document.querySelector("#delete-recipe-button");
  deleteButton.addEventListener("click", deleteRecipe);
}

/**
 * Asynchronous function to handle saving or updating a recipe.
 */
async function saveRecipe() {
  // Build JSON object for the recipe to be saved or updated
  const patchRecipe = {
    id: document.querySelector("#modal-recipe-id").value,
    recipeTitle: document.querySelector("#recipe-name").value,
    recipeBody: document.querySelector("#recipe-body").value,
  };

  // Send a PATCH request to the server to save or update the recipe
  // Note: You might want to handle the response or errors appropriately
  await fetch(
    API_URL + "/recipes/admin",
    makeOptions("PATCH", patchRecipe, true)
  ).then((r) => handleHttpErrors(r));

  // Refresh the recipe list after saving
  getRecipes();
}

/**
 * Asynchronous function to handle the deletion of a recipe.
 */
async function deleteRecipe() {
  // Build JSON object for the recipe to be deleted
  const deleteRecipe = {
    id: parseInt(document.querySelector("#delete-modal-recipe-id").value),
    recipeTitle: document.querySelector("#delete-recipe-name").value,
    recipeBody: document.querySelector("#delete-recipe-body").value,
  };

  // Send a DELETE request to the server
  await fetch(
    API_URL + "/recipes/admin",
    makeOptions("DELETE", deleteRecipe, true)
  );

  // Refresh the recipe list after deletion
  getRecipes();
}

async function createRecipe() {
  const offers = await fetch(
    API_URL + "/stores/products",
    makeOptions("GET", null, true)
  ).then((r) => handleHttpErrors(r));
  var addButton = document.querySelector(".inputFieldButton");
  var removeButton = document.querySelector(".removeFieldButton");

  addButton.addEventListener("click", function () {
    if (currentFields < maxFields) {
      addIngredientField();
      currentFields++;
    } else {
      alert("You can only add up to 5 ingredients.");
    }
  });

  removeButton.addEventListener("click", function () {
    if (currentFields > 1) {
      removeIngredientField();
      currentFields--;
    } else {
      alert("You must have at least one ingredient.");
    }
  });

  var existingSelect = document.querySelector("#ingredientFields select");

  // Populate existing select with offers
  offers.forEach((offer) => {
    var option = document.createElement("option");
    option.value = JSON.stringify(offer);
    option.text = offer[7];
    existingSelect.appendChild(option);
  });
  function addIngredientField() {
    var ingredientFields = document.getElementById("ingredientFields");

    var newInputGroup = document.createElement("div");
    newInputGroup.className = "input-group mb-3";

    var newSelect = document.createElement("select");
    newSelect.className = "form-select form-select-lg";
    newSelect.setAttribute("aria-label", ".form-select-lg example");

    var option1 = document.createElement("option");
    option1.value = "";
    option1.text = "Vælg et produkt";
    newSelect.appendChild(option1);
    newInputGroup.appendChild(newSelect);
    ingredientFields.appendChild(newInputGroup);

    offers.forEach((offer) => {
      var option = document.createElement("option");
      option.value = JSON.stringify(offer);
      option.text = offer[7];
      newSelect.appendChild(option);
    });
  }

  function removeIngredientField() {
    var ingredientFields = document.getElementById("ingredientFields");
    ingredientFields.removeChild(ingredientFields.lastElementChild);
  }

  document
    .querySelector("#createRecipeButton")
    .addEventListener("click", function () {
      var closeButton = document.querySelector(
        '#recipeCreateModal [data-bs-dismiss="modal"]'
      );
      const selectInputs = document.querySelectorAll(
        "#ingredientFields select"
      );
      selectedOffers = Array.from(selectInputs).map((select) => {
        const offerObject = JSON.parse(select.value);
        return offerObject;
      });
      closeButton.click();
      router.navigate(`/create-recipe/`);
    });
}

import { API_URL } from "../../settings.js";
import { handleHttpErrors, makeOptions, sanitizer } from "../../utility.js";
import { logout } from "../login/login.js";

const URL1 = API_URL + "/users";
const URL2 = API_URL + "/shopping-list";
const URL3 = API_URL + "/recipes";
let shopping_list_data;

export async function initProfile() {
  fetchProfile();
  fetchShoppingList();
  fetchRecipes();
}
async function fetchProfile() {
  const profile_data = await fetch(
    URL1 + "/user-as-authenticated",
    makeOptions("GET", null, true)
  ).then(handleHttpErrors);
  document.querySelector("#username-input").value = sanitizer(
    profile_data.username
  );
  document.querySelector("#email-input").value = sanitizer(profile_data.email);
  document.querySelector("#first-name-input").value = sanitizer(
    profile_data.firstName
  );
  document.querySelector("#last-name-input").value = sanitizer(
    profile_data.lastName
  );
  document
    .querySelector("#change_data_user")
    .addEventListener("click", profileModalOpen);
  document
    .querySelector("#change_user_data_btn")
    .addEventListener("click", changeUserData);
  document
    .querySelector("#delete_data_user")
    .addEventListener("click", openDeleteModal);
  document
    .querySelector("#delete_user_btn")
    .addEventListener("click", deleteUserData);
}
function openDeleteModal() {
  document.querySelector("#delete-modal-trigger").click();
}
async function deleteUserData() {
  try {
    await fetch(
      URL1 + "/user-as-authenticated",
      makeOptions("DELETE", null, true)
    ).then(handleHttpErrors);
  } catch (error) {
    console.log(error);
  }
  logout();
}
function profileModalOpen() {
  document.querySelector("#profile-modal-trigger").click();
}
function changeUserData() {
  const patchUser = {
    username: document.querySelector("#username-input").value,
    email: document.querySelector("#email-input").value,
    firstName: document.querySelector("#first-name-input").value,
    lastName: document.querySelector("#last-name-input").value,
    password_old: document.querySelector("#password-input").value,
    password_new: document.querySelector("#password-input2").value,
  };
  for (const prop in patchUser) {
    if (patchUser.hasOwnProperty(prop) && patchUser[prop] === null) {
      patchUser[prop] = "";
    }
  }
  fetch(
    URL1 + "/user-as-authenticated",
    makeOptions("PATCH", patchUser, true)
  ).then(handleHttpErrors);
  location.reload();
}
async function fetchShoppingList() {
  const currentDate = new Date();
  shopping_list_data = await fetch(
    URL2 + "/user-as-authenticated",
    makeOptions("GET", null, true)
  ).then(handleHttpErrors);
  const shopping_list_new = [];
  const shopping_list_old = [];
  shopping_list_data.forEach((list) => {
    const listDate = new Date(list.createdAt);

    if (isSameDate(listDate, currentDate)) {
      shopping_list_new.push(list);
    } else {
      shopping_list_old.push(list);
    }
  });
  const new_list = shopping_list_new
    .map((list) => {
      const shopName = list.offers[0].request.store.name;
      const shopAddress = `${list.offers[0].request.store.street}, ${list.offers[0].request.store.zip} ${list.offers[0].request.store.city}`;
      const date = new Date(list.createdAt).toISOString().split("T")[0];
      const totalPrice = list.offers.reduce(
        (total, offer) => total + offer.newPrice,
        0
      );
      const buttonId = `openListButton_${list.id}`;

      return `
        <div class="shopping-list m-3" style="border-top: 1px solid green;border-bottom: 1px solid green;">
            <div class="row">
                <div class="col text-truncate">${shopName} - ${shopAddress} - ${date} Total Price: ${totalPrice}</div>
            </div>
            <div class="row-auto">
                    <button id="${buttonId}" class="btn btn-primary m-1 open-list-button" data-list-id="${list.id}">Åben indkøbsliste</button>
            </div>
        </div>
    `;
    })
    .join("");

  if (shopping_list_new.length === 0) {
    document.querySelector("#new-list-field").innerHTML = sanitizer(
      "Der er ikke noget at vise"
    );
  } else {
    document.querySelector("#new-list-field").innerHTML = sanitizer(new_list);
  }

  const old_list = shopping_list_old
    .map((list) => {
      const shopName = list.offers[0].request.store.name;
      const shopAddress = `${list.offers[0].request.store.street}, ${list.offers[0].request.store.zip} ${list.offers[0].request.store.city}`;
      const date = new Date(list.createdAt).toISOString().split("T")[0];
      const totalPrice = list.offers.reduce(
        (total, offer) => total + offer.newPrice,
        0
      );
      const buttonId = `openListButton_${list.id}`;

      return `
            <div class="shopping-list m-3" style="border-top: 1px solid green;border-bottom: 1px solid green;">
                <div class="row">
                    <div class="col text-truncate">${shopName} - ${shopAddress} - ${date} Total Price: ${totalPrice}</div>
                </div>
                <div class="row-auto">
                    <button id="${buttonId}" class="btn btn-primary m-1 open-list-button" data-list-id="${list.id}">Åben indkøbsliste</button>
                </div>
            </div>
    `;
    })
    .join("");
  if (shopping_list_old.length === 0) {
    document.querySelector("#old-list-field").innerHTML = sanitizer(
      "Der er ikke noget at vise"
    );
  } else {
    document.querySelector("#old-list-field").innerHTML = sanitizer(old_list);
  }
  document
    .querySelector("#new-list-field")
    .addEventListener("click", function (event) {
      if (event.target.classList.contains("open-list-button")) {
        const listId = event.target.getAttribute("data-list-id");
        openShoppingList(listId, shopping_list_new);
      }
    });
}

function openShoppingList(listId, shoppingListArray) {
  const numericListId = parseInt(listId.trim(), 10);
  if (shoppingListArray && shoppingListArray.length > 0) {
    const selectedIndex = shoppingListArray.findIndex(
      (list) => list.id === numericListId
    );
    const selectedList = shoppingListArray[selectedIndex];
    const storeInfo = `
            <div class="col">
                <div class="row m-1" style="border-bottom:1px solid green">
                    <div class="col">${selectedList.offers[0].request.store.name}</div>
                    <div class="col text-end">${selectedList.offers[0].request.store.street}</div>
                </div>
            </div>
        `;

    const listBody =
      storeInfo +
      selectedList.offers
        .map((offer) => {
          return `
                <div class="col">
                    <div class="row">
                        <div class="col-7 mx-auto text-truncate">${offer.product.description}</div>
                        <div class="col-3 mx-auto text-end">${offer.newPrice} ,-</div>
                    </div>
                </div>
            `;
        })
        .join("");

    document.querySelector("#shoppinglist-modal-body").innerHTML =
      sanitizer(listBody);
    document.querySelector("#shoppinglist-modal-trigger").click();
  } else {
    console.error("Shopping list data not available yet.");
  }
}

async function fetchRecipes() {
  const recipe_data = await fetch(
    URL3 + "/user-as-authenticated",
    makeOptions("GET", null, true)
  ).then(handleHttpErrors);
  const recipe_list = recipe_data
    .map((recipe) => {
      return `
    <div class="col d-flex justify-content-center">
        <div class="card m-3 recipe-card" style="width:250px; max-height:300px; min-height:300px;">
            <div class="card-body" style="overflow:hidden;">
                <p class="card-text">${recipe.recipeBody}</p>
            </div>
        </div>
    </div>
`;
    })
    .join("");
  const recipe_list_with_row = `<div class="row">${recipe_list}</div>`;
  if (recipe_data.length === 0) {
    document.querySelector("#recipe-cards").innerHTML = sanitizer(
      "Der er ikke noget at vise"
    );
  } else {
    document.querySelector("#recipe-cards").innerHTML =
      sanitizer(recipe_list_with_row);
  }
  const recipeCards = document.querySelectorAll(".recipe-card");
  recipeCards.forEach((card, index) => {
    card.addEventListener("click", () => {
      openRecipeModal(recipe_data[index]);
    });
  });
}
function openRecipeModal(recipe) {
  document.querySelector("#recipe-modal-body").innerHTML = recipe.recipeBody;
  document.querySelector("#recipe-modal-trigger").click();
}
function isSameDate(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

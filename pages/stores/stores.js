import { API_URL } from "./../../settings.js";
import {
  handleHttpErrors,
  makeOptions,
  sanitizeStringWithTableRows,
} from "./../../utility.js";
import { selectedCards } from "../offers/offers.js";

export let storeData = [];

const URL = API_URL + "/stores";
export async function initStores() {
  if(selectedCards.length !== 0){
    history.replaceState(null, null, "#/stores");
    location.reload();
  }
  document.querySelector("#submit-zip").addEventListener("click", () => {
    showSpinner();
    getStores(document.querySelector("#zipcode-input").value);
  });
  document
    .querySelector("#store-cards")
    .addEventListener("click", function (e) {
      chooseStore(e);
    });
}

async function getStores(zip) {
  document.querySelector("#store-cards").style.visibility = "visible";
  const stores = await fetch(
    URL + "?zipcode=" + zip,
    makeOptions("GET", null, false)
  ).then((r) => handleHttpErrors(r));
  const storeRows = stores
    .map(
      (store) => `
    <div class="col-md-4 mb-4">
            <div class="card">
                <div class="row no-gutters">
                    <div class="col-md-8">
                        <div class="card-body">
                            <h5 class="card-title">${store.name}</h5>
                            <p class="card-text">${store.city}, ${
        store.street
      }, ${store.zip}</p>
                            <button id="${
                              store.id
                            }_storeid" class="choose-store btn btn-sm btn-danger">Vælg butik</button>
                        </div>
                    </div>
                    <div class="col-md-4 d-flex align-items-center justify-content-center">
                        <img src="${getBrandLogo(store.brand)}" alt="${
        store.brand
      }" style="height: 80px; width: auto;">
                    </div>
                </div>
            </div>
        </div>
    `
    )
    .join("");
  hideSpinner();
  document.querySelector("#store-cards").innerHTML =
    sanitizeStringWithTableRows(storeRows);
}

function chooseStore(e) {
  const btn = e.target;
  storeData = [];

  if (!btn.id || !btn.id.includes("_storeid")) {
    return;
  }
  const storeId = btn.id.split("_")[0];

  const selectedStore = storeData.find((store) => store.id === storeId);
  if (!selectedStore) {
    const storeCard = btn.closest(".card");

    const storeInfo = {
      id: storeId,
      name: storeCard.querySelector(".card-title").innerText,
      address: storeCard.querySelector(".card-text").innerText,
      brand: storeCard.querySelector(".col-md-4 img").alt,
    };
    storeData.push(storeInfo);
  }

  //router.navigate(`/foodplan/?storeid=${storeId}`); // oprindelig
  router.navigate(`/offers/?storeid=${storeId}`);
}
function showSpinner() {
  var spinner = document.getElementById("spinner");
  spinner.style.display = "block";
}

function hideSpinner() {
  var spinner = document.getElementById("spinner");
  spinner.style.display = "none";
}
function getBrandLogo(brand) {
  switch (brand.toLowerCase()) {
    case "netto":
      return "../../images/netto.png";
    case "foetex":
      return "../../images/foetex.png";
    case "bilka":
      return "../../images/bilka.png";
  }
}

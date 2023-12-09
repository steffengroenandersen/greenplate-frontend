import "./navigo.js";

import { setActiveLink, loadHtml, renderHtml } from "./utility.js";

import { initHome } from "./pages/home/home.js";
import { initStores } from "./pages/stores/stores.js";
import { initSignup } from "./pages/signup/signup.js";
import { initLogin, toggleLoginStatus, logout } from "./pages/login/login.js";
import { initFoodplan } from "./pages/foodplan/foodplan.js";
import { initOffers } from "./pages/offers/offers.js";
import { initRecipesOverview } from "./pages/recipes-overview/recipes-overview.js";
import { initCreateRecipe } from "./pages/createRecipe/create-recipe.js";
import { initDashboard } from "./pages/dashboard/dashboard.js";
import { initProfile } from "./pages/profile/profile.js";

window.addEventListener("load", async () => {
  const templateHome = await loadHtml("./pages/home/home.html");
  const templateSignup = await loadHtml("./pages/signup/signup.html");
  const templateNotFound = await loadHtml("./pages/notFound/notFound.html");
  const templateStores = await loadHtml("./pages/stores/stores.html");
  const templateLogin = await loadHtml("./pages/login/login.html");
  const templateFoodplan = await loadHtml("./pages/foodplan/foodplan.html");
  const templateOffers = await loadHtml("./pages/offers/offers.html");
  const templateRecipesOverview = await loadHtml(
    "./pages/recipes-overview/recipes-overview.html"
  );
  const templateCreateRecipe = await loadHtml(
    "./pages/createRecipe/create-recipe.html"
  );
  const templateDashboard = await loadHtml("./pages/dashboard/dashboard.html");
  const templateProfile = await loadHtml("./pages/profile/profile.html");

  //If token existed, for example after a refresh, set UI accordingly
  const token = localStorage.getItem("token");
  toggleLoginStatus(token);

  const router = new Navigo("/", { hash: true });
  window.router = router;
  let forceReload = false;  
  router
    .hooks({
      before(done, match) {
        setActiveLink("menu", match.url);
        done();
      },
    })
    .on({
      "/": () => {
        renderHtml(templateHome, "content");
        initHome();
      },
      "/signup": () => {
        renderHtml(templateSignup, "content");
        initSignup();
      },
      "/login": (match) => {
        renderHtml(templateLogin, "content");
        initLogin();
      },
      "/logout": () => {
        renderHtml(templateLogin, "content");
        logout();
      },
      "/stores": () => {
        renderHtml(templateStores, "content");
        initStores();
      },
      "/foodplan": () => {
        renderHtml(templateFoodplan, "content");
        initFoodplan();
      },
      "/offers": (match) => {
        renderHtml(templateOffers, "content");
        initOffers(match);
      },
      "/recipes-overview": () => {
        renderHtml(templateRecipesOverview, "content");
        initRecipesOverview();
      },
      "/create-recipe": () => {
        renderHtml(templateCreateRecipe, "content");
        initCreateRecipe();
      },
      "/dashboard": () => {
        renderHtml(templateDashboard, "content");
        initDashboard();
      },
      "/profile": () => {
        renderHtml(templateProfile, "content");
        initProfile();
      },
    })
    .notFound(() => {
      renderHtml(templateNotFound, "content");
    })
    .resolve();
});

window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
  alert(
    "Error: " +
      errorMsg +
      " Script: " +
      url +
      " Line: " +
      lineNumber +
      " Column: " +
      column +
      " StackTrace: " +
      errorObj
  );
};
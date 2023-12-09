import { API_URL } from "../../settings.js";
import { handleHttpErrors, makeOptions, sanitizer } from "../../utility.js";

const URL = API_URL + "/users";

export function initSignup() {
  document.querySelector("#btn-signup").addEventListener("click", signup);
}

async function signup() {
  event.preventDefault();

  document.querySelector("#invalid-feedback1").innerHTML = "";
  document.querySelector("#invalid-feedback2").innerHTML = "";
  document.querySelector("#invalid-feedback3").innerHTML = "";
  document.querySelector("#invalid-feedback4").innerHTML = "";
  document.querySelector("#invalid-feedback5").innerHTML = "";
  document.querySelector("#invalid-feedback6").innerHTML = "";

  const firstName = sanitizer(document.querySelector("#input-firstname").value);
  const lastName = sanitizer(document.querySelector("#input-lastname").value);
  const email = sanitizer(document.querySelector("#input-email").value);
  const username = sanitizer(document.querySelector("#input-username").value);
  const password = sanitizer(document.querySelector("#input-password").value);
  const passwordCheck = sanitizer(
    document.querySelector("#input-password2").value
  );

  if (
    !isSignupValid(
      firstName,
      lastName,
      email,
      username,
      password,
      passwordCheck
    )
  ) {
    return;
  }

  const signupRequest = {
    firstName: firstName,
    lastName: lastName,
    email: email,
    username: username,
    password: password,
  };

  try {
    const res = await fetch(URL, makeOptions("POST", signupRequest)).then((r) =>
      handleHttpErrors(r)
    );
    window.router.navigate("/login");
  } catch (err) {
    if (err.message === "User already exists") {
      document.querySelector("#invalid-feedback3").innerHTML =
        "Brugernavn er allerede i brug.";
    }
    if (err.message === "Email already exists") {
      document.querySelector("#invalid-feedback4").innerHTML =
        "Email er allerede i brug.";
    }
  }
}

function isSignupValid(
  firstName,
  lastName,
  email,
  username,
  password,
  passwordCheck
) {
  if (!firstName || firstName.trim() === "") {
    document.querySelector("#invalid-feedback1").innerHTML =
      "Indtast venligst fornavn.";
    return false;
  }

  if (!lastName || lastName.trim() === "") {
    document.querySelector("#invalid-feedback2").innerHTML =
      "Indtast venligst efternavn.";
    return false;
  }

  if (!username || username.trim() === "" || username.length < 2) {
    document.querySelector("#invalid-feedback3").innerHTML =
      "Indtast venligst brugernavn.";
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || email.trim() === "" || !emailRegex.test(email)) {
    document.querySelector("#invalid-feedback4").innerHTML =
      "Indtast venlist en gyldig emailadresse.";
    return false;
  }

  if (!password || password.length < 4) {
    document.querySelector("#invalid-feedback5").innerHTML =
      "Kodeord skal være mindst 4 tegn.";
    return false;
  }

  if (password !== passwordCheck) {
    document.querySelector("#invalid-feedback6").innerHTML =
      "Kodeord er ikke ens.";
    return false;
  }

  return true;
}

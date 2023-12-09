let API_URL;

if (
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
) {
  API_URL = "http://localhost:8080/api";
} else {
  API_URL = "https://greenplate-backends.azurewebsites.net/api";
}

export { API_URL };

export const FETCH_NO_API_ERROR =
  " (Is the API online or did the endpoint exists ?)";

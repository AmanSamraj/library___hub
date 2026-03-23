// Frontend logic for toggling forms and submitting auth requests.
document.addEventListener("DOMContentLoaded", () => {
  // Main page to redirect after login
  const MAIN_PAGE = "../index.html";
  const TOKEN_KEY = "libraryHubToken";
  const USER_KEY = "libraryHubUser";
  const wrapper = document.querySelector(".wrapper");
  const alreadyLogged = document.getElementById("alreadyLogged");
  const goHomeBtn = document.getElementById("goHomeBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const registerLink = document.querySelector(".register-link");
  const loginLink = document.querySelector(".login-link");
  const getStoredUser = () => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || "null");
    } catch (error) {
      return null;
    }
  };

  // If token exists, show "already logged in" state
  if (localStorage.getItem(TOKEN_KEY)) {
    if (alreadyLogged) alreadyLogged.hidden = false;
    if (wrapper) wrapper.style.display = "none";
  }

  if (goHomeBtn) {
    goHomeBtn.addEventListener("click", () => {
      // Go back to main page
      window.location.href = MAIN_PAGE;
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      // Clear auth data and show login form again
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("email");
      if (alreadyLogged) alreadyLogged.hidden = true;
      if (wrapper) wrapper.style.display = "block";
    });
  }

  if (registerLink) {
    registerLink.addEventListener("click", (e) => {
      e.preventDefault();
      // Switch to register panel
      if (wrapper) wrapper.classList.add("active");
    });
  }

  if (loginLink) {
    loginLink.addEventListener("click", (e) => {
      e.preventDefault();
      // Switch to login panel
      if (wrapper) wrapper.classList.remove("active");
    });
  }

  // Backend base URL
  const API = "/api";
  const registerForm = document.getElementById("registerForm");
  const loginForm = document.getElementById("loginForm");

  const tryFetchJson = async (url, options) => {
    try {
      const res = await fetch(url, options);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { ok: false, error: data.message || "Request failed" };
      }
      return { ok: true, data };
    } catch (err) {
      return { ok: false, error: err && err.message ? err.message : "Network error" };
    }
  };

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("regUsername").value.trim();
      const email = document.getElementById("regEmail").value.trim();
      const password = document.getElementById("regPassword").value;
      const phoneInput = document.getElementById("regPhone");
      const phone = phoneInput ? phoneInput.value.trim() : "";

      const remote = await tryFetchJson(API + "/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, phone }),
      });

      if (remote.ok) {
        alert(remote.data.message || "Registered");
        if (wrapper) wrapper.classList.remove("active");
        return;
      }
      alert(remote.error);
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("loginUsername").value.trim();
      const password = document.getElementById("loginPassword").value;

      const remote = await tryFetchJson(API + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrUsername: username, password }),
      });

      if (remote.ok) {
        alert((remote.data.message || "OTP sent") + " Please verify it from the main login page.");
        return;
      }
      alert(remote.error);
    });
  }

  const storedUser = getStoredUser();
  if (storedUser && alreadyLogged) {
    alreadyLogged.hidden = false;
  }
});

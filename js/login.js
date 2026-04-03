document.addEventListener("DOMContentLoaded", function() {
  var loginForm = document.getElementById("loginForm");
  var registerForm = document.getElementById("registerForm");
  var loginStatus = document.getElementById("loginStatus");
  var registerStatus = document.getElementById("registerStatus");
  var accountStatus = document.getElementById("accountStatus");
  var logoutButton = document.getElementById("logoutButton");
  var loginPanel = document.getElementById("loginPanel");
  var registerPanel = document.getElementById("registerPanel");
  var showLoginButton = document.getElementById("showLoginButton");
  var showRegisterButton = document.getElementById("showRegisterButton");

  function setMessage(node, message, isError) {
    if (!node) {
      return;
    }

    node.textContent = message;
    node.style.color = isError ? "#b42318" : "#166534";
  }

  function updateAccountStatus() {
    if (!accountStatus) {
      return;
    }

    var user = window.LibraryHubApi.getUser();
    if (user) {
      accountStatus.textContent = "Signed in as " + user.username + " (" + user.email + ")";
    } else {
      accountStatus.textContent = "You are not signed in yet.";
    }

    if (logoutButton) {
      logoutButton.hidden = !user;
    }
  }

  function showMode(mode) {
    var showLogin = mode !== "register";

    if (loginPanel) {
      loginPanel.hidden = !showLogin;
    }

    if (registerPanel) {
      registerPanel.hidden = showLogin;
    }

    if (showLoginButton) {
      showLoginButton.classList.toggle("active", showLogin);
    }

    if (showRegisterButton) {
      showRegisterButton.classList.toggle("active", !showLogin);
    }
  }

  async function loadBackendStatus() {
    try {
      var health = await window.LibraryHubApi.request("/health", {
        method: "GET"
      });

      if (health.database !== "connected") {
        var message = "Database disconnected hai. Login, register, cart aur checkout tab tak kaam nahi karenge jab tak MongoDB connect na ho.";
        setMessage(loginStatus, message, true);
        setMessage(registerStatus, message, true);
      }
    } catch (error) {
      console.warn("Health check failed:", error && error.message ? error.message : error);
    }
  }

  if (registerForm) {
    registerForm.addEventListener("submit", async function(event) {
      event.preventDefault();

      try {
        setMessage(registerStatus, "Sending OTP...", false);
        var response = await window.LibraryHubApi.request("/auth/register", {
          method: "POST",
          body: JSON.stringify({
            username: registerForm.registerUsername.value.trim(),
            email: registerForm.registerEmail.value.trim(),
            password: registerForm.registerPassword.value.trim(),
            phone: registerForm.registerPhone.value.trim()
          })
        });

        window.sessionStorage.setItem("libraryHubPendingRegisterEmail", registerForm.registerEmail.value.trim());
        if (response.delivery === "console") {
          window.sessionStorage.setItem("libraryHubOtpDelivery", "console");
        } else {
          window.sessionStorage.removeItem("libraryHubOtpDelivery");
        }
        window.location.href = "register-otp.html?email=" + encodeURIComponent(response.email || registerForm.registerEmail.value.trim());
      } catch (error) {
        setMessage(registerStatus, error.message, true);
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async function(event) {
      event.preventDefault();

      try {
        setMessage(loginStatus, "Logging in...", false);
        var session = await window.LibraryHubApi.request("/auth/login", {
          method: "POST",
          body: JSON.stringify({
            emailOrUsername: loginForm.email.value.trim(),
            password: loginForm.password.value.trim()
          })
        });

        window.LibraryHubApi.saveSession(session);
        loginForm.reset();
        updateAccountStatus();
        setMessage(loginStatus, "Login successful. Redirecting to home...", false);
        window.setTimeout(function() {
          window.location.href = "index.html";
        }, 900);
      } catch (error) {
        setMessage(loginStatus, error.message, true);
      }
    });
  }

  if (logoutButton) {
    logoutButton.addEventListener("click", function() {
      window.LibraryHubApi.clearSession();
      updateAccountStatus();
      setMessage(loginStatus, "You have been logged out.", false);
    });
  }

  if (showLoginButton) {
    showLoginButton.addEventListener("click", function() {
      showMode("login");
    });
  }

  if (showRegisterButton) {
    showRegisterButton.addEventListener("click", function() {
      showMode("register");
    });
  }

  updateAccountStatus();
  showMode("login");
  loadBackendStatus();
});

document.addEventListener("DOMContentLoaded", function() {
  var loginForm = document.getElementById("loginForm");
  var registerForm = document.getElementById("registerForm");
  var loginStatus = document.getElementById("loginStatus");
  var registerStatus = document.getElementById("registerStatus");
  var accountStatus = document.getElementById("accountStatus");
  var logoutButton = document.getElementById("logoutButton");
  var otpFieldWrap = document.getElementById("otpFieldWrap");
  var otpInput = document.getElementById("loginOtp");
  var resendOtpButton = document.getElementById("resendOtpButton");
  var loginSubmitButton = document.getElementById("loginSubmitButton");
  var pendingLoginIdentity = "";
  var otpStepActive = false;

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

  function setOtpStep(active) {
    otpStepActive = active;

    if (otpFieldWrap) {
      otpFieldWrap.hidden = !active;
    }

    if (otpInput) {
      otpInput.required = active;
      if (!active) {
        otpInput.value = "";
      }
    }

    if (resendOtpButton) {
      resendOtpButton.hidden = !active;
    }

    if (loginSubmitButton) {
      loginSubmitButton.textContent = active ? "Verify OTP & Login" : "Send OTP";
    }
  }

  async function requestLoginOtp() {
    var emailOrUsername = loginForm.email.value.trim();
    var password = loginForm.password.value.trim();

    if (!emailOrUsername || !password) {
      throw new Error("Email and password are required");
    }

    var response = await window.LibraryHubApi.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        emailOrUsername: emailOrUsername,
        password: password
      })
    });

    pendingLoginIdentity = emailOrUsername;
    setOtpStep(true);
    setMessage(loginStatus, "OTP sent to " + (response.maskedEmail || response.email) + ". Enter it below to finish login.", false);
  }

  if (registerForm) {
    registerForm.addEventListener("submit", async function(event) {
      event.preventDefault();
      setMessage(registerStatus, "Creating your account...", false);

      try {
        await window.LibraryHubApi.request("/auth/register", {
          method: "POST",
          body: JSON.stringify({
            username: registerForm.registerUsername.value.trim(),
            email: registerForm.registerEmail.value.trim(),
            password: registerForm.registerPassword.value.trim(),
            phone: registerForm.registerPhone.value.trim()
          })
        });

        setMessage(registerStatus, "Account created. You can log in now.", false);
        registerForm.reset();
      } catch (error) {
        setMessage(registerStatus, error.message, true);
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async function(event) {
      event.preventDefault();

      try {
        if (!otpStepActive) {
          setMessage(loginStatus, "Checking password and sending OTP...", false);
          await requestLoginOtp();
          return;
        }

        setMessage(loginStatus, "Verifying OTP...", false);
        var session = await window.LibraryHubApi.request("/auth/login/verify-otp", {
          method: "POST",
          body: JSON.stringify({
            emailOrUsername: pendingLoginIdentity || loginForm.email.value.trim(),
            otp: otpInput ? otpInput.value.trim() : ""
          })
        });

        window.LibraryHubApi.saveSession(session);
        pendingLoginIdentity = "";
        setOtpStep(false);
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

  if (resendOtpButton) {
    resendOtpButton.addEventListener("click", async function() {
      if (!loginForm) {
        return;
      }

      setMessage(loginStatus, "Sending a fresh OTP...", false);

      try {
        await requestLoginOtp();
      } catch (error) {
        setMessage(loginStatus, error.message, true);
      }
    });
  }

  if (logoutButton) {
    logoutButton.addEventListener("click", function() {
      window.LibraryHubApi.clearSession();
      pendingLoginIdentity = "";
      setOtpStep(false);
      updateAccountStatus();
      setMessage(loginStatus, "You have been logged out.", false);
    });
  }

  setOtpStep(false);
  updateAccountStatus();
});

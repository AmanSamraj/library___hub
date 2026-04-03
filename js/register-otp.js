document.addEventListener("DOMContentLoaded", function() {
  var otpForm = document.getElementById("registerOtpForm");
  var emailInput = document.getElementById("verifyEmail");
  var otpInput = document.getElementById("verifyOtp");
  var verifyStatus = document.getElementById("verifyStatus");
  var otpInfo = document.getElementById("otpInfo");

  function setMessage(message, isError) {
    if (!verifyStatus) {
      return;
    }

    verifyStatus.textContent = message;
    verifyStatus.style.color = isError ? "#b42318" : "#166534";
  }

  function getPendingEmail() {
    var params = new URLSearchParams(window.location.search);
    return params.get("email") || window.sessionStorage.getItem("libraryHubPendingRegisterEmail") || "";
  }

  var pendingEmail = getPendingEmail();
  var otpDelivery = window.sessionStorage.getItem("libraryHubOtpDelivery");

  if (!pendingEmail) {
    setMessage("Pehle register page par jaakar OTP bhejo.", true);
    if (otpForm) {
      otpForm.hidden = true;
    }
    return;
  }

  if (emailInput) {
    emailInput.value = pendingEmail;
  }

  if (otpInfo) {
    otpInfo.textContent = "OTP " + pendingEmail + " par bheja gaya hai. Sahi OTP verify hone par hi registration complete hoga.";
    if (otpDelivery === "console") {
      otpInfo.textContent += " SMTP configured nahi hai, isliye OTP server terminal me print hua hai.";
    }
  }

  if (otpForm) {
    otpForm.addEventListener("submit", async function(event) {
      event.preventDefault();

      try {
        setMessage("Verifying OTP...", false);
        await window.LibraryHubApi.request("/auth/register/verify-otp", {
          method: "POST",
          body: JSON.stringify({
            emailOrUsername: pendingEmail,
            otp: otpInput ? otpInput.value.trim() : ""
          })
        });

        window.sessionStorage.removeItem("libraryHubPendingRegisterEmail");
        window.sessionStorage.removeItem("libraryHubOtpDelivery");
        setMessage("Account registered successfully. Redirecting to login...", false);
        window.setTimeout(function() {
          window.location.href = "login.html";
        }, 1000);
      } catch (error) {
        setMessage(error.message, true);
      }
    });
  }
});

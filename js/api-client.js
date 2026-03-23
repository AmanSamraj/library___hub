(function() {
  const API_BASE = "/api";
  const TOKEN_KEY = "libraryHubToken";
  const USER_KEY = "libraryHubUser";
  const LEGACY_TOKEN_KEY = "token";
  const LEGACY_USERNAME_KEY = "username";
  const LEGACY_EMAIL_KEY = "email";

  async function request(path, options) {
    const token = localStorage.getItem(TOKEN_KEY);
    const headers = Object.assign(
      { "Content-Type": "application/json" },
      options && options.headers ? options.headers : {}
    );

    if (token) {
      headers.Authorization = "Bearer " + token;
    }

    const response = await fetch(API_BASE + path, Object.assign({}, options, { headers }));
    const data = await response.json().catch(function() {
      return {};
    });

    if (!response.ok) {
      const message = data && data.message ? data.message : "Request failed";
      throw new Error(message);
    }

    return data;
  }

  function saveSession(session) {
    localStorage.setItem(TOKEN_KEY, session.token);
    localStorage.setItem(USER_KEY, JSON.stringify(session.user));
    localStorage.setItem(LEGACY_TOKEN_KEY, session.token);
    localStorage.setItem(LEGACY_USERNAME_KEY, session.user.username || "");
    localStorage.setItem(LEGACY_EMAIL_KEY, session.user.email || "");
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    localStorage.removeItem(LEGACY_USERNAME_KEY);
    localStorage.removeItem(LEGACY_EMAIL_KEY);
  }

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch (error) {
      return null;
    }
  }

  window.LibraryHubApi = {
    apiBase: API_BASE,
    request: request,
    saveSession: saveSession,
    clearSession: clearSession,
    storageKeys: {
      token: TOKEN_KEY,
      user: USER_KEY
    },
    getToken: function() {
      return localStorage.getItem(TOKEN_KEY);
    },
    getUser: getUser,
    isLoggedIn: function() {
      return Boolean(localStorage.getItem(TOKEN_KEY));
    }
  };
})();

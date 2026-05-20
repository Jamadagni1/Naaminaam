import {
  SUPABASE_URL,
  getSupabaseClient,
  isSupabaseConfigured,
  supabase,
  waitForSupabaseClient
} from "./supabase-config.js?v=sb-20260404b";

const ADMIN_EMAILS = [
  // "admin@example.com"
];

const ADMIN_REDIRECT = "/admin.html";
const USER_REDIRECT = "/index.html";
const REDIRECT_STORAGE_KEY = "naamin-auth-redirect";

const form = document.querySelector("form");
const messageEl = document.getElementById("auth-message");
const mode = document.body?.dataset?.auth || "";
const isAuthScreen = mode === "login" || mode === "signup";
const AUTH_PATHS = ["/login.html", "/signup.html"];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const showMessage = (text, type = "info") => {
  if (!messageEl) return;
  messageEl.textContent = text;
  messageEl.dataset.type = type;
};

const isConfigPlaceholder = () => !isSupabaseConfigured();
const getAuthClient = () => getSupabaseClient() || supabase || null;
const buildGoogleAuthorizeUrl = () => {
  const redirectTo = encodeURIComponent(getAuthReturnUrl());
  return `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${redirectTo}`;
};

const setButtonBusy = (button, isBusy, busyLabel = "Please wait...") => {
  if (!button) return;
  if (!button.dataset.defaultLabel) {
    button.dataset.defaultLabel = button.textContent || "";
  }
  button.disabled = isBusy;
  button.textContent = isBusy ? busyLabel : (button.dataset.defaultLabel || "");
};

const normalizeRole = (email) => {
  if (!email) return "user";
  return ADMIN_EMAILS.includes(email.toLowerCase()) ? "admin" : "user";
};

const validateEmail = (email) => emailRegex.test(email);

const validatePassword = (password) => String(password).length >= 8;

const getUserRole = async (user) => normalizeRole(user?.email);

const isAuthPath = (pathname = "") => {
  const normalized = String(pathname || "").toLowerCase();
  return AUTH_PATHS.some((authPath) => normalized.endsWith(authPath));
};

const getSameOriginReferrerPath = () => {
  const referrer = String(document.referrer || "").trim();
  if (!referrer) return "";

  try {
    const parsed = new URL(referrer, window.location.origin);
    if (parsed.origin !== window.location.origin) return "";
    if (isAuthPath(parsed.pathname)) return "";
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch (_e) {
    return "";
  }
};

const normalizeRedirectPath = (raw) => {
  if (!raw) return "";
  try {
    const decoded = decodeURIComponent(String(raw));
    const parsed = new URL(decoded, window.location.origin);
    if (parsed.origin !== window.location.origin) return "";
    if (isAuthPath(parsed.pathname)) return "";
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch (_e) {
    return "";
  }
};

const readStoredRedirect = () => {
  try {
    const stored = localStorage.getItem(REDIRECT_STORAGE_KEY);
    return normalizeRedirectPath(stored);
  } catch (_e) {
    return "";
  }
};

const saveStoredRedirect = (rawPath) => {
  const normalized = normalizeRedirectPath(rawPath);
  if (!normalized) return "";
  try {
    localStorage.setItem(REDIRECT_STORAGE_KEY, normalized);
  } catch (_e) {
    // ignore storage edge cases
  }
  return normalized;
};

const clearStoredRedirect = () => {
  try {
    localStorage.removeItem(REDIRECT_STORAGE_KEY);
  } catch (_e) {
    // ignore storage edge cases
  }
};

const getDefaultPostAuthRedirect = () => {
  return getRequestedRedirect() || readStoredRedirect() || getSameOriginReferrerPath();
};

const getAuthReturnUrl = () => {
  const authReturnUrl = new URL(window.location.pathname, window.location.origin);
  const requestedRedirect = getDefaultPostAuthRedirect();
  if (requestedRedirect) {
    authReturnUrl.searchParams.set("redirect", requestedRedirect);
  }
  return authReturnUrl.toString();
};

const getUrlParam = (key) => {
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.has(key)) {
    return searchParams.get(key);
  }

  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  const hashParams = new URLSearchParams(hash);
  return hashParams.get(key);
};

const hasAuthCallbackParams = () => {
  return [
    "access_token",
    "refresh_token",
    "token_type",
    "expires_in",
    "expires_at",
    "provider_token",
    "provider_refresh_token",
    "code"
  ].some((key) => Boolean(getUrlParam(key)));
};

const clearAuthParamsFromUrl = () => {
  if (!window.location.search && !window.location.hash) return;
  window.history.replaceState({}, document.title, window.location.pathname);
};

const getRequestedRedirect = () => {
  const raw = getUrlParam("redirect");
  if (!raw) return "";
  return normalizeRedirectPath(raw);
};

const safeRedirect = (role, preferredRedirect = "") => {
  const redirectTarget = normalizeRedirectPath(preferredRedirect) || getDefaultPostAuthRedirect();
  const roleTarget = role === "admin" ? ADMIN_REDIRECT : USER_REDIRECT;
  const target = redirectTarget || roleTarget;

  if (redirectTarget) {
    clearStoredRedirect();
  }

  if (role === "admin" && !redirectTarget) {
    fetch(target, { method: "HEAD" })
      .then((res) => {
        window.location.href = res.ok ? target : USER_REDIRECT;
      })
      .catch(() => {
        window.location.href = USER_REDIRECT;
      });
  } else {
    window.location.href = target;
  }
};

const handleAuthError = (err) => {
  const code = err?.code || "";
  const message = String(err?.message || "").toLowerCase();

  switch (code) {
    case "user_already_exists":
      return "Email already exists. Please log in instead.";
    case "validation_failed":
      return "Invalid email format.";
    case "invalid_credentials":
      return "Invalid credentials. Please try again.";
    default:
      if (message.includes("user already registered")) {
        return "Email already exists. Please log in instead.";
      }
      if (message.includes("invalid login credentials")) {
        return "Invalid email or password. Please try again.";
      }
      if (message.includes("email not confirmed")) {
        return "Please confirm your email first, then log in.";
      }
      if (message.includes("password should be at least")) {
        return "Password should be at least 8 characters.";
      }
      if (message.includes("provider is not enabled")) {
        return "Google sign-in is not enabled for this Supabase project.";
      }
      if (message.includes("redirect_to") || message.includes("redirect uri") || message.includes("redirect_uri")) {
        return "Google login redirect is not allowed. Add this page URL in Supabase Auth > URL Configuration.";
      }
      if (message.includes("failed to fetch")) {
        return "Network error. Please check your connection and try again.";
      }
      return err?.message || "Something went wrong. Please try again.";
  }
};

const isMissingSessionError = (err) => {
  const message = String(err?.message || "").toLowerCase();
  return (
    err?.name === "AuthSessionMissingError" ||
    message.includes("auth session missing")
  );
};

if (isConfigPlaceholder()) {
  showMessage(
    "Supabase config is missing. Update supabase-config.js with your project keys.",
    "error"
  );
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    showMessage("", "info");

    if (isConfigPlaceholder()) {
      showMessage(
        "Please set Supabase keys in supabase-config.js before continuing.",
        "error"
      );
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    setButtonBusy(submitBtn, true, mode === "signup" ? "Creating account..." : "Logging in...");

    try {
      const authClient = getAuthClient() || (await waitForSupabaseClient());
      if (!authClient?.auth) {
        showMessage(
          "Auth client could not start. Reload once and try again.",
          "error"
        );
        return;
      }

      if (mode === "signup") {
        const name = document.getElementById("signup-name")?.value?.trim() || "";
        const email = document.getElementById("signup-email")?.value?.trim() || "";
        const password = document.getElementById("signup-password")?.value || "";
        const confirm = document.getElementById("signup-confirm")?.value || "";

        if (!name || !email || !password || !confirm) {
          showMessage("Please fill in all fields.", "error");
          return;
        }
        if (!validateEmail(email)) {
          showMessage("Please enter a valid email address.", "error");
          return;
        }
        if (!validatePassword(password)) {
          showMessage("Password must be at least 8 characters.", "error");
          return;
        }
        if (password !== confirm) {
          showMessage("Passwords do not match.", "error");
          return;
        }

        const role = normalizeRole(email);
        const { data, error } = await authClient.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              role
            },
            emailRedirectTo: getAuthReturnUrl()
          }
        });
        if (error) throw error;

        if (data.session?.user) {
          showMessage("Account created successfully. Redirecting...", "success");
          safeRedirect(role);
          return;
        }

        showMessage(
          "Account created. Please check your email to confirm your account.",
          "success"
        );
      } else if (mode === "login") {
        const email = document.getElementById("login-email")?.value?.trim() || "";
        const password = document.getElementById("login-password")?.value || "";

        if (!email || !password) {
          showMessage("Please enter your email and password.", "error");
          return;
        }
        if (!validateEmail(email)) {
          showMessage("Please enter a valid email address.", "error");
          return;
        }

        const { data, error } = await authClient.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;

        const role = await getUserRole(data.user);
        showMessage("Logged in. Redirecting...", "success");
        safeRedirect(role);
      }
    } catch (err) {
      showMessage(handleAuthError(err), "error");
    } finally {
      setButtonBusy(submitBtn, false);
    }
  });
}

const googleBtn = document.getElementById("google-auth-btn");
if (googleBtn) {
  googleBtn.addEventListener("click", async () => {
    showMessage("", "info");

    if (isConfigPlaceholder()) {
      showMessage(
        "Please set Supabase keys in supabase-config.js before continuing.",
        "error"
      );
      return;
    }

    setButtonBusy(googleBtn, true, "Opening Google...");

    try {
      const authClient = getAuthClient() || (await waitForSupabaseClient());
      if (!authClient?.auth) {
        showMessage("Opening Google sign-in...", "success");
        window.location.assign(buildGoogleAuthorizeUrl());
        return;
      }

      showMessage("Redirecting to Google...", "success");
      const redirectTo = getAuthReturnUrl();
      const { data, error } = await authClient.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            prompt: "select_account"
          }
        }
      });
      if (error) throw error;

      // supabase-js may auto-redirect on some versions, or return URL on others.
      if (data?.url) {
        window.location.assign(data.url);
        return;
      }

      // If SDK didn't redirect and no URL returned, force direct authorize URL.
      window.location.assign(buildGoogleAuthorizeUrl());
    } catch (err) {
      const friendly = handleAuthError(err);
      showMessage(friendly, "error");

      // Last-resort fallback for flaky SDK/cached bundles.
      window.setTimeout(() => {
        window.location.assign(buildGoogleAuthorizeUrl());
      }, 500);
    } finally {
      setButtonBusy(googleBtn, false);
    }
  });
}

if (isAuthScreen) {
  const preferredRedirect = getDefaultPostAuthRedirect();
  if (preferredRedirect) {
    saveStoredRedirect(preferredRedirect);
  }

  const footerAuthLink = document.querySelector('.footer a[href$="signup.html"], .footer a[href$="login.html"]');
  if (footerAuthLink && preferredRedirect) {
    footerAuthLink.href = `${footerAuthLink.getAttribute("href")}?redirect=${encodeURIComponent(preferredRedirect)}`;
  }

  const backBtn = document.querySelector('.back-btn[href]');
  if (backBtn && preferredRedirect) {
    backBtn.href = preferredRedirect;
  }
}

const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    const authClient = getAuthClient() || (await waitForSupabaseClient());
    if (isConfigPlaceholder() || !authClient?.auth) {
      window.location.href = USER_REDIRECT;
      return;
    }
    await authClient.auth.signOut({ scope: "local" });
    window.location.href = USER_REDIRECT;
  });
}

const syncAuthUi = async () => {
  if (isConfigPlaceholder()) return;
  const authClient = getAuthClient() || (await waitForSupabaseClient());
  if (!authClient?.auth) return;

  const hasCallbackParams = hasAuthCallbackParams();
  const authError = getUrlParam("error_description") || getUrlParam("error");
  if (authError) {
    showMessage(decodeURIComponent(authError), "error");
    clearAuthParamsFromUrl();
    return;
  }

  const { data, error } = await authClient.auth.getSession();
  if (error) {
    if (isMissingSessionError(error)) {
      return;
    }
    showMessage(handleAuthError(error), "error");
    return;
  }

  const user = data.session?.user || null;
  const authGate = document.querySelector("[data-auth-gate]");

  if (authGate) {
    if (!user) {
      authGate.textContent = "Please log in to continue.";
    } else {
      const role = await getUserRole(user);
      authGate.textContent = `Signed in as ${user.email} (${role})`;
    }
  }

  if (user && isAuthScreen && hasCallbackParams) {
    const role = await getUserRole(user);
    const preservedRedirect = getDefaultPostAuthRedirect();
    safeRedirect(role, preservedRedirect);
    return;
  }

  if (user && isAuthScreen) {
    showMessage(`Already signed in as ${user.email}.`, "success");
  }
};

const initAuthListeners = async () => {
  if (isConfigPlaceholder()) return;
  const authClient = getAuthClient() || (await waitForSupabaseClient());
  if (!authClient?.auth) return;

  authClient.auth.onAuthStateChange(async (_event, session) => {
    const authGate = document.querySelector("[data-auth-gate]");
    if (session?.user && isAuthScreen && hasAuthCallbackParams()) {
      const role = await getUserRole(session.user);
      const preservedRedirect = getDefaultPostAuthRedirect();
      safeRedirect(role, preservedRedirect);
      return;
    }

    if (!authGate) return;

    if (!session?.user) {
      authGate.textContent = "Please log in to continue.";
      return;
    }

    const role = await getUserRole(session.user);
    authGate.textContent = `Signed in as ${session.user.email} (${role})`;
  });

  syncAuthUi();
};

initAuthListeners();

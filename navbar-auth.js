import {
  getSupabaseClient,
  isSupabaseConfigured,
  supabase,
  waitForSupabaseClient
} from "./supabase-config.js?v=sb-20260404b";

const ROOT_PREFIX = window.location.pathname.includes("/more/") ? "../../" : "";
const PROFILE_PATH = `${ROOT_PREFIX}profile.html`;
const HOME_PATH = `${ROOT_PREFIX}index.html`;

const DESKTOP_PROFILE_ID = "nav-profile-menu";
const MOBILE_PROFILE_ID = "mobile-profile-menu";
const AUTH_LINK_SELECTOR = 'a[href*="login.html"], a[href*="signup.html"]';
const AUTH_STORAGE_KEY = "naamin-authenticated";
const getAuthClient = () => getSupabaseClient() || supabase || null;

// Expose the active client for non-module scripts (e.g., report download guard).
if (typeof window !== "undefined" && supabase) {
  window.__naaminSupabaseClient = supabase;
}

const getDisplayName = (user) => {
  const fullName = user?.user_metadata?.full_name?.trim();
  if (fullName) return fullName;

  const email = user?.email || "";
  return email.split("@")[0] || "Profile";
};

const ensureDesktopProfile = () => {
  const navActions = document.querySelector(".nav-actions");
  if (!navActions) return null;

  let menu = document.getElementById(DESKTOP_PROFILE_ID);
  if (!menu) {
    menu = document.createElement("div");
    menu.id = DESKTOP_PROFILE_ID;
    menu.className = "profile-menu";
    menu.innerHTML = `
      <button class="btn btn-login profile-toggle" type="button" aria-expanded="false">
        <span class="profile-avatar" aria-hidden="true">P</span>
        <span class="profile-label">Profile</span>
        <span class="arrow">&#9662;</span>
      </button>
      <div class="profile-dropdown">
        <a href="${PROFILE_PATH}" class="profile-dropdown-link">My Profile</a>
        <button type="button" class="profile-dropdown-link profile-signout-btn">Sign out</button>
      </div>
    `;
    navActions.appendChild(menu);
  }

  return menu;
};

const ensureMobileProfile = () => {
  const mobileActions = document.querySelector(".mobile-actions");
  if (!mobileActions) return null;

  let menu = document.getElementById(MOBILE_PROFILE_ID);
  if (!menu) {
    menu = document.createElement("div");
    menu.id = MOBILE_PROFILE_ID;
    menu.className = "mobile-profile-menu";
    menu.innerHTML = `
      <a href="${PROFILE_PATH}" class="btn btn-login mobile-btn mobile-profile-link">My Profile</a>
      <button type="button" class="btn btn-signup mobile-btn mobile-signout-btn">Sign out</button>
    `;
    mobileActions.appendChild(menu);
  }

  return menu;
};

const closeProfileMenus = () => {
  document.querySelectorAll(".profile-menu.open").forEach((menu) => {
    menu.classList.remove("open");
    const toggle = menu.querySelector(".profile-toggle");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  });
};

const wireProfileMenuEvents = () => {
  document.querySelectorAll(".profile-toggle").forEach((toggle) => {
    if (toggle.dataset.bound === "true") return;
    toggle.dataset.bound = "true";

    toggle.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const menu = toggle.closest(".profile-menu");
      const shouldOpen = !menu.classList.contains("open");
      closeProfileMenus();
      menu.classList.toggle("open", shouldOpen);
      toggle.setAttribute("aria-expanded", String(shouldOpen));
    });
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".profile-menu")) {
      closeProfileMenus();
    }
  });
};

const wireSignOut = () => {
  document.querySelectorAll(".profile-signout-btn, .mobile-signout-btn").forEach((button) => {
    if (button.dataset.bound === "true") return;
    button.dataset.bound = "true";

    button.addEventListener("click", async (event) => {
      event.preventDefault();
      try {
        const authClient = getAuthClient() || (await waitForSupabaseClient());
        if (authClient?.auth) {
          await authClient.auth.signOut({ scope: "local" });
        }
      } finally {
        window.location.href = HOME_PATH;
      }
    });
  });
};

const setLoggedOutUi = () => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (_e) {
    // ignore storage edge cases
  }

  document.querySelectorAll(AUTH_LINK_SELECTOR).forEach((link) => {
    link.style.display = "";
  });

  const desktopProfile = document.getElementById(DESKTOP_PROFILE_ID);
  if (desktopProfile) desktopProfile.style.display = "none";

  const mobileProfile = document.getElementById(MOBILE_PROFILE_ID);
  if (mobileProfile) mobileProfile.style.display = "none";
};

const setLoggedInUi = (user) => {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, "true");
  } catch (_e) {
    // ignore storage edge cases
  }

  document.querySelectorAll(AUTH_LINK_SELECTOR).forEach((link) => {
    link.style.display = "none";
  });

  const displayName = getDisplayName(user);
  const avatarLetter = displayName.charAt(0).toUpperCase() || "P";

  const desktopProfile = ensureDesktopProfile();
  if (desktopProfile) {
    desktopProfile.style.display = "flex";
    const label = desktopProfile.querySelector(".profile-label");
    const avatar = desktopProfile.querySelector(".profile-avatar");
    if (label) label.textContent = displayName;
    if (avatar) avatar.textContent = avatarLetter;
  }

  const mobileProfile = ensureMobileProfile();
  if (mobileProfile) {
    mobileProfile.style.display = "grid";
  }

  wireProfileMenuEvents();
  wireSignOut();
};

const syncNavbarAuth = async () => {
  if (!isSupabaseConfigured()) {
    setLoggedOutUi();
    return;
  }

  const authClient = getAuthClient() || (await waitForSupabaseClient());
  if (!authClient?.auth) {
    // Fallback: keep nav consistent while client script finishes loading.
    try {
      if (localStorage.getItem(AUTH_STORAGE_KEY) === "true") {
        setLoggedInUi({});
        return;
      }
    } catch (_e) {
      // ignore storage edge cases
    }
    setLoggedOutUi();
    return;
  }

  try {
    if (typeof window !== "undefined") {
      window.__naaminSupabaseClient = authClient;
    }
    const { data, error } = await authClient.auth.getSession();
    if (error || !data?.session?.user) {
      setLoggedOutUi();
      return;
    }
    setLoggedInUi(data.session.user);
  } catch (_error) {
    setLoggedOutUi();
  }
};

document.addEventListener("DOMContentLoaded", () => {
  syncNavbarAuth();

  if (!isSupabaseConfigured()) return;

  const startListener = async () => {
    const authClient = getAuthClient() || (await waitForSupabaseClient());
    if (!authClient?.auth) return;

    authClient.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setLoggedInUi(session.user);
        return;
      }

      setLoggedOutUi();
    });
  };

  startListener();
});

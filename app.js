import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// DOM Elements
const toastBanner = document.getElementById("toastBanner");
const authSection = document.getElementById("authSection");
const appSection = document.getElementById("appSection");
const userMenu = document.getElementById("userMenu");
const navSearchWrapper = document.getElementById("navSearchWrapper");
const globalSearchInput = document.getElementById("globalSearchInput");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const searchResultsBox = document.getElementById("searchResultsBox");
const closeSearchBoxBtn = document.getElementById("closeSearchBoxBtn");
const searchResultsContent = document.getElementById("searchResultsContent");

// Top-Right Settings & Menu Elements
const topMenuBtn = document.getElementById("topMenuBtn");
const topRightMenuDropdown = document.getElementById("topRightMenuDropdown");
const aboutBox = document.getElementById("aboutBox");
const closeAboutBtn = document.getElementById("closeAboutBtn");
const contactBox = document.getElementById("contactBox");
const closeContactBtn = document.getElementById("closeContactBtn");
const legalBox = document.getElementById("legalBox");
const closeLegalBtn = document.getElementById("closeLegalBtn");

const authForm = document.getElementById("authForm");
const tabLogin = document.getElementById("tabLogin");
const tabSignup = document.getElementById("tabSignup");
const nameGroup = document.getElementById("nameGroup");
const authSubmitBtn = document.getElementById("authSubmitBtn");
const authError = document.getElementById("authError");
const googleLoginBtn = document.getElementById("googleLoginBtn");
const logoutBtn = document.getElementById("logoutBtn");

// Settings Menu Elements
const settingsBox = document.getElementById("settingsBox");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");
const toggleThemeBtn = document.getElementById("toggleThemeBtn");
const enableBrowserNotifBtn = document.getElementById("enableBrowserNotifBtn");
const dmPrivacySelect = document.getElementById("dmPrivacySelect");
const socialLinksForm = document.getElementById("socialLinksForm");
const openProfileFromSettingsBtn = document.getElementById("openProfileFromSettingsBtn");

// Chat Inbox & Direct Messages Elements
const chatInboxBtn = document.getElementById("chatInboxBtn");
const chatBox = document.getElementById("chatBox");
const closeChatBtn = document.getElementById("closeChatBtn");
const startNewChatSelect = document.getElementById("startNewChatSelect");
const chatThreadsList = document.getElementById("chatThreadsList");
const activeChatHeader = document.getElementById("activeChatHeader");
const dmMessagesContainer = document.getElementById("dmMessagesContainer");
const dmSendForm = document.getElementById("dmSendForm");
const dmInput = document.getElementById("dmInput");

const profileBox = document.getElementById("profileBox");
const closeProfileBtn = document.getElementById("closeProfileBtn");
const profileForm = document.getElementById("profileForm");

const peopleBtn = document.getElementById("peopleBtn");
const peopleBox = document.getElementById("peopleBox");
const closePeopleBtn = document.getElementById("closePeopleBtn");
const peopleListContainer = document.getElementById("peopleListContainer");

const spacesBtn = document.getElementById("spacesBtn");
const spacesBox = document.getElementById("spacesBox");
const closeSpacesBtn = document.getElementById("closeSpacesBtn");
const createSpaceForm = document.getElementById("createSpaceForm");
const spacesListContainer = document.getElementById("spacesListContainer");
const activeSpaceRoom = document.getElementById("activeSpaceRoom");
const closeRoomBtn = document.getElementById("closeRoomBtn");
const roomPostsContainer = document.getElementById("roomPostsContainer");
const roomPostForm = document.getElementById("roomPostForm");

const notifBtn = document.getElementById("notifBtn");
const notifBox = document.getElementById("notifBox");
const closeNotifBtn = document.getElementById("closeNotifBtn");
const markAllReadBtn = document.getElementById("markAllReadBtn");
const notifListContainer = document.getElementById("notifListContainer");

const insightsBox = document.getElementById("insightsBox");
const closeInsightsBtn = document.getElementById("closeInsightsBtn");
const insightsContent = document.getElementById("insightsContent");

// Permanent Notes / Archive Vault Elements
const vaultBox = document.getElementById("vaultBox");
const closeVaultBtn = document.getElementById("closeVaultBtn");
const vaultForm = document.getElementById("vaultForm");
const vaultTitle = document.getElementById("vaultTitle");
const vaultCategory = document.getElementById("vaultCategory");
const vaultContent = document.getElementById("vaultContent");
const vaultSaveBtn = document.getElementById("vaultSaveBtn");
const vaultClearFormBtn = document.getElementById("vaultClearFormBtn");
const vaultExportBtn = document.getElementById("vaultExportBtn");
const vaultImportBtn = document.getElementById("vaultImportBtn");
const vaultImportFile = document.getElementById("vaultImportFile");
const vaultClearAllBtn = document.getElementById("vaultClearAllBtn");
const vaultEntriesList = document.getElementById("vaultEntriesList");
const vaultStatsBadge = document.getElementById("vaultStatsBadge");

const userInspectorModal = document.getElementById("userInspectorModal");
const closeInspectorBtn = document.getElementById("closeInspectorBtn");
const inspectorContent = document.getElementById("inspectorContent");

const postContent = document.getElementById("postContent");
const postCategory = document.getElementById("postCategory");
const postTagsInput = document.getElementById("postTagsInput");
const postImageInput = document.getElementById("postImageInput");
const imagePreviewContainer = document.getElementById("imagePreviewContainer");
const imagePreview = document.getElementById("imagePreview");
const removeImageBtn = document.getElementById("removeImageBtn");
const publishPostBtn = document.getElementById("publishPostBtn");
const feedContainer = document.getElementById("feedContainer");
const activeTagBadge = document.getElementById("activeTagBadge");

let isSignupMode = false;
let currentUser = null;
let currentUserDoc = { friends: [], sentRequests: [], receivedRequests: [], bio: "", socialLinks: {}, dmPrivacy: "everyone" };
let allUsersMap = {};
let selectedImageBase64 = null;
let currentFilter = "all";
let currentCategory = "all";
let currentTagFilter = "";
let currentSubTab = "discover";
let currentSpaceTab = "all";
let allPostsCache = [];
let optimisticPosts = [];
let allSpacesCache = [];
let allNotifsCache = [];
let allChatsCache = [];
let activeChatPeerUid = null;
let unsubscribeDmMessages = null;
let activeSpaceId = null;
let unsubscribeRoomPosts = null;
let inspectedUserId = null;

// Permanent Vault State
let vaultEntries = [];
let vaultEditingId = null;
const VAULT_STORAGE_KEY = "nesru_peace_vault_entries_v1";
const VAULT_DB_NAME = "NesruPeaceAppVaultDB";
const VAULT_STORE_NAME = "vault_entries";

function showToast(msg) {
  toastBanner.textContent = msg;
  toastBanner.classList.remove("hidden");
  setTimeout(() => toastBanner.classList.add("hidden"), 2800);
}

// Theme Mode Persistence
if (localStorage.getItem("np_theme") === "light") {
  document.body.classList.add("light-theme");
  toggleThemeBtn.textContent = "🌙 Dark Mode";
}

toggleThemeBtn.addEventListener("click", () => {
  const isLight = document.body.classList.toggle("light-theme");
  localStorage.setItem("np_theme", isLight ? "light" : "dark");
  toggleThemeBtn.textContent = isLight ? "🌙 Dark Mode" : "☀️ Light Mode";
});

// PWA Install Prompt
let deferredPrompt;
const installBtn = document.getElementById("installBtn");

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.classList.remove("hidden");
});

installBtn.addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === "accepted") installBtn.classList.add("hidden");
  deferredPrompt = null;
});

function hideAllPanels() {
  settingsBox.classList.add("hidden");
  chatBox.classList.add("hidden");
  profileBox.classList.add("hidden");
  peopleBox.classList.add("hidden");
  spacesBox.classList.add("hidden");
  notifBox.classList.add("hidden");
  insightsBox.classList.add("hidden");
  vaultBox.classList.add("hidden");
  aboutBox.classList.add("hidden");
  contactBox.classList.add("hidden");
  legalBox.classList.add("hidden");
}

function closeTopDropdown() {
  topRightMenuDropdown.classList.add("hidden");
  topMenuBtn.setAttribute("aria-expanded", "false");
}

topMenuBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  const willOpen = topRightMenuDropdown.classList.contains("hidden");
  topRightMenuDropdown.classList.toggle("hidden", !willOpen);
  topMenuBtn.setAttribute("aria-expanded", String(willOpen));
});

document.addEventListener("click", (e) => {
  if (!topRightMenuDropdown.contains(e.target) && !topMenuBtn.contains(e.target)) {
    closeTopDropdown();
  }
});

topRightMenuDropdown.querySelectorAll(".menu-item-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const action = btn.dataset.menuAction;
    closeTopDropdown();
    hideAllPanels();

    if (action === "website-settings") {
      settingsBox.classList.remove("hidden");
      const links = currentUserDoc.socialLinks || {};
      document.getElementById("socialFacebook").value = links.facebook || "";
      document.getElementById("socialInstagram").value = links.instagram || "";
      document.getElementById("socialX").value = links.x || "";
      document.getElementById("socialOther").value = links.other || "";
      dmPrivacySelect.value = currentUserDoc.dmPrivacy || "everyone";
    } else if (action === "vault") {
      vaultBox.classList.remove("hidden");
      renderVaultEntries();
    } else if (action === "profile") {
      profileBox.classList.remove("hidden");
      updateMyProfileStats();
    } else if (action === "insights") {
      insightsBox.classList.remove("hidden");
      renderInsights();
    } else if (action === "about") {
      aboutBox.classList.remove("hidden");
    } else if (action === "contact") {
      contactBox.classList.remove("hidden");
    } else if (action === "legal") {
      legalBox.classList.remove("hidden");
    }
  });
});

closeAboutBtn.addEventListener("click", () => aboutBox.classList.add("hidden"));
closeContactBtn.addEventListener("click", () => contactBox.classList.add("hidden"));
closeLegalBtn.addEventListener("click", () => legalBox.classList.add("hidden"));

document.getElementById("homeBrandBtn").addEventListener("click", () => {
  hideAllPanels();
  closeTopDropdown();
  searchResultsBox.classList.add("hidden");
  currentCategory = "all";
  currentTagFilter = "";
  updateCategoryChipsUI();
  renderPosts(allPostsCache);
});

// =====================================================================
// PERMANENT VAULT (IndexedDB + localStorage + JSON Backup)
// =====================================================================
function openVaultDB() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB not available"));
      return;
    }
    const req = indexedDB.open(VAULT_DB_NAME, 1);
    req.onupgradeneeded = (e) => {
      const idb = e.target.result;
      if (!idb.objectStoreNames.contains(VAULT_STORE_NAME)) {
        idb.createObjectStore(VAULT_STORE_NAME, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function loadVaultFromIDB() {
  const idb = await openVaultDB();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(VAULT_STORE_NAME, "readonly");
    const store = tx.objectStore(VAULT_STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

async function syncVaultToIDB(items) {
  try {
    const idb = await openVaultDB();
    await new Promise((resolve, reject) => {
      const tx = idb.transaction(VAULT_STORE_NAME, "readwrite");
      const store = tx.objectStore(VAULT_STORE_NAME);
      store.clear();
      for (const item of items) {
        store.put(item);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (_) {}
}

function saveVaultEntries(items) {
  vaultEntries = items;
  try {
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(items));
  } catch (_) {}
  syncVaultToIDB(items);
  renderVaultEntries();
}

async function initVaultEntries() {
  let localItems = [];
  try {
    const raw = localStorage.getItem(VAULT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) localItems = parsed;
    }
  } catch (_) {}

  let idbItems = [];
  try {
    idbItems = await loadVaultFromIDB();
  } catch (_) {}

  const mergedMap = new Map();
  for (const item of [...idbItems, ...localItems]) {
    if (item && item.id) mergedMap.set(item.id, item);
  }

  vaultEntries = Array.from(mergedMap.values()).sort(
    (a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0)
  );

  try {
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(vaultEntries));
  } catch (_) {}
  await syncVaultToIDB(vaultEntries);
  renderVaultEntries();
}

closeVaultBtn.addEventListener("click", () => vaultBox.classList.add("hidden"));

function renderVaultEntries() {
  vaultStatsBadge.textContent = `Kuufaman: ${vaultEntries.length}`;
  if (vaultEntries.length === 0) {
    vaultEntriesList.innerHTML = `<p class="muted" style="text-align:center;padding:1rem;">Odeeffannoon kuufame hin jiru. Waan turuu barbaaddu olitti galmeessi.</p>`;
    return;
  }

  vaultEntriesList.innerHTML = vaultEntries.map((item) => {
    const t = item.updatedAt || item.createdAt ? new Date(item.updatedAt || item.createdAt).toLocaleString() : "Amma";
    return `
      <div class="mini-post">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;margin-bottom:0.3rem;flex-wrap:wrap;">
          <strong>${escapeHTML(item.title || "Yaadannoo Hin Haqamne")}</strong>
          <span class="post-time">${item.category ? `${escapeHTML(item.category)} • ` : ""}${t}</span>
        </div>
        <div style="white-space:pre-wrap;margin-bottom:0.55rem;">${escapeHTML(item.content)}</div>
        <div style="display:flex;gap:0.4rem;">
          <button type="button" class="btn btn-ghost-sm" onclick="window.__editVaultItem('${item.id}')">Gulaali</button>
          <button type="button" class="btn btn-danger-sm" onclick="window.__deleteVaultItem('${item.id}')">Haqi</button>
        </div>
      </div>
    `;
  }).join("");
}

window.__editVaultItem = function (id) {
  const target = vaultEntries.find((v) => v.id === id);
  if (!target) return;
  vaultEditingId = target.id;
  vaultTitle.value = target.title || "";
  vaultCategory.value = target.category || "";
  vaultContent.value = target.content || "";
  vaultSaveBtn.textContent = "Jijjiirama Kuusi";
  vaultContent.focus();
};

window.__deleteVaultItem = function (id) {
  if (!confirm("Odeeffannoo kana dhuguma haquu barbaaddaa?")) return;
  const next = vaultEntries.filter((v) => v.id !== id);
  if (vaultEditingId === id) {
    vaultEditingId = null;
    vaultSaveBtn.textContent = "💾 Yeroo Hundaaf Kuusi";
    vaultForm.reset();
  }
  saveVaultEntries(next);
  showToast("Odeeffannoon haqameera.");
};

vaultForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const content = vaultContent.value.trim();
  if (!content) return;
  const now = Date.now();
  let next;

  if (vaultEditingId) {
    next = vaultEntries.map((item) =>
      item.id === vaultEditingId
        ? {
            ...item,
            title: vaultTitle.value.trim(),
            category: vaultCategory.value.trim(),
            content,
            updatedAt: now
          }
        : item
    );
    vaultEditingId = null;
    vaultSaveBtn.textContent = "💾 Yeroo Hundaaf Kuusi";
  } else {
    next = [
      {
        id: "vault_" + now + "_" + Math.random().toString(36).slice(2, 7),
        title: vaultTitle.value.trim(),
        category: vaultCategory.value.trim(),
        content,
        createdAt: now,
        updatedAt: now
      },
      ...vaultEntries
    ];
  }

  saveVaultEntries(next);
  vaultForm.reset();
  showToast("✅ Odeeffannoon hin haqamne kuufameera!");
});

vaultClearFormBtn.addEventListener("click", () => {
  vaultEditingId = null;
  vaultSaveBtn.textContent = "💾 Yeroo Hundaaf Kuusi";
  vaultForm.reset();
});

vaultClearAllBtn.addEventListener("click", () => {
  if (vaultEntries.length === 0) return;
  if (!confirm("Odeeffannoo kuufame HUNDAA ofiin haquu barbaaddaa?")) return;
  vaultEditingId = null;
  vaultSaveBtn.textContent = "💾 Yeroo Hundaaf Kuusi";
  saveVaultEntries([]);
  showToast("Hundi haqameera.");
});

vaultExportBtn.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(vaultEntries, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "nesru-peace-vault-backup.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast("📥 Backup (.JSON) buufameera!");
});

vaultImportBtn.addEventListener("click", () => vaultImportFile.click());

vaultImportFile.addEventListener("change", (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!Array.isArray(imported)) {
        alert("Faayiliin JSON kun sirrii miti.");
        return;
      }
      const map = new Map();
      for (const item of [...vaultEntries, ...imported]) {
        if (item && item.id && item.content) map.set(item.id, item);
      }
      const merged = Array.from(map.values()).sort(
        (a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0)
      );
      saveVaultEntries(merged);
      showToast("✅ Backup deebi'eera!");
    } catch (_) {
      alert("Faayilicha dubbisuun hin danda'amne.");
    }
    vaultImportFile.value = "";
  };
  reader.readAsText(file);
});

// Auth UI Tabs
tabLogin.addEventListener("click", () => {
  isSignupMode = false;
  tabLogin.classList.add("active");
  tabSignup.classList.remove("active");
  nameGroup.classList.add("hidden");
  authSubmitBtn.textContent = "Seeni";
  authError.textContent = "";
});

tabSignup.addEventListener("click", () => {
  isSignupMode = true;
  tabSignup.classList.add("active");
  tabLogin.classList.remove("active");
  nameGroup.classList.remove("hidden");
  authSubmitBtn.textContent = "Galmaa'i";
  authError.textContent = "";
});

// Register / Login
authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  authError.textContent = "";
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const displayName = document.getElementById("displayName").value.trim();

  try {
    if (isSignupMode) {
      if (!displayName) {
        authError.textContent = "Maaloo maqaa keessan guutuu barreessaa.";
        return;
      }
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=10b981&color=fff`;
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName, photoURL: avatarUrl });
      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        name: displayName,
        email,
        photoURL: avatarUrl,
        bio: "Nagaa fi jaalala Nesru Peace irratti!",
        friends: [],
        sentRequests: [],
        receivedRequests: [],
        socialLinks: {},
        dmPrivacy: "everyone",
        createdAt: serverTimestamp()
      });
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }
  } catch (err) {
    authError.textContent = "Dogoggora: " + err.message;
  }
});

// Google Sign-In
googleLoginBtn.addEventListener("click", async () => {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    const u = res.user;
    const avatarUrl = u.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.displayName || "NP")}&background=10b981&color=fff`;
    const userRef = doc(db, "users", u.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: u.uid,
        name: u.displayName || "Fayyadamaa",
        email: u.email,
        photoURL: avatarUrl,
        bio: "Nagaa fi jaalala Nesru Peace irratti!",
        friends: [],
        sentRequests: [],
        receivedRequests: [],
        socialLinks: {},
        dmPrivacy: "everyone",
        createdAt: serverTimestamp()
      });
    } else {
      await setDoc(userRef, {
        name: u.displayName || snap.data().name,
        photoURL: avatarUrl
      }, { merge: true });
    }
  } catch (err) {
    authError.textContent = "Google Login hin milkoofne: " + err.message;
  }
});

logoutBtn.addEventListener("click", () => signOut(auth));

// Auth Observer
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if (user) {
    authSection.classList.add("hidden");
    appSection.classList.remove("hidden");
    userMenu.classList.remove("hidden");
    navSearchWrapper.classList.remove("hidden");

    const avatarUrl = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || "NP")}&background=10b981&color=fff`;
    document.getElementById("currentUserAvatar").src = avatarUrl;
    document.getElementById("profileAvatarPreview").src = avatarUrl;
    document.getElementById("profileEmailDisplay").textContent = user.email;
    document.getElementById("editName").value = user.displayName || "";

    const myRef = doc(db, "users", user.uid);
    const mySnap = await getDoc(myRef);
    if (!mySnap.exists()) {
      await setDoc(myRef, {
        uid: user.uid,
        name: user.displayName || "Fayyadamaa",
        email: user.email,
        photoURL: avatarUrl,
        bio: "Nagaa fi jaalala Nesru Peace irratti!",
        friends: [],
        sentRequests: [],
        receivedRequests: [],
        socialLinks: {},
        dmPrivacy: "everyone",
        createdAt: serverTimestamp()
      });
    }

    initVaultEntries();
    listenToUsers();
    listenToPosts();
    listenToSpaces();
    listenToNotifications();
    listenToChatThreads();
  } else {
    authSection.classList.remove("hidden");
    appSection.classList.add("hidden");
    userMenu.classList.add("hidden");
    navSearchWrapper.classList.add("hidden");
  }
});

// =====================================================================
// GLOBAL SEARCH ENGINE (Posts, Users, Tags, Groups/Channels)
// =====================================================================
globalSearchInput.addEventListener("input", () => {
  const q = globalSearchInput.value.trim().toLowerCase();
  if (!q) {
    clearSearchBtn.classList.add("hidden");
    searchResultsBox.classList.add("hidden");
    return;
  }
  clearSearchBtn.classList.remove("hidden");
  searchResultsBox.classList.remove("hidden");
  renderGlobalSearchResults(q);
});

clearSearchBtn.addEventListener("click", () => {
  globalSearchInput.value = "";
  clearSearchBtn.classList.add("hidden");
  searchResultsBox.classList.add("hidden");
});

closeSearchBoxBtn.addEventListener("click", () => {
  searchResultsBox.classList.add("hidden");
});

function renderGlobalSearchResults(q) {
  const matchedUsers = Object.values(allUsersMap).filter(
    (u) =>
      (u.name || "").toLowerCase().includes(q) ||
      (u.bio || "").toLowerCase().includes(q)
  );

  const matchedPosts = allPostsCache.filter(
    (p) =>
      (p.text || "").toLowerCase().includes(q) ||
      (p.authorName || "").toLowerCase().includes(q) ||
      (p.category || "").toLowerCase().includes(q) ||
      (p.tags || []).some((t) => t.toLowerCase().includes(q))
  );

  const matchedSpaces = allSpacesCache.filter(
    (s) =>
      (s.name || "").toLowerCase().includes(q) ||
      (s.description || "").toLowerCase().includes(q)
  );

  if (matchedUsers.length === 0 && matchedPosts.length === 0 && matchedSpaces.length === 0) {
    searchResultsContent.innerHTML = `<p class="muted" style="text-align:center;padding:1rem;">"${escapeHTML(q)}" irratti wanti argame hin jiru.</p>`;
    return;
  }

  let html = "";

  if (matchedUsers.length > 0) {
    html += `<h4 style="margin-bottom:0.45rem;color:var(--info);">👤 Namoota (${matchedUsers.length})</h4>`;
    html += matchedUsers.slice(0, 5).map((u) => {
      const av = u.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || "U")}&background=10b981&color=fff`;
      return `
        <div class="person-row">
          <div class="person-meta" onclick="openUserProfile('${u.id}')">
            <img src="${av}" class="avatar-sm" alt="Avatar" />
            <div>
              <div class="author-name">${escapeHTML(u.name || "Fayyadamaa")}</div>
              <div class="muted">${escapeHTML(u.bio || "")}</div>
            </div>
          </div>
          <div class="person-actions">
            ${u.id !== currentUser?.uid ? `<button class="btn btn-primary" style="padding:0.32rem 0.7rem;font-size:0.78rem;" onclick="openDirectChatWith('${u.id}')">💬 Ergaa Ergi</button>` : ""}
          </div>
        </div>
      `;
    }).join("");
  }

  if (matchedSpaces.length > 0) {
    html += `<h4 style="margin:0.75rem 0 0.45rem;color:var(--accent);">🌐 Groups & Channels (${matchedSpaces.length})</h4>`;
    html += matchedSpaces.slice(0, 4).map((s) => `
      <div class="person-row">
        <div>
          <strong>${s.type === "channel" ? "📢" : "👥"} ${escapeHTML(s.name)}</strong>
          <div class="muted">${escapeHTML(s.description)}</div>
        </div>
        <button class="btn btn-secondary" onclick="document.getElementById('spacesBtn').click()">Bani</button>
      </div>
    `).join("");
  }

  if (matchedPosts.length > 0) {
    html += `<h4 style="margin:0.75rem 0 0.45rem;color:var(--accent);">📝 Postiiwwan (${matchedPosts.length})</h4>`;
    html += matchedPosts.slice(0, 6).map((p) => `
      <div class="mini-post">
        <div style="display:flex;justify-content:space-between;margin-bottom:0.2rem;">
          <strong class="author-name" onclick="openUserProfile('${p.uid}')">${escapeHTML(p.authorName || "Fayyadamaa")}</strong>
          <span class="post-cat-badge">${escapeHTML(p.category || "Nagaa")}</span>
        </div>
        <div>${escapeHTML((p.text || "").slice(0, 140))}</div>
      </div>
    `).join("");
  }

  searchResultsContent.innerHTML = html;
}

// =====================================================================
// SETTINGS MENU & SOCIAL MEDIA LINKING (Facebook, Instagram, X)
// =====================================================================
closeSettingsBtn.addEventListener("click", () => settingsBox.classList.add("hidden"));

openProfileFromSettingsBtn.addEventListener("click", () => {
  hideAllPanels();
  profileBox.classList.remove("hidden");
  updateMyProfileStats();
});

enableBrowserNotifBtn.addEventListener("click", async () => {
  if (!("Notification" in window)) {
    showToast("Browser keessan Notification hin deeggaru.");
    return;
  }
  const perm = await Notification.requestPermission();
  showToast(perm === "granted" ? "✓ Beeksisi eeyyamameera!" : "Beeksisi hin eeyyamamne.");
});

function normalizeSocialUrl(platform, val) {
  const v = (val || "").trim();
  if (!v) return "";
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  const cleanHandle = v.replace(/^@/, "");
  if (platform === "facebook") return `https://facebook.com/${cleanHandle}`;
  if (platform === "instagram") return `https://instagram.com/${cleanHandle}`;
  if (platform === "x") return `https://x.com/${cleanHandle}`;
  return `https://${v}`;
}

socialLinksForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentUser) return;
  const socialLinks = {
    facebook: normalizeSocialUrl("facebook", document.getElementById("socialFacebook").value),
    instagram: normalizeSocialUrl("instagram", document.getElementById("socialInstagram").value),
    x: normalizeSocialUrl("x", document.getElementById("socialX").value),
    other: normalizeSocialUrl("other", document.getElementById("socialOther").value)
  };
  const dmPrivacy = dmPrivacySelect.value;

  try {
    await setDoc(doc(db, "users", currentUser.uid), {
      socialLinks,
      dmPrivacy
    }, { merge: true });
    showToast("✅ Qindaa'inni fi Social Media ol-kaa'amaniiru!");
  } catch (err) {
    alert("Dogoggora: " + err.message);
  }
});

function renderSocialBadgesHTML(links) {
  if (!links) return "";
  const items = [];
  if (links.facebook) items.push(`<a href="${escapeHTML(links.facebook)}" target="_blank" rel="noopener" class="social-pill fb">📘 Facebook</a>`);
  if (links.instagram) items.push(`<a href="${escapeHTML(links.instagram)}" target="_blank" rel="noopener" class="social-pill ig">📸 Instagram</a>`);
  if (links.x) items.push(`<a href="${escapeHTML(links.x)}" target="_blank" rel="noopener" class="social-pill x">𝕏 X</a>`);
  if (links.other) items.push(`<a href="${escapeHTML(links.other)}" target="_blank" rel="noopener" class="social-pill other">🔗 Link</a>`);
  return items.join("");
}

// =====================================================================
// DIRECT MESSAGES & CHAT INBOX
// =====================================================================
function getThreadId(uid1, uid2) {
  return [uid1, uid2].sort().join("_");
}

chatInboxBtn.addEventListener("click", () => {
  const wasHidden = chatBox.classList.contains("hidden");
  hideAllPanels();
  if (wasHidden) {
    chatBox.classList.remove("hidden");
    populateNewChatDropdown();
    renderChatThreads();
  }
});

closeChatBtn.addEventListener("click", () => chatBox.classList.add("hidden"));

function populateNewChatDropdown() {
  const others = Object.values(allUsersMap).filter((u) => u.id !== currentUser?.uid);
  startNewChatSelect.innerHTML = `<option value="">➕ Nama haaraa waliin haasa'i...</option>` +
    others.map((u) => `<option value="${u.id}">${escapeHTML(u.name || "Fayyadamaa")}</option>`).join("");
}

startNewChatSelect.addEventListener("change", () => {
  const peerUid = startNewChatSelect.value;
  if (peerUid) {
    openDirectChatWith(peerUid);
    startNewChatSelect.value = "";
  }
});

window.openDirectChatWith = function(peerUid) {
  if (!peerUid || peerUid === currentUser?.uid) return;
  const peer = allUsersMap[peerUid];
  if (peer?.dmPrivacy === "friends" && !(currentUserDoc.friends || []).includes(peerUid)) {
    alert("Fayyadamaan kun hiriyoota isaa qofarraa ergaa dhuunfaa (DM) fudhata. Dura Add Friend godhaa.");
    return;
  }

  hideAllPanels();
  userInspectorModal.classList.add("hidden");
  searchResultsBox.classList.add("hidden");
  chatBox.classList.remove("hidden");
  populateNewChatDropdown();

  activeChatPeerUid = peerUid;
  const peerName = peer?.name || "Fayyadamaa";
  const peerAvatar = peer?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(peerName)}&background=10b981&color=fff`;

  activeChatHeader.innerHTML = `
    <div style="display:flex;align-items:center;gap:0.55rem;cursor:pointer;" onclick="openUserProfile('${peerUid}')">
      <img src="${peerAvatar}" class="avatar-sm" alt="Avatar" />
      <div>
        <strong>${escapeHTML(peerName)}</strong>
        <div class="post-time">Ergaa Dhuunfaa (Direct Message)</div>
      </div>
    </div>
    <button class="btn btn-ghost-sm" onclick="openUserProfile('${peerUid}')">👤 Profaayilii</button>
  `;

  dmSendForm.classList.remove("hidden");
  renderChatThreads();

  const threadId = getThreadId(currentUser.uid, peerUid);
  updateDoc(doc(db, "chats", threadId), {
    [`unread_${currentUser.uid}`]: false
  }).catch(() => {});

  if (unsubscribeDmMessages) unsubscribeDmMessages();
  const q = query(collection(db, "chats", threadId, "messages"), orderBy("createdAt", "asc"));
  unsubscribeDmMessages = onSnapshot(q, (snap) => {
    const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (msgs.length === 0) {
      dmMessagesContainer.innerHTML = `<p class="muted" style="text-align:center;margin-top:2rem;">Nagaa gaafadhaa! Ergaa jalqabaa barreessaa.</p>`;
      return;
    }
    dmMessagesContainer.innerHTML = msgs.map((m) => {
      const isMine = m.senderUid === currentUser.uid;
      const t = m.createdAt?.toDate ? m.createdAt.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Amma";
      return `
        <div class="dm-bubble ${isMine ? "mine" : "theirs"}">
          <div>${escapeHTML(m.text)}</div>
          <div class="dm-time">${t}</div>
        </div>
      `;
    }).join("");
    dmMessagesContainer.scrollTop = dmMessagesContainer.scrollHeight;
  });
};

dmSendForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!activeChatPeerUid || !currentUser) return;
  const text = dmInput.value.trim();
  if (!text) return;

  dmInput.value = "";
  const peerUid = activeChatPeerUid;
  const threadId = getThreadId(currentUser.uid, peerUid);

  try {
    await setDoc(doc(db, "chats", threadId), {
      participants: [currentUser.uid, peerUid],
      lastMessage: text,
      lastSenderUid: currentUser.uid,
      updatedAt: serverTimestamp(),
      [`unread_${peerUid}`]: true,
      [`unread_${currentUser.uid}`]: false
    }, { merge: true });

    await addDoc(collection(db, "chats", threadId, "messages"), {
      senderUid: currentUser.uid,
      senderName: currentUser.displayName || "Fayyadamaa",
      text,
      createdAt: serverTimestamp()
    });

    pushNotification(peerUid, `💬 ${currentUser.displayName || "Fayyadamaa"} ergaa dhuunfaa (DM) isiniif ergeera: "${text.slice(0, 35)}"`);
  } catch (err) {
    alert("Ergaan hin ergamne: " + err.message);
  }
});

function listenToChatThreads() {
  const q = query(collection(db, "chats"), orderBy("updatedAt", "desc"));
  onSnapshot(q, (snap) => {
    allChatsCache = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((c) => c.participants?.includes(currentUser?.uid));

    const unreadCount = allChatsCache.filter((c) => c[`unread_${currentUser?.uid}`] === true).length;
    const chatBadge = document.getElementById("chatUnreadBadge");
    if (unreadCount > 0) {
      chatBadge.textContent = unreadCount;
      chatBadge.classList.remove("hidden");
    } else {
      chatBadge.classList.add("hidden");
    }

    if (!chatBox.classList.contains("hidden")) {
      renderChatThreads();
    }
  });
}

function renderChatThreads() {
  if (allChatsCache.length === 0) {
    chatThreadsList.innerHTML = `<p class="muted" style="font-size:0.8rem;padding:0.5rem;">Mariin jalqabame hin jiru. Nama gubbaa irraa filadhaa.</p>`;
    return;
  }

  chatThreadsList.innerHTML = allChatsCache.map((c) => {
    const peerUid = c.participants.find((id) => id !== currentUser?.uid);
    const peer = allUsersMap[peerUid] || {};
    const peerName = peer.name || "Fayyadamaa";
    const peerAvatar = peer.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(peerName)}&background=10b981&color=fff`;
    const isUnread = c[`unread_${currentUser?.uid}`] === true;
    const isActive = activeChatPeerUid === peerUid;

    return `
      <div class="thread-item ${isActive ? "active" : ""} ${isUnread ? "unread" : ""}" onclick="openDirectChatWith('${peerUid}')">
        <img src="${peerAvatar}" class="avatar-sm" alt="Avatar" />
        <div style="overflow:hidden;flex:1;">
          <div style="font-weight:600;font-size:0.85rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHTML(peerName)}</div>
          <div class="muted" style="font-size:0.76rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHTML(c.lastMessage || "")}</div>
        </div>
      </div>
    `;
  }).join("");
}

// =====================================================================
// NOTIFICATIONS
// =====================================================================
function pushNotification(recipientUid, message, type = "info") {
  if (!recipientUid || recipientUid === currentUser?.uid) return Promise.resolve();
  return addDoc(collection(db, "notifications"), {
    recipientUid,
    actorUid: currentUser.uid,
    actorName: currentUser.displayName || "Fayyadamaa",
    message,
    type,
    read: false,
    createdAt: serverTimestamp()
  }).catch((e) => console.error("Notification error:", e));
}

function triggerLocalBrowserAlert(title, body) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body, icon: "icons/icon-192.png" });
  }
}

function listenToNotifications() {
  let initialLoad = true;
  const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
  onSnapshot(q, (snapshot) => {
    const mine = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((n) => n.recipientUid === currentUser?.uid);

    if (!initialLoad) {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          if (data.recipientUid === currentUser?.uid && !data.read) {
            triggerLocalBrowserAlert("Nesru Peace", data.message);
          }
        }
      });
    }
    initialLoad = false;

    allNotifsCache = mine;
    const unreadCount = mine.filter((n) => !n.read).length;
    const notifBadge = document.getElementById("notifBadge");
    if (unreadCount > 0) {
      notifBadge.textContent = unreadCount;
      notifBadge.classList.remove("hidden");
    } else {
      notifBadge.classList.add("hidden");
    }

    if (!notifBox.classList.contains("hidden")) {
      renderNotifications();
    }
  });
}

notifBtn.addEventListener("click", () => {
  const wasHidden = notifBox.classList.contains("hidden");
  hideAllPanels();
  if (wasHidden) {
    notifBox.classList.remove("hidden");
    renderNotifications();
  }
});
closeNotifBtn.addEventListener("click", () => notifBox.classList.add("hidden"));

markAllReadBtn.addEventListener("click", () => {
  const unread = allNotifsCache.filter((n) => !n.read);
  Promise.all(unread.map((n) => updateDoc(doc(db, "notifications", n.id), { read: true })));
});

function renderNotifications() {
  if (allNotifsCache.length === 0) {
    notifListContainer.innerHTML = `<p class="muted" style="text-align:center;padding:1rem;">Beeksisi haaraa hin jiru.</p>`;
    return;
  }

  notifListContainer.innerHTML = allNotifsCache.map((n) => {
    const t = n.createdAt?.toDate ? n.createdAt.toDate().toLocaleString() : "Amma";
    return `
      <div class="notif-item ${n.read ? "" : "unread"}">
        <div>
          <div style="font-size:0.9rem;">${escapeHTML(n.message)}</div>
          <div class="post-time">${t}</div>
        </div>
        ${!n.read ? `<button class="btn btn-ghost-sm mark-one-read" data-id="${n.id}">Dubbifame</button>` : `<span class="muted">✓</span>`}
      </div>
    `;
  }).join("");

  notifListContainer.querySelectorAll(".mark-one-read").forEach((btn) => {
    btn.addEventListener("click", () => {
      updateDoc(doc(db, "notifications", btn.dataset.id), { read: true });
    });
  });
}

// =====================================================================
// INSIGHTS / ANALYTICS
// =====================================================================
closeInsightsBtn.addEventListener("click", () => insightsBox.classList.add("hidden"));

function renderInsights() {
  const totalPosts = allPostsCache.length;
  const myPosts = allPostsCache.filter((p) => p.uid === currentUser?.uid);
  const myLikesReceived = myPosts.reduce((sum, p) => sum + (p.likes?.length || 0), 0);
  const myCommentsReceived = myPosts.reduce((sum, p) => sum + (p.comments?.length || 0), 0);
  const friendsCount = currentUserDoc.friends?.length || 0;
  const joinedSpacesCount = allSpacesCache.filter((s) => s.members?.includes(currentUser?.uid)).length;

  const topPosts = [...myPosts]
    .sort((a, b) => ((b.likes?.length || 0) + (b.comments?.length || 0)) - ((a.likes?.length || 0) + (a.comments?.length || 0)))
    .slice(0, 4);

  const maxEngagement = Math.max(
    1,
    ...topPosts.map((p) => (p.likes?.length || 0) + (p.comments?.length || 0))
  );

  insightsContent.innerHTML = `
    <div class="insights-grid">
      <div class="metric-box">
        <div class="metric-val">${myPosts.length}</div>
        <div class="metric-lbl">Postii Koo</div>
      </div>
      <div class="metric-box">
        <div class="metric-val">${myLikesReceived}</div>
        <div class="metric-lbl">Like Argadhe</div>
      </div>
      <div class="metric-box">
        <div class="metric-val">${myCommentsReceived}</div>
        <div class="metric-lbl">Yaada (Comments)</div>
      </div>
      <div class="metric-box">
        <div class="metric-val">${friendsCount}</div>
        <div class="metric-lbl">Hiriyoota Koo</div>
      </div>
      <div class="metric-box">
        <div class="metric-val">${joinedSpacesCount}</div>
        <div class="metric-lbl">Groups & Channels</div>
      </div>
      <div class="metric-box">
        <div class="metric-val">${vaultEntries.length}</div>
        <div class="metric-lbl">Vault Kuufaman</div>
      </div>
      <div class="metric-box">
        <div class="metric-val">${totalPosts}</div>
        <div class="metric-lbl">Walii Gala Postii</div>
      </div>
    </div>

    <h4 style="margin-bottom:0.65rem;color:var(--info);">📈 Sochii Postii Keessanii (Engagement Chart)</h4>
    ${
      topPosts.length === 0
        ? `<p class="muted">Hanga ammaatti postii maxxansitanii yaada/like argattan hin jiru.</p>`
        : topPosts.map((p) => {
            const eng = (p.likes?.length || 0) + (p.comments?.length || 0);
            const pct = Math.round((eng / maxEngagement) * 100);
            const label = (p.text || "Suuraa Postii").slice(0, 32);
            return `
              <div class="bar-row">
                <div class="bar-label">
                  <span>${escapeHTML(label)}</span>
                  <span>❤️ ${p.likes?.length || 0} • 💬 ${p.comments?.length || 0}</span>
                </div>
                <div class="bar-track">
                  <div class="bar-fill" style="width:${pct}%"></div>
                </div>
              </div>
            `;
          }).join("")
    }
  `;
}

// =====================================================================
// GROUPS & CHANNELS
// =====================================================================
spacesBtn.addEventListener("click", () => {
  const wasHidden = spacesBox.classList.contains("hidden");
  hideAllPanels();
  if (wasHidden) {
    spacesBox.classList.remove("hidden");
    renderSpacesList();
  }
});
closeSpacesBtn.addEventListener("click", () => spacesBox.classList.add("hidden"));

document.querySelectorAll(".space-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".space-tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    currentSpaceTab = tab.dataset.spacetab;
    renderSpacesList();
  });
});

createSpaceForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentUser) return;
  const type = document.getElementById("spaceType").value;
  const name = document.getElementById("spaceName").value.trim();
  const description = document.getElementById("spaceDesc").value.trim();
  if (!name || !description) return;

  document.getElementById("spaceName").value = "";
  document.getElementById("spaceDesc").value = "";

  try {
    await addDoc(collection(db, "spaces"), {
      type,
      name,
      description,
      ownerUid: currentUser.uid,
      ownerName: currentUser.displayName || "Fayyadamaa",
      members: [currentUser.uid],
      createdAt: serverTimestamp()
    });
    showToast(`✅ ${type === "channel" ? "Channel" : "Group"} "${name}" uumameera!`);
  } catch (err) {
    alert("Dogoggora: " + err.message);
  }
});

function listenToSpaces() {
  const q = query(collection(db, "spaces"), orderBy("createdAt", "desc"));
  onSnapshot(q, (snapshot) => {
    allSpacesCache = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (!spacesBox.classList.contains("hidden")) {
      renderSpacesList();
    }
  });
}

function renderSpacesList() {
  const list = allSpacesCache.filter((s) => currentSpaceTab === "all" || s.type === currentSpaceTab);
  if (list.length === 0) {
    spacesListContainer.innerHTML = `<p class="muted" style="text-align:center;padding:1rem;">Group ykn Channel uumame hin jiru. Kan jalqabaa uumaa!</p>`;
    return;
  }

  spacesListContainer.innerHTML = list.map((s) => {
    const isMember = s.members?.includes(currentUser?.uid);
    const isOwner = s.ownerUid === currentUser?.uid;
    const badgeCls = s.type === "channel" ? "pill-channel" : "pill-group";
    const typeLabel = s.type === "channel" ? "📢 Channel" : "👥 Group";

    return `
      <div class="space-card">
        <div style="flex:1;min-width:220px;">
          <div style="display:flex;align-items:center;gap:0.45rem;margin-bottom:0.25rem;">
            <span class="space-pill ${badgeCls}">${typeLabel}</span>
            <strong>${escapeHTML(s.name)}</strong>
          </div>
          <div class="muted">${escapeHTML(s.description)}</div>
          <div class="post-time">Abbaa: ${escapeHTML(s.ownerName || "Fayyadamaa")} • Miseensota: ${s.members?.length || 0}</div>
        </div>
        <div class="person-actions">
          ${
            !isMember
              ? `<button class="btn btn-primary join-space-btn" data-id="${s.id}">${s.type === "channel" ? "Subscribe" : "Join"}</button>`
              : `<button class="btn btn-secondary open-space-btn" data-id="${s.id}">Bani (Open)</button>
                 ${!isOwner ? `<button class="btn btn-danger-sm leave-space-btn" data-id="${s.id}">Ba'i</button>` : ""}`
          }
        </div>
      </div>
    `;
  }).join("");

  spacesListContainer.querySelectorAll(".join-space-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const space = allSpacesCache.find((x) => x.id === btn.dataset.id);
      updateDoc(doc(db, "spaces", btn.dataset.id), {
        members: arrayUnion(currentUser.uid)
      });
      if (space?.ownerUid) {
        pushNotification(space.ownerUid, `${currentUser.displayName || "Fayyadamaa"} ${space.name} (${space.type})tti makameera.`);
      }
    });
  });

  spacesListContainer.querySelectorAll(".leave-space-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      updateDoc(doc(db, "spaces", btn.dataset.id), {
        members: arrayRemove(currentUser.uid)
      });
      if (activeSpaceId === btn.dataset.id) {
        activeSpaceRoom.classList.add("hidden");
      }
    });
  });

  spacesListContainer.querySelectorAll(".open-space-btn").forEach((btn) => {
    btn.addEventListener("click", () => openSpaceRoom(btn.dataset.id));
  });
}

function openSpaceRoom(spaceId) {
  const space = allSpacesCache.find((s) => s.id === spaceId);
  if (!space) return;
  activeSpaceId = spaceId;
  activeSpaceRoom.classList.remove("hidden");

  document.getElementById("roomTitle").textContent = `${space.type === "channel" ? "📢" : "👥"} ${space.name}`;
  document.getElementById("roomMeta").textContent = `${space.description} • Miseensota: ${space.members?.length || 0}`;

  const canPost = space.type === "group" || space.ownerUid === currentUser?.uid;
  const inputEl = document.getElementById("roomPostInput");
  const submitBtn = roomPostForm.querySelector("button[type='submit']");
  const noteEl = document.getElementById("roomPermissionNote");

  inputEl.disabled = !canPost;
  submitBtn.disabled = !canPost;
  noteEl.textContent = canPost
    ? (space.type === "group" ? "Group kana keessatti miseensonni hundi ergaa dabarsuu ni danda'u." : "Channel kana keessatti akka abbaa channelitti maxxansuu ni dandeessa.")
    : "Channel kana keessatti abbaa channel qofatu maxxansuu danda'a (ati ni dubbista).";

  if (unsubscribeRoomPosts) unsubscribeRoomPosts();
  const q = query(collection(db, "spaces", spaceId, "messages"), orderBy("createdAt", "asc"));
  unsubscribeRoomPosts = onSnapshot(q, (snap) => {
    const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (msgs.length === 0) {
      roomPostsContainer.innerHTML = `<p class="muted" style="text-align:center;">Ergaan jalqabaa hin jiru.</p>`;
      return;
    }
    roomPostsContainer.innerHTML = msgs.map((m) => `
      <div class="room-msg">
        <div style="display:flex;justify-content:space-between;margin-bottom:0.2rem;">
          <strong style="color:var(--accent);">${escapeHTML(m.authorName || "Fayyadamaa")}</strong>
          <span class="post-time">${m.createdAt?.toDate ? m.createdAt.toDate().toLocaleTimeString() : "Amma"}</span>
        </div>
        <div>${escapeHTML(m.text)}</div>
      </div>
    `).join("");
    roomPostsContainer.scrollTop = roomPostsContainer.scrollHeight;
  });
}

closeRoomBtn.addEventListener("click", () => {
  activeSpaceId = null;
  activeSpaceRoom.classList.add("hidden");
  if (unsubscribeRoomPosts) unsubscribeRoomPosts();
});

roomPostForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!activeSpaceId || !currentUser) return;
  const space = allSpacesCache.find((s) => s.id === activeSpaceId);
  if (!space) return;
  if (space.type === "channel" && space.ownerUid !== currentUser.uid) {
    alert("Channel keessatti abbaa channel qofatu maxxansa.");
    return;
  }

  const inputEl = document.getElementById("roomPostInput");
  const text = inputEl.value.trim();
  if (!text) return;

  inputEl.value = "";

  addDoc(collection(db, "spaces", activeSpaceId, "messages"), {
    uid: currentUser.uid,
    authorName: currentUser.displayName || "Fayyadamaa",
    text,
    createdAt: serverTimestamp()
  });

  (space.members || []).forEach((memberUid) => {
    if (memberUid !== currentUser.uid) {
      pushNotification(memberUid, `${currentUser.displayName || "Fayyadamaa"} ${space.name} keessatti maxxanseera.`);
    }
  });
});

// =====================================================================
// USERS, FRIENDS & PROFILE INSPECTOR
// =====================================================================
function listenToUsers() {
  onSnapshot(collection(db, "users"), (snapshot) => {
    allUsersMap = {};
    snapshot.forEach((d) => {
      allUsersMap[d.id] = { id: d.id, ...d.data() };
    });

    if (currentUser && allUsersMap[currentUser.uid]) {
      currentUserDoc = allUsersMap[currentUser.uid];
      document.getElementById("editBio").value = currentUserDoc.bio || "";
      document.getElementById("mySocialBadges").innerHTML = renderSocialBadgesHTML(currentUserDoc.socialLinks);
      updateFriendBadges();
      updateMyProfileStats();
    }

    if (!peopleBox.classList.contains("hidden")) renderPeopleDirectory();
    if (!chatBox.classList.contains("hidden")) {
      populateNewChatDropdown();
      renderChatThreads();
    }
    if (!userInspectorModal.classList.contains("hidden") && inspectedUserId) renderUserInspector(inspectedUserId);
  });
}

function updateFriendBadges() {
  const reqCount = currentUserDoc.receivedRequests?.length || 0;
  const friendsCount = currentUserDoc.friends?.length || 0;
  const pendingBadge = document.getElementById("pendingBadge");
  if (reqCount > 0) {
    pendingBadge.textContent = reqCount;
    pendingBadge.classList.remove("hidden");
  } else {
    pendingBadge.classList.add("hidden");
  }
  document.getElementById("reqCountTab").textContent = reqCount;
  document.getElementById("friendsCountTab").textContent = friendsCount;
}

function updateMyProfileStats() {
  const friendsCount = currentUserDoc.friends?.length || 0;
  const myPostsCount = allPostsCache.filter((p) => p.uid === currentUser?.uid).length;
  document.getElementById("myProfileStats").innerHTML = `
    <span>👥 Hiriyoota: ${friendsCount}</span>
    <span>📝 Postii: ${myPostsCount}</span>
  `;
}

closeProfileBtn.addEventListener("click", () => profileBox.classList.add("hidden"));

profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentUser) return;
  const newName = document.getElementById("editName").value.trim();
  const newBio = document.getElementById("editBio").value.trim();
  const avatarUrl = currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(newName)}&background=10b981&color=fff`;

  try {
    await updateProfile(currentUser, { displayName: newName, photoURL: avatarUrl });
    await setDoc(doc(db, "users", currentUser.uid), {
      name: newName,
      bio: newBio,
      photoURL: avatarUrl
    }, { merge: true });
    profileBox.classList.add("hidden");
    showToast("✅ Profaayiliin haaromfameera!");
  } catch (err) {
    alert("Dogoggora: " + err.message);
  }
});

peopleBtn.addEventListener("click", () => {
  const wasHidden = peopleBox.classList.contains("hidden");
  hideAllPanels();
  if (wasHidden) {
    peopleBox.classList.remove("hidden");
    renderPeopleDirectory();
  }
});
closePeopleBtn.addEventListener("click", () => peopleBox.classList.add("hidden"));

document.querySelectorAll(".sub-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".sub-tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    currentSubTab = tab.dataset.subtab;
    renderPeopleDirectory();
  });
});

function getFriendshipStatus(targetUid) {
  if (targetUid === currentUser?.uid) return "self";
  if (currentUserDoc.friends?.includes(targetUid)) return "friends";
  if (currentUserDoc.sentRequests?.includes(targetUid)) return "sent";
  if (currentUserDoc.receivedRequests?.includes(targetUid)) return "received";
  return "none";
}

function renderFriendshipButton(targetUid) {
  const status = getFriendshipStatus(targetUid);
  if (status === "self") return `<span class="muted">Profaayilii Koo</span>`;
  const msgBtn = `<button class="btn btn-primary" style="padding:0.35rem 0.72rem;font-size:0.78rem;" onclick="openDirectChatWith('${targetUid}')">💬 Ergaa (DM)</button>`;
  if (status === "friends") {
    return `${msgBtn} <button class="btn btn-danger-sm unfriend-btn" data-uid="${targetUid}">✕ Dhiisi</button>`;
  }
  if (status === "sent") {
    return `${msgBtn} <button class="btn btn-ghost-sm cancel-req-btn" data-uid="${targetUid}">⏳ Ergameera</button>`;
  }
  if (status === "received") {
    return `
      <button class="btn btn-primary accept-req-btn" data-uid="${targetUid}">✓ Eeyyami</button>
      <button class="btn btn-danger-sm decline-req-btn" data-uid="${targetUid}">✕ Didi</button>
    `;
  }
  return `${msgBtn} <button class="btn btn-secondary add-friend-btn" data-uid="${targetUid}">➕ Add Friend</button>`;
}

function renderPeopleDirectory() {
  const allOthers = Object.values(allUsersMap).filter((u) => u.id !== currentUser?.uid);
  let list = [];
  if (currentSubTab === "discover") list = allOthers;
  else if (currentSubTab === "requests") list = (currentUserDoc.receivedRequests || []).map((id) => allUsersMap[id]).filter(Boolean);
  else if (currentSubTab === "friends") list = (currentUserDoc.friends || []).map((id) => allUsersMap[id]).filter(Boolean);

  if (list.length === 0) {
    peopleListContainer.innerHTML = `<p class="muted" style="text-align:center;padding:1rem;">Namoonni kutaalee kana jalatti mul'atan hin jiran.</p>`;
    return;
  }

  peopleListContainer.innerHTML = list.map((person) => {
    const avatar = person.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name || "U")}&background=10b981&color=fff`;
    const fCount = person.friends?.length || 0;
    return `
      <div class="person-row">
        <div class="person-meta open-profile-trigger" data-uid="${person.id}">
          <img src="${avatar}" alt="Avatar" class="avatar" />
          <div>
            <div class="author-name">${escapeHTML(person.name || "Fayyadamaa")}</div>
            <div class="muted">${escapeHTML(person.bio || "Nagaa Nesru Peace irratti!")} • ${fCount} Hiriyoota</div>
          </div>
        </div>
        <div class="person-actions">${renderFriendshipButton(person.id)}</div>
      </div>
    `;
  }).join("");

  attachFriendshipEvents(peopleListContainer);
}

window.openUserProfile = function(uid) {
  if (!uid) return;
  inspectedUserId = uid;
  userInspectorModal.classList.remove("hidden");
  renderUserInspector(uid);
};

closeInspectorBtn.addEventListener("click", () => {
  inspectedUserId = null;
  userInspectorModal.classList.add("hidden");
});

userInspectorModal.addEventListener("click", (e) => {
  if (e.target === userInspectorModal) {
    inspectedUserId = null;
    userInspectorModal.classList.add("hidden");
  }
});

function renderUserInspector(uid) {
  const person = allUsersMap[uid];
  if (!person) return;
  const avatar = person.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name || "U")}&background=10b981&color=fff`;
  const friendsCount = person.friends?.length || 0;
  const userPosts = allPostsCache.filter((p) => p.uid === uid);
  const socialHTML = renderSocialBadgesHTML(person.socialLinks);

  inspectorContent.innerHTML = `
    <div class="inspector-top">
      <img src="${avatar}" alt="Avatar" class="avatar-lg" />
      <div style="flex:1;">
        <h3 style="font-size:1.15rem;">${escapeHTML(person.name || "Fayyadamaa")}</h3>
        <div class="stats-row">
          <span>👥 Hiriyoota: ${friendsCount}</span>
          <span>📝 Postii: ${userPosts.length}</span>
        </div>
        <div style="margin-top:0.5rem;display:flex;gap:0.4rem;flex-wrap:wrap;">${renderFriendshipButton(uid)}</div>
      </div>
    </div>
    <div class="inspector-bio">
      <strong>Waa'ee Profaayilii (Bio):</strong><br/>
      ${escapeHTML(person.bio || "Fayyadamaa waltajjii nagaa Nesru Peace.")}
      ${socialHTML ? `<div class="social-badges-row" style="margin-top:0.65rem;">${socialHTML}</div>` : ""}
    </div>
    <div class="inspector-posts-title">Postiiwwan ${escapeHTML(person.name || "Fayyadamaa")} Maxxanse (${userPosts.length})</div>
    ${
      userPosts.length === 0
        ? `<p class="muted">Hanga ammaatti postiin maxxanfame hin jiru.</p>`
        : userPosts.map((p) => `
            <div class="mini-post">
              <div class="post-time" style="margin-bottom:0.25rem;">${p.createdAt?.toDate ? p.createdAt.toDate().toLocaleString() : "Amma"}</div>
              ${p.text ? `<div style="margin-bottom:0.4rem;">${escapeHTML(p.text)}</div>` : ""}
              ${p.image ? `<img src="${p.image}" alt="Post" style="width:100%;max-height:200px;object-fit:cover;border-radius:8px;" />` : ""}
            </div>
          `).join("")
    }
  `;

  attachFriendshipEvents(inspectorContent);
}

function attachFriendshipEvents(containerEl) {
  containerEl.querySelectorAll(".open-profile-trigger").forEach((el) => {
    el.addEventListener("click", () => openUserProfile(el.dataset.uid));
  });

  containerEl.querySelectorAll(".add-friend-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetUid = btn.dataset.uid;
      updateDoc(doc(db, "users", currentUser.uid), { sentRequests: arrayUnion(targetUid) });
      updateDoc(doc(db, "users", targetUid), { receivedRequests: arrayUnion(currentUser.uid) });
      pushNotification(targetUid, `${currentUser.displayName || "Fayyadamaa"} gaaffii hiriyummaa (Add Friend) isiniif ergeera.`);
      showToast("⏳ Gaaffiin hiriyummaa ergameera!");
    });
  });

  containerEl.querySelectorAll(".cancel-req-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetUid = btn.dataset.uid;
      updateDoc(doc(db, "users", currentUser.uid), { sentRequests: arrayRemove(targetUid) });
      updateDoc(doc(db, "users", targetUid), { receivedRequests: arrayRemove(currentUser.uid) });
    });
  });

  containerEl.querySelectorAll(".accept-req-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const requesterUid = btn.dataset.uid;
      updateDoc(doc(db, "users", currentUser.uid), {
        receivedRequests: arrayRemove(requesterUid),
        friends: arrayUnion(requesterUid)
      });
      updateDoc(doc(db, "users", requesterUid), {
        sentRequests: arrayRemove(currentUser.uid),
        friends: arrayUnion(currentUser.uid)
      });
      pushNotification(requesterUid, `${currentUser.displayName || "Fayyadamaa"} gaaffii hiriyummaa keessanii eeyyameera! Amma hiriyaadha.`);
      showToast("🤝 Hiriyummaan mirkanaa'eera!");
    });
  });

  containerEl.querySelectorAll(".decline-req-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const requesterUid = btn.dataset.uid;
      updateDoc(doc(db, "users", currentUser.uid), { receivedRequests: arrayRemove(requesterUid) });
      updateDoc(doc(db, "users", requesterUid), { sentRequests: arrayRemove(currentUser.uid) });
    });
  });

  containerEl.querySelectorAll(".unfriend-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetUid = btn.dataset.uid;
      if (!confirm("Hiriyummaa kana dhaabuu barbaadduu?")) return;
      updateDoc(doc(db, "users", currentUser.uid), { friends: arrayRemove(targetUid) });
      updateDoc(doc(db, "users", targetUid), { friends: arrayRemove(currentUser.uid) });
    });
  });
}

// =====================================================================
// POSTS, CATEGORIES, TAGS & SOCIAL SHARING (Facebook, Instagram, X)
// =====================================================================
function parseTags(rawInput, bodyText) {
  const set = new Set();
  (rawInput || "")
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .forEach((t) => set.add(t.startsWith("#") ? t.toLowerCase() : `#${t.toLowerCase()}`));

  const inlineMatches = (bodyText || "").match(/#[a-zA-Z0-9_À-ɏ]+/g) || [];
  inlineMatches.forEach((t) => set.add(t.toLowerCase()));
  return Array.from(set).slice(0, 8);
}

postImageInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const maxWidth = 720;
      const scale = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      selectedImageBase64 = canvas.toDataURL("image/jpeg", 0.68);
      imagePreview.src = selectedImageBase64;
      imagePreviewContainer.classList.remove("hidden");
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

removeImageBtn.addEventListener("click", () => {
  selectedImageBase64 = null;
  postImageInput.value = "";
  imagePreviewContainer.classList.add("hidden");
});

postContent.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    publishPostBtn.click();
  }
});

publishPostBtn.addEventListener("click", async () => {
  const text = postContent.value.trim();
  const imageData = selectedImageBase64;
  if (!text && !imageData) return;
  if (!currentUser) return;

  const category = postCategory.value || "Nagaa";
  const tags = parseTags(postTagsInput.value, text);

  postContent.value = "";
  postTagsInput.value = "";
  selectedImageBase64 = null;
  postImageInput.value = "";
  imagePreviewContainer.classList.add("hidden");

  const tempId = "temp_" + Date.now();
  const authorName = currentUser.displayName || "Fayyadamaa";
  const authorAvatar = currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=10b981&color=fff`;

  optimisticPosts.unshift({
    id: tempId,
    uid: currentUser.uid,
    authorName,
    authorAvatar,
    text,
    category,
    tags,
    image: imageData || null,
    likes: [],
    comments: [],
    isPending: true,
    createdAt: null
  });
  renderPosts(allPostsCache);

  try {
    await addDoc(collection(db, "posts"), {
      uid: currentUser.uid,
      authorName,
      authorAvatar,
      text,
      category,
      tags,
      image: imageData || null,
      likes: [],
      comments: [],
      createdAt: serverTimestamp()
    });

    optimisticPosts = optimisticPosts.filter((p) => p.id !== tempId);
    showToast("✅ Postiin keessan maxxanfameera!");

    Promise.all(
      (currentUserDoc.friends || []).map((friendUid) =>
        pushNotification(friendUid, `${authorName} postii haaraa (${category}) maxxanseera.`)
      )
    );
  } catch (err) {
    optimisticPosts = optimisticPosts.filter((p) => p.id !== tempId);
    renderPosts(allPostsCache);
    alert("Postiin hin ergamne: " + err.message);
  }
});

document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderPosts(allPostsCache);
  });
});

function updateCategoryChipsUI() {
  document.querySelectorAll(".cat-chip").forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.cat === currentCategory);
  });
  if (currentTagFilter) {
    activeTagBadge.textContent = `🏷️ ${currentTagFilter} ✕`;
    activeTagBadge.classList.remove("hidden");
  } else {
    activeTagBadge.classList.add("hidden");
  }
}

document.querySelectorAll(".cat-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    currentCategory = chip.dataset.cat;
    updateCategoryChipsUI();
    renderPosts(allPostsCache);
  });
});

activeTagBadge.addEventListener("click", () => {
  currentTagFilter = "";
  updateCategoryChipsUI();
  renderPosts(allPostsCache);
});

window.filterByTag = function(tag) {
  currentTagFilter = tag;
  updateCategoryChipsUI();
  renderPosts(allPostsCache);
};

function listenToPosts() {
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  onSnapshot(q, (snapshot) => {
    allPostsCache = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    updateMyProfileStats();
    renderPosts(allPostsCache);
    if (!userInspectorModal.classList.contains("hidden") && inspectedUserId) renderUserInspector(inspectedUserId);
    if (!insightsBox.classList.contains("hidden")) renderInsights();
  });
}

function renderPosts(posts) {
  const combinedPosts = [...optimisticPosts, ...posts];
  let filtered = combinedPosts;

  if (currentFilter === "mine") {
    filtered = filtered.filter((p) => p.uid === currentUser?.uid);
  } else if (currentFilter === "friends") {
    const fIds = currentUserDoc.friends || [];
    filtered = filtered.filter((p) => fIds.includes(p.uid) || p.uid === currentUser?.uid);
  }

  if (currentCategory !== "all") {
    filtered = filtered.filter((p) => (p.category || "Nagaa") === currentCategory);
  }

  if (currentTagFilter) {
    filtered = filtered.filter((p) => (p.tags || []).includes(currentTagFilter));
  }

  if (filtered.length === 0) {
    feedContainer.innerHTML = `<div class="card" style="text-align:center;color:var(--text-muted)">Postiin kutaalee kana jalatti mul'atu hin jiru.</div>`;
    return;
  }

  const pageUrl = encodeURIComponent(window.location.href);

  feedContainer.innerHTML = "";
  filtered.forEach((post) => {
    const liveAuthor = allUsersMap[post.uid];
    const authorName = liveAuthor?.name || post.authorName || "Fayyadamaa";
    const authorAvatar = liveAuthor?.photoURL || post.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=10b981&color=fff`;

    const isLiked = post.likes?.includes(currentUser.uid);
    const likeCount = post.likes?.length || 0;
    const comments = post.comments || [];
    const tags = post.tags || [];
    const categoryLabel = post.category || "Nagaa";
    const shareText = encodeURIComponent((post.text || "Nesru Peace irraa yaada nagaa!").slice(0, 220));
    const timeStr = post.isPending
      ? "⚡ Maxxansaa jira..."
      : (post.createdAt?.toDate ? post.createdAt.toDate().toLocaleString() : "Amma");

    const card = document.createElement("article");
    card.className = `post-card ${post.isPending ? "optimistic-pending" : ""}`;
    card.innerHTML = `
      <div class="post-header">
        <div class="post-author">
          <img src="${authorAvatar}" alt="Avatar" class="avatar open-profile-trigger" data-uid="${post.uid}" />
          <div>
            <div>
              <span class="author-name open-profile-trigger" data-uid="${post.uid}">${escapeHTML(authorName)}</span>
              <span class="post-cat-badge">${escapeHTML(categoryLabel)}</span>
            </div>
            <div class="post-time">${timeStr}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:0.38rem;flex-wrap:wrap;">
          ${post.uid !== currentUser.uid
            ? `<button class="btn btn-ghost-sm" onclick="openDirectChatWith('${post.uid}')">💬 DM</button>`
            : ""}
          ${post.uid !== currentUser.uid && !currentUserDoc.friends?.includes(post.uid) && !currentUserDoc.sentRequests?.includes(post.uid)
            ? `<button class="btn btn-secondary add-friend-btn" style="padding:0.28rem 0.65rem;font-size:0.78rem;" data-uid="${post.uid}">+ Add Friend</button>`
            : ""}
          ${post.uid === currentUser.uid && !post.isPending
            ? `<button class="btn btn-danger-sm delete-post-btn" data-id="${post.id}">Haqi</button>`
            : ""}
        </div>
      </div>
      ${post.text ? `<div class="post-body">${escapeHTML(post.text)}</div>` : ""}
      ${tags.length > 0 ? `<div class="post-tags-row">${tags.map((t) => `<button class="tag-chip" onclick="filterByTag('${escapeHTML(t)}')">${escapeHTML(t)}</button>`).join("")}</div>` : ""}
      ${post.image ? `<img src="${post.image}" alt="Post Image" class="post-image" />` : ""}
      <div class="post-footer">
        <button class="action-chip like-btn ${isLiked ? "liked" : ""}" data-id="${post.id}" ${post.isPending ? "disabled" : ""}>
          ${isLiked ? "❤️" : "🤍"} Jaalladhu (${likeCount})
        </button>
        <button class="action-chip" onclick="openUserProfile('${post.uid}')">
          👤 Profaayilii
        </button>
        <a class="action-chip" href="https://www.facebook.com/sharer/sharer.php?u=${pageUrl}&quote=${shareText}" target="_blank" rel="noopener" title="Facebook irratti qoodi">
          📘 FB
        </a>
        <a class="action-chip" href="https://twitter.com/intent/tweet?text=${shareText}&url=${pageUrl}" target="_blank" rel="noopener" title="X (Twitter) irratti qoodi">
          𝕏 X
        </a>
        <button class="action-chip ig-copy-btn" data-text="${escapeHTML(post.text || "")}" title="Instagram fi kan biroof waraabi">
          📸 IG / Copy
        </button>
      </div>
      <div class="comments-section">
        ${comments.map((c) => `
          <div class="comment-item">
            <span class="comment-author" onclick="openUserProfile('${c.uid || ""}')">${escapeHTML(c.author)}:</span>
            <span>${escapeHTML(c.text)}</span>
          </div>
        `).join("")}
        ${!post.isPending ? `
        <form class="comment-form" data-id="${post.id}">
          <input type="text" placeholder="Yaada keessan barreessaa..." required />
          <button type="submit" class="btn btn-primary" style="padding:0.45rem 0.9rem;">Ergi</button>
        </form>` : ""}
      </div>
    `;
    feedContainer.appendChild(card);
  });

  attachPostEvents();
  attachFriendshipEvents(feedContainer);
}

function attachPostEvents() {
  document.querySelectorAll(".like-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const postId = btn.dataset.id;
      const post = allPostsCache.find((p) => p.id === postId);
      if (!post) return;
      const postRef = doc(db, "posts", postId);
      const isLiked = post.likes?.includes(currentUser.uid);

      updateDoc(postRef, {
        likes: isLiked ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid)
      });

      if (!isLiked && post.uid !== currentUser.uid) {
        pushNotification(post.uid, `${currentUser.displayName || "Fayyadamaa"} postii keessan jaallateera (❤️).`);
      }
    });
  });

  document.querySelectorAll(".delete-post-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (confirm("Postii kana haquu barbaadduu?")) {
        deleteDoc(doc(db, "posts", btn.dataset.id));
      }
    });
  });

  document.querySelectorAll(".comment-form").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector("input");
      const commentText = input.value.trim();
      if (!commentText) return;

      const postId = form.dataset.id;
      const post = allPostsCache.find((p) => p.id === postId);
      const postRef = doc(db, "posts", postId);

      input.value = "";

      updateDoc(postRef, {
        comments: arrayUnion({
          uid: currentUser.uid,
          author: currentUser.displayName || "Fayyadamaa",
          text: commentText,
          createdAt: new Date().toISOString()
        })
      });

      if (post?.uid && post.uid !== currentUser.uid) {
        pushNotification(post.uid, `${currentUser.displayName || "Fayyadamaa"} postii keessan irratti yaada kenneera: "${commentText.slice(0, 40)}"`);
      }
    });
  });

  document.querySelectorAll(".ig-copy-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const textToCopy = `${btn.dataset.text}

— Nesru Peace (${window.location.href})`;
      try {
        await navigator.clipboard.writeText(textToCopy);
        showToast("📋 Instagram & Social Media irratti maxxansuuf waraabameera!");
      } catch {
        alert("Liinkiin garagalfameera!");
      }
    });
  });
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// 🧠 Firebase Config – Replace with your actual config values
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef"
};

// ✅ Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// 📦 DOM Elements
const signInBtn = document.getElementById("signInBtn");
const signOutBtn = document.getElementById("signOutBtn");
const glForm = document.getElementById("glForm");
const itemList = document.getElementById("itemList");
const totalGLDisplay = document.getElementById("totalGL");

let totalGL = 0;
let currentUserUid = null;

// 🔐 Google Sign-In
const provider = new firebase.auth.GoogleAuthProvider();

signInBtn.onclick = () => {
  auth.signInWithPopup(provider).catch((error) => {
    console.error("Sign-in error:", error);
    alert("Google Sign-in Failed");
  });
};

signOutBtn.onclick = () => {
  auth.signOut();
};

// 🔄 Auth State Change
auth.onAuthStateChanged(user => {
  if (user) {
    currentUserUid = user.uid;
    signInBtn.style.display = "none";
    signOutBtn.style.display = "inline-block";
    glForm.style.display = "flex";
    loadGLItems();
  } else {
    currentUserUid = null;
    signInBtn.style.display = "inline-block";
    signOutBtn.style.display = "none";
    glForm.style.display = "none";
    itemList.innerHTML = "";
    totalGLDisplay.textContent = "0";
  }
});

// ➕ Form Submission (Add Item)
glForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!currentUserUid) return alert("Please sign in first!");

  const item = document.getElementById("item").value.trim();
  const quantity = parseFloat(document.getElementById("quantity").value);
  const glPer100g = parseFloat(document.getElementById("glPer100g").value);

  if (!item || isNaN(quantity) || isNaN(glPer100g)) {
    alert("Please fill all fields correctly.");
    return;
  }

  const itemGL = (glPer100g * quantity) / 100;

  const newRef = db.ref(`glItems/${currentUserUid}`).push();
  newRef.set({
    item,
    quantity,
    glPer100g,
    itemGL
  });

  glForm.reset();
});

// 🔽 Load Items from Firebase
function loadGLItems() {
  db.ref(`glItems/${currentUserUid}`).on("value", (snapshot) => {
    const data = snapshot.val() || {};
    itemList.innerHTML = "";
    totalGL = 0;

    Object.keys(data).forEach(id => {
      const { item, itemGL } = data[id];
      totalGL += itemGL;

      const li = document.createElement("li");
      li.className = "list-group-item d-flex justify-content-between align-items-center";
      li.innerHTML = `
        <span>${item} — ${itemGL.toFixed(1)} GL</span>
        <button class="btn btn-sm btn-outline-danger">Remove</button>
      `;

      li.querySelector("button").onclick = () => {
        db.ref(`glItems/${currentUserUid}/${id}`).remove();
      };

      itemList.appendChild(li);
    });

    totalGLDisplay.textContent = totalGL.toFixed(1);
  });
}

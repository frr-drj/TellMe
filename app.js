const firebaseConfig = {
  apiKey: "AIzaSyC7Y_FWNpb0rB5wSNb2Xc7X2W7Sg99Z5-M",
  authDomain: "tellme-8f210.firebaseapp.com",
  projectId: "tellme-8f210",
  storageBucket: "tellme-8f210.firebasestorage.app",
  messagingSenderId: "390546456642",
  appId: "1:390546456642:web:8cdee5927bdd7e7adc6ddb",
  measurementId: "G-LV9SL7JLW3"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

const email = document.getElementById('email');
const password = document.getElementById('password');
const displayName = document.getElementById('displayName');
const photoURL = document.getElementById('photoURL');
const authSection = document.getElementById('authSection');
const chatSection = document.getElementById('chatSection');
const userName = document.getElementById('userName');
const userPhoto = document.getElementById('userPhoto');
const messageText = document.getElementById('messageText');
const messagesDiv = document.getElementById('messages');
const adminPanel = document.getElementById('adminPanel');
const adminBadge = document.getElementById('adminBadge');

let currentUser = null;
let adminEmail = "giridirghraj@gmail.com";

function register() {
  auth.createUserWithEmailAndPassword(email.value, password.value)
    .then(cred => {
      return cred.user.updateProfile({
        displayName: displayName.value,
        photoURL: photoURL.value || ''
      });
    });
}

function login() {
  auth.signInWithEmailAndPassword(email.value, password.value)
    .catch(err => alert(err.message));
}

function logout() {
  auth.signOut();
}

auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    authSection.classList.add('hidden');
    chatSection.classList.remove('hidden');
    userName.innerText = user.displayName || "Anonymous";
    userPhoto.src = user.photoURL || 'https://via.placeholder.com/40';
    if (user.email === adminEmail) {
      adminPanel.classList.remove('hidden');
      adminBadge.classList.remove('hidden');
    }
    loadMessages();
  } else {
    currentUser = null;
    authSection.classList.remove('hidden');
    chatSection.classList.add('hidden');
    adminPanel.classList.add('hidden');
  }
});

function sendMessage() {
  const text = messageText.value.trim();
  if (!text) return;

  db.collection('messages').add({
    text,
    uid: currentUser.uid,
    name: currentUser.displayName,
    photo: currentUser.photoURL,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    likes: [],
    replies: []
  });

  messageText.value = '';
}

function loadMessages() {
  db.collection('messages').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
    messagesDiv.innerHTML = '';
    snapshot.forEach(doc => {
      const msg = doc.data();
      const div = document.createElement('div');
      div.className = 'message';

      div.innerHTML = `
        <div class="meta">
          <img src="${msg.photo}" width="30" height="30"/> 
          <strong>${msg.name}</strong>
        </div>
        <div>${msg.text}</div>
        <div>
          <button class="like" onclick="likeMessage('${doc.id}')">❤️ ${msg.likes.length}</button>
          <button class="reply" onclick="replyToMessage('${doc.id}')">↩️ Reply</button>
        </div>
      `;

      messagesDiv.appendChild(div);
    });
  });
}

function likeMessage(id) {
  const docRef = db.collection('messages').doc(id);
  docRef.get().then(doc => {
    const data = doc.data();
    if (!data.likes.includes(currentUser.uid)) {
      docRef.update({
        likes: firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
      });
    }
  });
}

function replyToMessage(id) {
  const reply = prompt("Your reply:");
  if (!reply) return;
  const docRef = db.collection('messages').doc(id);
  docRef.update({
    replies: firebase.firestore.FieldValue.arrayUnion({
      uid: currentUser.uid,
      name: currentUser.displayName,
      text: reply
    })
  });
}

function clearMessages() {
  if (confirm("Are you sure you want to clear all messages?")) {
    db.collection('messages').get().then(snapshot => {
      snapshot.forEach(doc => doc.ref.delete());
    });
  }
}

// Dark mode toggle
document.getElementById('darkModeToggle').onclick = () => {
  document.body.classList.toggle('dark');
};
      

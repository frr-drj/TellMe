const firebaseConfig = {
  apiKey: "AIzaSyC7Y_FWNpb0rB5wSNb2Xc7X2W7Sg99Z5-M",
  authDomain: "tellme-8f210.firebaseapp.com",
  projectId: "tellme-8f210",
  storageBucket: "tellme-8f210.appspot.com",
  messagingSenderId: "390546456642",
  appId: "1:390546456642:web:8cdee5927bdd7e7adc6ddb",
  measurementId: "G-LV9SL7JLW3"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const chatContainer = document.getElementById('chatContainer');
const authContainer = document.getElementById('authContainer');

function toggleAuth() {
  loginForm.classList.toggle('hidden');
  registerForm.classList.toggle('hidden');
}

function register() {
  const name = document.getElementById('regName').value;
  const username = document.getElementById('regUsername').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  const photo = document.getElementById('regPhoto').files[0];

  auth.createUserWithEmailAndPassword(email, password)
    .then(async (cred) => {
      let photoURL = '';
      if (photo) {
        const snap = await storage.ref('profiles/' + cred.user.uid).put(photo);
        photoURL = await snap.ref.getDownloadURL();
      }

      await cred.user.updateProfile({
        displayName: name,
        photoURL: photoURL
      });

      await db.collection('users').doc(cred.user.uid).set({
        name,
        username,
        email,
        photoURL
      });
    });
}

function login() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  auth.signInWithEmailAndPassword(email, password).catch(err => alert(err.message));
}

function logout() {
  auth.signOut();
}

auth.onAuthStateChanged(user => {
  if (user) {
    authContainer.classList.add('hidden');
    chatContainer.classList.remove('hidden');

    document.getElementById('userPic').src = user.photoURL;
    document.getElementById('userDisplayName').textContent = user.displayName;

    db.collection('users').doc(user.uid).get().then(doc => {
      document.getElementById('userUsername').textContent = '@' + doc.data().username;
    });

    if (user.email === 'giridirghraj@gmail.com') {
      document.getElementById('adminBadge').classList.remove('hidden');
    }

    listenForMessages();
  } else {
    chatContainer.classList.add('hidden');
    authContainer.classList.remove('hidden');
  }
});

function sendMessage() {
  const text = document.getElementById('messageInput').value.trim();
  if (!text) return;

  const user = auth.currentUser;

  db.collection('messages').add({
    uid: user.uid,
    name: user.displayName,
    photo: user.photoURL,
    text: text,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    likes: [],
    replies: []
  });

  document.getElementById('messageInput').value = '';
}

function listenForMessages() {
  db.collection('messages').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = '';

    snapshot.forEach(doc => {
      const msg = doc.data();
      const div = document.createElement('div');
      div.className = 'message';

      let replyHTML = '';
      if (msg.replies) {
        replyHTML = msg.replies.map(r => `
          <div class="reply">
            <strong>${r.name}</strong>: ${r.text}
          </div>
        `).join('');
      }

      div.innerHTML = `
        <div class="meta"><img src="${msg.photo}" width="20" height="20"> <strong>${msg.name}</strong></div>
        <div>${msg.text}</div>
        ${replyHTML}
        <button onclick="replyToMessage('${doc.id}')">Reply</button>
      `;

      messagesDiv.appendChild(div);
    });
  });
}

function replyToMessage(id) {
  const reply = prompt("Enter your reply:");
  if (!reply) return;

  const user = auth.currentUser;

  db.collection('messages').doc(id).update({
    replies: firebase.firestore.FieldValue.arrayUnion({
      uid: user.uid,
      name: user.displayName,
      text: reply
    })
  });
        }
        

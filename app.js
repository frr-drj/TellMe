// Firebase config
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

// DOM elements
const usernameInput = document.getElementById('username');
const storyInput = document.getElementById('storyInput');
const addStoryButton = document.getElementById('addStoryButton');
const storyDiv = document.getElementById('story');
const wordCount = document.getElementById('wordCount');
const toggleMode = document.getElementById('toggleMode');

// Toggle dark mode
toggleMode.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

// Add story
addStoryButton.addEventListener('click', () => {
  const storyPart = storyInput.value.trim();
  const username = usernameInput.value.trim() || "Anonymous";

  if (storyPart) {
    db.collection('story').add({
      text: storyPart,
      username: username,
      likes: 0,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    }).then(() => {
      storyInput.value = '';
    }).catch(err => console.error("Error:", err));
  }
});

// Real-time listener
db.collection('story').orderBy('timestamp').onSnapshot(snapshot => {
  storyDiv.innerHTML = '';
  let totalWords = 0;

  snapshot.docs.forEach(doc => {
    const { text, username, likes } = doc.data();
    const storyId = doc.id;

    const p = document.createElement('p');
    p.textContent = `${username}: ${text}`;
    
    // Word count
    totalWords += text.split(/\s+/).length;

    // Like button
    const likeBtn = document.createElement('button');
    likeBtn.textContent = `❤️ ${likes}`;
    likeBtn.className = 'like';
    likeBtn.onclick = () => {
      db.collection('story').doc(storyId).update({
        likes: firebase.firestore.FieldValue.increment(1)
      });
    };

    // Voice button
    const speakBtn = document.createElement('button');
    speakBtn.textContent = '🔊';
    speakBtn.onclick = () => {
      const utterance = new SpeechSynthesisUtterance(`${username} says: ${text}`);
      speechSynthesis.speak(utterance);
    };

    p.appendChild(likeBtn);
    p.appendChild(speakBtn);
    storyDiv.appendChild(p);
  });

  wordCount.textContent = `Total Words: ${totalWords}`;
});
        

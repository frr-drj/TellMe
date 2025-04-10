// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7Y_FWNpb0rB5wSNb2Xc7X2W7Sg99Z5-M",
  authDomain: "tellme-8f210.firebaseapp.com",
  projectId: "tellme-8f210",
  storageBucket: "tellme-8f210.firebasestorage.app",
  messagingSenderId: "390546456642",
  appId: "1:390546456642:web:8cdee5927bdd7e7adc6ddb",
  measurementId: "G-LV9SL7JLW3"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// References to DOM elements
const storyInput = document.getElementById('storyInput');
const addStoryButton = document.getElementById('addStoryButton');
const storyDiv = document.getElementById('story');

// Function to add new story part
addStoryButton.addEventListener('click', () => {
  const storyPart = storyInput.value.trim();
  if (storyPart) {
    // Add story part to Firestore
    db.collection('story').add({
      text: storyPart,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    }).then(() => {
      storyInput.value = ''; // Clear input field
    });
  }
});

// Real-time listener to update story on all devices
db.collection('story')
  .orderBy('timestamp')
  .onSnapshot(snapshot => {
    storyDiv.innerHTML = ''; // Clear existing story

    snapshot.docs.forEach(doc => {
      const storyText = doc.data().text;
      const p = document.createElement('p');
      p.textContent = storyText;
      storyDiv.appendChild(p); // Append each new story part
    });
  });

// Firebase configuration
// Replace with your own Firebase config after creating a project
const firebaseConfig = {
  apiKey: "AIzaSyC9kcX_MnBPNAm66z7Z-RnX7v1bASJCuwI",
  authDomain: "ammar080.firebaseapp.com",
  projectId: "ammar080",
  storageBucket: "ammar080.firebasestorage.app",
  messagingSenderId: "445180355575",
  appId: "1:445180355575:web:e5a4cb1fd787fd0d6c44f2",
  measurementId: "G-G5W4ZT4YD8"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a reference to the Firestore database
const db = firebase.firestore();

// Collection reference for checklist items
const checklistCollection = db.collection('checklist');

// Function to save a checklist item
async function saveChecklistItem(itemId, isChecked) {
  try {
    await checklistCollection.doc(itemId).set({
      isChecked: isChecked,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log('Checklist item saved to Firebase');
    
    // Update localStorage as backup
    try {
      let saved = localStorage.getItem('completedPapers');
      let completedPapers = saved ? JSON.parse(saved) : {};
      completedPapers[itemId] = isChecked;
      localStorage.setItem('completedPapers', JSON.stringify(completedPapers));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
    
    return true;
  } catch (error) {
    console.error('Error saving checklist item:', error);
    throw error;
  }
}

// Function to load all checklist items
async function loadChecklistItems() {
  try {
    const snapshot = await checklistCollection.get();
    const completedPapers = {};
    
    snapshot.forEach(doc => {
      completedPapers[doc.id] = doc.data().isChecked;
    });
    
    console.log('Checklist items loaded from Firebase');
    return completedPapers;
  } catch (error) {
    console.error('Error loading checklist items:', error);
    
    // Fallback to localStorage if Firebase fails
    try {
      const saved = localStorage.getItem('completedPapers');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading from localStorage:', e);
    }
    
    return {};
  }
} 
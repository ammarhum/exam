// Checklist Synchronization Manager
// This file manages the synchronization of exam checklist items across devices

// Initialize with Firebase
let db;
let checklistCollection;
let localUserId;

// Initialize the synchronization system
function initChecklistSync() {
  // Get Firestore instance
  db = firebase.firestore();
  
  // Reference to checklist collection
  checklistCollection = db.collection('checklist-items');
  
  // Generate or retrieve a local user ID to identify this device
  localUserId = getOrCreateLocalUserId();
  
  console.log('Checklist sync initialized with user ID:', localUserId);
  
  // Set up real-time listeners for updates
  setupRealtimeListeners();
}

// Generate or retrieve a local user ID
function getOrCreateLocalUserId() {
  let userId = localStorage.getItem('checklist_user_id');
  
  if (!userId) {
    // Generate a random ID for this device
    userId = 'user_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('checklist_user_id', userId);
  }
  
  return userId;
}

// Set up real-time listeners for checklist updates
function setupRealtimeListeners() {
  checklistCollection.onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
      if (change.type === 'modified' || change.type === 'added') {
        const data = change.doc.data();
        
        // Ignore updates triggered by this device
        if (data.lastUpdatedBy !== localUserId) {
          console.log('Remote update received for:', change.doc.id);
          
          // Update UI without triggering another save
          updateCheckboxInUI(change.doc.id, data.isChecked);
        }
      }
    });
  }, error => {
    console.error('Error in real-time listener:', error);
  });
}

// Update checkbox in the UI without triggering a save
function updateCheckboxInUI(itemId, isChecked) {
  const checkboxes = document.querySelectorAll(`.paper-checkbox[data-id="${itemId}"]`);
  
  checkboxes.forEach(checkbox => {
    // Update checkbox
    checkbox.checked = isChecked;
    
    // Update parent li class
    const listItem = checkbox.closest('li');
    if (listItem) {
      if (isChecked) {
        listItem.classList.add('completed-paper');
      } else {
        listItem.classList.remove('completed-paper');
      }
    }
  });
}

// Reset all checklist items (mark all as unchecked)
async function resetAllChecklistItems() {
  try {
    const snapshot = await checklistCollection.get();
    
    // Batch all deletes for efficiency
    const batch = db.batch();
    
    snapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log('All checklist items have been reset');
    
    // Clear local storage backup
    localStorage.removeItem('completedPapers');
    
    return true;
  } catch (error) {
    console.error('Error resetting checklist items:', error);
    return false;
  }
}

// Save a checklist item state change
async function saveChecklistItem(itemId, isChecked) {
  try {
    await checklistCollection.doc(itemId).set({
      isChecked: isChecked,
      lastUpdatedBy: localUserId,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('Checklist item saved:', itemId, isChecked);
    
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
    
    // Still update localStorage even if Firebase fails
    try {
      let saved = localStorage.getItem('completedPapers');
      let completedPapers = saved ? JSON.parse(saved) : {};
      completedPapers[itemId] = isChecked;
      localStorage.setItem('completedPapers', JSON.stringify(completedPapers));
    } catch (e) {
      console.error('Error saving to localStorage fallback:', e);
    }
    
    return false;
  }
}

// Load all checklist items
async function loadChecklistItems() {
  try {
    const snapshot = await checklistCollection.get();
    const completedPapers = {};
    
    snapshot.forEach(doc => {
      completedPapers[doc.id] = doc.data().isChecked;
    });
    
    console.log('Checklist items loaded from Firebase, count:', snapshot.size);
    return completedPapers;
  } catch (error) {
    console.error('Error loading checklist items:', error);
    
    // Fallback to localStorage if Firebase fails
    try {
      const saved = localStorage.getItem('completedPapers');
      if (saved) {
        console.log('Falling back to localStorage for checklist items');
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading from localStorage:', e);
    }
    
    return {};
  }
}

// Initialize event listeners for checkboxes
function initCheckboxListeners() {
  document.addEventListener('change', event => {
    const target = event.target;
    
    // Check if this is a paper checkbox
    if (target.classList.contains('paper-checkbox')) {
      const itemId = target.getAttribute('data-id');
      const isChecked = target.checked;
      
      // Update the UI immediately
      const listItem = target.closest('li');
      if (listItem) {
        if (isChecked) {
          listItem.classList.add('completed-paper');
        } else {
          listItem.classList.remove('completed-paper');
        }
      }
      
      // Save the change to Firebase
      saveChecklistItem(itemId, isChecked);
    }
  });
}

// Export functions
window.checklistSync = {
  init: initChecklistSync,
  save: saveChecklistItem,
  load: loadChecklistItems,
  reset: resetAllChecklistItems,
  initListeners: initCheckboxListeners
}; 
// Sample interests
const interests = [
  { name: "Sports", emoji: "🏀" },
  { name: "Music", emoji: "🎵" },
  { name: "Art", emoji: "🎨" },
  { name: "Technology", emoji: "💻" },
  { name: "Science", emoji: "🔬" },
  { name: "Literature", emoji: "📚" },
  { name: "Gaming", emoji: "🎮" },
  { name: "Travel", emoji: "✈️" },
  { name: "Photography", emoji: "📸" },
  { name: "Cooking", emoji: "🍳" },
  { name: "Fitness", emoji: "🏋️‍♂️" },
  { name: "Movies", emoji: "🎬" },
  { name: "Theater", emoji: "🎭" },
  { name: "Dance", emoji: "💃" },
  { name: "Volunteering", emoji: "🤝" },
  { name: "Fashion", emoji: "👗" },
  { name: "Environment", emoji: "🌳" },
  { name: "History", emoji: "🏺" },
  { name: "Writing", emoji: "✍️" },
  { name: "Robotics", emoji: "🤖" },
  { name: "School Events", emoji: "🎉" },
  { name: "Debate", emoji: "🗣️" },
  { name: "Coding", emoji: "👨‍💻" },
  { name: "Astronomy", emoji: "🌌" },
  { name: "Meditation", emoji: "🧘" }
];

const maxSelection = 5;
let selectedInterests = new Set();

// Make selectedInterests globally accessible
window.selectedInterests = selectedInterests;

const searchInput = document.getElementById('search-input');
const suggestionsList = document.getElementById('suggestions-list');
const selectedContainer = document.getElementById('selected-container');
const availableContainer = document.getElementById('available-container');
const counterElements = document.querySelectorAll('.counter');
const nextButton = document.querySelector('.next-button');

// Levenshtein for fuzzy matching
function levenshtein(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1).toLowerCase() === a.charAt(j - 1).toLowerCase()) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Display text: emoji + name
function displayInterest(interest) {
  return `${interest.emoji} ${interest.name}`;
}

// Render pill buttons
function renderPills(container, items, isSelected = false) {
  container.innerHTML = '';
  items.forEach(interest => {
    const pill = document.createElement('button');
    pill.classList.add('pill');
    if (isSelected) pill.classList.add('selected');
    pill.textContent = displayInterest(interest);

    pill.disabled = isSelected
      ? false
      : selectedInterests.size >= maxSelection &&
        !selectedInterests.has(interest.name);

    pill.addEventListener('click', () => {
      if (selectedInterests.has(interest.name)) {
        selectedInterests.delete(interest.name);
      } else {
        if (selectedInterests.size >= maxSelection) return;
        selectedInterests.add(interest.name);
      }
      window.selectedInterests = selectedInterests; // Sync to window
      updateUI();
    });

    container.appendChild(pill);
  });
}

// Update UI
function updateUI() {
  const selected = interests.filter(i => selectedInterests.has(i.name));
  const available = interests.filter(i => !selectedInterests.has(i.name));

  renderPills(selectedContainer, selected, true);
  renderPills(availableContainer, available, false);

  counterElements.forEach(el => {
    el.textContent = `${selectedInterests.size}/${maxSelection}`;
  });

  nextButton.disabled =
    selectedInterests.size < 3 || selectedInterests.size > maxSelection;

  suggestionsList.style.display = 'none';
}

// Filter with fuzzy logic
function filterInterests(query) {
  if (!query.trim()) return [];
  const q = query.toLowerCase();

  let filtered = interests.filter(
    i =>
      i.name.toLowerCase().includes(q) &&
      !selectedInterests.has(i.name)
  );

  if (filtered.length === 0) {
    filtered = interests.filter(
      i =>
        !selectedInterests.has(i.name) &&
        levenshtein(i.name.toLowerCase(), q) <= 2
    );
  }

  return filtered;
}

// Show dropdown list
function showSuggestions(filtered) {
  suggestionsList.innerHTML = '';

  if (filtered.length === 0) {
    suggestionsList.style.display = 'none';
    return;
  }

  filtered.forEach(interest => {
    const li = document.createElement('li');
    li.textContent = displayInterest(interest);
    li.addEventListener('click', () => {
      if (selectedInterests.size < maxSelection) {
        selectedInterests.add(interest.name);
        updateUI();
        searchInput.value = '';
        suggestionsList.style.display = 'none';
      }
    });
    suggestionsList.appendChild(li);
  });

  suggestionsList.style.display = 'block';
}

// Event listeners
searchInput.addEventListener('input', () => {
  const query = searchInput.value;
  showSuggestions(filterInterests(query));
});

searchInput.addEventListener('focus', () => {
  if (searchInput.value.trim() !== '') {
    showSuggestions(filterInterests(searchInput.value));
  }
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-bar')) {
    suggestionsList.style.display = 'none';
  }
});

// Initial render
updateUI();

const workCards = Array.from(document.querySelectorAll('.work-card'));
const modal = document.getElementById('modal');
const modalImage = document.getElementById('modalImage');
const modalCategory = document.getElementById('modalCategory');
const modalTitle = document.getElementById('modalTitle');
const modalLocation = document.getElementById('modalLocation');
const modalDescription = document.getElementById('modalDescription');
const closeModal = document.getElementById('closeModal');

const collectionForm = document.getElementById('collectionForm');
const collectionTitle = document.getElementById('collectionTitle');
const collectionNote = document.getElementById('collectionNote');
const collectionCover = document.getElementById('collectionCover');
const collectionPhotos = document.getElementById('collectionPhotos');
const collectionsList = document.getElementById('collectionsList');
const collectionTemplate = document.getElementById('collectionTemplate');
const uploadInput = document.getElementById('uploadInput');
const uploadBtn = document.getElementById('uploadBtn');
const previewGrid = document.getElementById('previewGrid');

const STORAGE_KEY = 'ikonfilm.collections.v1';

function openModal(card) {
  modalImage.src = card.dataset.src || card.querySelector('img')?.src || '';
  modalImage.alt = card.dataset.title || 'Selected photo';
  modalCategory.textContent = card.dataset.category || 'Featured work';
  modalTitle.textContent = card.dataset.title || 'Untitled';
  modalLocation.textContent = card.dataset.location || '';
  modalDescription.textContent = card.dataset.description || '';
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeViewer() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

workCards.forEach((card) => card.addEventListener('click', () => openModal(card)));
closeModal.addEventListener('click', closeViewer);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeViewer();
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeViewer();
});

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function loadCollections() {
  const raw = localStorage.getItem(STORAGE_KEY);
  const saved = raw ? JSON.parse(raw) : [];
  collectionsList.innerHTML = '';

  if (!saved.length) {
    const empty = document.createElement('div');
    empty.className = 'collection-empty';
    empty.textContent = 'No collections yet. Add one on the left with a title, a note, and a few photos.';
    collectionsList.appendChild(empty);
    return;
  }

  for (const item of saved) {
    const node = collectionTemplate.content.cloneNode(true);
    const card = node.querySelector('.collection-card');
    const cover = node.querySelector('.collection-cover');
    const title = node.querySelector('h3');
    const note = node.querySelector('p');
    const thumbs = node.querySelector('.collection-thumbs');

    cover.src = item.cover;
    cover.alt = item.title;
    title.textContent = item.title;
    note.textContent = item.note;

    item.photos.slice(0, 4).forEach((src) => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = item.title;
      thumbs.appendChild(img);
    });

    collectionsList.appendChild(card);
  }
}

collectionForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const coverFile = collectionCover.files?.[0];
  const photoFiles = Array.from(collectionPhotos.files || []);

  if (!coverFile || !photoFiles.length) {
    alert('Please add a cover image and at least one collection photo.');
    return;
  }

  const [cover, ...photos] = await Promise.all([
    fileToDataURL(coverFile),
    ...photoFiles.map(fileToDataURL),
  ]);

  const raw = localStorage.getItem(STORAGE_KEY);
  const saved = raw ? JSON.parse(raw) : [];
  saved.unshift({
    title: collectionTitle.value.trim(),
    note: collectionNote.value.trim(),
    cover,
    photos,
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));

  collectionForm.reset();
  loadCollections();
});

uploadBtn.addEventListener('click', () => uploadInput.click());
uploadInput.addEventListener('change', async (e) => {
  const files = Array.from(e.target.files || []);
  if (!files.length) return;

  const items = await Promise.all(files.map(async (file) => ({
    name: file.name,
    src: await fileToDataURL(file),
  })));

  previewGrid.innerHTML = '';
  items.slice(0, 8).forEach((item) => {
    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.name;
    previewGrid.appendChild(img);
  });
});

loadCollections();

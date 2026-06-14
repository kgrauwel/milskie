const STORAGE_KEY = "flashcards.app.v1";
const STATIC_LIBRARY_KEY = "flashcards.staticLibrary.v6";
const STATIC_LIBRARY_URL = "./data/flashcards.json";
const COLORS = ["#146c65", "#315c9b", "#c2563d", "#2f7d4f", "#b7791f", "#6f4e7c"];
const REWARD_MESSAGES = ["Goed bezig!", "Mooi!", "Sterk!", "Top gedaan!", "Je bent op dreef!"];
const REWARD_IMAGE_PATHS = [
  "./images/puzzles/studeren1.jpg",
  "./images/puzzles/studeren2.jpg",
  "./images/puzzles/studeren3.jpg",
  "./images/puzzles/studeren4.jpg",
  "./images/puzzles/studeren5.jpg",
  "./images/puzzles/studeren6.jpg",
  "./images/puzzles/studeren7.jpg"
];
const REWARD_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="#f7f6ef"/>
  <circle cx="80" cy="82" r="34" fill="#ffe45c"/>
  <path d="M72 54 L88 54 L88 33 L72 33 Z" fill="#c2563d"/>
  <rect x="108" y="104" width="184" height="166" rx="32" fill="#7fb3ad" stroke="#12312d" stroke-width="10"/>
  <rect x="146" y="64" width="108" height="54" rx="20" fill="#146c65" stroke="#12312d" stroke-width="8"/>
  <line x1="200" y1="62" x2="200" y2="34" stroke="#12312d" stroke-width="9" stroke-linecap="round"/>
  <circle cx="200" cy="26" r="13" fill="#c2563d" stroke="#12312d" stroke-width="6"/>
  <circle cx="165" cy="168" r="18" fill="#ffffff" stroke="#12312d" stroke-width="7"/>
  <circle cx="235" cy="168" r="18" fill="#ffffff" stroke="#12312d" stroke-width="7"/>
  <circle cx="165" cy="168" r="7" fill="#12312d"/>
  <circle cx="235" cy="168" r="7" fill="#12312d"/>
  <path d="M157 220 Q200 254 243 220" fill="none" stroke="#12312d" stroke-width="10" stroke-linecap="round"/>
  <rect x="80" y="152" width="38" height="88" rx="18" fill="#315c9b" stroke="#12312d" stroke-width="8"/>
  <rect x="282" y="152" width="38" height="88" rx="18" fill="#315c9b" stroke="#12312d" stroke-width="8"/>
  <rect x="140" y="266" width="38" height="56" rx="14" fill="#c2563d" stroke="#12312d" stroke-width="8"/>
  <rect x="222" y="266" width="38" height="56" rx="14" fill="#c2563d" stroke="#12312d" stroke-width="8"/>
  <path d="M88 314 C124 350 276 350 312 314" fill="none" stroke="#146c65" stroke-width="12" stroke-linecap="round"/>
  <path d="M310 72 l12 24 27 4 -20 19 5 27 -24 -13 -24 13 5 -27 -20 -19 27 -4z" fill="#ffe45c" stroke="#12312d" stroke-width="6"/>
</svg>`;
const REWARD_FALLBACK_IMAGE_URL = `data:image/svg+xml,${encodeURIComponent(REWARD_SVG)}`;
const WORLD_DECK_ID = "deck-wereld-landen-hoofdsteden";
const WORLD_CONTINENTS = [
  { value: "Europe", label: "Europa" },
  { value: "Africa", label: "Afrika" },
  { value: "Asia", label: "Azië" },
  { value: "North America", label: "Noord-Amerika" },
  { value: "South America", label: "Zuid-Amerika" },
  { value: "Oceania", label: "Oceanië" }
];

const defaultDecks = [
  {
    id: "deck-engels-basis",
    title: "Engels basis",
    description: "Korte woorden en zinnen.",
    color: "#146c65",
    cards: [
      makeCard("Goedemorgen", "Good morning", "engels, begroeting"),
      makeCard("Dank je wel", "Thank you", "engels"),
      makeCard("Ik begrijp het niet", "I do not understand", "engels"),
      makeCard("Waar is het station?", "Where is the station?", "engels, reizen")
    ]
  },
  {
    id: "deck-kennis",
    title: "Algemene kennis",
    description: "Een kleine startersset.",
    color: "#315c9b",
    cards: [
      makeCard("Welke planeet staat bekend als de rode planeet?", "Mars", "ruimte"),
      makeCard("Hoeveel zijden heeft een zeshoek?", "6", "wiskunde"),
      makeCard("Wat is H2O?", "Water", "scheikunde")
    ]
  }
];

const state = loadState();
const study = {
  queue: [],
  position: 0,
  flipped: false,
  signature: "",
  missedQueue: [],
  typedAnswered: false,
  typedGiven: "",
  typedExpected: "",
  typedCorrect: false,
  typedFieldResults: [],
  imageZoomLevel: 0,
  typedResult: "",
  peekQuestion: false,
  roundKnown: 0,
  roundAgain: 0,
  rewardPieces: 0,
  rewardOrder: [],
  rewardOrderTarget: 0,
  rewardGrid: { columns: 0, rows: 0 },
  rewardImageUrl: "",
  rewardComplete: false
};

const timer = {
  active: false,
  answered: 0,
  correctAnswers: 0,
  correctIds: new Set(),
  missed: 0,
  startTime: 0,
  elapsedMs: 0,
  intervalId: null,
  deckId: ""
};

let activeView = "study";
let selectedColor = COLORS[0];
let toastTimer = null;
let deferredInstallPrompt = null;
let serverSyncReady = false;
let serverSaveTimer = null;
let draftImages = { front: "", back: "" };
let draggedDeckId = "";

const els = {
  activeSetLabel: document.querySelector("#activeSetLabel"),
  installButton: document.querySelector("#installButton"),
  importButton: document.querySelector("#importButton"),
  exportButton: document.querySelector("#exportButton"),
  importFile: document.querySelector("#importFile"),
  tabs: Array.from(document.querySelectorAll("[data-view]")),
  panels: Array.from(document.querySelectorAll("[data-view-panel]")),
  viewTitle: document.querySelector("#viewTitle"),
  viewMeta: document.querySelector("#viewMeta"),
  viewActions: document.querySelector("#viewActions"),
  newDeckButton: document.querySelector("#newDeckButton"),
  deckSearch: document.querySelector("#deckSearch"),
  deckList: document.querySelector("#deckList"),
  studyCard: document.querySelector("#studyCard"),
  studySide: document.querySelector("#studySide"),
  studyText: document.querySelector("#studyText"),
  studyImage: document.querySelector("#studyImage"),
  studyAudio: document.querySelector("#studyAudio"),
  peekQuestionButton: document.querySelector("#peekQuestionButton"),
  zoomOutButton: document.querySelector("#zoomOutButton"),
  zoomInButton: document.querySelector("#zoomInButton"),
  typedAnswerForm: document.querySelector("#typedAnswerForm"),
  typedAnswerSingleField: document.querySelector("#typedAnswerSingleField"),
  typedAnswerInput: document.querySelector("#typedAnswerInput"),
  typedAnswerFields: document.querySelector("#typedAnswerFields"),
  typedAnswerFeedback: document.querySelector("#typedAnswerFeedback"),
  checkAnswerButton: document.querySelector("#checkAnswerButton"),
  flipButton: document.querySelector("#flipButton"),
  knownButton: document.querySelector("#knownButton"),
  againButton: document.querySelector("#againButton"),
  nextButton: document.querySelector("#nextButton"),
  resetRoundButton: document.querySelector("#resetRoundButton"),
  progressMetric: document.querySelector("#progressMetric"),
  knownMetric: document.querySelector("#knownMetric"),
  againMetric: document.querySelector("#againMetric"),
  rewardCard: document.querySelector("#rewardCard"),
  rewardPuzzle: document.querySelector("#rewardPuzzle"),
  rewardMetric: document.querySelector("#rewardMetric"),
  rewardCaption: document.querySelector("#rewardCaption"),
  timerMetricRow: document.querySelector("#timerMetricRow"),
  timerMetric: document.querySelector("#timerMetric"),
  timerScoreRow: document.querySelector("#timerScoreRow"),
  timerCountMetric: document.querySelector("#timerCountMetric"),
  timerTools: document.querySelector("#timerTools"),
  timerGoalText: document.querySelector("#timerGoalText"),
  startTimerButton: document.querySelector("#startTimerButton"),
  stopTimerButton: document.querySelector("#stopTimerButton"),
  cardForm: document.querySelector("#cardForm"),
  editingCardId: document.querySelector("#editingCardId"),
  frontInput: document.querySelector("#frontInput"),
  backInput: document.querySelector("#backInput"),
  tagsInput: document.querySelector("#tagsInput"),
  frontImageInput: document.querySelector("#frontImageInput"),
  backImageInput: document.querySelector("#backImageInput"),
  frontImagePreview: document.querySelector("#frontImagePreview"),
  backImagePreview: document.querySelector("#backImagePreview"),
  removeFrontImageButton: document.querySelector("#removeFrontImageButton"),
  removeBackImageButton: document.querySelector("#removeBackImageButton"),
  saveCardButton: document.querySelector("#saveCardButton"),
  cancelEditButton: document.querySelector("#cancelEditButton"),
  cardSearch: document.querySelector("#cardSearch"),
  cardList: document.querySelector("#cardList"),
  deckForm: document.querySelector("#deckForm"),
  deckTitleInput: document.querySelector("#deckTitleInput"),
  deckDescriptionInput: document.querySelector("#deckDescriptionInput"),
  colorSwatches: document.querySelector("#colorSwatches"),
  duplicateDeckButton: document.querySelector("#duplicateDeckButton"),
  deleteDeckButton: document.querySelector("#deleteDeckButton"),
  mathForm: document.querySelector("#mathForm"),
  mathOperationInputs: Array.from(document.querySelectorAll("[name='mathOperation']")),
  mathDeckTitleInput: document.querySelector("#mathDeckTitleInput"),
  mathMaxInput: document.querySelector("#mathMaxInput"),
  mathTablesInput: document.querySelector("#mathTablesInput"),
  mathTableLimitInput: document.querySelector("#mathTableLimitInput"),
  mathRangeOptions: document.querySelector("#mathRangeOptions"),
  mathTableOptions: document.querySelector("#mathTableOptions"),
  mathPreview: document.querySelector("#mathPreview"),
  studyModeInputs: Array.from(document.querySelectorAll("[name='studyMode']")),
  timerModeInputs: Array.from(document.querySelectorAll("[name='timerMode']")),
  languageDirectionInputs: Array.from(document.querySelectorAll("[name='languageDirection']")),
  frCategorySelect: document.querySelector("#frCategorySelect"),
  frLevelSelect: document.querySelector("#frLevelSelect"),
  worldContinentInputs: Array.from(document.querySelectorAll("[name='worldContinent']")),
  toast: document.querySelector("#toast")
};

bindEvents();
render();
registerServiceWorker();
loadFromServer();

function makeCard(front, back, tags = "", frontImage = "", backImage = "", frontAudio = "", backAudio = "", frontLang = "", backLang = "") {
  return {
    id: uid(),
    front,
    back,
    tags,
    frontImage,
    backImage,
    frontAudio,
    backAudio,
    frontLang,
    backLang,
    correct: 0,
    again: 0,
    reviewed: 0,
    lastReviewed: ""
  };
}

function uid() {
  if (window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return normalizeState(JSON.parse(stored));
    }
  } catch (error) {
    console.warn("Kon opgeslagen kaarten niet lezen.", error);
  }

  return normalizeState({
    decks: defaultDecks,
    activeDeckId: defaultDecks[0].id
  });
}

function normalizeState(input) {
  input = input && typeof input === "object" ? input : {};
  const decksInput = Array.isArray(input.decks) ? input.decks : [];
  const decks = decksInput
    .filter((deck) => deck && typeof deck === "object")
    .map((deck, deckIndex) => ({
      id: textValue(deck.id || uid()),
      title: textValue(deck.title || `Set ${deckIndex + 1}`),
      description: textValue(deck.description || ""),
      color: COLORS.includes(deck.color) ? deck.color : COLORS[deckIndex % COLORS.length],
      cards: normalizeCards(deck.cards)
    }));

  const safeDecks = decks.length ? decks : cloneDecks(defaultDecks);
  const activeDeckId = safeDecks.some((deck) => deck.id === input.activeDeckId)
    ? input.activeDeckId
    : safeDecks[0].id;

  return {
    decks: safeDecks,
    activeDeckId,
    settings: normalizeSettings(input.settings)
  };
}

function textValue(value) {
  return repairMojibake(String(value || ""));
}

function repairMojibake(value) {
  if (!/[ÃÂ]/.test(value)) {
    return value;
  }

  const replacements = {
    "Ã€": "À",
    "ÃÁ": "Á",
    "Ã‚": "Â",
    "Ãƒ": "Ã",
    "Ã„": "Ä",
    "Ã…": "Å",
    "Ã†": "Æ",
    "Ã‡": "Ç",
    "Ãˆ": "È",
    "Ã‰": "É",
    "ÃŠ": "Ê",
    "Ã‹": "Ë",
    "ÃŒ": "Ì",
    "ÃÍ": "Í",
    "ÃŽ": "Î",
    "ÃÏ": "Ï",
    "Ã‘": "Ñ",
    "Ã’": "Ò",
    "Ã“": "Ó",
    "Ã”": "Ô",
    "Ã•": "Õ",
    "Ã–": "Ö",
    "Ã˜": "Ø",
    "Ã™": "Ù",
    "Ãš": "Ú",
    "Ã›": "Û",
    "Ãœ": "Ü",
    "ÃÝ": "Ý",
    "Ã¡": "á",
    "Ã ": "à",
    "Ã¢": "â",
    "Ã£": "ã",
    "Ã¤": "ä",
    "Ã¥": "å",
    "Ã¦": "æ",
    "Ã§": "ç",
    "Ã¨": "è",
    "Ã©": "é",
    "Ãª": "ê",
    "Ã«": "ë",
    "Ã¬": "ì",
    "Ã­": "í",
    "Ã®": "î",
    "Ã¯": "ï",
    "Ã°": "ð",
    "Ã±": "ñ",
    "Ã²": "ò",
    "Ã³": "ó",
    "Ã´": "ô",
    "Ãµ": "õ",
    "Ã¶": "ö",
    "Ã¸": "ø",
    "Ã¹": "ù",
    "Ãº": "ú",
    "Ã»": "û",
    "Ã¼": "ü",
    "Ã½": "ý",
    "Ã¿": "ÿ",
    "Â°": "°",
    "Â«": "«",
    "Â»": "»",
    "Â·": "·",
    "Â": ""
  };

  return Object.entries(replacements).reduce(
    (text, [wrong, right]) => text.split(wrong).join(right),
    value
  );
}

function normalizeSettings(settings) {
  const input = settings && typeof settings === "object" ? settings : {};
  const studyMode = input.studyMode === "type" ? "type" : "flip";
  const timerEnabled = input.timerEnabled === false || input.timerMode === "off" ? false : true;
  const languageDirection = input.languageDirection === "targetToNl" ? "targetToNl" : "nlToTarget";
  const frCategory = ["all", "words", "verbs"].includes(input.frCategory) ? input.frCategory : "all";
  const frLevel = isFrLevel(input.frLevel) ? input.frLevel : "all";
  const worldContinents = normalizeWorldContinents(input.worldContinents);
  return { studyMode, timerEnabled, languageDirection, frCategory, frLevel, worldContinents };
}

function normalizeWorldContinents(values) {
  const allowed = WORLD_CONTINENTS.map((continent) => continent.value);
  if (!Array.isArray(values)) {
    return allowed;
  }

  const selected = values.filter((value) => allowed.includes(value));
  return selected.length ? selected : allowed;
}

function isFrLevel(value) {
  const text = String(value || "");
  if (text.startsWith("1e ASO Rob")) {
    return true;
  }

  return [
    "all",
    "1e Leerjaar",
    "2e Leerjaar",
    "3e Leerjaar",
    "4e Leerjaar",
    "5e Leerjaar",
    "6e Leerjaar",
    "1e ASO",
    "1e ASO Rob alle",
    "1e ASO Rob Chores",
    "1e ASO Rob Rooms in the house",
    "1e ASO Rob Cleaning supplies",
    "1e ASO Rob Talents",
    "1e ASO Rob Skills",
    "1e ASO Rob Jobs",
    "2e ASO",
    "3e ASO",
    "4e ASO",
    "5e ASO",
    "6e ASO"
  ].includes(value);
}

function normalizeCards(cards) {
  if (!Array.isArray(cards)) {
    return [];
  }

  return cards
    .filter((card) => card && typeof card === "object")
    .map((card) => ({
      id: textValue(card.id || uid()),
      front: textValue(card.front || ""),
      back: textValue(card.back || ""),
      tags: textValue(card.tags || ""),
      frontImage: textValue(card.frontImage || ""),
      backImage: textValue(card.backImage || ""),
      zoomImages: normalizeStringList(card.zoomImages),
      frontAudio: textValue(card.frontAudio || ""),
      backAudio: textValue(card.backAudio || ""),
      frontLang: textValue(card.frontLang || ""),
      backLang: textValue(card.backLang || ""),
      cardType: textValue(card.cardType || ""),
      answerFields: normalizeAnswerFields(card.answerFields),
      correct: toNumber(card.correct),
      again: toNumber(card.again),
      reviewed: toNumber(card.reviewed),
      lastReviewed: textValue(card.lastReviewed || "")
    }))
    .filter((card) => card.front.trim() || card.back.trim());
}

function normalizeStringList(items) {
  if (!Array.isArray(items)) {
    return [];
  }
  return items.map((item) => textValue(item || "")).filter(Boolean);
}

function normalizeAnswerFields(fields) {
  if (!Array.isArray(fields)) {
    return [];
  }

  return fields
    .filter((field) => field && typeof field === "object")
    .map((field, index) => ({
      label: textValue(field.label || `Antwoord ${index + 1}`),
      value: textValue(field.value || ""),
      aliases: Array.isArray(field.aliases) ? field.aliases.map((alias) => textValue(alias || "")).filter(Boolean) : []
    }))
    .filter((field) => field.value.trim());
}

function cloneDecks(decks) {
  return decks.map((deck) => ({
    ...deck,
    id: uid(),
    cards: deck.cards.map((card) => ({ ...card, id: uid() }))
  }));
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function saveState() {
  saveLocalState();
  scheduleServerSave();
}

function saveLocalState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Kon kaarten niet opslaan.", error);
    showToast("Opslaan lukte niet in deze browser.");
  }
}

function bindEvents() {
  els.tabs.forEach((tab) => {
    tab.addEventListener("click", () => setView(tab.dataset.view));
  });

  els.newDeckButton.addEventListener("click", createDeck);
  els.deckSearch.addEventListener("input", renderDeckList);
  els.cardSearch.addEventListener("input", renderCards);

  els.studyCard.addEventListener("click", flipCard);
  els.studyCard.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      flipCard();
    }
  });
  els.studyAudio.addEventListener("click", (event) => event.stopPropagation());
  els.peekQuestionButton.addEventListener("click", togglePeekQuestion);
  els.zoomOutButton?.addEventListener("click", zoomStudyImageOut);
  els.zoomInButton?.addEventListener("click", zoomStudyImageIn);
  els.typedAnswerForm.addEventListener("submit", checkTypedAnswer);
  els.flipButton.addEventListener("click", flipCard);
  els.knownButton.addEventListener("click", () => gradeCard("known"));
  els.againButton.addEventListener("click", () => gradeCard("again"));
  els.nextButton.addEventListener("click", nextCard);
  els.resetRoundButton.addEventListener("click", resetRound);
  els.startTimerButton.addEventListener("click", handleTimerButton);
  els.stopTimerButton.addEventListener("click", stopTimer);

  els.cardForm.addEventListener("submit", saveCard);
  els.cancelEditButton.addEventListener("click", resetCardForm);
  els.frontImageInput.addEventListener("change", () => readImageInput(els.frontImageInput, "front"));
  els.backImageInput.addEventListener("change", () => readImageInput(els.backImageInput, "back"));
  els.removeFrontImageButton.addEventListener("click", () => removeDraftImage("front"));
  els.removeBackImageButton.addEventListener("click", () => removeDraftImage("back"));
  els.deckForm.addEventListener("submit", saveDeck);
  els.duplicateDeckButton.addEventListener("click", duplicateDeck);
  els.deleteDeckButton.addEventListener("click", deleteDeck);
  els.mathForm.addEventListener("submit", createMathDeck);
  els.mathOperationInputs.forEach((input) => {
    input.addEventListener("change", renderMathOptions);
  });
  [els.mathMaxInput, els.mathTablesInput, els.mathTableLimitInput].forEach((input) => {
    input.addEventListener("input", renderMathOptions);
  });
  els.studyModeInputs.forEach((input) => {
    input.addEventListener("change", saveSettings);
  });
  els.timerModeInputs.forEach((input) => {
    input.addEventListener("change", saveSettings);
  });
  els.languageDirectionInputs.forEach((input) => {
    input.addEventListener("change", saveSettings);
  });
  els.frCategorySelect.addEventListener("change", saveSettings);
  els.frLevelSelect.addEventListener("change", saveSettings);
  els.worldContinentInputs.forEach((input) => {
    input.addEventListener("change", saveSettings);
  });

  els.exportButton.addEventListener("click", exportData);
  els.importButton.addEventListener("click", () => els.importFile.click());
  els.importFile.addEventListener("change", importData);

  document.addEventListener("keydown", handleKeys);

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    els.installButton.hidden = false;
  });

  els.installButton.addEventListener("click", async () => {
    if (!deferredInstallPrompt) {
      return;
    }
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    els.installButton.hidden = true;
  });
}

function render() {
  ensureActiveDeck();
  ensureStudyQueue();
  renderView();
  renderDeckList();
  renderStudy();
  renderCards();
  renderDeckForm();
  renderSettings();
  renderMathOptions();
}

function setView(view) {
  activeView = view;
  renderView();
  renderSettings();
  renderMathOptions();
  renderStudy();
}

function renderView() {
  const deck = getActiveDeck();
  const studyCount = deck ? getStudyCardIndices(deck).length : 0;
  const titles = {
    study: "Leren",
    cards: "Kaarten",
    sets: "Sets",
    math: "Rekenen",
    options: "Opties"
  };

  els.tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.view === activeView);
  });

  els.panels.forEach((panel) => {
    const isActive = panel.dataset.viewPanel === activeView;
    panel.hidden = !isActive;
    panel.classList.toggle("active", isActive);
  });

  els.viewTitle.textContent = titles[activeView];
  if (!deck) {
    els.viewMeta.textContent = "";
  } else if (isLanguageCodexDeck(deck) || isWorldCountriesDeck(deck)) {
    els.viewMeta.textContent = `${deck.title} - ${studyCount} geselecteerd van ${deck.cards.length}`;
  } else {
    els.viewMeta.textContent = `${deck.title} - ${deck.cards.length} kaart${deck.cards.length === 1 ? "" : "en"}`;
  }
  els.activeSetLabel.textContent = deck ? deck.title : "Geen set";
  els.viewActions.replaceChildren();
}

function renderDeckList() {
  const search = normalizeSearch(els.deckSearch.value);
  const decks = state.decks
    .map((deck, index) => ({ deck, index }))
    .filter(({ deck }) => {
      const haystack = normalizeSearch(`${deck.title} ${deck.description}`);
      return !search || haystack.includes(search);
    });

  els.deckList.replaceChildren();

  if (!decks.length) {
    els.deckList.append(emptyState("Geen sets gevonden."));
    return;
  }

  decks.forEach(({ deck, index }) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "deck-item";
    button.draggable = !search;
    button.dataset.deckId = deck.id;
    button.title = search ? "" : "Sleep om de set te verplaatsen";
    button.classList.toggle("active", deck.id === state.activeDeckId);
    button.addEventListener("dragstart", (event) => startDeckDrag(event, deck.id));
    button.addEventListener("dragover", (event) => allowDeckDrop(event));
    button.addEventListener("dragleave", (event) => event.currentTarget.classList.remove("drop-target"));
    button.addEventListener("drop", (event) => dropDeck(event, index));
    button.addEventListener("dragend", clearDeckDragStyles);
    button.addEventListener("click", () => {
      state.activeDeckId = deck.id;
      resetCardForm();
      study.signature = "";
      saveState();
      render();
    });

    const color = document.createElement("span");
    color.className = "deck-color";
    color.style.background = deck.color;
    color.setAttribute("aria-hidden", "true");

    const body = document.createElement("span");
    const title = document.createElement("span");
    title.className = "deck-title";
    title.textContent = deck.title;
    const meta = document.createElement("span");
    meta.className = "deck-meta";
    meta.textContent = `${deck.cards.length} kaart${deck.cards.length === 1 ? "" : "en"}`;
    body.append(title, meta);

    button.append(color, body);
    els.deckList.append(button);
  });
}

function startDeckDrag(event, deckId) {
  if (els.deckSearch.value.trim()) {
    event.preventDefault();
    return;
  }

  draggedDeckId = deckId;
  event.currentTarget.classList.add("dragging");
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", deckId);
}

function allowDeckDrop(event) {
  if (!draggedDeckId) {
    return;
  }
  event.preventDefault();
  event.currentTarget.classList.add("drop-target");
}

function dropDeck(event, targetIndex) {
  event.preventDefault();
  const sourceId = event.dataTransfer.getData("text/plain") || draggedDeckId;
  const sourceIndex = state.decks.findIndex((deck) => deck.id === sourceId);

  if (sourceIndex < 0 || sourceIndex === targetIndex) {
    clearDeckDragStyles();
    return;
  }

  const [deck] = state.decks.splice(sourceIndex, 1);
  const adjustedTarget = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
  state.decks.splice(adjustedTarget, 0, deck);
  draggedDeckId = "";
  saveState();
  renderDeckList();
  showToast("Setvolgorde bewaard.");
}

function clearDeckDragStyles() {
  draggedDeckId = "";
  els.deckList.querySelectorAll(".deck-item").forEach((item) => {
    item.classList.remove("dragging", "drop-target");
  });
}

function renderStudy() {
  const deck = getActiveDeck();
  ensureStudyQueue();

  if (!deck || !study.queue.length) {
    els.studyCard.classList.remove("typed-result-card");
    els.studyText.classList.remove("answer-card-text");
    els.studyText.textContent = deck && deck.cards.length ? "Geen kaarten voor deze keuze." : "Geen kaarten in deze set.";
    els.studySide.textContent = "Set";
    renderStudyImage("", false, []);
    renderStudyAudio("");
    renderPeekQuestionButton(false);
    renderStudyModeControls(false, null);
    setStudyButtons(false);
    els.progressMetric.textContent = "0 / 0";
    els.knownMetric.textContent = "0";
    els.againMetric.textContent = "0";
    renderRewardPuzzle(0);
    renderTimer();
    return;
  }

  const card = getCurrentCard();
  const display = getCardDisplay(card);
  const typeMode = isTypeMode();
  const answerAvailable = (!typeMode && study.flipped) || (typeMode && study.typedAnswered);
  const showBack = answerAvailable && !study.peekQuestion;
  const progress = `${study.position + 1} / ${study.queue.length}`;
  els.studyCard.classList.toggle("typed-result-card", typeMode && study.typedAnswered && showBack);
  els.studySide.textContent = showBack ? "Antwoord" : "Vraag";
  renderStudyText(display, showBack, typeMode);
  const imageSource = showBack ? display.answerImage : zoomedQuestionImage(display);
  renderStudyImage(imageSource, showBack, showBack ? [] : display.questionZoomImages);
  renderStudyAudio(showBack ? display.answerAudio : display.questionAudio);
  renderPeekQuestionButton(answerAvailable);
  els.progressMetric.textContent = progress;
  els.knownMetric.textContent = String(study.roundKnown);
  els.againMetric.textContent = String(study.roundAgain);
  renderRewardPuzzle(study.queue.length);
  els.flipButton.textContent = study.flipped ? "Vraag tonen" : "Omdraaien";
  renderStudyModeControls(true, display);
  renderTimer();
  setStudyButtons(true);
}

function isTypeMode() {
  return state.settings?.studyMode === "type";
}

function renderRewardPuzzle(totalCards) {
  if (!els.rewardPuzzle || !els.rewardMetric || !els.rewardCaption) {
    return;
  }

  const target = rewardTarget(totalCards);
  const revealed = Math.min(study.rewardPieces, target);
  const order = ensureRewardOrder(target);
  const grid = rewardGrid(target);
  const pieceCount = grid.columns * grid.rows;
  const puzzleComplete = Boolean(target && revealed >= target);
  const allPieces = Array.from({ length: pieceCount }, (_, index) => index);
  const activePieces = new Set(puzzleComplete ? allPieces : order);
  const revealedPieces = new Set(puzzleComplete ? allPieces : order.slice(0, revealed));
  els.rewardMetric.textContent = `${revealed} / ${target}`;
  els.rewardPuzzle.style.setProperty("--reward-columns", String(grid.columns || 1));
  els.rewardPuzzle.style.setProperty("--reward-rows", String(grid.rows || 1));
  els.rewardCaption.textContent = target
    ? revealed >= target
      ? "Puzzel klaar. Goed gewerkt!"
      : "Elk juist antwoord maakt de puzzel verder."
    : "Kies kaarten om de puzzel te starten.";

  const imageUrl = `url("${rewardImageUrl()}")`;
  els.rewardPuzzle.replaceChildren();

  for (let index = 0; index < pieceCount; index += 1) {
    const piece = document.createElement("div");
    const active = activePieces.has(index);
    const isRevealed = revealedPieces.has(index);
    piece.className = `reward-piece${isRevealed ? " revealed" : ""}${active ? "" : " placeholder"}`;
    if (isRevealed) {
      const column = index % grid.columns;
      const row = Math.floor(index / grid.columns);
      piece.style.backgroundImage = imageUrl;
      piece.style.backgroundSize = `${grid.columns * 100}% ${grid.rows * 100}%`;
      piece.style.backgroundPosition = `${grid.columns === 1 ? 0 : (column / (grid.columns - 1)) * 100}% ${grid.rows === 1 ? 0 : (row / (grid.rows - 1)) * 100}%`;
    }
    els.rewardPuzzle.append(piece);
  }
}

function rewardImageUrl() {
  if (!study.rewardImageUrl) {
    study.rewardImageUrl = pickRewardImageUrl();
  }

  return study.rewardImageUrl;
}

function pickRewardImageUrl() {
  if (!REWARD_IMAGE_PATHS.length) {
    return REWARD_FALLBACK_IMAGE_URL;
  }

  return REWARD_IMAGE_PATHS[Math.floor(Math.random() * REWARD_IMAGE_PATHS.length)];
}

function ensureRewardOrder(target) {
  const grid = rewardGrid(target);
  const pieceCount = grid.columns * grid.rows;

  if (!target) {
    study.rewardOrder = [];
    study.rewardOrderTarget = 0;
    study.rewardGrid = grid;
    return [];
  }

  if (
    study.rewardOrderTarget !== target ||
    study.rewardOrder.length !== target ||
    study.rewardGrid.columns !== grid.columns ||
    study.rewardGrid.rows !== grid.rows ||
    study.rewardOrder.some((index) => index < 0 || index >= pieceCount)
  ) {
    study.rewardOrder = Array.from({ length: pieceCount }, (_, index) => index);
    shuffleArray(study.rewardOrder);
    study.rewardOrder = study.rewardOrder.slice(0, target);
    study.rewardOrderTarget = target;
    study.rewardGrid = grid;
  }

  return study.rewardOrder;
}

function rewardTarget(totalCards) {
  return Math.max(0, totalCards);
}

function rewardGrid(target) {
  if (!target) {
    return { columns: 1, rows: 1 };
  }

  const columns = Math.ceil(Math.sqrt(target));
  const rows = Math.ceil(target / columns);
  return { columns, rows };
}

function addRewardPiece() {
  const target = rewardTarget(study.queue.length);
  ensureRewardOrder(target);
  if (!target || study.rewardPieces >= target) {
    return;
  }

  study.rewardPieces += 1;
  if (study.rewardPieces >= target) {
    study.rewardComplete = true;
    showToast("Puzzel klaar. Goed gewerkt!");
    return;
  }

  showToast(REWARD_MESSAGES[(study.rewardPieces - 1) % REWARD_MESSAGES.length]);
}

function isTimerEnabled() {
  return state.settings?.timerEnabled !== false;
}

function getCardDisplay(card) {
  const reverse = isLanguageCard(card) && state.settings?.languageDirection === "targetToNl";

  if (reverse) {
    return {
      questionText: card.back,
      answerText: card.front,
      questionImage: card.backImage,
      answerImage: card.frontImage,
      questionZoomImages: [],
      questionAudio: card.backAudio,
      answerAudio: card.frontAudio,
      answerFields: [],
      isLanguage: true
    };
  }

  return {
    questionText: card.front,
    answerText: card.back,
    questionImage: card.frontImage,
    answerImage: card.backImage,
    questionZoomImages: Array.isArray(card.zoomImages) ? card.zoomImages : [],
    questionAudio: card.frontAudio,
    answerAudio: card.backAudio,
    answerFields: Array.isArray(card.answerFields) ? card.answerFields : [],
    isLanguage: isLanguageCard(card)
  };
}

function isLanguageCard(card) {
  const tags = normalizeSearch(card.tags);
  return Boolean(card.frontLang || card.backLang || card.cardType === "language" || tags.includes("fr-nl") || tags.includes("taal"));
}

function renderStudyText(display, showBack, typeMode) {
  els.studyText.classList.toggle("answer-card-text", typeMode && study.typedAnswered && showBack);
  els.studyText.replaceChildren();

  if (typeMode && study.typedAnswered && showBack) {
    const summary = document.createElement("div");
    summary.className = "answer-card-summary";
    summary.append(answerLine("Vraag", questionLabel(display), "neutral", null));
    if (study.typedFieldResults.length) {
      study.typedFieldResults.forEach((field) => {
        summary.append(
          answerLine(`${field.label} - jouw antwoord`, field.given, field.correct ? "correct" : "wrong", field.correct ? null : field.expected),
          answerLine(`${field.label} - juiste antwoord`, field.expected, "correct", null)
        );
      });
    } else {
      summary.append(
        answerLine("Juiste antwoord", study.typedExpected, "correct", null),
        answerLine("Jouw antwoord", study.typedGiven, study.typedCorrect ? "correct" : "wrong", study.typedCorrect ? null : study.typedExpected)
      );
    }
    els.studyText.append(summary);
    return;
  }

  els.studyText.textContent = showBack ? display.answerText : display.questionText;
}

function questionLabel(display) {
  if (display.questionText.trim()) {
    return display.questionText;
  }
  if (display.questionImage && display.questionAudio) {
    return "Afbeelding en geluid als vraag";
  }
  if (display.questionImage) {
    return "Afbeelding als vraag";
  }
  if (display.questionAudio) {
    return "Geluid als vraag";
  }
  return "Vraag zonder tekst";
}

function renderStudyModeControls(hasCards, display) {
  const typeMode = isTypeMode();
  const answerFields = getExpectedAnswerFields(display);
  const multiAnswer = answerFields.length > 1;
  els.typedAnswerForm.hidden = !hasCards || !typeMode || study.typedAnswered;
  els.typedAnswerForm.classList.toggle("multi-answer-panel", multiAnswer);
  els.typedAnswerSingleField.hidden = multiAnswer;
  els.typedAnswerFields.hidden = !multiAnswer;
  els.flipButton.hidden = typeMode;
  els.knownButton.hidden = typeMode;
  els.againButton.hidden = typeMode;
  els.nextButton.hidden = !hasCards;

  if (!hasCards || !typeMode) {
    els.typedAnswerInput.value = "";
    els.typedAnswerInput.disabled = false;
    renderTypedAnswerFields([], false);
    els.checkAnswerButton.disabled = false;
    els.typedAnswerFeedback.replaceChildren();
    return;
  }

  if (study.typedAnswered) {
    els.typedAnswerInput.value = study.typedGiven;
    els.typedAnswerInput.disabled = true;
    renderTypedAnswerFields(answerFields, true);
    els.checkAnswerButton.disabled = true;
    els.typedAnswerFeedback.replaceChildren();
    return;
  }

  els.typedAnswerInput.disabled = false;
  els.checkAnswerButton.disabled = false;
  els.typedAnswerInput.value = "";
  renderTypedAnswerFields(answerFields, false);
  els.typedAnswerFeedback.textContent = "Typ het antwoord en druk op Controleer.";
}

function getExpectedAnswerFields(display) {
  if (display && Array.isArray(display.answerFields) && display.answerFields.length) {
    return display.answerFields;
  }

  return [{ label: "Jouw antwoord", value: display?.answerText || "" }];
}

function renderTypedAnswerFields(fields, disabled) {
  els.typedAnswerFields.replaceChildren();
  fields.forEach((field, index) => {
    const label = document.createElement("label");
    label.className = "field";
    const caption = document.createElement("span");
    caption.textContent = field.label;
    const input = document.createElement("input");
    input.type = "text";
    input.autocomplete = "off";
    input.placeholder = field.label;
    input.dataset.answerIndex = String(index);
    input.disabled = disabled;
    label.append(caption, input);
    els.typedAnswerFields.append(label);
  });
}

function zoomedQuestionImage(display) {
  const images = Array.isArray(display.questionZoomImages) && display.questionZoomImages.length
    ? display.questionZoomImages
    : [display.questionImage].filter(Boolean);
  const index = Math.min(study.imageZoomLevel, Math.max(0, images.length - 1));
  return images[index] || display.questionImage;
}

function renderStudyImage(imageSource, isBackSide, zoomImages = []) {
  els.studyCard.classList.toggle("has-card-image", Boolean(imageSource));
  renderZoomButtons(zoomImages);
  if (!imageSource) {
    els.studyImage.hidden = true;
    els.studyImage.removeAttribute("src");
    return;
  }

  els.studyImage.src = imageSource;
  els.studyImage.alt = isBackSide ? "Afbeelding bij antwoord" : "Afbeelding bij vraag";
  els.studyImage.hidden = false;
}

function renderZoomButtons(zoomImages) {
  if (!els.zoomOutButton || !els.zoomInButton) {
    return;
  }
  const count = Array.isArray(zoomImages) ? zoomImages.length : 0;
  const canZoom = count > 1;
  els.zoomOutButton.hidden = !canZoom;
  els.zoomInButton.hidden = !canZoom;
  els.zoomOutButton.disabled = !canZoom || study.imageZoomLevel <= 0;
  els.zoomInButton.disabled = !canZoom || study.imageZoomLevel >= count - 1;
  els.zoomOutButton.title = "Zoom uit";
  els.zoomInButton.title = "Zoom in";
}

function zoomStudyImageOut(event) {
  event.stopPropagation();
  study.imageZoomLevel = Math.max(0, study.imageZoomLevel - 1);
  renderStudy();
}

function zoomStudyImageIn(event) {
  event.stopPropagation();
  const card = getCurrentCard();
  const display = card ? getCardDisplay(card) : null;
  const maxZoom = Math.max(0, (display?.questionZoomImages?.length || 1) - 1);
  study.imageZoomLevel = Math.min(maxZoom, study.imageZoomLevel + 1);
  renderStudy();
}

function renderStudyAudio(audioSource) {
  els.studyAudio.pause();
  if (!audioSource) {
    els.studyAudio.hidden = true;
    els.studyAudio.removeAttribute("src");
    els.studyAudio.load();
    return;
  }

  els.studyAudio.src = audioSource;
  els.studyAudio.hidden = false;
  els.studyAudio.load();
}

function renderPeekQuestionButton(answerAvailable) {
  els.peekQuestionButton.hidden = !answerAvailable;
  els.peekQuestionButton.title = study.peekQuestion ? "Antwoord opnieuw bekijken" : "Vraag opnieuw bekijken";
  els.peekQuestionButton.setAttribute(
    "aria-label",
    study.peekQuestion ? "Antwoord opnieuw bekijken" : "Vraag opnieuw bekijken"
  );
}

function togglePeekQuestion(event) {
  event.stopPropagation();
  study.peekQuestion = !study.peekQuestion;
  renderStudy();
}

function setStudyButtons(enabled) {
  [
    els.studyCard,
    els.flipButton,
    els.knownButton,
    els.againButton,
    els.nextButton,
    els.resetRoundButton
  ].forEach((button) => {
    if (button === els.studyCard) {
      button.setAttribute("aria-disabled", String(!enabled));
      button.tabIndex = enabled ? 0 : -1;
      return;
    }
    button.disabled = !enabled;
  });
}

function renderCards() {
  const deck = getActiveDeck();
  const search = normalizeSearch(els.cardSearch.value);
  els.cardList.replaceChildren();

  if (!deck || !deck.cards.length) {
    els.cardList.append(emptyState("Geen kaarten in deze set."));
    return;
  }

  const cards = deck.cards.filter((card) => {
    const haystack = normalizeSearch(`${card.front} ${card.back} ${card.tags} ${card.frontAudio} ${card.backAudio}`);
    return !search || haystack.includes(search);
  });

  if (!cards.length) {
    els.cardList.append(emptyState("Geen kaarten gevonden."));
    return;
  }

  cards.forEach((card) => {
    const article = document.createElement("article");
    article.className = "note-card";

    const body = document.createElement("div");
    body.className = "note-body";

    const title = document.createElement("strong");
    title.className = "note-title";
    title.textContent = card.front || (card.frontAudio ? "Geluid als vraag" : "Afbeelding als vraag");

    const answer = document.createElement("div");
    answer.className = "note-answer";
    answer.textContent = card.back;

    const media = document.createElement("div");
    media.className = "note-media";
    const images = document.createElement("div");
    images.className = "note-images";
    appendNoteImage(images, card.frontImage, "Vraagafbeelding");
    appendNoteImage(images, card.backImage, "Antwoordafbeelding");
    if (images.children.length) {
      media.append(images);
    }
    appendNoteAudio(media, card.frontAudio, "Vraaggeluid");
    appendNoteAudio(media, card.backAudio, "Antwoordgeluid");

    const meta = document.createElement("div");
    meta.className = "note-meta";
    meta.textContent = card.tags ? `${card.tags} - ${card.reviewed} keer geleerd` : `${card.reviewed} keer geleerd`;

    body.append(title);
    if (card.back) {
      body.append(answer);
    }
    if (media.children.length) {
      body.append(media);
    }
    body.append(meta);

    const actions = document.createElement("div");
    actions.className = "note-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "note-action";
    editButton.textContent = "Wijzigen";
    editButton.addEventListener("click", () => editCard(card.id));

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "note-action danger";
    deleteButton.textContent = "Verwijderen";
    deleteButton.addEventListener("click", () => deleteCard(card.id));

    actions.append(editButton, deleteButton);
    article.append(body, actions);
    els.cardList.append(article);
  });
}

function appendNoteImage(parent, source, alt) {
  if (!source) {
    return;
  }
  const image = document.createElement("img");
  image.className = "note-image";
  image.src = source;
  image.alt = alt;
  parent.append(image);
}

function appendNoteAudio(parent, source, label) {
  if (!source) {
    return;
  }
  const wrapper = document.createElement("div");
  const caption = document.createElement("div");
  caption.className = "note-meta";
  caption.textContent = label;
  const audio = document.createElement("audio");
  audio.className = "note-audio";
  audio.src = source;
  audio.controls = true;
  wrapper.append(caption, audio);
  parent.append(wrapper);
}

function renderDeckForm() {
  const deck = getActiveDeck();
  if (!deck) {
    return;
  }

  selectedColor = deck.color;
  els.deckTitleInput.value = deck.title;
  els.deckDescriptionInput.value = deck.description;
  renderColorSwatches();
  els.deleteDeckButton.disabled = state.decks.length <= 1;
}

function renderColorSwatches() {
  els.colorSwatches.replaceChildren();
  COLORS.forEach((color) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "swatch";
    button.classList.toggle("active", color === selectedColor);
    button.style.background = color;
    button.setAttribute("aria-label", `Kleur ${color}`);
    button.addEventListener("click", () => {
      selectedColor = color;
      renderColorSwatches();
    });
    els.colorSwatches.append(button);
  });
}

function ensureStudyQueue(force = false) {
  const deck = getActiveDeck();
  const signature = deck
    ? `${deck.id}:${studyFilterSignature(deck)}:${deck.cards.map((card) => card.id).join("|")}`
    : "none";

  if (!force && study.signature === signature) {
    return;
  }

  study.signature = signature;
  study.queue = deck ? getStudyCardIndices(deck) : [];
  shuffleArray(study.queue);
  study.missedQueue = [];
  study.position = 0;
  study.flipped = false;
  study.peekQuestion = false;
  study.imageZoomLevel = 0;
  resetRoundStats();
  resetTimerState();
  clearTypedAnswer();
}

function getCurrentCard() {
  const deck = getActiveDeck();
  if (!deck || !deck.cards.length || !study.queue.length) {
    return null;
  }
  const cardIndex = study.queue[study.position] ?? 0;
  return deck.cards[cardIndex] || null;
}

function getStudyCardIndices(deck) {
  if (!deck) {
    return [];
  }

  return deck.cards
    .map((card, index) => ({ card, index }))
    .filter(({ card }) => cardMatchesStudyFilters(deck, card))
    .map(({ index }) => index);
}

function cardMatchesStudyFilters(deck, card) {
  if (isWorldCountriesDeck(deck)) {
    return cardMatchesWorldFilter(card);
  }

  if (!isLanguageCodexDeck(deck)) {
    return true;
  }

  const tags = normalizeSearch(card.tags);
  const category = state.settings?.frCategory || "all";
  const level = state.settings?.frLevel || "all";
  const isVerb = tags.includes("werkwoorden");
  const isWord = tags.includes("vocabulaire");

  if (category === "verbs") {
    return isVerb;
  }

  if (category === "words" && !isWord) {
    return false;
  }

  if (level !== "all") {
    return isWord && tags.includes(normalizeSearch(level));
  }

  return true;
}

function cardMatchesWorldFilter(card) {
  const selected = getSelectedWorldContinents();
  if (selected.length === WORLD_CONTINENTS.length) {
    return true;
  }

  const tags = normalizeSearch(card.tags);
  return WORLD_CONTINENTS.some((continent) =>
    selected.includes(continent.value) && tags.includes(normalizeSearch(continent.value))
  );
}

function getSelectedWorldContinents() {
  return normalizeWorldContinents(state.settings?.worldContinents);
}

function studyFilterSignature(deck) {
  if (isWorldCountriesDeck(deck)) {
    return getSelectedWorldContinents().join("|");
  }

  if (!isLanguageCodexDeck(deck)) {
    return "all";
  }
  return `${state.settings?.frCategory || "all"}:${state.settings?.frLevel || "all"}`;
}

function isLanguageCodexDeck(deck) {
  return deck?.id === "fr-nl-codex" || deck?.id === "en-nl-codex";
}

function isWorldCountriesDeck(deck) {
  return deck?.id === WORLD_DECK_ID;
}

function flipCard() {
  if (!getCurrentCard()) {
    return;
  }
  if (isTypeMode()) {
    if (study.typedAnswered) {
      return;
    }
    focusTypedAnswer();
    return;
  }
  study.flipped = !study.flipped;
  study.peekQuestion = false;
  study.imageZoomLevel = 0;
  renderStudy();
}

function checkTypedAnswer(event) {
  event.preventDefault();
  const card = getCurrentCard();
  if (!card) {
    return;
  }

  if (study.typedAnswered) {
    nextCard();
    return;
  }

  const display = getCardDisplay(card);
  const expectedFields = getExpectedAnswerFields(display);
  const multiAnswer = expectedFields.length > 1;
  const fieldResults = readTypedFieldResults(expectedFields, multiAnswer);

  if (fieldResults.some((field) => !field.given)) {
    showToast("Typ eerst je antwoord.");
    focusTypedAnswer();
    return;
  }

  const correct = fieldResults.every((field) => field.correct);
  study.typedAnswered = true;
  study.peekQuestion = false;
  study.typedGiven = multiAnswer ? formatFieldAnswers(fieldResults, "given") : fieldResults[0].given;
  study.typedExpected = multiAnswer ? formatFieldAnswers(fieldResults, "expected") : fieldResults[0].expected;
  study.typedCorrect = correct;
  study.typedFieldResults = multiAnswer ? fieldResults : [];
  study.typedResult = correct ? "known" : "again";

  applyCardGrade(card, study.typedResult);
  saveState();
  renderStudy();
  renderCards();

  if (correct) {
    showToast("Goed!");
  } else {
    showToast(`Niet goed. Antwoord: ${study.typedExpected}`);
  }
}

function focusTypedAnswer() {
  const firstMultiInput = els.typedAnswerFields.querySelector("input:not(:disabled)");
  if (!els.typedAnswerFields.hidden && firstMultiInput) {
    firstMultiInput.focus();
    return;
  }
  els.typedAnswerInput.focus();
}

function readTypedFieldResults(expectedFields, multiAnswer) {
  return expectedFields.map((field, index) => {
    const input = multiAnswer
      ? els.typedAnswerFields.querySelector(`[data-answer-index="${index}"]`)
      : els.typedAnswerInput;
    const given = input?.value.trim() || "";
    const expected = field.value;
    return {
      label: field.label,
      given,
      expected,
      correct: answerMatchesField(given, field)
    };
  });
}

function answerMatchesField(given, field) {
  const options = [field.value, ...(Array.isArray(field.aliases) ? field.aliases : [])];
  return options.some((expected) => answersMatch(given, expected));
}

function formatFieldAnswers(fields, property) {
  return fields.map((field) => `${field.label}: ${field[property]}`).join("\n");
}

function answersMatch(given, expected) {
  const normalizedGiven = normalizeAnswer(given);
  if (!normalizedGiven) {
    return false;
  }

  return answerAlternatives(expected).some((option) => {
    const normalizedExpected = normalizeAnswer(option);
    if (normalizedGiven === normalizedExpected) {
      return true;
    }

    const givenWithoutArticle = withoutLeadingArticle(normalizedGiven);
    const expectedWithoutArticle = withoutLeadingArticle(normalizedExpected);
    return (
      (givenWithoutArticle.changed || expectedWithoutArticle.changed) &&
      givenWithoutArticle.text === expectedWithoutArticle.text
    );
  });
}

function answerAlternatives(value) {
  const parts = String(value || "")
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length <= 1) {
    return [value];
  }

  const firstIsToVerb = normalizeAnswer(parts[0]).startsWith("to ");
  return parts.map((part) => {
    if (firstIsToVerb && !normalizeAnswer(part).startsWith("to ")) {
      return `to ${part}`;
    }
    return part;
  });
}

function withoutLeadingArticle(value) {
  const text = String(value || "").trim();
  const stripped = text.replace(/^(a|an|the|de|het|een)\s+/, "");
  return { text: stripped, changed: stripped !== text };
}

function renderTypedFeedback(given, expected, correct) {
  els.typedAnswerFeedback.replaceChildren();

  const result = document.createElement("div");
  result.className = "answer-result";
  result.append(
    answerLine("Jouw antwoord", given, correct ? "correct" : "wrong", correct ? null : expected),
    answerLine("Juiste antwoord", expected, "correct", null)
  );
  els.typedAnswerFeedback.append(result);
}

function answerLine(label, value, status, compareTo) {
  const wrapper = document.createElement("div");
  wrapper.className = "answer-line";
  const caption = document.createElement("span");
  caption.textContent = label;
  const answer = document.createElement("div");
  answer.className = `answer-value ${status}`;

  if (compareTo) {
    appendDiffText(answer, value, compareTo);
  } else {
    answer.textContent = value;
  }

  wrapper.append(caption, answer);
  return wrapper;
}

function appendDiffText(parent, given, expected) {
  const firstDiff = firstDifferenceIndex(normalizeAnswer(given), normalizeAnswer(expected));
  if (firstDiff < 0) {
    parent.textContent = given;
    return;
  }

  const before = given.slice(0, firstDiff);
  const after = given.slice(firstDiff) || " ";
  parent.append(document.createTextNode(before));
  const mark = document.createElement("span");
  mark.className = "answer-diff";
  mark.textContent = after;
  parent.append(mark);
}

function firstDifferenceIndex(left, right) {
  const limit = Math.min(left.length, right.length);
  for (let index = 0; index < limit; index += 1) {
    if (left[index] !== right[index]) {
      return index;
    }
  }
  return left.length === right.length ? -1 : limit;
}

function normalizeAnswer(value) {
  const text = String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (/^\s*-?\d+([,.]\d+)?\s*$/.test(text)) {
    return text.replace(",", ".").trim();
  }

  return text
    .replace(/[-\u2013\u2014/]/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function gradeCard(result) {
  const deck = getActiveDeck();
  const card = getCurrentCard();
  if (!deck || !card) {
    return;
  }

  applyCardGrade(card, result);
  moveAfterGrade(result);
  clearTypedAnswer();
  study.flipped = false;
  study.peekQuestion = false;
  study.imageZoomLevel = 0;
  saveState();
  renderStudy();
  renderCards();
}

function applyCardGrade(card, result) {
  card.reviewed += 1;
  card.lastReviewed = new Date().toISOString();

  if (result === "known") {
    card.correct += 1;
    study.roundKnown += 1;
    addRewardPiece();
    countTimedAnswer(card, true);
  } else {
    card.again += 1;
    study.roundAgain += 1;
    countTimedAnswer(card, false);
  }
}

function moveAfterGrade(result) {
  if (result === "known") {
    moveForward();
  } else {
    repeatLater();
  }
}

function clearTypedAnswer() {
  study.typedAnswered = false;
  study.peekQuestion = false;
  study.typedGiven = "";
  study.typedExpected = "";
  study.typedCorrect = false;
  study.typedFieldResults = [];
  study.typedResult = "";
}

function resetRoundStats() {
  study.roundKnown = 0;
  study.roundAgain = 0;
  study.rewardPieces = 0;
  study.rewardOrder = [];
  study.rewardOrderTarget = 0;
  study.rewardGrid = { columns: 0, rows: 0 };
  study.rewardImageUrl = "";
  study.rewardComplete = false;
}

function repeatLater() {
  if (study.queue.length <= 1) {
    return;
  }

  const current = study.queue[study.position];
  if (!study.missedQueue.includes(current)) {
    study.missedQueue.push(current);
  }
  moveForward();
}

function moveForward() {
  if (!study.queue.length) {
    return;
  }
  study.position += 1;
  if (study.position >= study.queue.length) {
    if (study.missedQueue.length) {
      study.queue = study.missedQueue.slice();
      shuffleArray(study.queue);
      study.missedQueue = [];
      study.position = 0;
      showToast("Fouten opnieuw oefenen.");
    } else {
      study.position = 0;
      showToast("Ronde klaar.");
    }
  }
}

function nextCard() {
  if (isTypeMode() && study.typedAnswered) {
    moveAfterGrade(study.typedResult);
    clearTypedAnswer();
    study.flipped = false;
    study.peekQuestion = false;
    study.imageZoomLevel = 0;
    renderStudy();
    return;
  }

  moveForward();
  clearTypedAnswer();
  study.flipped = false;
  study.peekQuestion = false;
  study.imageZoomLevel = 0;
  renderStudy();
}

function shuffleArray(items) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }
  return items;
}

function resetRound() {
  ensureStudyQueue(true);
  resetRoundStats();
  resetTimer();
  clearTypedAnswer();
  study.peekQuestion = false;
  study.imageZoomLevel = 0;
  renderStudy();
  showToast("Opnieuw gestart met geschudde kaarten.");
}

function handleTimerButton() {
  if (timer.active || timer.answered > 0 || timer.elapsedMs > 0) {
    resetTimer();
    return;
  }
  startTimer();
}

function startTimer() {
  if (!isTimerEnabled()) {
    showToast("Timer staat uit bij Opties.");
    return;
  }

  const deck = getActiveDeck();
  if (!deck || !deck.cards.length) {
    showToast("Voeg eerst kaarten toe.");
    return;
  }

  beginTimer(deck);
  renderTimer();
}

function beginTimer(deck) {
  timer.active = true;
  timer.answered = 0;
  timer.correctAnswers = 0;
  timer.correctIds = new Set();
  timer.missed = 0;
  timer.elapsedMs = 0;
  timer.startTime = Date.now();
  timer.deckId = deck.id;
  window.clearInterval(timer.intervalId);
  timer.intervalId = window.setInterval(updateElapsedTime, 250);
}

function resetTimer() {
  resetTimerState();
  renderTimer();
}

function resetTimerState() {
  timer.active = false;
  window.clearInterval(timer.intervalId);
  timer.intervalId = null;
  timer.answered = 0;
  timer.correctAnswers = 0;
  timer.correctIds = new Set();
  timer.missed = 0;
  timer.startTime = 0;
  timer.elapsedMs = 0;
  timer.deckId = "";
}

function stopTimer() {
  if (!timer.active) {
    return;
  }

  if (timer.active) {
    timer.elapsedMs = Date.now() - timer.startTime;
  }
  timer.active = false;
  window.clearInterval(timer.intervalId);
  timer.intervalId = null;
  renderTimer();
}

function updateElapsedTime() {
  if (timer.active) {
    timer.elapsedMs = Date.now() - timer.startTime;
  }
  renderTimer();
}

function countTimedAnswer(card, isKnown) {
  if (!isTimerEnabled()) {
    return;
  }

  const deck = getActiveDeck();
  if (!deck) {
    return;
  }

  if (timer.deckId && timer.deckId !== deck.id) {
    resetTimerState();
  }

  if (!timer.active && timer.answered === 0 && timer.elapsedMs === 0) {
    beginTimer(deck);
  }

  if (!timer.active || timer.deckId !== deck.id) {
    return;
  }

  timer.answered += 1;
  if (isKnown) {
    timer.correctAnswers += 1;
    timer.correctIds.add(card.id);
  } else {
    timer.missed += 1;
  }

  if (timer.correctIds.size >= timerTargetCount(deck)) {
    stopTimer();
    showEndMessage(deck);
  } else {
    renderTimer();
  }
}

function renderTimer() {
  const timerEnabled = isTimerEnabled();
  els.timerMetricRow.hidden = !timerEnabled;
  els.timerScoreRow.hidden = !timerEnabled;
  els.timerTools.hidden = !timerEnabled;

  if (!timerEnabled) {
    if (timer.active || timer.answered > 0 || timer.elapsedMs > 0) {
      resetTimerState();
    }
    return;
  }

  const deck = getActiveDeck();
  const total = deck ? timerTargetCount(deck) : 0;
  const isCurrentDeckTimer = deck && timer.deckId === deck.id;
  const correct = isCurrentDeckTimer ? timer.correctAnswers : 0;
  const attempts = isCurrentDeckTimer ? timer.answered : 0;
  els.timerMetric.textContent = formatTime(timer.elapsedMs);
  els.timerCountMetric.textContent = `${correct} / ${attempts}`;
  els.timerGoalText.textContent = total
    ? `Doel: alle ${total} kaarten goed`
    : "Doel: alle kaarten goed";
  els.startTimerButton.textContent = timer.active || timer.answered > 0 || timer.elapsedMs > 0
    ? "Reset timer"
    : "Start timer";
  els.stopTimerButton.disabled = !timer.active;
}

function showEndMessage(deck) {
  const total = timerTargetCount(deck);
  const time = formatTime(timer.elapsedMs);
  const message = [
    "Einde!",
    `Punten: ${timer.correctAnswers} / ${timer.answered}`,
    `Kaarten goed: ${timer.correctIds.size} / ${total}`,
    `Tijd: ${time}`,
    `Pogingen: ${timer.answered}`,
    `Nog oefenen geklikt: ${timer.missed}`
  ].join("\n");
  window.alert(message);
  showToast(`Einde: ${timer.correctAnswers}/${timer.answered} in ${time}.`);
}

function timerTargetCount(deck) {
  return getStudyCardIndices(deck).length;
}

function formatTime(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(restMinutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function saveCard(event) {
  event.preventDefault();
  const deck = getActiveDeck();
  if (!deck) {
    return;
  }

  const front = els.frontInput.value.trim();
  const back = els.backInput.value.trim();
  const tags = els.tagsInput.value.trim();
  const editingId = els.editingCardId.value;
  const existingCard = editingId ? deck.cards.find((item) => item.id === editingId) : null;
  const existingFrontAudio = existingCard?.frontAudio || "";
  const existingBackAudio = existingCard?.backAudio || "";

  if ((!front && !draftImages.front && !existingFrontAudio) || (!back && !draftImages.back && !existingBackAudio)) {
    showToast("Vul vraag en antwoord in, of voeg een afbeelding of geluid toe.");
    return;
  }

  if (editingId) {
    const card = existingCard;
    if (card) {
      card.front = front;
      card.back = back;
      card.tags = tags;
      card.frontImage = draftImages.front;
      card.backImage = draftImages.back;
      card.frontAudio = card.frontAudio || "";
      card.backAudio = card.backAudio || "";
    }
    showToast("Kaart bijgewerkt.");
  } else {
    deck.cards.push(makeCard(front, back, tags, draftImages.front, draftImages.back));
    showToast("Kaart toegevoegd.");
  }

  resetCardForm();
  study.signature = "";
  saveState();
  render();
}

function editCard(cardId) {
  const deck = getActiveDeck();
  const card = deck?.cards.find((item) => item.id === cardId);
  if (!card) {
    return;
  }

  els.editingCardId.value = card.id;
  els.frontInput.value = card.front;
  els.backInput.value = card.back;
  els.tagsInput.value = card.tags;
  draftImages = { front: card.frontImage || "", back: card.backImage || "" };
  renderImagePreviews();
  els.saveCardButton.textContent = "Kaart bewaren";
  els.cancelEditButton.hidden = false;
  els.frontInput.focus();
}

function deleteCard(cardId) {
  const deck = getActiveDeck();
  if (!deck || !window.confirm("Kaart verwijderen?")) {
    return;
  }

  deck.cards = deck.cards.filter((card) => card.id !== cardId);
  resetCardForm();
  study.signature = "";
  saveState();
  render();
  showToast("Kaart verwijderd.");
}

function resetCardForm() {
  els.editingCardId.value = "";
  els.frontInput.value = "";
  els.backInput.value = "";
  els.tagsInput.value = "";
  els.frontImageInput.value = "";
  els.backImageInput.value = "";
  draftImages = { front: "", back: "" };
  renderImagePreviews();
  els.saveCardButton.textContent = "Kaart toevoegen";
  els.cancelEditButton.hidden = true;
}

async function readImageInput(input, side) {
  const file = input.files?.[0];
  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    showToast("Kies een afbeelding.");
    input.value = "";
    return;
  }

  try {
    draftImages[side] = await resizeImage(file);
    renderImagePreviews();
    showToast("Afbeelding toegevoegd.");
  } catch (error) {
    console.warn("Afbeelding kon niet worden gelezen.", error);
    showToast("Afbeelding kon niet worden gelezen.");
  } finally {
    input.value = "";
  }
}

function removeDraftImage(side) {
  draftImages[side] = "";
  renderImagePreviews();
}

function renderImagePreviews() {
  renderImagePreview(els.frontImagePreview, els.removeFrontImageButton, draftImages.front);
  renderImagePreview(els.backImagePreview, els.removeBackImageButton, draftImages.back);
}

function renderImagePreview(container, removeButton, source) {
  container.replaceChildren();
  removeButton.hidden = !source;

  if (!source) {
    container.textContent = "Geen afbeelding";
    return;
  }

  const image = document.createElement("img");
  image.src = source;
  image.alt = "Voorbeeld";
  container.append(image);
}

function resizeImage(file) {
  const maxSize = 1600;
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.addEventListener("load", () => {
      const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
      const width = Math.max(1, Math.round(image.naturalWidth * scale));
      const height = Math.max(1, Math.round(image.naturalHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0, width, height);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL("image/jpeg", 0.84));
    });

    image.addEventListener("error", () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("image-load-failed"));
    });

    image.src = objectUrl;
  });
}

function createDeck() {
  const nextNumber = state.decks.length + 1;
  const deck = {
    id: uid(),
    title: `Nieuwe set ${nextNumber}`,
    description: "",
    color: COLORS[(nextNumber - 1) % COLORS.length],
    cards: []
  };
  state.decks.push(deck);
  state.activeDeckId = deck.id;
  study.signature = "";
  saveState();
  setView("sets");
  render();
  els.deckTitleInput.focus();
}

function saveDeck(event) {
  event.preventDefault();
  const deck = getActiveDeck();
  if (!deck) {
    return;
  }

  deck.title = els.deckTitleInput.value.trim() || "Naamloze set";
  deck.description = els.deckDescriptionInput.value.trim();
  deck.color = selectedColor;
  saveState();
  render();
  showToast("Set bewaard.");
}

function duplicateDeck() {
  const deck = getActiveDeck();
  if (!deck) {
    return;
  }

  const copy = {
    ...deck,
    id: uid(),
    title: `${deck.title} kopie`,
    cards: deck.cards.map((card) => ({ ...card, id: uid() }))
  };

  state.decks.push(copy);
  state.activeDeckId = copy.id;
  study.signature = "";
  saveState();
  render();
  showToast("Kopie gemaakt.");
}

function deleteDeck() {
  const deck = getActiveDeck();
  if (!deck || state.decks.length <= 1 || !window.confirm("Set met alle kaarten verwijderen?")) {
    return;
  }

  state.decks = state.decks.filter((item) => item.id !== deck.id);
  state.activeDeckId = state.decks[0].id;
  study.signature = "";
  resetCardForm();
  saveState();
  render();
  showToast("Set verwijderd.");
}

function renderSettings() {
  const mode = isTypeMode() ? "type" : "flip";
  els.studyModeInputs.forEach((input) => {
    input.checked = input.value === mode;
  });

  const timerMode = isTimerEnabled() ? "on" : "off";
  els.timerModeInputs.forEach((input) => {
    input.checked = input.value === timerMode;
  });

  const languageDirection = state.settings?.languageDirection === "targetToNl" ? "targetToNl" : "nlToTarget";
  els.languageDirectionInputs.forEach((input) => {
    input.checked = input.value === languageDirection;
  });

  els.frCategorySelect.value = state.settings?.frCategory || "all";
  els.frLevelSelect.value = state.settings?.frLevel || "all";

  const selectedContinents = getSelectedWorldContinents();
  els.worldContinentInputs.forEach((input) => {
    input.checked = selectedContinents.includes(input.value);
  });
}

function saveSettings(event) {
  if (event.target.name === "studyMode") {
    const mode = event.target.value === "type" ? "type" : "flip";
    state.settings = normalizeSettings({ ...state.settings, studyMode: mode });
    study.flipped = false;
    clearTypedAnswer();
    showToast(mode === "type" ? "Antwoorden typen staat aan." : "Omdraaien staat aan.");
  }

  if (event.target.name === "timerMode") {
    const timerEnabled = event.target.value !== "off";
    state.settings = normalizeSettings({ ...state.settings, timerEnabled });
    if (!timerEnabled) {
      resetTimerState();
    }
    showToast(timerEnabled ? "Timer staat aan." : "Timer staat uit.");
  }

  if (event.target.name === "languageDirection") {
    const languageDirection = event.target.value === "targetToNl" ? "targetToNl" : "nlToTarget";
    state.settings = normalizeSettings({ ...state.settings, languageDirection });
    study.flipped = false;
    clearTypedAnswer();
    showToast(languageDirection === "targetToNl" ? "Taalrichting: taal naar NL." : "Taalrichting: NL naar taal.");
  }

  if (event.target.id === "frCategorySelect") {
    state.settings = normalizeSettings({ ...state.settings, frCategory: event.target.value });
    study.signature = "";
    showToast("Taalkeuze aangepast.");
  }

  if (event.target.id === "frLevelSelect") {
    state.settings = normalizeSettings({ ...state.settings, frLevel: event.target.value });
    study.signature = "";
    showToast("Taal-leerjaar aangepast.");
  }

  if (event.target.name === "worldContinent") {
    const worldContinents = els.worldContinentInputs
      .filter((input) => input.checked)
      .map((input) => input.value);
    state.settings = normalizeSettings({ ...state.settings, worldContinents });
    study.signature = "";
    showToast("Werelddelen aangepast.");
  }

  saveState();
  renderSettings();
  render();
}

function selectedMathOperation() {
  const selected = els.mathOperationInputs.find((input) => input.checked);
  return selected ? selected.value : "add";
}

function renderMathOptions() {
  const spec = readMathSpec(false);
  const tableMode = spec.operation === "multiply" || spec.operation === "divide";
  els.mathRangeOptions.hidden = tableMode;
  els.mathTableOptions.hidden = !tableMode;

  if (tableMode && !spec.tables.length) {
    els.mathPreview.textContent = "Vul minstens 1 tafel in, bijvoorbeeld 11,13,14.";
    return;
  }

  const count = countMathCards(spec);
  const example = mathExample(spec);
  els.mathPreview.textContent = example
    ? `Maakt ${count} kaart${count === 1 ? "" : "en"}. Voorbeeld: ${example}`
    : `Maakt ${count} kaart${count === 1 ? "" : "en"}.`;
}

function createMathDeck(event) {
  event.preventDefault();
  const spec = readMathSpec(true);

  if ((spec.operation === "multiply" || spec.operation === "divide") && !spec.tables.length) {
    showToast("Vul minstens 1 tafel in.");
    els.mathTablesInput.focus();
    return;
  }

  const count = countMathCards(spec);
  if (count > 3000 && !window.confirm(`Dit maakt ${count} kaarten. Toch doorgaan?`)) {
    return;
  }

  const cards = buildMathCards(spec);
  if (!cards.length) {
    showToast("Geen rekensommen gevonden.");
    return;
  }

  const deck = {
    id: uid(),
    title: els.mathDeckTitleInput.value.trim() || mathDefaultTitle(spec),
    description: mathDescription(spec),
    color: COLORS[state.decks.length % COLORS.length],
    cards
  };

  state.decks.push(deck);
  state.activeDeckId = deck.id;
  study.signature = "";
  clearTypedAnswer();
  saveState();
  render();
  setView("study");
  showToast(`${cards.length} rekensommen gemaakt.`);
}

function readMathSpec(writeBack) {
  const operation = selectedMathOperation();
  const max = readInteger(els.mathMaxInput, 20, 2, 100, writeBack);
  const tableLimit = readInteger(els.mathTableLimitInput, 10, 1, 50, writeBack);
  const tables = parseMathTables(els.mathTablesInput.value);

  if (writeBack && tables.length) {
    els.mathTablesInput.value = tables.join(",");
  }

  return { operation, max, tables, tableLimit };
}

function readInteger(input, fallback, min, max, writeBack) {
  const parsed = Number.parseInt(input.value, 10);
  const value = Number.isFinite(parsed)
    ? Math.min(max, Math.max(min, parsed))
    : fallback;

  if (writeBack) {
    input.value = String(value);
  }

  return value;
}

function parseMathTables(value) {
  const seen = new Set();
  return String(value || "")
    .split(/[,\s;]+/)
    .map((part) => Number.parseInt(part, 10))
    .filter((number) => Number.isFinite(number) && number > 0 && number <= 500)
    .filter((number) => {
      if (seen.has(number)) {
        return false;
      }
      seen.add(number);
      return true;
    });
}

function countMathCards(spec) {
  if (spec.operation === "add" || spec.operation === "subtract") {
    return ((spec.max + 1) * (spec.max + 2)) / 2;
  }

  return spec.tables.length * spec.tableLimit;
}

function buildMathCards(spec) {
  if (spec.operation === "add") {
    const cards = [];
    for (let result = 0; result <= spec.max; result += 1) {
      for (let left = 0; left <= result; left += 1) {
        const right = result - left;
        cards.push(makeCard(`${left} + ${right} =`, String(result), "rekenen, +"));
      }
    }
    return cards;
  }

  if (spec.operation === "subtract") {
    const cards = [];
    for (let left = 0; left <= spec.max; left += 1) {
      for (let right = 0; right <= left; right += 1) {
        cards.push(makeCard(`${left} - ${right} =`, String(left - right), "rekenen, -"));
      }
    }
    return cards;
  }

  if (spec.operation === "multiply") {
    return spec.tables.flatMap((table) =>
      Array.from({ length: spec.tableLimit }, (_, index) => {
        const factor = index + 1;
        return makeCard(`${factor} x ${table} =`, String(factor * table), `rekenen, tafel ${table}`);
      })
    );
  }

  return spec.tables.flatMap((table) =>
    Array.from({ length: spec.tableLimit }, (_, index) => {
      const answer = index + 1;
      return makeCard(`${answer * table} / ${table} =`, String(answer), `rekenen, tafel ${table}`);
    })
  );
}

function mathDefaultTitle(spec) {
  if (spec.operation === "add") {
    return `Rekenen + tot ${spec.max}`;
  }
  if (spec.operation === "subtract") {
    return `Rekenen - tot ${spec.max}`;
  }
  if (spec.operation === "multiply") {
    return `Tafels x ${spec.tables.join(",")}`;
  }
  return `Delen door ${spec.tables.join(",")}`;
}

function mathDescription(spec) {
  if (spec.operation === "add" || spec.operation === "subtract") {
    return `Automatisch gemaakt: ${mathDefaultTitle(spec)}.`;
  }
  return `Automatisch gemaakt: ${mathDefaultTitle(spec)}, van 1 tot en met ${spec.tableLimit}.`;
}

function mathExample(spec) {
  if (spec.operation === "add") {
    const left = Math.min(5, spec.max);
    const right = Math.min(4, Math.max(0, spec.max - left));
    return `${left} + ${right} = ${left + right}`;
  }
  if (spec.operation === "subtract") {
    const left = Math.min(9, spec.max);
    const right = Math.min(4, left);
    return `${left} - ${right} = ${left - right}`;
  }
  const table = spec.tables[0];
  if (!table) {
    return "";
  }
  if (spec.operation === "multiply") {
    return `3 x ${table} = ${3 * table}`;
  }
  return `${3 * table} / ${table} = 3`;
}

function exportData() {
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    activeDeckId: state.activeDeckId,
    settings: state.settings,
    decks: state.decks
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `flashcards-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  showToast("Export gemaakt.");
}

function importData(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const content = String(reader.result || "");
      if (isCsvFile(file)) {
        importCsvDeck(content, file.name);
        return;
      }

      const imported = normalizeState(JSON.parse(content));
      const replace = window.confirm("Bestaande sets vervangen? Annuleren voegt de import toe.");

      if (replace) {
        state.decks = imported.decks;
        state.activeDeckId = imported.activeDeckId;
        state.settings = imported.settings;
      } else {
        const addedDecks = cloneDecks(imported.decks);
        state.decks = state.decks.concat(addedDecks);
        state.activeDeckId = addedDecks[0]?.id || state.decks[0].id;
      }

      study.signature = "";
      resetCardForm();
      saveState();
      render();
      showToast("Import klaar.");
    } catch (error) {
      console.warn("Import mislukt.", error);
      showToast("Importbestand niet herkend.");
    } finally {
      els.importFile.value = "";
    }
  });
  reader.readAsText(file);
}

function isCsvFile(file) {
  return file.name.toLowerCase().endsWith(".csv") || file.type === "text/csv";
}

function importCsvDeck(content, fileName) {
  const rows = parseCsv(content).filter((row) => row.some((cell) => cell.trim()));
  if (!rows.length) {
    showToast("CSV-bestand is leeg.");
    return;
  }

  const deck = deckFromCsvRows(rows, fileName);
  if (!deck.cards.length) {
    showToast("Geen flashcards gevonden in CSV.");
    return;
  }

  state.decks.push(deck);
  state.activeDeckId = deck.id;
  study.signature = "";
  resetCardForm();
  saveState();
  render();
  setView("cards");
  showToast(`${deck.cards.length} kaarten geladen uit ${fileName}.`);
}

function deckFromCsvRows(rows, fileName) {
  const titleInfo = extractCsvDeckTitle(rows, fileName);
  const usableRows = titleInfo.rows;
  const firstRow = usableRows[0].map((cell) => normalizeHeader(cell));
  const hasHeader = csvLooksLikeHeader(firstRow);
  const columnMap = hasHeader ? csvColumnMap(firstRow) : { front: 0, back: 1, tags: 2 };
  const dataRows = hasHeader ? usableRows.slice(1) : usableRows;

  const cards = dataRows
    .map((row) => csvRowToCard(row, columnMap))
    .filter(Boolean);

  return {
    id: uid(),
    title: titleInfo.title,
    description: `Geladen uit ${fileName}`,
    color: COLORS[state.decks.length % COLORS.length],
    cards
  };
}

function extractCsvDeckTitle(rows, fileName) {
  const fallbackTitle = baseFileName(fileName);
  if (rows.length < 2) {
    return { title: fallbackTitle, rows };
  }

  const firstRow = rows[0].map((cell) => String(cell || "").trim());
  const normalized = firstRow.map((cell) => normalizeHeader(cell));
  const nonEmptyCells = firstRow.filter(Boolean);

  if (nonEmptyCells.length === 1 && !csvLooksLikeHeader(normalized)) {
    return { title: nonEmptyCells[0], rows: rows.slice(1) };
  }

  if (["set", "setnaam", "naam", "deck", "decknaam"].includes(normalized[0]) && firstRow[1]) {
    return { title: firstRow[1], rows: rows.slice(1) };
  }

  return { title: fallbackTitle, rows };
}

function csvRowToCard(row, columnMap) {
  const front = getCsvCell(row, columnMap.front);
  const back = getCsvCell(row, columnMap.back);
  const tags = getCsvCell(row, columnMap.tags);
  const frontImage = getCsvCell(row, columnMap.frontImage);
  const backImage = getCsvCell(row, columnMap.backImage);
  const frontAudio = getCsvCell(row, columnMap.frontAudio);
  const backAudio = getCsvCell(row, columnMap.backAudio);

  if ((!front && !frontImage && !frontAudio) || (!back && !backImage && !backAudio)) {
    return null;
  }

  return makeCard(front, back, tags, frontImage, backImage, frontAudio, backAudio);
}

function csvColumnMap(headers) {
  return headers.reduce((map, header, index) => {
    if (["vraag", "voorkant", "front", "question", "term"].includes(header)) {
      map.front = index;
    }
    if (["antwoord", "achterkant", "back", "answer", "definition"].includes(header)) {
      map.back = index;
    }
    if (["label", "labels", "tag", "tags", "categorie"].includes(header)) {
      map.tags = index;
    }
    if (["vraagafbeelding", "frontimage", "questionimage"].includes(header)) {
      map.frontImage = index;
    }
    if (["antwoordafbeelding", "backimage", "answerimage"].includes(header)) {
      map.backImage = index;
    }
    if (["vraaggeluid", "frontaudio", "questionaudio", "audio"].includes(header)) {
      map.frontAudio = index;
    }
    if (["antwoordgeluid", "backaudio", "answeraudio"].includes(header)) {
      map.backAudio = index;
    }
    return map;
  }, {});
}

function csvLooksLikeHeader(headers) {
  const knownHeaders = new Set([
    "vraag",
    "voorkant",
    "front",
    "question",
    "term",
    "antwoord",
    "achterkant",
    "back",
    "answer",
    "definition",
    "label",
    "labels",
    "tag",
    "tags",
    "categorie",
    "vraagafbeelding",
    "frontimage",
    "questionimage",
    "antwoordafbeelding",
    "backimage",
    "answerimage",
    "vraaggeluid",
    "frontaudio",
    "questionaudio",
    "audio",
    "antwoordgeluid",
    "backaudio",
    "answeraudio"
  ]);
  return headers.some((header) => knownHeaders.has(header));
}

function normalizeHeader(value) {
  return String(value || "")
    .trim()
    .replace(/^\uFEFF/, "")
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

function getCsvCell(row, index) {
  if (!Number.isInteger(index) || index < 0 || index >= row.length) {
    return "";
  }
  return String(row[index] || "").trim();
}

function baseFileName(fileName) {
  return String(fileName || "CSV set")
    .replace(/\.[^.]+$/, "")
    .trim() || "CSV set";
}

function parseCsv(content) {
  const delimiter = detectDelimiter(content);
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const next = content[index + 1];

    if (char === "\"") {
      if (inQuotes && next === "\"") {
        cell += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === delimiter && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell);
  rows.push(row);
  return rows;
}

function detectDelimiter(content) {
  const firstLine = String(content || "").split(/\r?\n/, 1)[0] || "";
  const candidates = [",", ";", "\t"];
  return candidates
    .map((delimiter) => ({
      delimiter,
      count: countDelimiter(firstLine, delimiter)
    }))
    .sort((a, b) => b.count - a.count)[0].delimiter;
}

function countDelimiter(line, delimiter) {
  let count = 0;
  let inQuotes = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === "\"") {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      count += 1;
    }
  }
  return count;
}

function handleKeys(event) {
  const target = event.target;
  const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
  if (isTyping || activeView !== "study") {
    return;
  }

  if (event.key === " ") {
    event.preventDefault();
    flipCard();
  }

  if (event.key === "ArrowRight") {
    nextCard();
  }

  if (event.key === "1") {
    gradeCard("again");
  }

  if (event.key === "2") {
    gradeCard("known");
  }
}

function getActiveDeck() {
  return state.decks.find((deck) => deck.id === state.activeDeckId) || state.decks[0] || null;
}

function ensureActiveDeck() {
  if (!state.decks.some((deck) => deck.id === state.activeDeckId)) {
    state.activeDeckId = state.decks[0]?.id || "";
  }
}

function normalizeSearch(value) {
  return String(value || "").trim().toLowerCase();
}

function emptyState(message) {
  const element = document.createElement("div");
  element.className = "empty-state";
  element.textContent = message;
  return element;
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.add("visible");
  toastTimer = window.setTimeout(() => {
    els.toast.classList.remove("visible");
  }, 2400);
}

async function loadFromServer() {
  if (!canUseServerSync()) {
    return;
  }

  try {
    const response = await fetch("./api/state", { headers: { Accept: "application/json" } });
    serverSyncReady = response.ok;

    if (!response.ok) {
      if (response.status === 404) {
        await loadStaticLibrary();
      }
      return;
    }

    const serverState = normalizeState(await response.json());
    state.decks = serverState.decks;
    state.activeDeckId = serverState.activeDeckId;
    state.settings = serverState.settings;
    study.signature = "";
    saveLocalState();
    render();
  } catch (error) {
    console.warn("Serveropslag niet beschikbaar.", error);
    await loadStaticLibrary();
  }
}

async function loadStaticLibrary() {
  try {
    const response = await fetch(STATIC_LIBRARY_URL, {
      cache: "no-store",
      headers: { Accept: "application/json" }
    });
    if (!response.ok) {
      return;
    }

    const libraryState = cleanStaticLibraryState(normalizeState(await response.json()));
    const signature = staticLibrarySignature(libraryState);
    const alreadyLoaded = localStorage.getItem(STATIC_LIBRARY_KEY) === signature;
    if (alreadyLoaded && !isDefaultStarterState()) {
      return;
    }

    const changed = mergeStaticLibrary(libraryState);
    localStorage.setItem(STATIC_LIBRARY_KEY, signature);
    if (changed) {
      study.signature = "";
      saveLocalState();
      render();
      showToast("Online sets geladen.");
    }
  } catch (error) {
    console.warn("Online startsets niet beschikbaar.", error);
  }
}

function cleanStaticLibraryState(libraryState) {
  return {
    ...libraryState,
    decks: libraryState.decks.map((deck) => ({
      ...deck,
      cards: deck.cards.map((card) => ({
        ...card,
        correct: 0,
        again: 0,
        reviewed: 0,
        lastReviewed: ""
      }))
    }))
  };
}

function staticLibrarySignature(libraryState) {
  const signatureSource = libraryState.decks.map((deck) => ({
    id: deck.id,
    title: deck.title,
    description: deck.description,
    cards: deck.cards.map((card) => ({
      id: card.id,
      front: card.front,
      back: card.back,
      tags: card.tags,
      frontImage: card.frontImage,
      backImage: card.backImage,
      zoomImages: card.zoomImages,
      frontAudio: card.frontAudio,
      backAudio: card.backAudio,
      cardType: card.cardType,
      answerFields: card.answerFields
    }))
  }));
  return hashText(JSON.stringify(signatureSource));
}

function hashText(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

function isDefaultStarterState() {
  if (state.decks.length !== defaultDecks.length) {
    return false;
  }
  return defaultDecks.every((defaultDeck) =>
    state.decks.some((deck) => deck.title === defaultDeck.title && deck.cards.length === defaultDeck.cards.length)
  );
}

function mergeStaticLibrary(libraryState) {
  if (!libraryState.decks.length) {
    return false;
  }

  if (isDefaultStarterState()) {
    state.decks = libraryState.decks;
    state.activeDeckId = libraryState.activeDeckId;
    state.settings = { ...state.settings, ...libraryState.settings };
    return true;
  }

  let changed = false;
  libraryState.decks.forEach((libraryDeck) => {
    const existingIndex = state.decks.findIndex((deck) => deck.id === libraryDeck.id);
    if (existingIndex === -1) {
      state.decks.push(libraryDeck);
      changed = true;
      return;
    }

    const mergedDeck = mergeLibraryDeck(state.decks[existingIndex], libraryDeck);
    if (JSON.stringify(state.decks[existingIndex]) !== JSON.stringify(mergedDeck)) {
      state.decks[existingIndex] = mergedDeck;
      changed = true;
    }
  });

  if (!changed) {
    return false;
  }

  if (!state.decks.some((deck) => deck.id === state.activeDeckId)) {
    state.activeDeckId = state.decks[0].id;
  }
  return true;
}

function mergeLibraryDeck(existingDeck, libraryDeck) {
  const existingCardsById = new Map(existingDeck.cards.map((card) => [card.id, card]));
  const libraryCardIds = new Set(libraryDeck.cards.map((card) => card.id));
  const mergedCards = libraryDeck.cards.map((libraryCard) => {
    const existingCard = existingCardsById.get(libraryCard.id);
    if (!existingCard) {
      return libraryCard;
    }

    return {
      ...libraryCard,
      correct: existingCard.correct || 0,
      again: existingCard.again || 0,
      reviewed: existingCard.reviewed || 0,
      lastReviewed: existingCard.lastReviewed || ""
    };
  });

  const extraCards = existingDeck.cards.filter((card) => !libraryCardIds.has(card.id));
  return {
    ...libraryDeck,
    cards: [...mergedCards, ...extraCards]
  };
}

function canUseServerSync() {
  return location.protocol.startsWith("http");
}

function scheduleServerSave() {
  if (!serverSyncReady || !canUseServerSync()) {
    return;
  }

  window.clearTimeout(serverSaveTimer);
  serverSaveTimer = window.setTimeout(saveToServer, 500);
}

async function saveToServer() {
  try {
    await fetch("./api/state", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state)
    });
  } catch (error) {
    console.warn("Serveropslag mislukt.", error);
  }
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || !location.protocol.startsWith("http")) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.warn("Service worker niet gestart.", error);
    });
  });
}

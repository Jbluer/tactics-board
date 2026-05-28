'use struct';
// 一番下を表示
window.addEventListener('load', () => {
  const container = document.getElementById('posts-container');
  if (container) container.scrollTop = container.scrollHeight;
});

// エンターキー と Ctrlキー(Macの場合はCommandキー)を押していたら送信
const formElement = document.forms['message-form'];
if (formElement) {
  const textareaElement = formElement.elements['content'];
  textareaElement.addEventListener('keydown', (event) => {
    if (isPressedSubmitKey(event)) {
      event.preventDefault();
      formElement.submit();
    }
  });
}

// 送信キーを押しているか判定
function isPressedSubmitKey(event) {
  if (event.key !== 'Enter') {
    return false;
  }
  if (event.ctrlKey) {
    return true;
  }
  // MacのCommandキーはmetaKeyという名前
  if (event.metaKey) {
    return true;
  }
}


// ツールチップの有効化
const tooltipTriggerElements = document.querySelectorAll('[data-bs-toggle="tooltip"]');
tooltipTriggerElements.forEach((tooltipTriggerElement) => {
  new bootstrap.Tooltip(tooltipTriggerElement);
});

 // ===== 11×11 盤面 =====
const COLS = 11;
const ROWS = 11;

let pieces = [];
let selectedPieceIndex = null;
let selectedPaletteIndex = null;

const PALETTE_PIECES = [
  { label: '大将', owner: 'black' }, { label: '騎兵', owner: 'black' },
  { label: '近衛', owner: 'black' }, { label: '弓兵', owner: 'black' }, 
  { label: '憲兵', owner: 'black' }, { label: '歩兵', owner: 'black' },
  { label: '大将', owner: 'white' }, { label: '騎兵', owner: 'white' },
  { label: '近衛', owner: 'white' }, { label: '弓兵', owner: 'white' },
  { label: '憲兵', owner: 'white' }, { label: '歩兵', owner: 'white' },
];

const canvas = document.getElementById('board-canvas');
const ctx = canvas.getContext('2d');

function getCellSize() {
  const area = document.querySelector('.board-area');
  const padding = 16;
  const maxW = (area ? area.clientWidth : 400) - padding * 2;
  const maxH = (area ? area.clientHeight : 400) - padding * 2;
  return Math.floor(Math.min(maxW / (COLS + 1), maxH / (ROWS + 1)));
}

function resizeCanvas() {
  const cell = getCellSize();
  const margin = cell;
  canvas.width = COLS * cell + margin * 2;
  canvas.height = ROWS * cell + margin * 2;
  drawBoard();
}

function isDarkMode() {
  return document.body.dataset.bsTheme === 'dark';
}

function drawBoard() {
  const cell = getCellSize();
  const margin = cell;
  const dark = isDarkMode();

  const boardBg = dark ? '#6b4f27' : '#e8c97a';
  const lineColor = dark ? '#3a2408' : '#5a3e1b';
  const labelColor = dark ? '#d0b080' : '#5a3e1b';
  const selHighlight = 'rgba(59,130,246,0.25)';

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = boardBg;
  ctx.beginPath();
  ctx.roundRect(margin - cell * 0.15, margin - cell * 0.15,
    COLS * cell + cell * 0.3, ROWS * cell + cell * 0.3, 4);
  ctx.fill();

  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 1;
  for (let c = 0; c <= COLS; c++) {
    ctx.beginPath();
    ctx.moveTo(margin + c * cell, margin);
    ctx.lineTo(margin + c * cell, margin + ROWS * cell);
    ctx.stroke();
  }
  for (let r = 0; r <= ROWS; r++) {
    ctx.beginPath();
    ctx.moveTo(margin, margin + r * cell);
    ctx.lineTo(margin + COLS * cell, margin + r * cell);
    ctx.stroke();
  }

  const rowLabels = ['一','二','三','四','五','六','七','八','九','十','十一'];
  const fontSize = Math.max(8, Math.floor(cell * 0.38));
  ctx.fillStyle = labelColor;
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let c = 0; c < COLS; c++) {
    ctx.fillText(String(c + 1), margin + c * cell + cell / 2, margin / 2);
  }
  ctx.textAlign = 'right';
  for (let r = 0; r < ROWS; r++) {
    ctx.fillText(rowLabels[r], margin - cell * 0.2, margin + r * cell + cell / 2);
  }

  if (selectedPieceIndex !== null) {
    const p = pieces[selectedPieceIndex];
    ctx.fillStyle = selHighlight;
    ctx.fillRect(margin + p.col * cell, margin + p.row * cell, cell, cell);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(margin + p.col * cell, margin + p.row * cell, cell, cell);
    ctx.lineWidth = 1;
  }

  pieces.forEach((p, idx) => {
    const x = margin + p.col * cell + cell / 2;
    const y = margin + p.row * cell + cell / 2;
    const r = cell * 0.42;
    const isSelected = idx === selectedPieceIndex;
    const isBlack = p.owner === 'black';

    ctx.save();
    if (p.owner === 'white') {
      ctx.translate(x, y);
      ctx.rotate(Math.PI);
      ctx.translate(-x, -y);
    }
    ctx.beginPath();
    const pts = pentagonPoints(x, y, r);
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    ctx.fillStyle = isSelected ? (isBlack ? '#1e40af' : '#f0fdf4') : (isBlack ? '#1c1c1c' : '#f5f0e0');
    ctx.strokeStyle = isSelected ? '#3b82f6' : (isBlack ? '#555' : '#aaa');
    ctx.lineWidth = 1.5;
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    const pieceFontSize = Math.max(8, Math.floor(cell * 0.38));
    ctx.font = `bold ${pieceFontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = isBlack ? '#f5f0e0' : '#1c1c1c';
    if (p.owner === 'white') {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.PI);
      ctx.fillText(p.label, 0, 0);
      ctx.restore();
    } else {
      ctx.fillText(p.label, x, y);
    }
  });
}

function pentagonPoints(cx, cy, r) {
  const angles = [-90, -18, 54, 126, 198].map(d => d * Math.PI / 180);
  return angles.map(a => [cx + r * Math.cos(a), cy + r * Math.sin(a)]);
}

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const px = (e.clientX - rect.left) * scaleX;
  const py = (e.clientY - rect.top) * scaleY;
  const cell = getCellSize();
  const margin = cell;
  const col = Math.floor((px - margin) / cell);
  const row = Math.floor((py - margin) / cell);

  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) {
    selectedPieceIndex = null;
    drawBoard();
    return;
  }

  if (selectedPaletteIndex !== null) {
    const template = PALETTE_PIECES[selectedPaletteIndex];
    const existingPiece = pieces.find(p => p.row === row && p.col === col);
    if (existingPiece) {
      return;
    }
    pieces.push({ label: template.label, owner: template.owner, row, col });
    drawBoard();
    return;
  }

  const clickedIdx = pieces.findIndex(p => p.row === row && p.col === col);

  if (selectedPieceIndex === null) {
    if (clickedIdx !== -1) selectedPieceIndex = clickedIdx;
  } else {
    if (clickedIdx === selectedPieceIndex) {
      selectedPieceIndex = null;
    } else if (clickedIdx !== -1) {
      const movingPiece = pieces[selectedPieceIndex];
      const targetPiece = pieces[clickedIdx];
      if (movingPiece.owner === targetPiece.owner) {
        selectedPieceIndex = null; 
      } else {
      pieces.splice(clickedIdx, 1);
      const newIdx = selectedPieceIndex > clickedIdx ? selectedPieceIndex - 1 : selectedPieceIndex;
      pieces[newIdx].row = row;
      pieces[newIdx].col = col;
      selectedPieceIndex = null;
      }
    } else {
      pieces[selectedPieceIndex].row = row;
      pieces[selectedPieceIndex].col = col;
      selectedPieceIndex = null;
    }
  }
  drawBoard();
});

canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const px = (e.clientX - rect.left) * scaleX;
  const py = (e.clientY - rect.top) * scaleY;
  const cell = getCellSize();
  const margin = cell;
  const col = Math.floor((px - margin) / cell);
  const row = Math.floor((py - margin) / cell);
  pieces = pieces.filter(p => !(p.row === row && p.col === col));
  selectedPieceIndex = null;
  drawBoard();
});

function renderPalette() {
  const palette = document.getElementById('piece-palette');
  palette.innerHTML = '';
  PALETTE_PIECES.forEach((p, idx) => {
    const el = document.createElement('div');
    el.className = 'palette-piece' + (idx === selectedPaletteIndex ? ' selected' : '');
    el.title = `${p.label}（${p.owner === 'black' ? '先手' : '後手'}）`;
    el.style.background = p.owner === 'black' ? '#1c1c1c' : '#f5f0e0';
    el.style.color = p.owner === 'black' ? '#f5f0e0' : '#1c1c1c';
    el.style.border = idx === selectedPaletteIndex ? '2px solid #3b82f6' : '';
    el.textContent = p.label;
    el.addEventListener('click', () => {
      selectedPaletteIndex = (selectedPaletteIndex === idx) ? null : idx;
      selectedPieceIndex = null;
      renderPalette();
      drawBoard();
    });
    palette.appendChild(el);
  });
}

document.getElementById('btn-clear').addEventListener('click', () => {
  pieces = [];
  selectedPieceIndex = null;
  selectedPaletteIndex = null;
  renderPalette();
  drawBoard();
});

// 盤面を添付するボタン
document.getElementById('btn-attach-board').addEventListener('click', () => {
  const textarea = formElement.elements['content'];
  const boardData = JSON.stringify(pieces);
  // すでに盤面データが含まれていたら置き換え、なければ追記
  const cleaned = textarea.value.replace(/\[board:\[.*?\]\]/g, '').trimEnd();
  textarea.value = cleaned + (cleaned ? '\n' : '') + `[board:${boardData}]`;
});

// 投稿カード内の小さい盤面を描画する
function renderBoardPreview(canvas, piecesData) {
  const ctx = canvas.getContext('2d');
  const cell = Math.floor(canvas.width / (COLS + 1));
  const margin = cell;
  const dark = isDarkMode();

  const boardBg = dark ? '#6b4f27' : '#e8c97a';
  const lineColor = dark ? '#3a2408' : '#5a3e1b';

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = boardBg;
  ctx.fillRect(margin - cell * 0.15, margin - cell * 0.15,
    COLS * cell + cell * 0.3, ROWS * cell + cell * 0.3);

  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 0.5;
  for (let c = 0; c <= COLS; c++) {
    ctx.beginPath();
    ctx.moveTo(margin + c * cell, margin);
    ctx.lineTo(margin + c * cell, margin + ROWS * cell);
    ctx.stroke();
  }
  for (let r = 0; r <= ROWS; r++) {
    ctx.beginPath();
    ctx.moveTo(margin, margin + r * cell);
    ctx.lineTo(margin + COLS * cell, margin + r * cell);
    ctx.stroke();
  }

  piecesData.forEach((p) => {
    const x = margin + p.col * cell + cell / 2;
    const y = margin + p.row * cell + cell / 2;
    const r = cell * 0.42;
    const isBlack = p.owner === 'black';

    ctx.save();
    if (p.owner === 'white') {
      ctx.translate(x, y);
      ctx.rotate(Math.PI);
      ctx.translate(-x, -y);
    }
    ctx.beginPath();
    const pts = pentagonPoints(x, y, r);
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    ctx.fillStyle = isBlack ? '#1c1c1c' : '#f5f0e0';
    ctx.strokeStyle = isBlack ? '#555' : '#aaa';
    ctx.lineWidth = 0.5;
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    const fontSize = Math.max(5, Math.floor(cell * 0.38));
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = isBlack ? '#f5f0e0' : '#1c1c1c';
    if (p.owner === 'white') {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.PI);
      ctx.fillText(p.label, 0, 0);
      ctx.restore();
    } else {
      ctx.fillText(p.label, x, y);
    }
  });
}

// 投稿一覧コンテナにイベント委譲で「盤面に反映」ボタンを処理
document.getElementById('posts-container').addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-load-board');
  if (!btn) return;
  const raw = btn.dataset.pieces;
  if (!raw) return;
  try {
    pieces = JSON.parse(raw);
    selectedPieceIndex = null;
    selectedPaletteIndex = null;
    renderPalette();
    drawBoard();
  } catch(e) { /* 不正データは無視 */ }
});

const resizeObserver = new ResizeObserver(() => resizeCanvas());
const boardArea = document.querySelector('.board-area');
if (boardArea) resizeObserver.observe(boardArea);

window.addEventListener('load', () => {
  const container = document.getElementById('posts-container');
  if (container) container.scrollTop = container.scrollHeight;
  renderPalette();
  resizeCanvas();
  // 投稿カード内の盤面プレビューを全て描画
  initBoardPreviews();
});

function initBoardPreviews() {
  document.querySelectorAll('.board-preview-canvas').forEach((canvas) => {
    const raw = canvas.dataset.pieces;
    if (!raw) return;
    try {
      const piecesData = JSON.parse(raw);
      const size = canvas.width; // 既にwidthは設定済み
      renderBoardPreview(canvas, piecesData);
    } catch(e) { /* 不正データは無視 */ }
  });
}
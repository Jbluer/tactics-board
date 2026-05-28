'use strict';
const fs = require('node:fs');
const Cookies = require('cookies');
const { currentThemeKey } = require('../config');

function handleLogout(req, res) {
  res.writeHead(401, {
    'Content-Type': 'text/html; charset=utf-8'
  });
  res.end(
    `<!DOCTYPE html><html lang="ja">
        <body>
            <h1>ログアウトしました</h1>
            <a href="/posts">ログイン</a>
        </body>
    </html>`
  );
}

function handleChangeTheme(req, res) {
  const cookies = new Cookies(req, res);
  const currentTheme = (cookies.get(currentThemeKey) !== 'light' ? 'light' : 'dark');
  cookies.set(currentThemeKey, currentTheme);
  res.writeHead(303, {
    'Location': '/posts'
  });
  res.end();
}

function handleFavicon(req, res) {
  res.writeHead(200, {
    'Content-Type': 'image/vnd.microsoft.icon',
    'Cache-Control': 'public, max-age=604800'
  });
  const favicon = fs.readFileSync('./favicon.ico');
  res.end(favicon);
}

function handleStyleCssFile(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/css',
  });
  const file = fs.readFileSync('./public/style.css');
  res.end(file);
}

function handleNnChatJsFile(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/javascript',
  });
  const file = fs.readFileSync('./public/boardchat.js');
  res.end(file);
}

function handleNotFound(req, res) {
  res.writeHead(404, {
    'Content-Type': 'text/html; charset=utf-8'
  });
  res.end(`<!DOCTYPE html><html lang="ja">
    <body>
      <h1>404 ページが見つかりません</h1>
      <a href="/posts">陣略棋戦術交流掲示板へ</a>
    </body>
  </html>`);
}

function handleBadRequest(req, res) {
  res.writeHead(400, {
    'Content-Type': 'text/plain; charset=utf-8'
  });
  res.end('未対応のリクエストです');
}

function handleTopPage(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8'
  });
  res.end(`<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>陣略棋</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" integrity="sha256-fx038NkLY4U1TCrBDiu5FWPEa9eiZu01EiLryshJbCo=" crossorigin="anonymous">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.0/font/bootstrap-icons.css">
  <style>
    body { background-color: #1a1208; color: #e8d5a0; }
    .hero {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: radial-gradient(ellipse at center, #2e1f0a 0%, #1a1208 70%);
    }
    .title-jp {
      font-size: 4rem;
      font-weight: bold;
      letter-spacing: 0.3em;
      color: #e8c97a;
      text-shadow: 0 0 20px rgba(232,201,122,0.4);
    }
    .subtitle { color: #a08040; letter-spacing: 0.2em; }
    .divider {
      width: 200px;
      height: 1px;
      background: linear-gradient(to right, transparent, #e8c97a, transparent);
      margin: 1.5rem auto;
    }
    .card-rule {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(232,201,122,0.2);
      border-radius: 8px;
    }
    .card-rule h5 { color: #e8c97a; }
    .table { color: #e8d5a0; }
    .table thead { color: #e8c97a; }
    .table-bordered { border-color: rgba(232,201,122,0.2) !important; }
    .table-bordered td, .table-bordered th { border-color: rgba(232,201,122,0.2) !important; }
    .badge-special {
      background: rgba(232,201,122,0.15);
      border: 1px solid rgba(232,201,122,0.3);
      color: #e8c97a;
      border-radius: 4px;
      padding: 2px 8px;
      font-size: 0.8rem;
    }
    .btn-enter {
      background: linear-gradient(135deg, #b8860b, #e8c97a);
      color: #1a1208;
      font-weight: bold;
      letter-spacing: 0.2em;
      padding: 0.75rem 3rem;
      border: none;
      border-radius: 4px;
      font-size: 1.1rem;
      transition: opacity 0.2s;
    }
    .btn-enter:hover { opacity: 0.85; color: #1a1208; }
    .wip-badge {
      background: rgba(255,150,0,0.15);
      border: 1px solid rgba(255,150,0,0.3);
      color: #ffa040;
      border-radius: 4px;
      padding: 2px 10px;
      font-size: 0.8rem;
    }
  </style>
</head>
<body>
  <div class="hero">
    <div class="text-center mb-4">
      <p class="subtitle mb-1">戦略ボードゲーム</p>
      <h1 class="title-jp">陣略棋</h1>
      <p class="subtitle">JINRYAKUGI</p>
    </div>
    <div class="divider"></div>
    <p class="text-center mb-4" style="color:#a08040; letter-spacing:0.1em;">
      11×11の盤上で繰り広げられる、調略と戦略の頭脳戦
    </p>
    <a href="/posts" class="btn btn-enter mb-5">掲示板へ入る</a>

    <div class="container" style="max-width:800px;">

      <!-- 概要 -->
      <div class="card-rule p-4 mb-3">
        <h5><i class="bi-flag-fill me-2"></i>ゲームの概要</h5>
        <p class="mb-1">盤面：11×11マス　／　各プレイヤー22枚</p>
        <p class="mb-0">相手の<strong style="color:#e8c97a;">将軍</strong>を先に取った方の勝ち。</p>
      </div>

      <!-- 駒の構成 -->
      <div class="card-rule p-4 mb-3">
        <h5><i class="bi-grid-fill me-2"></i>駒の構成</h5>
        <table class="table table-bordered table-sm mb-0">
          <thead>
            <tr><th>駒の名前</th><th>枚数</th><th>寝返る枚数</th></tr>
          </thead>
          <tbody>
            <tr><td>将軍</td><td>1枚</td><td>0枚</td></tr>
            <tr><td>近衛</td><td>2枚</td><td>0枚</td></tr>
            <tr><td>騎兵</td><td>2枚</td><td>1枚</td></tr>
            <tr><td>弓兵</td><td>4枚</td><td>2枚</td></tr>
            <tr><td>憲兵／忍</td><td>2枚</td><td>1枚</td></tr>
            <tr><td>歩兵</td><td>11枚</td><td>11枚</td></tr>
          </tbody>
        </table>
      </div>

      <!-- 駒の動き -->
      <div class="card-rule p-4 mb-3">
        <h5><i class="bi-arrows-move me-2"></i>駒の動き</h5>
        <ul class="mb-0" style="line-height:2;">
          <li><strong style="color:#e8c97a;">将軍</strong>　全方向に1マス</li>
          <li><strong style="color:#e8c97a;">近衛</strong>　金将と同じ動き</li>
          <li><strong style="color:#e8c97a;">騎兵</strong>　飛車と同じ動き</li>
          <li><strong style="color:#e8c97a;">弓兵</strong>　移動は全方向1マス／攻撃は2マス前の横3マス</li>
          <li><strong style="color:#e8c97a;">憲兵／忍</strong>　桂馬と同じ動き</li>
          <li><strong style="color:#e8c97a;">歩兵</strong>　前に1マス。敵陣奥3段で「成歩」に成れる</li>
          <li><strong style="color:#e8c97a;">成歩</strong>　前方3方向へ1マス</li>
        </ul>
      </div>

      <!-- 特殊ルール -->
      <div class="card-rule p-4 mb-3">
        <h5><i class="bi-lightning-fill me-2"></i>特殊ルール</h5>
        <p><strong style="color:#e8c97a;">初期配置</strong>　自陣の一定エリア内に自由に駒を配置して開始。</p>
        <p class="mb-1"><strong style="color:#e8c97a;">調略（寝返り）</strong></p>
        <ul class="mb-0">
          <li>味方の駒に守られていない状態で取られた駒は「寝返り判定」が発生。</li>
          <li>「寝返る」駒なら取った側の持ち駒になる。「寝返らない」駒は盤上から除去。</li>
          <li>一度寝返った駒も、再度取られれば再び判定の対象となる。</li>
        </ul>
      </div>

      <!-- 調整中 -->
      <div class="card-rule p-4 mb-5">
        <h5><i class="bi-tools me-2"></i>バランス調整案 <span class="wip-badge ms-2">検討中</span></h5>
        <ul class="mb-0">
          <li>初期配置エリアの広さ</li>
          <li>歩兵の柔軟性パッケージ（後退＋デメリット、成歩のパワーアップ）</li>
          <li>調略の条件パッケージ（歩兵の隣接を条件にする）</li>
        </ul>
      </div>

    </div>
  </div>
</body>
</html>`);
}

module.exports = {
  handleLogout,
  handleChangeTheme,
  handleFavicon,
  handleStyleCssFile,
  handleNnChatJsFile,
  handleNotFound,
  handleBadRequest,
  handleTopPage,
};
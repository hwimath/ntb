const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 캔버스 크기 설정 (모바일 세로 화면에 적합하도록 설정)
canvas.width = window.innerWidth * 0.8; // 화면 너비의 80%를 사용
canvas.height = window.innerHeight; // 화면 높이를 최대치로 사용

// 이미지 로딩
const playerImage = new Image();
const enemyImage1 = new Image();
const enemyImage2 = new Image();
const itemImage1 = new Image();
const itemImage2 = new Image();
const backgroundImage = new Image();

// 이미지 파일 경로 설정 (본인이 만든 이미지 경로로 수정)
playerImage.src = 'game_images/player_plane.png';  // 주인공 비행기 이미지
enemyImage1.src = 'game_images/enemy_plane1.png'; // 적 비행기 1
enemyImage2.src = 'game_images/enemy_plane2.png'; // 적 비행기 2
itemImage1.src = 'game_images/missile_item.png';  // 미사일 강화 아이템
itemImage2.src = 'game_images/health_item.png';   // 체력 회복 아이템
backgroundImage.src = 'game_images/background.png'; // 배경 이미지

let player = {
  x: canvas.width / 2,
  y: canvas.height - 120, // 화면 높이에 맞춰 위치 조정
  width: 60,
  height: 60,
  speed: 5,
  energy: 100,
  missileCount: 1, // 기본 미사일 발사 개수는 1
  hitCount: 0 // 적과 부딪힌 횟수
};

let missiles = [];
let enemies = [];
let items = [];
let keys = {};
let score = 0; // 점수

// 이미지 로드 확인
let imagesLoaded = 0;
const totalImages = 6;  // 로드할 이미지 개수
const checkImagesLoaded = () => {
  imagesLoaded++;
  if (imagesLoaded === totalImages) {
    gameLoop();  // 모든 이미지가 로드되었을 때 게임 시작
  }
};

playerImage.onload = checkImagesLoaded;
enemyImage1.onload = checkImagesLoaded;
enemyImage2.onload = checkImagesLoaded;
itemImage1.onload = checkImagesLoaded;
itemImage2.onload = checkImagesLoaded;
backgroundImage.onload = checkImagesLoaded;

// 배경 그리기
function drawBackground() {
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

// 플레이어 이동
function movePlayer() {
  if (keys['ArrowLeft'] && player.x > 0) {
    player.x -= player.speed;
  }
  if (keys['ArrowRight'] && player.x < canvas.width - player.width) {
    player.x += player.speed;
  }
  if (keys['ArrowUp'] && player.y > 0) {
    player.y -= player.speed;
  }
  if (keys['ArrowDown'] && player.y < canvas.height - player.height) {
    player.y += player.speed;
  }
}

// 미사일 발사
function shootMissile() {
  let missile1 = {
    x: player.x + player.width / 2 - 2.5,
    y: player.y,
    width: 5,
    height: 10,
    speed: 5
  };

  missiles.push(missile1);

  // 미사일 2발 발사 (아이템을 먹었을 때)
  if (player.missileCount >= 2) {
    let missile2 = {
      x: player.x + player.width / 2 - 10,
      y: player.y - 20, // 두 번째 미사일은 위에서 발사
      width: 5,
      height: 10,
      speed: 5
    };
    missiles.push(missile2);
  }

  // 미사일 3발 발사
  if (player.missileCount >= 3) {
    let missile3 = {
      x: player.x + player.width / 2 + 5,
      y: player.y - 20, // 세 번째 미사일은 위에서 발사
      width: 5,
      height: 10,
      speed: 5
    };
    missiles.push(missile3);
  }

  // 미사일 4발 발사
  if (player.missileCount >= 4) {
    let missile4 = {
      x: player.x + player.width / 2 - 20,
      y: player.y - 20, // 네 번째 미사일은 위에서 발사
      width: 5,
      height: 10,
      speed: 5
    };
    missiles.push(missile4);
  }
}

// 적 비행기 생성
function spawnEnemy() {
  let enemy = {
    x: Math.random() * (canvas.width - 50),
    y: -50,
    width: 50,
    height: 50,
    speed: Math.random() * 1 + 0.5,  // 적의 속도를 0.5~1.5로 느리게 설정
    image: Math.random() > 0.5 ? enemyImage1 : enemyImage2,
    isDead: false
  };
  enemies.push(enemy);
}

// 아이템 생성
function spawnItem() {
  let item = {
    x: Math.random() * (canvas.width - 30),
    y: -30,
    width: 30,
    height: 30,
    type: Math.random() > 0.5 ? 'missile' : 'health',
    image: Math.random() > 0.5 ? itemImage1 : itemImage2,
    speed: 2
  };
  items.push(item);
}

// 미사일, 적, 아이템 업데이트 및 충돌 감지
function update() {
  movePlayer();

  // 미사일 자동 발사
  if (missiles.length === 0) {
    shootMissile();
  }

  missiles.forEach((missile, index) => {
    missile.y -= missile.speed;
    if (missile.y < 0) missiles.splice(index, 1); 
  });

  enemies.forEach((enemy, index) => {
    enemy.y += enemy.speed;
    if (enemy.y > canvas.height) {
      enemies.splice(index, 1);
    }
  });

  items.forEach((item, index) => {
    item.y += item.speed;
    if (item.y > canvas.height) {
      items.splice(index, 1);
    }
  });

  missiles.forEach((missile, mIndex) => {
    enemies.forEach((enemy, eIndex) => {
      // 미사일과 적의 충돌 체크
      if (missile.x < enemy.x + enemy.width &&
        missile.x + missile.width > enemy.x &&
        missile.y < enemy.y + enemy.height &&
        missile.y + missile.height > enemy.y) {
        
        // 적 처치
        enemies.splice(eIndex, 1);
        missiles.splice(mIndex, 1);
        score += 1; // 점수 증가
      }
    });
  });

  items.forEach((item, iIndex) => {
    if (item.x < player.x + player.width &&
      item.x + item.width > player.x &&
      item.y < player.y + player.height &&
      item.y + item.height > player.y) {
      if (item.type === 'missile') {
        // 미사일 아이템을 먹으면 미사일 개수가 2발 → 3발 → 4발로 증가
        player.missileCount = Math.min(player.missileCount + 1, 4);
      } else if (item.type === 'health') {
        player.energy = Math.min(player.energy + 20, 100); // 체력 회복
      }
      items.splice(iIndex, 1);
    }
  });

  enemies.forEach(enemy => {
    if (enemy.y + enemy.height > player.y && !enemy.isDead) {
      player.hitCount += 1; // 적과 부딪힌 횟수 증가
      enemy.isDead = true;
    }
  });

  // 3번 부딪히면 게임 종료
  if (player.hitCount >= 3) {
    alert('게임 오버!');
    window.location.reload(); 
  }

  if (player.energy <= 0) {
    alert('게임 오버!');
    window.location.reload(); 
  }
}

// 게임 그리기
function draw() {
  drawBackground();

  // 비행기 크기 원래대로 그리기
  ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);

  missiles.forEach(missile => {
    ctx.fillStyle = 'red';
    ctx.fillRect(missile.x, missile.y, missile.width, missile.height);
  });

  enemies.forEach(enemy => {
    ctx.drawImage(enemy.image, enemy.x, enemy.y, enemy.width, enemy.height);
  });

  items.forEach(item => {
    ctx.drawImage(item.image, item.x, item.y, item.width, item.height);
  });

  // 화면 오른쪽 위에 점수 표시
  ctx.fillStyle = 'black';
  ctx.font = '20px Arial';
  ctx.fillText(`Score: ${score}`, canvas.width - 100, 30); // 점수 표시

  // 체력 표시
  ctx.fillText(`Health: ${player.energy}`, 10, 30);
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  if (e.key === ' ') {  // 스페이스바로 미사일 발사
    shootMissile();
  }
});

window.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

setInterval(() => {
  spawnEnemy();
  if (Math.random() > 0.7) spawnItem();
}, 1000);

gameLoop();

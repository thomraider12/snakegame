const playBoard = document.querySelector(".play-board");
const scoreElement = document.querySelector(".score");
const highScoreElement = document.querySelector(".high-score");
const controls = document.querySelectorAll(".controls i");
const musicToggleBtn = document.getElementById("music-toggle");

// Carregar sons
const eatSound = new Audio('eat.mp3');
const bgMusic = new Audio('bg-music.mp3');
bgMusic.loop = true; // Configurar a música de fundo para repetir
bgMusic.volume = 0.2; // Reduzir o volume da música de fundo

let isMusicPlaying = true; // Estado inicial da música
let musicStartTime = 0; // Posição inicial da música
const SESSION_TIMEOUT = 3600000; // 1 hora em milissegundos

// Recuperar estado da música e posição do localStorage
const savedMusicState = JSON.parse(localStorage.getItem("music-state")) || {};
const lastSessionTime = savedMusicState.timestamp || Date.now();
const timeSinceLastSession = Date.now() - lastSessionTime;

// Reiniciar música se a última sessão foi há muito tempo
if (timeSinceLastSession < SESSION_TIMEOUT) {
    isMusicPlaying = savedMusicState.isPlaying !== undefined ? savedMusicState.isPlaying : true;
    musicStartTime = savedMusicState.currentTime || 0;
}

// Configurar música de acordo com o estado recuperado
bgMusic.currentTime = musicStartTime;
if (isMusicPlaying) {
    bgMusic.play();
    musicToggleBtn.textContent = "Música: Ligada";
} else {
    bgMusic.pause();
    musicToggleBtn.textContent = "Música: Desligada";
}

// Alternar música ao clicar no botão
musicToggleBtn.addEventListener("click", () => {
    if (isMusicPlaying) {
        bgMusic.pause();
        musicToggleBtn.textContent = "Música: Desligada";
    } else {
        bgMusic.play();
        musicToggleBtn.textContent = "Música: Ligada";
    }
    isMusicPlaying = !isMusicPlaying;

    // Salvar estado atualizado no localStorage
    localStorage.setItem("music-state", JSON.stringify({
        isPlaying: isMusicPlaying,
        currentTime: bgMusic.currentTime,
        timestamp: Date.now()
    }));
});

// Salvar estado da música periodicamente
setInterval(() => {
    if (!gameOver) {
        localStorage.setItem("music-state", JSON.stringify({
            isPlaying: isMusicPlaying,
            currentTime: bgMusic.currentTime,
            timestamp: Date.now()
        }));
    }
}, 5000); // Atualizar a cada 5 segundos

let gameOver = false;
let foodX, foodY;
let snakeX = 5, snakeY = 5;
let velocityX = 0, velocityY = 0;
let snakeBody = [];
let setIntervalId;
let score = 0;

// Obter maior pontuação do local storage
let highScore = localStorage.getItem("high-score") || 0;
highScoreElement.innerText = `Maior Pontuação: ${highScore}`;

// Gerar posição aleatória para a comida
const updateFoodPosition = () => {
    foodX = Math.floor(Math.random() * 30) + 1;
    foodY = Math.floor(Math.random() * 30) + 1;
};

const handleGameOver = () => {
    clearInterval(setIntervalId);
    alert("Game Over! Carrega no OK para jogar outra vez...");
    location.reload();
};

// Alterar a direção com base na tecla pressionada
const changeDirection = e => {
    if (e.key === "ArrowUp" && velocityY != 1) {
        velocityX = 0;
        velocityY = -1;
    } else if (e.key === "ArrowDown" && velocityY != -1) {
        velocityX = 0;
        velocityY = 1;
    } else if (e.key === "ArrowLeft" && velocityX != 1) {
        velocityX = -1;
        velocityY = 0;
    } else if (e.key === "ArrowRight" && velocityX != -1) {
        velocityX = 1;
        velocityY = 0;
    }
};

// Alterar direção ao clicar nos controles
controls.forEach(button => button.addEventListener("click", () => changeDirection({ key: button.dataset.key })));

const initGame = () => {
    if (gameOver) return handleGameOver();
    let html = `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;

    // Quando a cobra come a comida
    if (snakeX === foodX && snakeY === foodY) {
        updateFoodPosition();
        snakeBody.push([foodY, foodX]); // Adicionar comida ao corpo da cobra
        score++;
        highScore = score >= highScore ? score : highScore; // Atualizar a maior pontuação
        localStorage.setItem("high-score", highScore);

        scoreElement.innerText = `Pontuação: ${score}`;
        highScoreElement.innerText = `Maior Pontuação: ${highScore}`;

        eatSound.play(); // Tocar o som ao comer
    }

    // Atualizar posição da cabeça da cobra
    snakeX += velocityX;
    snakeY += velocityY;

    // Movimentar as partes do corpo da cobra
    for (let i = snakeBody.length - 1; i > 0; i--) {
        snakeBody[i] = snakeBody[i - 1];
    }
    snakeBody[0] = [snakeX, snakeY];

    // Verificar colisão com paredes ou corpo
    if (snakeX <= 0 || snakeX > 30 || snakeY <= 0 || snakeY > 30) {
        return gameOver = true;
    }

    // Renderizar corpo da cobra
    for (let i = 0; i < snakeBody.length; i++) {
        html += `<div class="head" style="grid-area: ${snakeBody[i][1]} / ${snakeBody[i][0]}"></div>`;
        if (i !== 0 && snakeBody[0][1] === snakeBody[i][1] && snakeBody[0][0] === snakeBody[i][0]) {
            gameOver = true;
        }
    }
    playBoard.innerHTML = html;
};

updateFoodPosition();
setIntervalId = setInterval(initGame, 95);
document.addEventListener("keyup", changeDirection);

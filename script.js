
let currentGenre = '';
let currentMovie = null;
let currentQuestion = 0;
let score = 0;
let lives = 3;
let streak = 0;
let timer = 15;
let timerInterval = null;
let genreData = {};
let unlockedGenres = ['superhero'];
let unlockedMovies = { superhero: [1] };
let completedMovies = {};
let questionTimes = [];


async function loadGenreData() {
    try {
        genreData.superhero = await fetch('data/superhero.json').then(r => r.json());
        genreData.romance = await fetch('data/romance.json').then(r => r.json());
        genreData.thriller = await fetch('data/thriller.json').then(r => r.json());
        genreData.fantasy = await fetch('data/fantasy.json').then(r => r.json());
        genreData.animation = await fetch('data/animation.json').then(r => r.json());
        loadGameState();
        initLobbyEntrance();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}


function initLobbyEntrance() {
    const enterBtn = document.getElementById('enter-lobby-btn');
    enterBtn.addEventListener('click', () => {
        const curtains = document.querySelector('.curtains');
        curtains.classList.add('active');
        setTimeout(() => {
            showGenreSelection();
        }, 1500);
    });
}


function showGenreSelection() {
    document.getElementById('lobby-entrance').classList.add('hidden');
    document.getElementById('genre-selection').classList.remove('hidden');
    document.getElementById('back-to-lobby').classList.add('hidden');
    const genreGrid = document.getElementById('genre-grid');
    genreGrid.innerHTML = '';

    const genres = ['superhero', 'romance', 'thriller', 'fantasy', 'animation'];
    
    genres.forEach(genreKey => {
        const genre = genreData[genreKey];
        if (!genre) return;

        const card = document.createElement('div');
        card.className = 'genre-card';
        
        if (!unlockedGenres.includes(genreKey)) {
            card.classList.add('locked');
            card.innerHTML = `
                <span class="lock-icon">🔒</span>
                <h2>${genre.name}</h2>
                <p>${genre.description}</p>
                <p style="font-size: 14px; color: #888;">Complete previous genre to unlock</p>
            `;
        } else {
            card.addEventListener('click', () => showMovies(genreKey));
            card.innerHTML = `
                <h2>${genre.name}</h2>
                <p>${genre.description}</p>
            `;
        }
        
        genreGrid.appendChild(card);
    });

    document.getElementById('back-to-lobby').addEventListener('click', () => {
        document.getElementById('genre-selection').classList.add('hidden');
        document.getElementById('lobby-entrance').classList.remove('hidden');
        const curtains = document.querySelector('.curtains');
        curtains.classList.remove('active');
    });
}


function showMovies(genreKey) {
    currentGenre = genreKey;
    const genre = genreData[genreKey];
    
    document.getElementById('genre-selection').classList.add('hidden');
    document.getElementById('movie-selection').classList.remove('hidden');
    document.getElementById('current-genre-title').textContent = genre.name;
    
    const movieGrid = document.getElementById('movie-grid');
    movieGrid.innerHTML = '';

    genre.movies.forEach(movie => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        
        const isUnlocked = unlockedMovies[genreKey]?.includes(movie.id);
        const isCompleted = completedMovies[`${genreKey}_${movie.id}`];
        
        if (!isUnlocked) {
            card.classList.add('locked');
        } else {
            card.addEventListener('click', () => startQuiz(genreKey, movie));
        }

        const emoji = movie.id === 1 ? '🎬' : movie.id === 2 ? '🎭' : '🎪';
        
        card.innerHTML = `
            <div class="movie-poster">${emoji}</div>
            <div class="movie-info">
                <h3 class="movie-title">${movie.name}</h3>
                <p class="movie-year">${movie.year}</p>
                ${isCompleted ? `
                    <div class="completion-badge">⭐</div>
                    <div class="score-display">${completedMovies[`${genreKey}_${movie.id}`].score}</div>
                ` : ''}
            </div>
        `;
        
        movieGrid.appendChild(card);
    });

    document.getElementById('back-to-genres').addEventListener('click', showGenreSelection);
}


function startQuiz(genreKey, movie) {
    currentMovie = movie;
    currentQuestion = 0;
    score = 0;
    lives = 3;
    streak = 0;
    questionTimes = [];
    
    document.getElementById('movie-selection').classList.add('hidden');
    document.getElementById('quiz-screen').classList.remove('hidden');
    
    document.getElementById('quiz-movie-title').textContent = movie.name;
    document.getElementById('quiz-movie-year').textContent = movie.year;
    
    loadQuestion();
}


function loadQuestion() {
    const question = currentMovie.questions[currentQuestion];
    if (!question) {
        endQuiz();
        return;
    }

    updateScorePanel();
    

    let numOptions = 4;
    if (currentQuestion >= 2 && currentQuestion < 4) numOptions = 5;
    if (currentQuestion >= 4) numOptions = 6;
    
    const displayOptions = question.options.slice(0, numOptions);
    
    document.getElementById('question-text').textContent = question.text;
    document.getElementById('current-question-num').textContent = currentQuestion + 1;
    
    const answerOptions = document.getElementById('answer-options');
    answerOptions.innerHTML = '';
    answerOptions.style.gridTemplateColumns = numOptions === 2 ? '1fr' : `repeat(${numOptions}, 1fr)`;
    
    displayOptions.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'answer-option';
        btn.textContent = option;
        btn.addEventListener('click', () => selectAnswer(index));
        answerOptions.appendChild(btn);
    });


    showCountdown();
}


function showCountdown() {
    const countdown = document.getElementById('countdown');
    const countdownNumber = document.getElementById('countdown-number');
    countdown.classList.remove('hidden');
    
    let num = 3;
    countdownNumber.textContent = num;
    
    const countdownInterval = setInterval(() => {
        num--;
        if (num > 0) {
            countdownNumber.textContent = num;
        } else {
            clearInterval(countdownInterval);
            countdown.classList.add('hidden');
            startQuestion();
        }
    }, 800);
}


function startQuestion() {
    const maxTime = 15 - currentQuestion;
    timer = maxTime;
    
    const startInterval = Date.now();
    

    document.getElementById('timer-fill').style.transition = 'none';
    document.getElementById('timer-fill').style.width = '100%';
    
    setTimeout(() => {
        document.getElementById('timer-fill').style.transition = `width ${maxTime}s linear`;
        document.getElementById('timer-fill').style.width = '0%';
    }, 50);
    
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startInterval) / 1000);
        const remaining = Math.max(0, maxTime - elapsed);
        
        document.getElementById('timer-text').textContent = `${remaining}s`;
        

        let color1 = '#00ff00';
        let color2 = '#00ff00';
        if (remaining < maxTime * 0.5) {
            color1 = '#ffff00';
            color2 = '#ff0000';
        }
        if (remaining < maxTime * 0.2) {
            color1 = '#ff0000';
            color2 = '#8b0000';
        }
        document.getElementById('timer-fill').style.background = `linear-gradient(90deg, ${color1}, ${color2})`;
        
        if (remaining === 0) {
            clearInterval(timerInterval);
            timeUp();
        }
    }, 100);
}


function timeUp() {

    currentQuestion++;
    if (currentQuestion < currentMovie.questions.length) {
        setTimeout(() => loadQuestion(), 1000);
    } else {
        endQuiz();
    }
}


function selectAnswer(selectedIndex) {
    if (timerInterval) clearInterval(timerInterval);
    
    const question = currentMovie.questions[currentQuestion];
    const answerOptions = document.querySelectorAll('.answer-option');
    
    let isCorrect = selectedIndex === question.correct;
    
    answerOptions.forEach((btn, index) => {
        btn.classList.add('selected');
        if (index === question.correct) {
            btn.classList.add('correct');
        }
        if (index !== question.correct && index === selectedIndex) {
            btn.classList.add('wrong');
        }
    });
    
    setTimeout(() => {
        if (isCorrect) {
            streak++;

            const basePoints = 10;
            const timeBonus = (timer / 15) * 5;
            const totalPoints = (basePoints + timeBonus) * (1 + streak * 0.5);
            score += Math.floor(totalPoints);
            updateScorePanel();
        } else {
            streak = 0;
            lives--;
            if (lives <= 0) {
                setTimeout(() => gameOver(), 2000);
                return;
            }
            updateScorePanel();
        }
        
        setTimeout(() => {
            currentQuestion++;
            if (currentQuestion < currentMovie.questions.length) {
                loadQuestion();
            } else {
                endQuiz();
            }
        }, 1500);
    }, 1000);
}


function updateScorePanel() {
    document.getElementById('current-score').textContent = score;
    
    let hearts = '';
    for (let i = 0; i < lives; i++) hearts += '❤️';
    for (let i = lives; i < 3; i++) hearts += '🖤';
    document.getElementById('lives-display').innerHTML = hearts;
    
    document.getElementById('streak-display').textContent = `${streak}x`;
}


function endQuiz() {
    document.getElementById('quiz-screen').classList.add('hidden');
    
    const percentage = (currentQuestion / currentMovie.questions.length) * 100;
    
    if (percentage >= 50) {

        if (!unlockedMovies[currentGenre].includes(currentMovie.id + 1)) {
            unlockedMovies[currentGenre].push(currentMovie.id + 1);
        }
        

        completedMovies[`${currentGenre}_${currentMovie.id}`] = {
            score: score,
            percentage: percentage
        };
        
        saveGameState();
        showResults();
    } else {
        gameOver();
    }
}


function showResults() {
    document.getElementById('results-screen').classList.remove('hidden');
    
    const percentage = Math.round((currentQuestion / currentMovie.questions.length) * 100);
    document.getElementById('final-score').textContent = score;
    document.getElementById('percentage-correct').textContent = `${percentage}%`;
    document.getElementById('avg-time').textContent = '12s';
    document.getElementById('remaining-lives').textContent = lives;
    
    document.getElementById('back-to-movies-btn').addEventListener('click', () => {
        document.getElementById('results-screen').classList.add('hidden');
        showMovies(currentGenre);
    });
}


function gameOver() {
    document.getElementById('game-over-screen').classList.remove('hidden');
    
    document.getElementById('completed-questions').textContent = currentQuestion;
    document.getElementById('game-over-score').textContent = score;
    
    document.getElementById('retry-btn').addEventListener('click', () => {
        document.getElementById('game-over-screen').classList.add('hidden');
        startQuiz(currentGenre, currentMovie);
    });
    
    document.getElementById('return-to-movies-btn').addEventListener('click', () => {
        document.getElementById('game-over-screen').classList.add('hidden');
        showMovies(currentGenre);
    });
}


function saveGameState() {
    localStorage.setItem('unlockedGenres', JSON.stringify(unlockedGenres));
    localStorage.setItem('unlockedMovies', JSON.stringify(unlockedMovies));
    localStorage.setItem('completedMovies', JSON.stringify(completedMovies));
}

function loadGameState() {
    if (localStorage.getItem('unlockedGenres')) {
        unlockedGenres = JSON.parse(localStorage.getItem('unlockedGenres'));
    }
    if (localStorage.getItem('unlockedMovies')) {
        unlockedMovies = JSON.parse(localStorage.getItem('unlockedMovies'));
    }
    if (localStorage.getItem('completedMovies')) {
        completedMovies = JSON.parse(localStorage.getItem('completedMovies'));
    }
}


loadGenreData();


let currentGenre = '';
let currentMovie = null;
let currentQuestion = 0;
let correctAnswers = 0;
let score = 0;
let lives = 3;
let streak = 0;
let timer = 15;
let timerInterval = null;
let questionStartTime = null;
let timeUpCalled = false;
let genreData = {};
let unlockedGenres = ['superhero'];
let unlockedMovies = { superhero: [1] };
let completedMovies = {};
let questionTimes = [];


async function loadGenreData() {
    try {
        const genreKeys = ['superhero', 'romance', 'thriller', 'fantasy', 'animation'];
        
        for (const key of genreKeys) {
            try {
                genreData[key] = await fetch(`data/${key}.json`).then(r => r.json());
            } catch (err) {
                console.warn(`Failed to load ${key}:`, err);
            }
        }
        
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
    document.getElementById('movie-selection').classList.add('hidden');
    document.getElementById('quiz-screen').classList.add('hidden');
    document.getElementById('results-screen').classList.add('hidden');
    document.getElementById('game-over-screen').classList.add('hidden');
    document.getElementById('collection-screen').classList.add('hidden');
    document.getElementById('genre-selection').classList.remove('hidden');
    document.getElementById('back-to-lobby').classList.add('hidden');
    const genreGrid = document.getElementById('genre-grid');
    genreGrid.innerHTML = '';


    const genres = Object.keys(genreData);
    
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

    const backToLobbyBtn = document.getElementById('back-to-lobby');
    backToLobbyBtn.replaceWith(backToLobbyBtn.cloneNode(true));
    document.getElementById('back-to-lobby').addEventListener('click', function() {
        console.log('Back to lobby clicked');
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
    document.getElementById('quiz-screen').classList.add('hidden');
    document.getElementById('results-screen').classList.add('hidden');
    document.getElementById('game-over-screen').classList.add('hidden');
    document.getElementById('collection-screen').classList.add('hidden');
    document.getElementById('lobby-entrance').classList.add('hidden');
    
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
        
        if (isCompleted) {
            card.innerHTML = `
                <div class="movie-poster">${emoji}</div>
                <div class="movie-info">
                    <h3 class="movie-title">${movie.name}</h3>
                    <p class="movie-year">${movie.year}</p>
                    <div class="completion-badge">⭐</div>
                    <div class="score-display">${completedMovies[`${genreKey}_${movie.id}`].score}</div>
                </div>
            `;
        } else {
            card.innerHTML = `
                <div class="movie-poster">${emoji}</div>
                <div class="movie-info">
                    <h3 class="movie-title">${movie.name}</h3>
                    <p class="movie-year">${movie.year}</p>
                </div>
            `;
        }
        
        movieGrid.appendChild(card);
    });

    const backBtn = document.getElementById('back-to-genres');
    backBtn.replaceWith(backBtn.cloneNode(true));
    document.getElementById('back-to-genres').addEventListener('click', function() {
        console.log('Back to genres clicked');
        showGenreSelection();
    });
}


function startQuiz(genreKey, movie) {

    const shuffledMovie = JSON.parse(JSON.stringify(movie));
    

    for (let i = shuffledMovie.questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledMovie.questions[i], shuffledMovie.questions[j]] = [shuffledMovie.questions[j], shuffledMovie.questions[i]];
    }
    
    currentMovie = shuffledMovie;
    currentQuestion = 0;
    correctAnswers = 0;
    score = 0;
    lives = 3;
    streak = 0;
    questionTimes = [];
    questionStartTime = null;
    
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
    

    timeUpCalled = false;
    

    questionStartTime = Date.now();

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
    

    const maxTime = Math.max(10, 15 - currentQuestion);
    timer = maxTime;
    console.log('Starting question', currentQuestion + 1, 'with', maxTime, 'seconds');
    

    const startInterval = Date.now();
    
    let num = 3;
    countdownNumber.textContent = num;
    

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
            timerInterval = null;
            timeUp();
        }
    }, 100);
    
    const countdownInterval = setInterval(() => {
        num--;
        if (num > 0) {
            countdownNumber.textContent = num;
        } else {
            clearInterval(countdownInterval);
            countdown.classList.add('hidden');

            startQuestionTimer();
        }
    }, 800);
}


function startQuestionTimer() {
    const maxTime = Math.max(10, 15 - currentQuestion);
    
    const startInterval = Date.now();
    

    document.getElementById('timer-fill').style.transition = 'none';
    document.getElementById('timer-fill').style.width = '100%';
    
    setTimeout(() => {
        document.getElementById('timer-fill').style.transition = `width ${maxTime}s linear`;
        document.getElementById('timer-fill').style.width = '0%';
    }, 50);
}



function timeUp() {

    if (timeUpCalled) {
        console.log('TimeUp already called, ignoring');
        return;
    }
    timeUpCalled = true;
    

    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    

    console.log('Time ran out for question', currentQuestion + 1);
    lives--;
    questionTimes.push(15 - currentQuestion);
    
    if (lives <= 0) {
        console.log('No lives left, ending quiz');
        setTimeout(() => gameOver(), 1000);
        return;
    }
    
    updateScorePanel();
    console.log('Lives remaining:', lives);
    

    setTimeout(() => {
        currentQuestion++;
        if (currentQuestion < currentMovie.questions.length) {
            loadQuestion();
        } else {
            endQuiz();
        }
    }, 1000);
}


function selectAnswer(selectedIndex) {

    if (timeUpCalled) {
        console.log('Answer already processed, ignoring click');
        return;
    }
    
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    

    timeUpCalled = true;
    

    if (questionStartTime) {
        const timeTaken = (Date.now() - questionStartTime) / 1000;
        questionTimes.push(timeTaken);
        console.log('Question', currentQuestion + 1, 'time:', timeTaken + 's');
    }
    
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
            correctAnswers++;

            const basePoints = 10;
            const maxTimeForQuestion = Math.max(10, 15 - currentQuestion);
            const timeBonus = Math.max(0, (timer / maxTimeForQuestion) * 5);
            const totalPoints = (basePoints + timeBonus) * (1 + streak * 0.3);
            score += Math.floor(totalPoints);
            updateScorePanel();
            console.log('Score added:', Math.floor(totalPoints), 'Total:', score, 'Correct:', correctAnswers);
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
            if (lives > 0) {
                currentQuestion++;
                if (currentQuestion < currentMovie.questions.length) {
                    loadQuestion();
                } else {
                    console.log('All questions answered, ending quiz');
                    endQuiz();
                }
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
    clearInterval(timerInterval);
    document.getElementById('quiz-screen').classList.add('hidden');
    
    const totalQuestions = currentMovie.questions.length;
    const percentage = Math.min(100, Math.round((correctAnswers / totalQuestions) * 100));
    
    console.log('Quiz ended. Correct:', correctAnswers, 'Total:', totalQuestions, 'Percentage:', percentage);
    

    completedMovies[`${currentGenre}_${currentMovie.id}`] = {
        score: score,
        percentage: percentage
    };
    
    if (percentage >= 50) {

        if (!unlockedMovies[currentGenre].includes(currentMovie.id + 1)) {
            unlockedMovies[currentGenre].push(currentMovie.id + 1);
        }
        

        checkAndUnlockNextGenre();
        
        saveGameState();
        showResults();
    } else {
        gameOver();
    }
}


function checkAndUnlockNextGenre() {
    const genre = genreData[currentGenre];
    let allCompleted = true;
    
    for (let movie of genre.movies) {
        const key = `${currentGenre}_${movie.id}`;
        if (!completedMovies[key] || completedMovies[key].percentage < 50) {
            allCompleted = false;
            break;
        }
    }
    
    if (allCompleted) {

        const genreOrder = ['superhero', 'romance', 'thriller', 'fantasy', 'animation'];
        const currentIndex = genreOrder.indexOf(currentGenre);
        
        if (currentIndex < genreOrder.length - 1) {
            const nextGenre = genreOrder[currentIndex + 1];
            if (!unlockedGenres.includes(nextGenre)) {
                unlockedGenres.push(nextGenre);
                if (!unlockedMovies[nextGenre]) {
                    unlockedMovies[nextGenre] = [1];
                }
            }
        }
    }
}


function showResults() {
    document.getElementById('results-screen').classList.remove('hidden');
    
    const totalQuestions = currentMovie.questions.length;
    const percentage = Math.min(100, Math.round((correctAnswers / totalQuestions) * 100));
    
    console.log('Results - Correct:', correctAnswers, 'Total:', totalQuestions, 'Percentage:', percentage);
    console.log('Question times:', questionTimes);
    

    let avgTime = 12;
    if (questionTimes.length > 0) {
        const sum = questionTimes.reduce((a, b) => a + b, 0);
        avgTime = Math.round(sum / questionTimes.length);
    }
    
    document.getElementById('final-score').textContent = score;
    document.getElementById('percentage-correct').textContent = `${percentage}%`;
    document.getElementById('avg-time').textContent = `${avgTime}s`;
    document.getElementById('remaining-lives').textContent = lives;
    
    const backBtn = document.getElementById('back-to-movies-btn');
    backBtn.replaceWith(backBtn.cloneNode(true));
    document.getElementById('back-to-movies-btn').addEventListener('click', () => {
        console.log('Back to movies clicked');
        document.getElementById('results-screen').classList.add('hidden');
        showMovies(currentGenre);
    });
    
    const collectionBtn = document.getElementById('view-collection-btn');
    if (collectionBtn) {
        collectionBtn.replaceWith(collectionBtn.cloneNode(true));
        document.getElementById('view-collection-btn').addEventListener('click', () => {
            console.log('View collection clicked');
            showCollection();
        });
    }
}


function showCollection() {
    document.getElementById('results-screen').classList.add('hidden');
    document.getElementById('collection-screen').classList.remove('hidden');
    

    let totalMovies = 0;
    let totalScore = 0;
    
    for (let genreKey in completedMovies) {
        totalMovies++;
        totalScore += completedMovies[genreKey].score;
    }
    
    const avgScore = totalMovies > 0 ? Math.round(totalScore / totalMovies) : 0;
    
    document.getElementById('movies-completed').textContent = totalMovies;
    document.getElementById('avg-collection-score').textContent = avgScore;
    

    const collectionGrid = document.getElementById('collection-grid');
    collectionGrid.innerHTML = '';
    
    for (let genreKey in completedMovies) {
        const [gen, movieId] = genreKey.split('_');
        const genre = genreData[gen];
        if (!genre) continue;
        
        const movie = genre.movies.find(m => m.id == movieId);
        if (!movie) continue;
        
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.innerHTML = `
            <div class="movie-poster">🎬</div>
            <div class="movie-info">
                <h3 class="movie-title">${movie.name}</h3>
                <p class="movie-year">${movie.year}</p>
                <div class="completion-badge">⭐</div>
                <div class="score-display">${completedMovies[genreKey].score}</div>
            </div>
        `;
        collectionGrid.appendChild(card);
    }
    
    const backFromCollectionBtn = document.getElementById('back-from-collection');
    backFromCollectionBtn.replaceWith(backFromCollectionBtn.cloneNode(true));
    document.getElementById('back-from-collection').addEventListener('click', function() {
        console.log('Back from collection clicked');
        document.getElementById('collection-screen').classList.add('hidden');
        showGenreSelection();
    });
}


function gameOver() {
    document.getElementById('game-over-screen').classList.remove('hidden');
    
    document.getElementById('completed-questions').textContent = correctAnswers;
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


let dontShowTutorial = localStorage.getItem('dontShowTutorial') === 'true';
console.log('Tutorial disabled:', dontShowTutorial);

function showTutorial() {
    console.log('Showing tutorial...');
    const modal = document.getElementById('tutorial-modal');
    console.log('Modal element:', modal);
    if (modal) {
        modal.classList.remove('hidden');
        console.log('Tutorial modal shown');
    } else {
        console.error('Tutorial modal not found!');
    }
}

function hideTutorial() {
    console.log('Hiding tutorial...');
    const modal = document.getElementById('tutorial-modal');
    if (modal) {
        modal.classList.add('hidden');
        console.log('Tutorial modal hidden');
    } else {
        console.error('Tutorial modal not found!');
    }
}


loadGenreData();


document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, setting up tutorial handlers...');
    
    const closeBtn = document.getElementById('close-tutorial');
    const gotItBtn = document.getElementById('got-it-btn');
    const helpBtn = document.getElementById('help-btn');
    
    console.log('closeBtn:', closeBtn);
    console.log('gotItBtn:', gotItBtn);
    console.log('helpBtn:', helpBtn);
    
    if (closeBtn) {
        console.log('Attaching close button handler');
        closeBtn.addEventListener('click', function() {
            console.log('Close button clicked');
            hideTutorial();
        });
    }
    
    if (gotItBtn) {
        console.log('Attaching got-it button handler');
        gotItBtn.addEventListener('click', function() {
            console.log('Got it button clicked');
            const checkbox = document.getElementById('dont-show-again');
            console.log('Checkbox:', checkbox);
            if (checkbox && checkbox.checked) {
                console.log('Saving dont-show setting');
                localStorage.setItem('dontShowTutorial', 'true');
                dontShowTutorial = true;
            }
            hideTutorial();
        });
    }
    
    if (helpBtn) {
        console.log('Attaching help button handler');
        helpBtn.addEventListener('click', function() {
            console.log('Help button clicked');
            showTutorial();
        });
    }
    

    if (!dontShowTutorial) {
        console.log('Showing tutorial on first load');
        setTimeout(() => {
            showTutorial();
        }, 1000);
    }
});
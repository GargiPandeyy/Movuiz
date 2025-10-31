# Movuiz 🎬

A movie quiz game.

Pick a genre, choose a movie, and answer 5 questions about it. Get at least 50% right to unlock the next movie. Complete all 3 movies in a genre to unlock the next genre!

## Scoring

- **Base points**: 10 per correct answer
- **Time bonus**: Answer faster for extra points
- **Streak multiplier**: Get multiple right in a row for bigger scores
- **Lives**: You have 3 hearts - lose them all and it's game over

## It Gets Harder

- More wrong answers to choose from (4 → 5 → 6 options)
- Timer gets shorter each question
- Questions get progressively more difficult

## Features

- Theater curtain opening animation
- Keyboard shortcuts (press 1-6 to answer)
- Progress tracking with localStorage
- Perfect score celebration screen

It was quite hard honestly speaking to make this project but i had got a taste of javascript by creating some project so i was able to make this one with some more fun. 

The biggest challenge was managing multiple timers simultaneously - coordinating the countdown, question timer, and visual timer bar while preventing race conditions and duplicate function calls. I learned to use flags to prevent bugs when timers would fire multiple times. Managing game state without a framework was also tricky - tracking unlocked genres, completed movies, scores, and lives across different screens while keeping everything synchronized. 

I also struggled with event listener memory leaks until I learned the replaceWith(cloneNode()) pattern to clean them up, and implementing the Fisher-Yates shuffle algorithm for randomizing questions taught me proper array shuffling beyond just using Math.random().

Took helped from friends, used a little bit of ai, learned and coded a lot.

[![Athena Award Badge](https:

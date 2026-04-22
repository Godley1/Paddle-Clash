# Modernizing “A Web Game in an Hour”: Neon Clash

## Project Overview
Neon Clash is a modernized remake of the 2015 tutorial “A Web Game in an Hour.” The original tutorial demonstrated how to build a simple browser game using HTML, CSS, JavaScript, jQuery, and older web development practices. My goal was to refactor the original idea using modern web standards while improving the gameplay, structure, and visual design.

## Original Game Summary
The original tutorial focused on building a lightweight arcade-style browser game that could run across devices. It used a combination of HTML, CSS, JavaScript, sprite graphics, and jQuery. While the tutorial was useful for its time, parts of the structure and coding style are now outdated compared to current best practices.

## Technologies Used
- HTML5
- CSS3
- JavaScript ES6+
- Canvas API
- GitHub
- GitHub Pages

## How the Updated Version Works
In my version, the player controls the left paddle while the computer controls the right paddle. The ball bounces off the paddles and walls, and the goal is to score by sending the ball past the opponent. After every 5 successful paddle returns, a new ball is added to the game. This creates a progressive difficulty system that increases the pace and challenge of each match. The first side to score 5 points wins.

## Key Improvements
- Replaced older coding patterns with modern JavaScript ES6+ syntax
- Organized the project into separate HTML, CSS, and JavaScript files
- Improved the visual design with a modern neon theme
- Added a responsive layout for better browser display
- Simplified the gameplay into a direct bounce system
- Added a multi-ball difficulty mechanic after every 5 successful rally hits
- Improved game reliability with cleaner logic and validation checks

## Challenges and Solutions
One of the main challenges was adapting older tutorial logic into a format that works smoothly in modern browsers. I also had to debug issues related to ball movement and rendering. To solve these problems, I simplified the gameplay structure, used cleaner logic, and added checks to prevent invalid ball behavior. Another challenge was managing the multi-ball feature without making the game confusing, so I reset the rally system after each point to keep the mechanics balanced.

## Conclusion
This project successfully modernized the original tutorial while adding my own gameplay style and design improvements. The final result is a cleaner, more responsive, and more engaging browser game that demonstrates how older web projects can be updated using current development standards.

# PixiJS 2D Animation Project

This project was built using **Pixi.js**, a 2D rendering library for the web.  
It demonstrates various graphical transformations, animations, and interactive features according to the individual PixiJS task.

## How to run the project

1. Download or clone this repository to your computer.
2. Install the dependencies:
   ```bash
   npm install
   ```
   Open is required
3. Open a terminal and run the following command:
   ```bash
   npm run dev
   ```
4. Your default browser will automatically open and display the project.

# Task Requirements Implemented

The project fulfills the following task requirements:

| Requirements                                  | where?                                                                                                 |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| [x] Rotations                                 | Container.rotation = Math.atan2(dy, dx) + Math.PI / 2                                                  |
| [x] Translations                              | Implemented in the app.ticker loop, updating container.x and container.y.                              |
| [x] Scaling                                   | window.addEventListener("wheel")                                                                       |
| [x] Transparency                              | app.canvas.addEventListener("contextmenu").                                                            |
| [x] Containers                                | const container = new Container();                                                                     |
| [x] Sprites & AnimatedSprites                 | The spaceship is a Sprite, the fire animation is an AnimatedSprite, and asteroids are AnimatedSprites. |
| [x] Rope / Trail Effect                       | See ropePoints and trail logic in app.ticker.                                                          |
| [x] Mouse Events                              | pointermove for rotation and movement, wheel for scaling, contextmenu for transparency.                |
| Extra Features (not required but implemented) | Shooting bullets with Spacebar                                                                         |

# How the code is organized

1. main.ts → Main game logic and PixiJS setup.
2. Controller.ts → Controller logic (if any specific input handling).
3. assets/ → All images and JSON sprite sheets used in the project.

# Notes

1. **SimpleRope** was replaced by Graphics for simplicity and to avoid errors; the trail still fulfills the rope effect requirement.

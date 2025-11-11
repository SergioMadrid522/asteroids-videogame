/* libraries */
import {
  Application,
  Assets,
  Container,
  Sprite,
  Texture,
  AnimatedSprite,
  Graphics,
  Point,
  Text,
} from "pixi.js";

/* types */
type Asteroid = AnimatedSprite & {
  speedX: number;
  speedY: number;
};
type Bullet = Graphics & {
  speedX: number;
  speedY: number;
};

(async () => {
  const app = new Application();
  await app.init({
    resizeTo: window,
  });
  document.body.appendChild(app.canvas);
  const backgroundTexture = await Assets.load("/assets/background.webp");
  const background = new Sprite(backgroundTexture);
  background.width = app.screen.width;
  background.height = app.screen.height;
  app.stage.addChild(background); /* CONTAINER CREATION */

  const container = new Container();
  app.stage.addChild(container); /* SPACESHIP SPRITE CREATION */

  const spaceShipTexture = await Assets.load("/assets/spaceShip.png");
  const spaceShip = new Sprite(spaceShipTexture);

  spaceShip.width = 58;
  spaceShip.height = 58;
  spaceShip.anchor.set(0.5);
  container.addChild(spaceShip); /* FIRE / TURBO ANIMATION */

  const fireSheet = await Assets.load("/assets/fire.json");

  container.x = app.screen.width / 2;
  container.y = app.screen.height / 2; // --- REQUISITO: IMPLEMENTACIÓN DE ROPE ---
  // change to Graphics for the trail (simpler and without errors)

  const historyLength = 20; // tail length
  const ropePoints: Point[] = [];
  for (let i = 0; i < historyLength; i++) {
    ropePoints.push(new Point(container.x, container.y));
  }
  const trail = new Graphics(); // Use Graphics instead of SimpleRope
  app.stage.addChildAt(trail, 1); // --- CONTADOR DE ASTEROIDES DESTRUIDOS ---
  let score = 0; // Variable para el puntaje
  const scoreText = new Text({
    text: `Asteroides destruidos: ${score}`,
    style: {
      fontFamily: "Arial",
      fontSize: 24,
      fill: 0xffffff,
      align: "left",
    },
  });
  scoreText.x = 10;
  scoreText.y = 10;
  app.stage.addChild(scoreText);

  let shakeDuration = 0;
  const shakeIntensity = 2.5;
  let shakingAsteroid: Asteroid | null = null;

  // --- REQUISITOS: EVENTOS DE MOUSE (Cumplen la tarea) ---
  // 1. Hacer el stage interactivo para que escuche eventos de mouse

  app.stage.interactive = true; // 2. Traslación y Rotación (con 'pointermove')
  let targetX = app.screen.width / 2;
  let targetY = app.screen.height / 2;
  const moveSpeed = 5;
  app.stage.on("pointermove", (event) => {
    const pointerPos = event.global;
    targetX = pointerPos.x;
    targetY = pointerPos.y;
    // Calculate the rotation towards the target
    const dx = targetX - container.x;
    const dy = targetY - container.y;
    container.rotation = Math.atan2(dy, dx) + Math.PI / 2;
  });

  window.addEventListener("wheel", (event) => {
    event.preventDefault(); // Prevents the page from scrolling
    const scaleAmount = 0.05;

    if (event.deltaY < 0) {
      // Roll up
      container.scale.x += scaleAmount;
      container.scale.y += scaleAmount;
    } else {
      // Roll down
      container.scale.x -= scaleAmount;
      container.scale.y -= scaleAmount;
    }
    // Limit the scale
    container.scale.x = Math.max(0.5, container.scale.x);
    container.scale.y = Math.max(0.5, container.scale.y);
  });

  app.canvas.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    if (container.alpha === 1.0) {
      container.alpha = 0.5;
    } else {
      container.alpha = 1.0;
    }
  }); /* CREATE ASTEROID */
  await Assets.load("/assets/small-asteroid.json");
  const frames = [];

  for (let i = 0; i < 60; i++) {
    const paddedIndex = i.toString().padStart(2, "0");
    const frameName = `Asteroid-A-10-${paddedIndex}.png`;
    frames.push(Texture.from(frameName));
  }

  const asteroids: Asteroid[] = [];
  const numAsteroids = 50;
  for (let i = 0; i < numAsteroids; i++) {
    const asteroid = new AnimatedSprite(frames) as Asteroid;

    asteroid.anchor.set(0.5);
    asteroid.animationSpeed = 0.1 + Math.random() * 0.1;
    asteroid.gotoAndPlay(Math.floor(Math.random() * 60));
    asteroid.x = Math.random() * app.screen.width;
    asteroid.y = Math.random() * app.screen.height;

    let speedX = (Math.random() - 0.5) * 2;
    let speedY = (Math.random() - 0.5) * 2;

    while (Math.abs(speedX) + Math.abs(speedY) < 1) {
      speedX = (Math.random() - 0.5) * 2;
      speedY = (Math.random() - 0.5) * 2;
    }

    asteroid.speedX = speedX;
    asteroid.speedY = speedY;
    app.stage.addChild(asteroid);
    asteroids.push(asteroid);
  }
  const bullets: Bullet[] = [];
  const bulletSpeed = 8;
  let lastShotTime = 0;
  const shotCooldown = 250;

  let spacePressed = false;

  window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      spacePressed = true;
    }
  });

  window.addEventListener("keyup", (e) => {
    if (e.code === "Space") {
      spacePressed = false;
    }
  });
  console.log(Object.keys(fireSheet.textures));

  app.ticker.add(() => {
    // move the ship towards the target position (mouse event)
    if (shakeDuration <= 0) {
      const dx = targetX - container.x;
      const dy = targetY - container.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > 1) {
        container.x += (dx / distance) * moveSpeed;
        container.y += (dy / distance) * moveSpeed;
      }
    }

    // shootting logic (with spacebar)
    const now = Date.now();
    if (spacePressed && now - lastShotTime > shotCooldown) {
      lastShotTime = now;
      const bullet = new Graphics() as Bullet;
      bullet.circle(0, 0, 4).fill(0xffffff);

      const shipGlobalPosition = container.getGlobalPosition();
      bullet.x = shipGlobalPosition.x;
      bullet.y = shipGlobalPosition.y;

      const angle = container.rotation - Math.PI / 2;
      bullet.speedX = Math.cos(angle) * bulletSpeed;
      bullet.speedY = Math.sin(angle) * bulletSpeed;

      app.stage.addChild(bullet);
      bullets.push(bullet);
    }

    // Update bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];
      bullet.x += bullet.speedX;
      bullet.y += bullet.speedY;
    }

    // --- REQUISITO: Actualizar el ROPE ---
    for (let i = ropePoints.length - 1; i > 0; i--) {
      ropePoints[i].x = ropePoints[i - 1].x;
      ropePoints[i].y = ropePoints[i - 1].y;
    }
    ropePoints[0].x = container.x;
    ropePoints[0].y = container.y;

    // draw the trail using Graphics
    trail.clear();
    trail.moveTo(ropePoints[0].x, ropePoints[0].y);
    for (let i = 1; i < ropePoints.length; i++) {
      trail.lineTo(ropePoints[i].x, ropePoints[i].y);
    }
    trail.stroke({ width: 5, color: 0xff0000 });

    // Crash detection
    if (shakeDuration > 0) {
      shakeDuration--;
      //Moves the container(ship) randomly
      container.x += (Math.random() - 0.5) * shakeIntensity;
      container.y += (Math.random() - 0.5) * shakeIntensity;
      if (shakingAsteroid) {
        shakingAsteroid.x += (Math.random() - 0.5) * shakeIntensity;
        shakingAsteroid.y += (Math.random() - 0.5) * shakeIntensity;
      }
    }

    // asteroids Logic + Collision Detection
    for (let a = asteroids.length - 1; a >= 0; a--) {
      const asteroid = asteroids[a];
      asteroid.x += asteroid.speedX;
      asteroid.y += asteroid.speedY;

      if (asteroid.x > app.screen.width + asteroid.width / 2)
        asteroid.x = -asteroid.width / 2;
      else if (asteroid.x < -asteroid.width / 2)
        asteroid.x = app.screen.width + asteroid.width / 2;
      if (asteroid.y > app.screen.height + asteroid.height / 2)
        asteroid.y = -asteroid.height / 2;
      else if (asteroid.y < -asteroid.height / 2)
        asteroid.y = app.screen.height + asteroid.height / 2;

      // Collision detection with spaceship
      const shipDx = container.x - asteroid.x;
      const shipDy = container.y - asteroid.y;
      const shipDistance = Math.sqrt(shipDx * shipDx + shipDy * shipDy);
      if (
        shipDistance < (spaceShip.width + asteroid.width) / 2 &&
        shakeDuration <= 0
      ) {
        // Shake asteroid
        shakeDuration = 10;
        shakingAsteroid = asteroid;
      }

      // Collision detection with bullets
      for (let b = bullets.length - 1; b >= 0; b--) {
        const bullet = bullets[b];
        const dx = asteroid.x - bullet.x;
        const dy = asteroid.y - bullet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < asteroid.width * 0.4) {
          const explosion = new Graphics().circle(0, 0, 0).fill(0xffd700);
          explosion.x = asteroid.x;
          explosion.y = asteroid.y;
          app.stage.addChild(explosion);

          let explosionRadius = 0;
          const explosionTicker = (delta: number) => {
            explosionRadius += 4 * delta;
            explosion.clear();
            explosion.circle(0, 0, explosionRadius).fill(0xffa500);

            if (explosionRadius > 30) {
              app.stage.removeChild(explosion);
              app.ticker.remove(explosionTicker);
            }
          };
          app.ticker.add(explosionTicker);

          app.stage.removeChild(asteroid);
          asteroids.splice(a, 1);

          app.stage.removeChild(bullet);
          bullets.splice(b, 1);

          // Increments the score and updates the text
          score++;
          scoreText.text = `Asteroides destruidos: ${score}`;

          break;
        }
      }
    }
  });
})();

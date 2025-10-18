/* libraries */
import {
  Application,
  Assets,
  Container,
  Sprite,
  Texture,
  AnimatedSprite,
  Graphics,
} from "pixi.js";
/* controllers */
import { Controller } from "./Controller.ts";
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
  const controller = new Controller();
  /* BACKGROUND CREATION */
  const backgroundTexture = await Assets.load("/assets/background.webp");
  const background = new Sprite(backgroundTexture);
  background.width = app.screen.width;
  background.height = app.screen.height;
  app.stage.addChild(background);

  /* CONTAINER CREATION */
  const container = new Container();
  app.stage.addChild(container);

  /* SPACESHIP SPRITE CREATION */
  const spaceShipTexture = await Assets.load("/assets/spaceShip.png");
  const spaceShip = new Sprite(spaceShipTexture);

  spaceShip.width = 58;
  spaceShip.height = 58;
  spaceShip.anchor.set(0.5);
  container.addChild(spaceShip);

  /* CENTER SPACESHIP */
  container.pivot.x = container.width / 2;
  container.pivot.y = container.height / 2;
  container.x = app.screen.width / 2;
  container.y = app.screen.height / 2;

  /* CREATE ASTEROID */
  await Assets.load("/assets/small-asteroid.json");
  const frames = [];

  for (let i = 0; i < 60; i++) {
    const paddedIndex = i.toString().padStart(2, "0");
    const frameName = `Asteroid-A-10-${paddedIndex}.png`;
    frames.push(Texture.from(frameName));
  }

  const asteroids: Asteroid[] = [];
  const numAsteroids = 10;
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
  const speed = 3;
  const rotation = 2;

  const bullets: Bullet[] = [];
  const bulletSpeed = 8;
  let lastShotTime = 0;
  const shotCooldown = 250;

  app.ticker.add(() => {
    /* Movement logic */
    if (controller.up) {
      spaceShip.y -= speed;
      spaceShip.angle -= rotation;
    }
    if (controller.down) {
      spaceShip.y += speed;
      spaceShip.angle += rotation;
    }
    if (controller.left) {
      spaceShip.x -= speed;
    }
    if (controller.right) {
      spaceShip.x += speed;
    }
    /* Shooting logic */
    const now = Date.now();
    if (controller.leftClick && now - lastShotTime > shotCooldown) {
      lastShotTime = now;
      const bullet = new Graphics() as Bullet;
      bullet.circle(0, 0, 4).fill(0xffffff);

      const shipGlobalPosition = spaceShip.getGlobalPosition();
      bullet.x = shipGlobalPosition.x;
      bullet.y = shipGlobalPosition.y;

      /* Calculate the angle from the spaceShip and shoot from there */
      const angle = spaceShip.rotation - Math.PI / 2;
      bullet.speedX = Math.cos(angle) * bulletSpeed;
      bullet.speedY = Math.sin(angle) * bulletSpeed;

      app.stage.addChild(bullet);
      bullets.push(bullet);
    }

    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];
      bullet.x += bullet.speedX;
      bullet.y += bullet.speedY;

      if (
        bullet.x < 0 ||
        bullet.x > app.screen.width ||
        bullet.y < 0 ||
        bullet.y > app.screen.height
      ) {
        app.stage.removeChild(bullet);
        bullets.splice(i, 1);
      }
    }

    /* Asteroids Logic */
    for (const asteroid of asteroids) {
      asteroid.x += asteroid.speedX;
      asteroid.y += asteroid.speedY;

      if (asteroid.x > app.screen.width + asteroid.width / 2) {
        asteroid.x = -asteroid.width / 2;
      } else if (asteroid.x < -asteroid.width / 2) {
        asteroid.x = app.screen.width + asteroid.width / 2;
      }

      if (asteroid.y > app.screen.height + asteroid.height / 2) {
        asteroid.y = -asteroid.height / 2;
      } else if (asteroid.y < -asteroid.height / 2) {
        asteroid.y = app.screen.height + asteroid.height / 2;
      }
    }
  });
})();

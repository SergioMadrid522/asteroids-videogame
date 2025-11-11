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
} from "pixi.js";
// Elimina la importación de SimpleRope, ya no la usamos
// import { SimpleRope } from "@pixi/mesh-extras";

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
    // Quita preference: "webgl2" si no es necesario, ya que Graphics funciona con WebGL1
  });
  document.body.appendChild(app.canvas);
  const controller = new Controller(); /* BACKGROUND CREATION */
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

  const fireFrames: Texture[] = [];
  for (const frameName in fireSheet.textures) {
    fireFrames.push(fireSheet.textures[frameName]);
  }

  const fire = new AnimatedSprite(fireFrames); // Lo anclamos desde el centro abajo, como una llama real

  fire.anchor.set(0.5, 0.2); // Posicionamos detrás de la nave dentro del mismo contenedor
  fire.y = spaceShip.height * 0.5 + 10; // un poco más abajo
  fire.scale.set(1.2);
  fire.rotation = Math.PI;
  fire.animationSpeed = 0.4;
  fire.visible = false;

  container.addChild(fire); /* CENTER SPACESHIP */ // Mueve el contenedor (que contiene la nave y el fuego) al centro

  container.x = app.screen.width / 2;
  container.y = app.screen.height / 2; // --- REQUISITO: IMPLEMENTACIÓN DE ROPE ---
  // Cambia a Graphics para la estela (más simple y sin errores)

  const historyLength = 20; // Longitud de la estela
  const ropePoints: Point[] = [];
  for (let i = 0; i < historyLength; i++) {
    ropePoints.push(new Point(container.x, container.y));
  }
  const trail = new Graphics(); // Usa Graphics en lugar de SimpleRope
  app.stage.addChildAt(trail, 1); // --- REQUISITOS: EVENTOS DE MOUSE (Cumplen la tarea) ---
  // 1. Hacer el stage interactivo para que escuche eventos de mouse

  app.stage.interactive = true; // 2. Traslación y Rotación (con 'pointermove')
  let targetX = app.screen.width / 2;
  let targetY = app.screen.height / 2;
  const moveSpeed = 5;
  app.stage.on("pointermove", (event) => {
    const pointerPos = event.global;
    targetX = pointerPos.x;
    targetY = pointerPos.y;
    // Calcula la rotación hacia el objetivo
    const dx = targetX - container.x;
    const dy = targetY - container.y;
    container.rotation = Math.atan2(dy, dx) + Math.PI / 2;
  });

  window.addEventListener("wheel", (event) => {
    event.preventDefault(); // Evita que la página haga scroll
    const scaleAmount = 0.05;

    if (event.deltaY < 0) {
      // Rueda hacia arriba
      container.scale.x += scaleAmount;
      container.scale.y += scaleAmount;
    } else {
      // Rueda hacia abajo
      container.scale.x -= scaleAmount;
      container.scale.y -= scaleAmount;
    } // Limitar la escala
    container.scale.x = Math.max(0.5, container.scale.x);
    container.scale.y = Math.max(0.5, container.scale.y);
  }); // 4. Transparencia (con 'contextmenu' - clic derecho)

  app.canvas.addEventListener("contextmenu", (event) => {
    event.preventDefault(); // Evita que salga el menú contextual
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
  const speed = 3; // --- LO VAMOS A USAR PARA EL TURBO
  // const rotation = 2; // --- YA NO SE USA (borrado)
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
    // Movimiento suave hacia el mouse
    const dx = targetX - container.x;
    const dy = targetY - container.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > 1) {
      container.x += (dx / distance) * moveSpeed;
      container.y += (dy / distance) * moveSpeed;
    }

    // Lógica de disparo
    const now = Date.now();
    if (controller.leftClick && now - lastShotTime > shotCooldown) {
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

    // Dibuja la estela con Graphics (líneas conectando puntos)
    trail.clear();
    trail.moveTo(ropePoints[0].x, ropePoints[0].y);
    for (let i = 1; i < ropePoints.length; i++) {
      trail.lineTo(ropePoints[i].x, ropePoints[i].y);
    }
    trail.stroke({ width: 5, color: 0xff0000 }); // Ajusta color/ancho como quieras (rojo para la estela)

    // Lógica de asteroides y colisiones
    for (let a = asteroids.length - 1; a >= 0; a--) {
      const asteroid = asteroids[a];
      asteroid.x += asteroid.speedX;
      asteroid.y += asteroid.speedY; // Screen wrap

      if (asteroid.x > app.screen.width + asteroid.width / 2)
        asteroid.x = -asteroid.width / 2;
      else if (asteroid.x < -asteroid.width / 2)
        asteroid.x = app.screen.width + asteroid.width / 2;
      if (asteroid.y > app.screen.height + asteroid.height / 2)
        asteroid.y = -asteroid.height / 2;
      else if (asteroid.y < -asteroid.height / 2)
        asteroid.y = app.screen.height + asteroid.height / 2; // Collision detection with bullets

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

          break;
        }
      }
    }
  });
})();

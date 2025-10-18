export class Controller {
  public up: boolean;
  public down: boolean;
  public left: boolean;
  public right: boolean;
  public rightClick: boolean;
  public leftClick: boolean;

  constructor() {
    this.up = false;
    this.down = false;
    this.left = false;
    this.right = false;
    this.rightClick = false;
    this.leftClick = false;

    /* Events when key is pressed and when is not */
    window.addEventListener("keydown", (e: KeyboardEvent) =>
      this.onKeyChange(e, true)
    );
    window.addEventListener("keyup", (e: KeyboardEvent) =>
      this.onKeyChange(e, false)
    );

    /* Events when mouse clicks are pressed and when are not */
    window.addEventListener("mousedown", (e: MouseEvent) =>
      this.onMouseChange(e, true)
    );
    window.addEventListener("mouseup", (e: MouseEvent) =>
      this.onMouseChange(e, false)
    );
  }

  private onKeyChange(event: KeyboardEvent, isPressed: boolean): void {
    const key = event.key;

    switch (key) {
      case "ArrowUp":
      case "w":
        this.up = isPressed;
        break;
      case "ArrowDown":
      case "s":
        this.down = isPressed;
        break;
      case "ArrowLeft":
      case "a":
        this.left = isPressed;
        break;
      case "ArrowRight":
      case "d":
        this.right = isPressed;
        break;
    }
  }
  private onMouseChange(event: MouseEvent, isPressed: boolean): void {
    if (event.button === 0) {
      this.leftClick = isPressed;
    } else if (event.button === 2) {
      this.rightClick = isPressed;
    }
  }
}

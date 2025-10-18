export type controllerProps = {
  KeyW: string;
  KeyS: string;
  KeyA: string;
  KeyD: string;
  ArrowUp: string;
  ArrowDown: string;
  ArrowLeft: string;
  ArrowRight: string;
};

export type KeyState = {
  pressed: boolean;
  doubleTap: boolean;
  timestamp: number;
};

export type Keys = "up" | "down" | "left" | "right" | "space";

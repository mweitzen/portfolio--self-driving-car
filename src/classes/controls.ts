import { CarType } from "./car";

export default class Controls {
  public forward: boolean;
  public reverse: boolean;
  public left: boolean;
  public right: boolean;

  constructor(carType: CarType) {
    this.forward = false;
    this.reverse = false;
    this.left = false;
    this.right = false;

    switch (carType) {
      case CarType.MANUAL:
        this.addKeyboardListener();
        break;
      case CarType.DUMB:
        this.forward = true;
        break;
      case CarType.SMART:
      default:
        break;
    }
  }

  private addKeyboardListener() {
    document.onkeydown = (event) => {
      switch (event.key) {
        case "ArrowUp":
          this.forward = true;
          break;
        case "ArrowDown":
          this.reverse = true;
          break;
        case "ArrowLeft":
          this.left = true;
          break;
        case "ArrowRight":
          this.right = true;
          break;
      }
    };
    document.onkeyup = (event) => {
      switch (event.key) {
        case "ArrowUp":
          this.forward = false;
          break;
        case "ArrowDown":
          this.reverse = false;
          break;
        case "ArrowLeft":
          this.left = false;
          break;
        case "ArrowRight":
          this.right = false;
          break;
      }
    };
  }
}

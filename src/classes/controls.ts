export default class Controls {
  public forward: boolean;
  public reverse: boolean;
  public left: boolean;
  public right: boolean;

  constructor(userControlled = false) {
    this.forward = false;
    this.reverse = false;
    this.left = false;
    this.right = false;

    if (userControlled) {
      this.addKeyboardListener();
    } else {
      this.forward = true;
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

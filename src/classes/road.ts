import { calculateLinearInterpolation } from "../utils";

export default class Road {
  private left: number;
  private right: number;
  private top: number;
  private bottom: number;
  private width: number;
  private laneCount: number;
  public borders: RoadBorders;

  public constructor(x: number, width: number, laneCount = 3) {
    // Set x-coordinates for road edges
    this.left = x - width / 2;
    this.right = x + width / 2;

    // Construct road parameters
    this.width = width;
    this.laneCount = laneCount;

    // Mock infinity for vertical y-coordinates
    const infinity = 10000000;
    this.top = -infinity;
    this.bottom = infinity;

    // Get road borders
    const topLeft = { x: this.left, y: this.top };
    const topRight = { x: this.right, y: this.top };
    const bottomLeft = { x: this.left, y: this.bottom };
    const bottomRight = { x: this.right, y: this.bottom };

    this.borders = [
      [topLeft, bottomLeft],
      [topRight, bottomRight],
    ];
  }

  public draw(ctx: CanvasRenderingContext2D) {
    // Line config
    ctx.lineWidth = 5;
    ctx.strokeStyle = "white";

    // Draw lines based on road attributes
    ctx.setLineDash([20, 20]);
    for (let i = 1; i <= this.laneCount - 1; i++) {
      const x = calculateLinearInterpolation(
        this.left,
        this.right,
        i / this.laneCount
      );

      ctx.beginPath();
      ctx.moveTo(x, this.top);
      ctx.lineTo(x, this.bottom);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    this.borders.forEach((border) => {
      ctx.beginPath();
      ctx.moveTo(border[0].x, border[0].y);
      ctx.lineTo(border[1].x, border[1].y);
      ctx.stroke();
    });
  }

  getLaneCenter(laneIndex: number) {
    const laneWidth = this.width / this.laneCount;
    return (
      this.left +
      laneWidth / 2 +
      Math.min(laneIndex, this.laneCount) * laneWidth
    );
  }
}

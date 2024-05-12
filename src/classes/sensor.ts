import Car from "./car";
import {
  calculateLinearInterpolation,
  calculatePolygonIntersection,
} from "../utils";

export default class Sensor {
  private car: Car;

  private rayCount: number = 5;
  private rayLength: number = 150;
  private raySpread: number = Math.PI / 2;
  private rays: Line[];
  private readings: (SensorTouch | null)[];

  public constructor(car: Car) {
    this.car = car;
    this.rayCount = 5;
    this.rayLength = 150;
    this.raySpread = Math.PI / 2;

    this.rays = [];
    this.readings = [];
  }

  public update(obstacles: Coordinate[][]) {
    this.castRays();
    this.readings = [];
    this.rays.forEach((ray) => {
      const reading = this.getReading(ray, obstacles);
      this.readings.push(reading);
    });
  }

  public draw(ctx: CanvasRenderingContext2D) {
    for (let i = 0; i < this.rayCount; i++) {
      const currentRay = this.rays[i];
      const currentReading = this.readings[i];

      const end = currentReading ?? currentRay[1];

      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "yellow";
      ctx.moveTo(currentRay[0].x, currentRay[0].y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "black";
      ctx.moveTo(currentRay[1].x, currentRay[1].y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }
  }

  public getRayCount() {
    return this.rayCount;
  }

  private castRays() {
    this.rays = [];
    for (let i = 0; i < this.rayCount; i++) {
      const rayAngle =
        calculateLinearInterpolation(
          this.raySpread / 2,
          -this.raySpread / 2,
          this.rayCount === 1 ? 0.5 : i / (this.rayCount - 1)
        ) + this.car.getForwardAngle();

      const center = this.car.getCenter();

      const start = {
        x: center.x,
        y: center.y,
      };
      const end = {
        x: center.x - Math.sin(rayAngle) * this.rayLength,
        y: center.y - Math.cos(rayAngle) * this.rayLength,
      };

      this.rays.push([start, end]);
    }
  }

  public getReadings() {
    return this.readings;
  }

  private getReading(ray: Line, obstacles: Coordinate[][]): SensorTouch | null {
    const touches: SensorTouchList = [];

    for (const obstacle of obstacles) {
      const touch = calculatePolygonIntersection(obstacle, ray);
      if (touch) touches.push(touch);
    }

    if (touches.length === 0) return null;

    const offsets = touches.map((touch) => touch.offset);
    const minOffset = Math.min(...offsets);

    return touches.find((touch) => touch.offset == minOffset) ?? null;
  }
}

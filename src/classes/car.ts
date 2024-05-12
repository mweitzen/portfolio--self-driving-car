import { calculatePolygonIntersection } from "../utils";

import Sensor from "./sensor";
import Controls from "./controls";
import NeuralNetwork from "./network";

export default class Car {
  //manual drive override
  private manual = false;

  // positioning
  private center: Coordinate;
  private width: number;
  private height: number;
  private polygon: Coordinate[];
  private forwardAngle: number;
  // movement
  private speed: number;
  private acceleration: number;
  private maxSpeed: number;
  private friction: number;
  private smartCar: boolean;
  private controls: Controls;
  // detection
  private brain: NeuralNetwork | undefined;
  private sensor: Sensor;
  private collision: boolean;

  public constructor(
    center: Coordinate,
    width: number,
    height: number,
    smartCar = false
  ) {
    // size, position
    this.center = center;
    this.width = width;
    this.height = height;

    // acceleration
    this.acceleration = 0.2;
    this.speed = 0;
    if (smartCar) {
      this.maxSpeed = 5;
    } else {
      this.maxSpeed = 3;
    }
    this.friction = 0.05;

    // collision details
    this.collision = false;

    // steering
    this.forwardAngle = 0;
    this.polygon = this.createPolygon();

    // controls
    this.smartCar = smartCar;
    this.controls = new Controls(smartCar);

    // sensors
    this.sensor = new Sensor(this);
    if (smartCar) {
      this.brain = new NeuralNetwork([this.sensor.getRayCount(), 6, 4]);
    }
  }

  /**
   * Draw car onto canvas
   *
   */
  public draw(ctx: CanvasRenderingContext2D) {
    if (this.collision) {
      ctx.fillStyle = "grey";
    } else {
      if (this.smartCar) {
        ctx.fillStyle = "black";
      } else {
        ctx.fillStyle = "blue";
      }
    }

    ctx.beginPath();
    ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
    for (let i = 1; i < this.polygon.length; i++) {
      ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
    }
    ctx.fill();

    this.sensor.draw(ctx);
  }

  /**
   * Update car
   *
   */
  public update(obstacles: Coordinate[][]) {
    // Check for collision state
    if (!this.collision) {
      this.move();
      this.polygon = this.createPolygon();
      this.collision = this.detectCollision(obstacles);
    }

    // Update sensors with new position
    this.sensor.update(obstacles);

    // Update sensors with new position
    if (this.smartCar && this.brain) {
      const offsets = this.sensor
        .getReadings()
        .map((reading) => (reading === null ? 0 : 1 - reading.offset));

      const outputs = NeuralNetwork.feedForward(offsets, this.brain);

      if (!this.manual) {
        this.controls.forward = outputs[0];
        this.controls.left = outputs[1];
        this.controls.right = outputs[2];
        this.controls.reverse = outputs[3];
      }
    }
  }

  /**
   * Get brain
   *
   */
  public getBrain() {
    return this.brain;
  }

  /**
   * Get forward facing angle
   *
   */
  public getForwardAngle() {
    return this.forwardAngle;
  }

  /**
   * Get center width and height of the car
   *
   */
  public getDimensions(): CarDimensions {
    return {
      center: this.center,
      width: this.width,
      height: this.height,
      polygon: this.polygon,
    };
  }

  /**
   * Create a polygon for collision detection
   *
   */
  private createPolygon() {
    const points: Coordinate[] = [];

    const radius = Math.hypot(this.width, this.height) / 2;
    const alpha = Math.atan2(this.width, this.height);

    points.push({
      x: this.center.x - Math.sin(this.forwardAngle - alpha) * radius,
      y: this.center.y - Math.cos(this.forwardAngle - alpha) * radius,
    });
    points.push({
      x: this.center.x - Math.sin(this.forwardAngle + alpha) * radius,
      y: this.center.y - Math.cos(this.forwardAngle + alpha) * radius,
    });
    points.push({
      x: this.center.x - Math.sin(Math.PI + this.forwardAngle - alpha) * radius,
      y: this.center.y - Math.cos(Math.PI + this.forwardAngle - alpha) * radius,
    });
    points.push({
      x: this.center.x - Math.sin(Math.PI + this.forwardAngle + alpha) * radius,
      y: this.center.y - Math.cos(Math.PI + this.forwardAngle + alpha) * radius,
    });

    return points;
  }

  /**
   * Move car with user input
   *
   */
  private move() {
    // Control acceleration
    if (this.controls.forward) {
      this.speed += this.acceleration;
    }
    if (this.controls.reverse) {
      this.speed -= this.acceleration;
    }

    // Set max speeds
    if (this.speed > this.maxSpeed) {
      this.speed = this.maxSpeed;
    }
    if (this.speed < -this.maxSpeed / 2) {
      this.speed = -this.maxSpeed / 2;
    }

    // Add friction to movement
    if (this.speed > 0) {
      this.speed -= this.friction;
    }
    if (this.speed < 0) {
      this.speed += this.friction;
    }
    if (Math.abs(this.speed) < this.friction) {
      this.speed = 0;
    }

    // Control steering
    if (this.speed != 0) {
      const flip = this.speed > 0 ? 1 : -1;
      if (this.controls.left) {
        this.forwardAngle += 0.03 * flip;
      }
      if (this.controls.right) {
        this.forwardAngle -= 0.03 * flip;
      }
    }

    // Set direction
    this.center.x -= Math.sin(this.forwardAngle) * this.speed;
    this.center.y -= Math.cos(this.forwardAngle) * this.speed;
  }

  /**
   * Detect whether car has collided with a boundary
   *
   */
  private detectCollision(obstacles: Coordinate[][]) {
    for (const obstacle of obstacles) {
      if (calculatePolygonIntersection(this.polygon, obstacle)) return true;
    }
    return false;
  }
}

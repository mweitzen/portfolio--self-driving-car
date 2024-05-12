import { calculatePolygonIntersection } from "../utils";

import Sensor from "./sensor";
import Controls from "./controls";
import NeuralNetwork from "./network";

export enum CarType {
  "SMART",
  "DUMB",
  "MANUAL",
}

export default class Car {
  //manual drive override
  private type: CarType;

  // positioning
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private polygon: Polygon;
  private forwardAngle: number;
  // movement
  private speed: number;
  private acceleration: number;
  private maxSpeed: number;
  private friction: number;
  private controls: Controls;
  // detection
  private brain: NeuralNetwork | undefined;
  private sensor: Sensor | undefined;
  private collision: boolean;

  /**
   * Constructor
   *
   */
  public constructor(
    type: CarType,
    center: Coordinate,
    dimensions: {
      width: number;
      height: number;
    }
  ) {
    // set car type
    this.type = type;

    // size, position
    this.x = center.x;
    this.y = center.y;
    this.width = dimensions.width;
    this.height = dimensions.height;

    // acceleration
    this.speed = 0;
    this.acceleration = 0.2;
    this.friction = 0.05;
    this.maxSpeed = type === CarType.DUMB ? 2 : 3;

    // collision details
    this.collision = false;

    // steering
    this.forwardAngle = 0;
    this.polygon = this.createPolygon();

    // controls
    this.controls = new Controls(type);

    // detection
    if (type !== CarType.DUMB) {
      this.sensor = new Sensor(this);
      this.brain = new NeuralNetwork([this.sensor.getRayCount(), 6, 4]);
    }
  }

  /**
   * Draw car onto canvas
   *
   */
  public draw(ctx: CanvasRenderingContext2D, drawSensor: boolean = false) {
    let fillStyle = "white";
    switch (this.type) {
      case CarType.SMART:
        fillStyle = "blue";
        break;
      case CarType.DUMB:
        fillStyle = "red";
        break;
      case CarType.MANUAL:
        fillStyle = "black";
        break;
    }
    if (this.collision) {
      fillStyle = "grey";
    }
    ctx.fillStyle = fillStyle;

    ctx.beginPath();
    ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
    this.polygon.forEach((point) => {
      ctx.lineTo(point.x, point.y);
    });
    ctx.fill();

    if (this.sensor && drawSensor) {
      this.sensor.draw(ctx);
    }
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
    if (this.sensor) {
      this.sensor.update(obstacles);
    }

    // Update sensors with new position
    if (this.sensor && this.brain) {
      const offsets = this.sensor
        .getReadings()
        .map((reading) => (reading === null ? 0 : 1 - reading.offset));

      const outputs = NeuralNetwork.feedForward(offsets, this.brain);

      if (this.type === CarType.SMART) {
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
  public loadBrain(brain: NeuralNetwork) {
    this.brain = brain;
  }

  /**
   * Get forward facing angle
   *
   */
  public getForwardAngle() {
    return this.forwardAngle;
  }

  /**
   * Get center of car
   *
   */
  public getCenter() {
    return {
      x: this.x,
      y: this.y,
    };
  }

  /**
   * Get center width and height of the car
   *
   */
  public getDimensions() {
    return {
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
      x: this.x - Math.sin(this.forwardAngle - alpha) * radius,
      y: this.y - Math.cos(this.forwardAngle - alpha) * radius,
    });
    points.push({
      x: this.x - Math.sin(this.forwardAngle + alpha) * radius,
      y: this.y - Math.cos(this.forwardAngle + alpha) * radius,
    });
    points.push({
      x: this.x - Math.sin(Math.PI + this.forwardAngle - alpha) * radius,
      y: this.y - Math.cos(Math.PI + this.forwardAngle - alpha) * radius,
    });
    points.push({
      x: this.x - Math.sin(Math.PI + this.forwardAngle + alpha) * radius,
      y: this.y - Math.cos(Math.PI + this.forwardAngle + alpha) * radius,
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
    this.x -= Math.sin(this.forwardAngle) * this.speed;
    this.y -= Math.cos(this.forwardAngle) * this.speed;
  }

  /**
   * Detect whether car has collided with a boundary
   *
   */
  private detectCollision(obstacles: Coordinate[][]) {
    for (const obstacle of obstacles) {
      if (calculatePolygonIntersection(this.polygon, obstacle)) {
        return true;
      }
    }
    return false;
  }
}

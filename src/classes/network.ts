import { getNodeCenter, getRGBA } from "../utils";

/**
 * Neural Network Class
 *
 */
export default class NeuralNetwork {
  private levels: Level[];

  constructor(neuronCounts: number[]) {
    this.levels = [];
    for (let i = 0; i < neuronCounts.length - 1; i++) {
      this.levels.push(new Level(neuronCounts[i], neuronCounts[i + 1]));
    }
  }

  /**
   * Feed forward the given inputs through the neural network
   *
   */
  public static feedForward(givenInputs: any[], network: NeuralNetwork) {
    let outputs = Level.feedForward(givenInputs, network.levels[0]);

    for (let i = 1; i < network.levels.length; i++) {
      outputs = Level.feedForward(outputs, network.levels[i]);
    }

    return outputs;
  }

  /**
   * Visualize full neural network
   *
   */
  public static visualizeNetwork(
    ctx: CanvasRenderingContext2D,
    network: NeuralNetwork
  ) {
    const margin = 50;

    const dimensions = {
      left: margin,
      top: margin,
      width: ctx.canvas.width - margin * 2,
      height: ctx.canvas.height - margin * 2,
    };

    const levelHeight = dimensions.height / network.levels.length;

    for (let i = 0; i < network.levels.length; i++) {
      const levelTop =
        dimensions.top +
        getNodeCenter(
          network.levels.length,
          i,
          dimensions.height - levelHeight,
          0
        );
      Level.visualizeLevel(ctx, network.levels[i], {
        ...dimensions,
        top: levelTop,
        height: levelHeight,
      });
    }
  }
}

/**
 * Layer Class
 *
 */
export class Level {
  private inputs: any[];
  private outputs: any[];
  private biases: any[];
  private weights: any[][];

  constructor(inputCount: number, outputCount: number) {
    this.inputs = new Array(inputCount);
    this.outputs = new Array(outputCount);
    this.biases = new Array(outputCount);
    this.weights = [];
    for (let i = 0; i < inputCount; i++) {
      this.weights.push(new Array(outputCount));
    }

    Level.randomize(this);
  }

  /**
   * Randomize the weights and biases
   *
   */
  private static randomize({ inputs, outputs, weights, biases }: Level) {
    for (let i = 0; i < inputs.length; i++) {
      for (let j = 0; j < outputs.length; j++) {
        weights[i][j] = Math.random() * 2 - 1;
      }
    }
    for (let i = 0; i < biases.length; i++) {
      biases[i] = Math.random() * 2 - 1;
    }
  }

  /**
   * Feed Forward Inputs for this Level
   *
   */
  public static feedForward(givenInputs: number[], level: Level) {
    const { inputs, outputs, weights, biases } = level;

    // Set level inputs to the given inputs
    for (let i = 0; i < inputs.length; i++) {
      level.inputs[i] = givenInputs[i];
    }

    // Calculate the sum of the inputs for each connected output
    for (let i = 0; i < outputs.length; i++) {
      const sum = inputs.reduce(
        (prev, current, j) => prev + current * weights[j][i]
      );
      // console.log(sum);
      if (sum > biases[i]) outputs[i] = 1;
      else outputs[i] = 0;
    }

    // Return outputs
    return outputs;
  }

  /**
   * Visualize Level
   *
   */
  public static visualizeLevel(
    ctx: CanvasRenderingContext2D,
    level: Level,
    dimensions: { left: number; top: number; width: number; height: number }
  ) {
    const { left, top, width, height } = dimensions;
    const right = left + width;
    const bottom = top + height;

    const nodeRadius = 19;
    const { inputs, outputs, weights, biases } = level;

    for (let i = 0; i < inputs.length; i++) {
      for (let j = 0; j < outputs.length; j++) {
        const bottomX = getNodeCenter(inputs.length, i, left, right);
        const topX = getNodeCenter(outputs.length, j, left, right);

        const lineWeight = weights[i][j];

        ctx.beginPath();
        ctx.moveTo(bottomX, bottom);
        ctx.lineTo(topX, top);
        ctx.lineWidth = 2;
        ctx.strokeStyle = getRGBA(lineWeight);
        ctx.stroke();
      }
    }

    for (let i = 0; i < inputs.length; i++) {
      const x = getNodeCenter(inputs.length, i, left, right);

      ctx.beginPath();
      ctx.arc(x, bottom, nodeRadius, 0, Math.PI * 2);
      ctx.fillStyle = getRGBA(inputs[i]);
      ctx.fill();
    }

    for (let i = 0; i < outputs.length; i++) {
      const x = getNodeCenter(outputs.length, i, left, right);

      ctx.beginPath();
      ctx.arc(x, top, nodeRadius * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = getRGBA(outputs[i]);
      ctx.fill();

      ctx.beginPath();
      ctx.lineWidth = 4;
      ctx.arc(x, top, nodeRadius, 0, Math.PI * 2);
      ctx.strokeStyle = getRGBA(biases[i]);
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([0, 0]);
    }
  }
}

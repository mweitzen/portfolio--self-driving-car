import Road from "./classes/road";
import Car from "./classes/car";
import NeuralNetwork from "./classes/network";

/**
 * Animate the canvas by updating the elements
 * in animation frame
 */
function animate(
  appCanvas: HTMLCanvasElement,
  networkCanvas: HTMLCanvasElement,
  road: Road,
  car: Car,
  traffic: Car[]
) {
  // Get the context
  const appCtx = appCanvas.getContext("2d");
  if (!appCtx) throw new Error("Canvas context was not defined.");
  const networkCtx = networkCanvas.getContext("2d");
  if (!networkCtx) throw new Error("Canvas context was not defined.");

  // Update traffic before we update our car
  traffic.forEach((otherCar) => {
    otherCar.update([
      car.getDimensions().polygon,
      ...road.borders,
      ...traffic
        .filter((x) => x !== otherCar)
        .map((x) => x.getDimensions().polygon),
    ]);
  });

  // Update the car information based on new position
  car.update([
    ...road.borders,
    ...traffic.map((otherCar) => otherCar.getDimensions().polygon),
  ]);

  // Reset canvas height and translate so car has visibile road ahead
  appCanvas.height = window.innerHeight;
  networkCanvas.height = window.innerHeight;

  appCtx.save();
  appCtx.translate(0, -car.getDimensions().center.y + appCanvas.height * 0.7);

  // Draw elements
  road.draw(appCtx);
  traffic.forEach((otherCar) => otherCar.draw(appCtx));
  car.draw(appCtx);

  // Restore the canvas
  appCtx.restore();

  const brain = car.getBrain();
  if (brain) {
    NeuralNetwork.visualizeNetwork(networkCtx, brain);
  }

  // Set function to animation frame
  requestAnimationFrame(() =>
    animate(appCanvas, networkCanvas, road, car, traffic)
  );
}

/**
 * Main function
 */
(function main() {
  // Get App Canvas
  const appCanvas = document.getElementById("appCanvas") as HTMLCanvasElement;
  appCanvas.width = 200;

  // Get Neural Network Visualization Canvas
  const networkCanvas = document.getElementById(
    "networkCanvas"
  ) as HTMLCanvasElement;
  networkCanvas.width = 400;

  // Get canvas 2d context
  const appCtx = appCanvas.getContext("2d");
  if (!appCtx) throw new Error("Error getting Canvas Context");

  const networkCtx = appCanvas.getContext("2d");
  if (!networkCtx) throw new Error("Error getting Canvas Context");

  // Create new road
  const road = new Road(appCanvas.width / 2, appCanvas.width * 0.9);
  road.draw(appCtx);

  // Create new car
  const car = new Car({ x: road.getLaneCenter(1), y: 100 }, 30, 50, true);

  // Create traffic
  const traffic = [new Car({ x: road.getLaneCenter(1), y: -100 }, 30, 50)];

  // Animate canvas
  animate(appCanvas, networkCanvas, road, car, traffic);
})();

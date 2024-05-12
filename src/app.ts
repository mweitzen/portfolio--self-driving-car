import Road from "./classes/road";
import Car, { CarType } from "./classes/car";
import NeuralNetwork from "./classes/network";

/**
 * Canvases from DOM
 *
 */
const storedBrain = getSavedBrain();
let bestBrain: NeuralNetwork;

/**
 * Event listeners for save/discard
 *
 */
document.getElementById("save")!.addEventListener("click", () => {
  saveBrain(bestBrain);
  console.log("Brain saved!");
});
document.getElementById("discard")!.addEventListener("click", discardBrain);

/**
 * Canvases from DOM
 *
 */
const AppCanvas = document.getElementById("appCanvas") as HTMLCanvasElement;
const NetworkCanvas = document.getElementById(
  "networkCanvas"
) as HTMLCanvasElement;

/**
 * Main function
 *
 */
(function main() {
  AppCanvas.width = 200;
  NetworkCanvas.width = 400;

  // Get canvas 2d context
  const appCtx = AppCanvas.getContext("2d");
  const networkCtx = NetworkCanvas.getContext("2d");
  if (!appCtx || !networkCtx) throw new Error("Error getting Canvas Context");

  // Create new road
  const road = new Road(AppCanvas.width / 2, AppCanvas.width * 0.9);
  road.draw(appCtx);

  // Create new car
  const car = new Car(
    CarType.MANUAL,
    { x: road.getLaneCenter(1), y: 100 },
    { width: 30, height: 50 }
  );

  // Create new tester cars
  const N = 200;
  const testers = generateCars(N, { x: road.getLaneCenter(1), y: 100 });

  // Create traffic
  const traffic = [
    new Car(
      CarType.DUMB,
      { x: road.getLaneCenter(1), y: -100 },
      { width: 30, height: 50 }
    ),
    new Car(
      CarType.DUMB,
      { x: road.getLaneCenter(0), y: -300 },
      { width: 30, height: 50 }
    ),
    new Car(
      CarType.DUMB,
      { x: road.getLaneCenter(2), y: -300 },
      { width: 30, height: 50 }
    ),
    // new Car(
    //   CarType.DUMB,
    //   { x: road.getLaneCenter(0), y: -500 },
    //   { width: 30, height: 50 }
    // ),
    // new Car(
    //   CarType.DUMB,
    //   { x: road.getLaneCenter(1), y: -500 },
    //   { width: 30, height: 50 }
    // ),
    // new Car(
    //   CarType.DUMB,
    //   { x: road.getLaneCenter(1), y: -700 },
    //   { width: 30, height: 50 }
    // ),
    // new Car(
    //   CarType.DUMB,
    //   { x: road.getLaneCenter(2), y: -700 },
    //   { width: 30, height: 50 }
    // ),
  ];

  // Animate canvas
  animate({ appCtx, networkCtx }, { road, car, testers, traffic });
  // for (let index = 0; index < 20; index++) {
  //   animate({ appCtx, networkCtx }, { road, car, testers, traffic });
  // }
})();

/**
 * Generate SMART (AI) Cars
 *
 */
function generateCars(N: number, coordinates: { x: number; y: number }) {
  const cars: Car[] = [];
  for (let i = 0; i < N; i++) {
    cars.push(new Car(CarType.SMART, coordinates, { width: 30, height: 50 }));
  }
  return cars;
}

/**
 * Animate the Canvas/Elements
 *
 */
function animate(
  contexts: {
    appCtx: CanvasRenderingContext2D;
    networkCtx: CanvasRenderingContext2D;
  },
  objects: {
    road: Road;
    car: Car;
    testers: Car[];
    traffic: Car[];
  }
) {
  const { appCtx, networkCtx } = contexts;
  const { road, car, testers, traffic } = objects;

  // Update traffic before we update our car
  traffic.forEach((dumbCar) => {
    dumbCar.update(road.borders);
  });

  // Update the manual car
  const obstacles = [
    ...road.borders,
    ...traffic.map((dumbCar) => dumbCar.getDimensions().polygon),
  ];
  car.update(obstacles);

  // Load previous best brain into first car or initialize tests
  let bestTester: Car = testers[0];
  if (storedBrain) {
    bestTester.loadBrain(storedBrain);
  }

  // Update tester cars and track best tester
  testers.forEach((tester) => {
    tester.update(obstacles);
    if (tester.getCenter().y < bestTester.getCenter().y) {
      bestTester = tester;
      bestBrain = tester.getBrain()!;
    }
  });

  // Reset canvas height and translate so car has visibile road ahead
  AppCanvas.height = window.innerHeight;
  NetworkCanvas.height = window.innerHeight;

  appCtx.save();
  appCtx.translate(0, -bestTester.getCenter().y + AppCanvas.height * 0.7);

  // Draw elements
  road.draw(appCtx);
  traffic.forEach((dumbCar) => dumbCar.draw(appCtx));
  car.draw(appCtx);
  appCtx.globalAlpha = 0.2;
  testers.forEach((tester) => tester.draw(appCtx));
  appCtx.globalAlpha = 1;
  bestTester.draw(appCtx, true);

  // Restore the canvas
  appCtx.restore();

  // Draw the brain of the best tester
  const brain = bestTester.getBrain();
  if (brain) {
    NeuralNetwork.visualizeNetwork(networkCtx, brain);
  }

  // Set function to animation frame
  requestAnimationFrame(() =>
    animate({ appCtx, networkCtx }, { road, car, testers, traffic })
  );
}

/**
 * Save/Load Best Testing Car
 *
 */
function saveBrain(brain: NeuralNetwork) {
  console.log("Saving brain...");
  console.log(brain);
  localStorage.setItem("bestBrain", JSON.stringify(brain));
}

function discardBrain() {
  localStorage.removeItem("bestBrain");
  console.log("Brain discarded.");
}

function getSavedBrain() {
  console.log("Loading brain....");
  const brain = localStorage.getItem("bestBrain");
  if (brain) {
    console.log("Brain loaded!");
    return JSON.parse(brain);
  }
  console.log("No brain in storage.");
  return null;
}

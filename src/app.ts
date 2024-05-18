import Road from "./classes/road";
import Car, { CarType } from "./classes/car";
import NeuralNetwork, { Level } from "./classes/network";

const MUTATION_COUNT = 10;
const MUTATION_RATE = 0.3;
const STARTING_LANE = 1;

/**
 * Global variables to access brain for local storage
 *
 */
const storedBrain = getSavedBrain();
let bestBrain: NeuralNetwork;

/**
 * Event listeners for save/discard
 *
 */
document
  .getElementById("save")!
  .addEventListener("click", () => saveBrain(bestBrain));
document.getElementById("discard")!.addEventListener("click", discardBrain);

/**
 * Canvases from DOM
 *
 */
const AppCanvas = document.getElementById("appCanvas") as HTMLCanvasElement;
const NetworkCanvas = document.getElementById(
  "networkCanvas"
) as HTMLCanvasElement;

AppCanvas.width = 200;
NetworkCanvas.width = 400;

/**
 * Main
 *
 */
(function main() {
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
  const N =
    Number(prompt("How many testers would you like to generate?")) ??
    MUTATION_COUNT;

  const testers = generateCars(N, {
    x: road.getLaneCenter(STARTING_LANE),
    y: 100,
  });

  // Seed testers with a mutated version of the best brain
  if (storedBrain) {
    // Load brain
    testers[0].loadBrain(storedBrain);

    // Prompt for mutation rate
    let mutationRate =
      Number(
        prompt(
          "How much would you like to mutate the stored brain? \n\n* Between 0 (least random) and 1(most random)"
        )
      ) ?? MUTATION_COUNT;

    // Check user input
    if (mutationRate > 1 || mutationRate < 0) mutationRate = MUTATION_RATE;

    // Mutate brains
    for (let i = 1; i < testers.length; i++) {
      const mutatedBrain = NeuralNetwork.mutate(storedBrain, mutationRate);
      testers[i].loadBrain(mutatedBrain);
    }
  }

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
    new Car(
      CarType.DUMB,
      { x: road.getLaneCenter(1), y: -500 },
      { width: 30, height: 50 }
    ),
    new Car(
      CarType.DUMB,
      { x: road.getLaneCenter(2), y: -500 },
      { width: 30, height: 50 }
    ),
    new Car(
      CarType.DUMB,
      { x: road.getLaneCenter(0), y: -700 },
      { width: 30, height: 50 }
    ),
    new Car(
      CarType.DUMB,
      { x: road.getLaneCenter(1), y: -700 },
      { width: 30, height: 50 }
    ),
    new Car(
      CarType.DUMB,
      { x: road.getLaneCenter(2), y: -900 },
      { width: 30, height: 50 }
    ),
    new Car(
      CarType.DUMB,
      { x: road.getLaneCenter(1), y: -1100 },
      { width: 30, height: 50 }
    ),
    new Car(
      CarType.DUMB,
      { x: road.getLaneCenter(0), y: -1100 },
      { width: 30, height: 50 }
    ),
  ];

  // Animate canvas
  animate({ appCtx, networkCtx }, { road, car, testers, traffic });
})();

/**
 * Animate
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

  // Update tester cars and track best tester
  let bestTester: Car = testers[0];

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
 * Generate Cars (SMART / AI)
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
 * Save Brain
 *
 */
function saveBrain(brain: NeuralNetwork) {
  console.log("Saving brain...");
  console.log(brain);
  localStorage.setItem("bestBrain", JSON.stringify(brain));
  console.log("Brain saved!");
}

/**
 * Discard Brain
 *
 */
function discardBrain() {
  localStorage.removeItem("bestBrain");
  console.log("Brain discarded.");
}

/**
 * Get Saved Brain
 *
 */
function getSavedBrain() {
  console.log("Loading brain....");
  const brain = localStorage.getItem("bestBrain");
  if (brain) {
    console.log("Brain loaded!");
    const data = JSON.parse(brain);
    const levels = data.levels.map(
      (level: any) =>
        new Level(
          level.inputs.length,
          level.outputs.length,
          level.biases,
          level.weights
        )
    );
    return new NeuralNetwork([], { levels });
  }
  console.log("No brain in storage.");
  return null;
}

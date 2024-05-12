export default undefined;

declare global {
  type Coordinate = {
    x: number;
    y: number;
  };

  type Line = [Coordinate, Coordinate];

  type SensorRay = Line;

  type SensorTouch = Coordinate & { offset: number };
  type SensorTouchList = SensorTouch[];

  type RoadBorders = [Line, Line];

  type CarDimensions = {
    center: Coordinate;
    height: number;
    width: number;
    polygon: Polygon;
  };
}

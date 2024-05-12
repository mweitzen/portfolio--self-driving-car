export default undefined;

declare global {
  type Coordinate = {
    x: number;
    y: number;
  };

  type Line = [Coordinate, Coordinate];
  type Polygon = Coordinate[];

  type SensorTouch = { x: number; y: number; offset: number };
  type SensorTouchList = SensorTouch[];

  type RoadBorders = [Line, Line];

  type CarDimensions = {
    center: Coordinate;
    height: number;
    width: number;
    polygon: Polygon;
  };
}

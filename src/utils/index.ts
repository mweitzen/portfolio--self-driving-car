/**
 * Get RGBA for Neural Network Visualization
 *
 */

export function getRGBA(value: number) {
  if (value === 0) {
    return `rgba(0,0,0,1)`;
  }
  const alpha = Math.abs(value);
  const R = value < 0 ? 0 : 255;
  const G = R;
  const B = value > 0 ? 0 : 255;

  return `rgba(${R},${G},${B},${alpha})` as const;
}

/**
 * Get center (x) for given node in inputs
 *
 */
export function getNodeCenter(
  nodeCount: number,
  currentIndex: number,
  left: number,
  right: number
) {
  return calculateLinearInterpolation(
    left,
    right,
    nodeCount === 1 ? 0.5 : currentIndex / (nodeCount - 1)
  );
}

/**
 * Calculate the Linear Interpolation between points
 *
 */
export function calculateLinearInterpolation(A: number, B: number, t: number) {
  return A + (B - A) * t;
}

/**
 * Calculate where two line segments intersection
 *
 */
export function calculateSegmentIntersection(
  line1: Line,
  line2: Line
): SensorTouch | null {
  const tTop =
    (line2[1].x - line2[0].x) * (line1[0].y - line2[0].y) -
    (line2[1].y - line2[0].y) * (line1[0].x - line2[0].x);
  const uTop =
    (line2[0].y - line1[0].y) * (line1[0].x - line1[1].x) -
    (line2[0].x - line1[0].x) * (line1[0].y - line1[1].y);
  const bottom =
    (line2[1].y - line2[0].y) * (line1[1].x - line1[0].x) -
    (line2[1].x - line2[0].x) * (line1[1].y - line1[0].y);

  if (bottom != 0) {
    const t = tTop / bottom;
    const u = uTop / bottom;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        x: calculateLinearInterpolation(line1[0].x, line1[1].x, t),
        y: calculateLinearInterpolation(line1[0].y, line1[1].y, t),
        offset: u,
      };
    }
  }

  return null;
}

/**
 * Calculate whether two polygons intersect
 *
 */
export function calculatePolygonIntersection(
  poly1: Coordinate[],
  poly2: Coordinate[]
) {
  // Iterate over each side of polygon 1
  for (let i = 0; i < poly1.length; i++) {
    // Get side by connecting this point and next point
    const poly1Side: Line = [poly1[i], poly1[(i + 1) % poly1.length]];

    // Iterate over each side of polygon 2
    for (let j = 0; j < poly2.length; j++) {
      // Get side by connecting this point and next point
      const poly2Side: Line = [poly2[j], poly2[(j + 1) % poly2.length]];

      // Caluculate if polygon line segments intersect
      const touch = calculateSegmentIntersection(poly1Side, poly2Side);
      if (touch) return touch;
    }
  }

  return null;
}

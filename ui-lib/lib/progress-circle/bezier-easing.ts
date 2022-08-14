/**
 * BezierEasing - use bezier curve for transition easing function
 * by Gaëtan Renaudeau 2014 - 2015 – MIT License
 *
 * Credits: is based on Firefox's nsSMILKeySpline.cpp
 * Usage:
 * let spline = BezierEasing([ 0.25, 0.1, 0.25, 1.0 ])
 * spline.get(x) => returns the easing value | x must be in [0, 1] range
 *
 */
/* eslint-disable */
// These values are established by empiricism with tests (tradeoff: performance VS precision)
const NEWTON_ITERATIONS = 4;
const NEWTON_MIN_SLOPE = 0.001;
const SUBDIVISION_PRECISION = 0.0000001;
const SUBDIVISION_MAX_ITERATIONS = 10;

const kSplineTableSize = 11;
const kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

const float32ArraySupported = typeof Float32Array === 'function';

function A(aA1, aA2) {
  return 1.0 - 3.0 * aA2 + 3.0 * aA1;
}
function B(aA1, aA2) {
  return 3.0 * aA2 - 6.0 * aA1;
}
function C(aA1) {
  return 3.0 * aA1;
}

// Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
function calcBezier(aT, aA1, aA2) {
  return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
}

// Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
function getSlope(aT, aA1, aA2) {
  return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
}

function binarySubdivide(aX, aA, aB, mX1, mX2) {
  let currentX;
  let currentT;
  let i = 0;
  do {
    currentT = aA + (aB - aA) / 2.0;
    currentX = calcBezier(currentT, mX1, mX2) - aX;
    if (currentX > 0.0) {
      aB = currentT;
    } else {
      aA = currentT;
    }
  } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
  return currentT;
}

function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
  for (let i = 0; i < NEWTON_ITERATIONS; ++i) {
    const currentSlope = getSlope(aGuessT, mX1, mX2);
    if (currentSlope === 0.0) return aGuessT;
    const currentX = calcBezier(aGuessT, mX1, mX2) - aX;
    aGuessT -= currentX / currentSlope;
  }
  return aGuessT;
}

/**
 * points is an array of [ mX1, mY1, mX2, mY2 ]
 */
function BezierEasing(points, b, c, d) {
  if (arguments.length === 4) {
    // @ts-ignore
    return new BezierEasing([points, b, c, d]);
  }
  // @ts-ignore
  if (!(this instanceof BezierEasing)) return new BezierEasing(points);

  if (!points || points.length !== 4) {
    throw new Error('BezierEasing: points must contains 4 values');
  }
  for (let i = 0; i < 4; ++i) {
    if (typeof points[i] !== 'number' || isNaN(points[i]) || !isFinite(points[i])) {
      throw new Error('BezierEasing: points should be integers.');
    }
  }
  if (points[0] < 0 || points[0] > 1 || points[2] < 0 || points[2] > 1) {
    throw new Error('BezierEasing x values must be in [0, 1] range.');
  }

  this._str = 'BezierEasing(' + points + ')';
  this._css = 'cubic-bezier(' + points + ')';
  this._p = points;
  this._mSampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);
  this._precomputed = false;

  this.get = this.get.bind(this);
}

BezierEasing.prototype = {
  get(x) {
    const mX1 = this._p[0];
    const mY1 = this._p[1];
    const mX2 = this._p[2];
    const mY2 = this._p[3];
    if (!this._precomputed) this._precompute();
    if (mX1 === mY1 && mX2 === mY2) return x; // linear
    // Because JavaScript number are imprecise, we should guarantee the extremes are right.
    if (x === 0) return 0;
    if (x === 1) return 1;
    return calcBezier(this._getTForX(x), mY1, mY2);
  },

  getPoints() {
    return this._p;
  },

  toString() {
    return this._str;
  },

  toCSS() {
    return this._css;
  },

  // Private part

  _precompute() {
    const mX1 = this._p[0];
    const mY1 = this._p[1];
    const mX2 = this._p[2];
    const mY2 = this._p[3];
    this._precomputed = true;
    if (mX1 !== mY1 || mX2 !== mY2) this._calcSampleValues();
  },

  _calcSampleValues() {
    const mX1 = this._p[0];
    const mX2 = this._p[2];
    for (let i = 0; i < kSplineTableSize; ++i) {
      this._mSampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
    }
  },

  /**
   * getTForX chose the fastest heuristic to determine the percentage value precisely from a given X projection.
   */
  _getTForX(aX) {
    const mX1 = this._p[0];
    const mX2 = this._p[2];
    const mSampleValues = this._mSampleValues;

    let intervalStart = 0.0;
    let currentSample = 1;
    const lastSample = kSplineTableSize - 1;

    for (; currentSample !== lastSample && mSampleValues[currentSample] <= aX; ++currentSample) {
      intervalStart += kSampleStepSize;
    }
    --currentSample;

    // Interpolate to provide an initial guess for t
    const dist =
      (aX - mSampleValues[currentSample]) / (mSampleValues[currentSample + 1] - mSampleValues[currentSample]);
    const guessForT = intervalStart + dist * kSampleStepSize;

    const initialSlope = getSlope(guessForT, mX1, mX2);
    if (initialSlope >= NEWTON_MIN_SLOPE) {
      return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
    } else if (initialSlope === 0.0) {
      return guessForT;
    } else {
      return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
    }
  }
};

// CSS mapping

BezierEasing.css = {
  // @ts-ignore
  ease: (BezierEasing.ease = BezierEasing(0.25, 0.1, 0.25, 1.0)),
  // @ts-ignore
  linear: (BezierEasing.linear = BezierEasing(0.0, 0.0, 1.0, 1.0)),
  // @ts-ignore
  'ease-in': (BezierEasing.easeIn = BezierEasing(0.42, 0.0, 1.0, 1.0)),
  // @ts-ignore
  'ease-out': (BezierEasing.easeOut = BezierEasing(0.0, 0.0, 0.58, 1.0)),
  // @ts-ignore
  'ease-in-out': (BezierEasing.easeInOut = BezierEasing(0.42, 0.0, 0.58, 1.0))
};

export { BezierEasing };

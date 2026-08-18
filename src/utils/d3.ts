/**
 * Centralized D3 imports — re-export only the methods used across the codebase.
 * This avoids pulling in the entire d3 bundle (~280 KB) when we only need
 * selection, interpolation, scales, arrays, and easing.
 */

// Selection
export {
	select,
	selectAll
} from 'd3-selection';

// Transitive dependency — d3-transition patches selection.prototype.transition()
import 'd3-transition';

// Interpolation
export {
	interpolate,
	interpolateRgb,
	interpolateNumber
} from 'd3-interpolate';

// Scales
export {
	scaleLinear,
	scaleDiverging
} from 'd3-scale';

// Array helpers
export {
	extent,
	max
} from 'd3-array';

// Easing
export {
	easeCubic
} from 'd3-ease';

// Types (for TypeScript references)
export type BaseType = import('d3-selection').BaseType;

// User preferences read once at start (reduced motion).
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

export { reduce };

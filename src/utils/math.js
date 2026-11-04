// Math and easing helpers.
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

const lerp = (a, b, t) => a + (b - a) * t;

const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };

function seeded(seed){ let s = (seed*9301 + 49297) % 233280; return () => { s = (s*9301 + 49297) % 233280; return s/233280; }; }

const ease = {
  out:x => 1 - Math.pow(1 - x, 3), inn:x => x*x*x, io:x => x < .5 ? 4*x*x*x : 1 - Math.pow(-2*x + 2, 3)/2,
  back:x => { const c1 = 1.6, c3 = c1 + 1; return 1 + c3*Math.pow(x - 1, 3) + c1*Math.pow(x - 1, 2); },
  elastic:x => x <= 0 ? 0 : x >= 1 ? 1 : Math.pow(2, -9*x)*Math.sin((x*10 - .75)*(2*Math.PI)/3.2) + 1,
  // fast in, slow through the middle, fast out (the card glide)
  glide:x => { const c = x - .5; return x*.32 + (.5 + 4*c*c*c)*.68; }
};

export { clamp, lerp, smooth, seeded, ease };

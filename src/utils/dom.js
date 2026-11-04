// Query helpers.
const $ = (s, r = document) => r.querySelector(s);

const $$ = (s, r = document) => [...r.querySelectorAll(s)];

export { $, $$ };

import Micromatch from 'https://esm.sh/micromatch@4.0.2';

console.log(Micromatch.isMatch('a.a\\b', '*.a\\b', { windows: true }));

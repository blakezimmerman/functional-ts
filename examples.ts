import {
  Semigroup, Functor, Monad, Either,
  Sum, Product, Max, Min, Average, All, Some, Flatten,
  Box, Right, Left,
  fold, flatFold, flatMap, fromNullable, tryCatch
} from './functionalTS';

const nested = [[0, [1]], [3, [[[8]]]], [4, [10, 6, [7]]]];
const numbers = [1, 2, 3, 4, 5];
const bools = [false, true, false, true];
const bad = undefined;

console.log(fold(Sum, numbers));
console.log(fold(Product, numbers));
console.log(fold(Max, numbers));
console.log(fold(Average, numbers));
console.log(fold(All, bools));
console.log(fold(Some, bools));
console.log(fold(Flatten, nested));
console.log(flatFold(Sum, nested));
console.log(flatFold(Product, nested));
console.log(flatFold(Max, nested));
console.log(flatFold(Average, nested));
console.log(flatMap(x => x + 1, nested));

console.log(
  Box(3)
    .map(x => x + 4)
    .map(x => x * 5)
    .fold(x => x / 10)
);

console.log(
  tryCatch(x => 1 + 1).fold(err => "Whoops", x => x)
);

console.log(
  fromNullable(bad).map(x => x + 1).fold(err => "Whoops", x => x)
);
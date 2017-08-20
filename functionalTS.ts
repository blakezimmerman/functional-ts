////////// Algebra Interfaces //////////

interface Semigroup<T> {
  val: T,
  props?: any,
  concat: (x: T) => Semigroup<T>
  inspect: () => string
  toString: () => string
}

interface Functor<T> {
  map: (f: Function) => Functor<T>
  fold: (f: Function, g?:Function) => T
  inspect: () => string
  toString: () => string
}

interface Monad<T> extends Functor<T> {
  map: (f: Function) => Monad<T>
  chain: (f: Function) => T
}

interface Either<T> extends Monad<T> {
  fold: (f: Function, g: Function) => T
}

export { Semigroup, Functor, Monad, Either };


////////// Monoids //////////

// Sum Monoid
const Sum = (x: any): Semigroup<any> => ({
  val: x,
  concat: (y: Semigroup<any>) =>
    Sum(x + y.val),
  inspect: () => `Sum(${x})`,
  toString: () => `Sum(${x})`
});

Sum.prototype.identity = Sum(0);

// Product Monoid
const Product = (x: any): Semigroup<any> => ({
  val: x,
  concat: (y: Semigroup<any>) =>
    Product(x * y.val),
  inspect: () => `Product(${x})`,
  toString: () => `Product(${x})`
});

Product.prototype.identity = Product(1);

// Max Monoid
const Max = (x: any): Semigroup<any> => ({
  val: x,
  concat: (y: Semigroup<any>) =>
    x > y.val ? Max(x) : Max(y.val),
  inspect: () => `Max(${x})`,
  toString: () => `Max(${x})`
});

Max.prototype.identity = Max(-Infinity);

// Min Monoid
const Min = (x: any): Semigroup<any> => ({
  val: x,
  concat: (y: Semigroup<any>) =>
    x < y.val ? Min(x) : Min(y.val),
  inspect: () => `Min(${x})`,
  toString: () => `Min(${x})`
});

Min.prototype.identity = Min(Infinity);

// Average Monoid
const Average = (sum: any, length: number = 1) => ({
  val: length && sum / length,
  props: { sum, length },
  concat: (that: Semigroup<any>) =>
    Average(
      sum + that.props.sum,
      length + that.props.length
    ),
  inspect: () => `Average(${{sum, length}})`,
  toString: () => `Average(${{sum, length}})`
});

Average.prototype.identity = Average(0, 0);

// All Monoid
const All = (x: any): Semigroup<any> => ({
  val: x,
  concat: (y: Semigroup<any>) => All(x && y.val),
  inspect: () => `All(${x})`,
  toString: () => `All(${x})`
});

All.prototype.identity = All(true);

// Some Monoid
const Some = (x: any): Semigroup<any> => ({
  val: x,
  concat: (y: Semigroup<any>) => Some(x || y.val),
  inspect: () => `Some(${x})`,
  toString: () => `Some(${x})`
});

Some.prototype.identity = Some(false);

// Flatten Monoid
const Flatten = (x: Array<any>): Semigroup<any> => ({
  val: x,
  concat: (y: Semigroup<any>) => 
    Flatten(x.concat(
      y.val instanceof Array
        ? fold(Flatten, y.val)
        : y.val
    )),
  inspect: () => `Flatten(${x})`,
  toString: () => `Flatten(${x})`
});

Flatten.prototype.identity = Flatten([]);

export { Sum, Product, Max, Min, Average, All, Some, Flatten };


////////// Monads //////////

const Box = (x: any): Monad<any> => ({
  map: (f: Function) => Box(f(x)),
  chain: (f: Function) => f(x),
  fold: (f: Function) => f(x),
  inspect: () => `Box(${x})`,
  toString: () => `Box(${x})`
});

const Right = (x: any): Either<any> => ({
  chain: (f: Function) => f(x),
  map: (f: Function) => Right(f(x)),
  fold: (f: Function, g: Function) => g(x),
  inspect: () => `Right(${x})`,
  toString: () => `Right(${x})`
});

const Left = (x: any): Either<any> => ({
  chain: (f: Function) => Left(x),
  map: (f: Function) => Left(x),
  fold: (f: Function, g: Function) => f(x),
  inspect: () => `Left(${x})`,
  toString: () => `Left(${x})`
});

export { Box, Right, Left };


////////// Utility Functions //////////

const fold = (Monoid: (x: any) => Semigroup<any>, list: Array<any>) =>
  list
    .map(x => Monoid(x))
    .reduce((x, y) => x.concat(y), Monoid.prototype.identity)
    .val;

const flatFold = (Monoid: (x: any) => Semigroup<any>, list: Array<any>) =>
  fold(Monoid, fold(Flatten, list));

const flatMap = (f: Function, list: Array<any>) =>
  fold(Flatten, list).map(f);

const fromNullable = (x: any): Either<any> =>
  x != null ? Right(x) : Left(null);

const tryCatch = (f: Function): Either<any> => {
  try {
    return Right(f());
  } catch(e) {
    return Left(e);
  }
};

export { fold, flatFold, flatMap, fromNullable, tryCatch };

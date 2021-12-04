# Chainrand-js — Verifiable hybrid-chain RNG.

Many applications require off-chain generation of random numbers for efficiency, security, etc.

This class allows you to generate a stream of deterministic, high-quality,  
cryptographically secure random numbers.

By seeding it with a Chainlink VRF result that is requested **only once for the project**,  
it can be used to demonstrate that the random numbers are **not cherry-picked**.

# Requirements

- A Javascript ES5 envrionment: NodeJS, most web browsers, even older ones.

# Installation

**Browser / CDN:**

```html
<script src="https://cdn.jsdelivr.net/npm/chainrand/chainrand.min.js"></script>
```

**NPM:**

```bash
npm i chainrand
```

Or you can clone/download this GitHub repository.

## Usage

```jsx
var rng = chainrand.CRNG("base10(<RNG_VRF_RESULT>)" + "<RNG_SEED_KEY>")
// prints 10 determinstic random numbers between [0, 1)
for (var i = 0; i < 10; ++i) {
    console.log(rng())
}
```

# Reproducibility

Current and future versions of this library will generate the same stream of random numbers from the same seed.

# Functions

## Constructor

```jsx
chainrand.CRNG(seed)
```

Creates an instance of the crng initialized with the `seed`.

**Parameters:**

- `seed: String` If empty, defaults to the empty string `""`.

**Example:**

```jsx
var crng = chainrand.CRNG("base10(<RNG_VRF_RESULT>)" + "<RNG_SEED_KEY>")
```

## random

```jsx
crng.random(): Number
```

Alias for `crng()`.
Returns a random number uniformly distributed in [0, 1).  
The numbers are in multiples of `2**-53`.

**Parameters:**
none

**Returns:**
A random number uniformly distributed in [0, 1).

## randrange

```jsx
crng.randrange(start, stop[, step]): Integer
crng.randrange(stop): Integer
```

Returns a random integer uniformly distributed in [start, stop).  
The integers are spaced with intervals of |step|.

**Parameters:**

- `start: Integer` The start of the range. (optional, default=`0`)
- `stop: Integer` The end of the range.
- `step: Integer` The interval step. (optional, default=`1`)

**Returns:**

A random integer uniformly distributed in [start, stop).

**Examples:**

```jsx
r = crng.randrange(3) // returns a random number in {0,1,2}
r = crng.randrange(-3) // returns a random number in {0,-1,-2}
r = crng.randrange(0, 6, 2) // returns a random number in {0,2,4}
r = crng.randrange(5, 0, 1) // returns a random number in {5,4,3,2,1}
r = crng.randrange(5, -5, -2) // returns a random number in {5,3,1,-1,-3}
```

## randint

```jsx
crng.randint(start, stop): Integer
crng.randint(stop): Integer
```

Returns a random integer uniformly distributed in [start, stop].  
The integers are spaced with intervals of |step|.

**Parameters:**

- `start: Integer` The start of the range. (optional, default=`0`)
- `stop: Integer` The end of the range.

**Returns:**

A random integer uniformly distributed in [start, stop].

**Examples:**

```jsx
r = crng.randint(3) // returns a random number in {0,1,2,3}
r = crng.randint(-3) // returns a random number in {0,-1,-2,-3}
r = crng.randint(-3, 1) // returns a random number in {-3,-2,-1,0,1}
r = crng.randint(3, -1) // returns a random number in {3,2,1,0,-1}
```

## choice

```jsx
crng.choice(population[, weights]): Array
```

Returns a random element from the population.

If weights is not provided, every element of population will be equally weighted.

If weights is a non-empty array and is of different length to population,  
only the first `Math.min(population.length, weights.length)` elements of population are sampled.

If the sum of the weights is less than or equal to zero,  
every element of population will be equally weighted.

**Parameters:**

- `population: Array`  The population.
- `weights: Array<Number>` The weights of the population. (optional)

**Returns:**

A random element in the population.

**Examples:**

```jsx
/* returns a random number in {1,2,3} */
r = crng.choice([1,2,3]) 

/* returns a random number in {1,2,3}
   with the weights {1:10, 2:1, 3:0.1} */
r = crng.choice([1,2,3], [10,1,0.1]) 
```

## sample

```jsx
crng.sample(population, k=1[, weights]): Array
```

Returns `k` random elements from the population, sampling **without** replacement.

If `k` is more than the length of the population, only `k` elements will be returned.

If weights is not provided, every element of population will be equally weighted.

If weights is a non-empty array and is of different length to population,  
only the first `Math.min(population.length, weights.length)` elements of population are sampled.

If the sum of the weights is less than or equal to zero,  
every element of population will be equally weighted.

**Parameters:**

- `population: Array`  The population.
- `k: Integer` The number of elements to choose.
- `weights: Array<Number>` The weights of the population. (optional)

**Returns:**

An array of `k` random elements from the population.

**Examples:**

```jsx
/* returns an array of 1 random element from {1,2,3} */
r = crng.sample([1,2,3]) 

/* returns an array of 2 random elements from {1,2,3} */
r = crng.sample([1,2,3], 2) 

/* returns an array of 2 random elements from {1,2,3}
   with the weights {1:10, 2:1, 3:0.1} */
r = crng.sample([1,2,3], 2, [10,1,0.1]) 
```

## shuffle

```jsx
crng.shuffle(population)
```

Shuffles the array in-place.

**Parameters:**

- `population: Array`  The population.

**Returns:** 

The shuffled array. 

## gauss

```jsx
crng.gauss(mu=0.0, sigma=1.0): Number
```

Normal distribution, also called the Gaussian distribution. 

**Parameters:**

- `mu: Number`  The mean. (optional, default=`0.0`)
- `sigma: Number` The standard deviation. (optional, default=`1.0`)

**Returns:**

A random number from the Gaussian distribution.

# License

MIT

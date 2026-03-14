const DOG_BREEDS = [
  "Beagle",
  "Corgi",
  "Dachshund",
  "Shiba Inu",
  "Dalmatian",
  "Greyhound",
  "Poodle",
  "Samoyed"
];

interface RandomDogBreedOptions {
  excludeNames?: string[];
  random?: () => number;
}

export function getRandomDogBreedNames(count: number, options: RandomDogBreedOptions = {}): string[] {
  const { excludeNames = [], random = Math.random } = options;
  const availableBreeds = DOG_BREEDS.filter((breed) => !excludeNames.includes(breed));

  return Array.from({ length: count }, () => {
    const index = Math.floor(random() * availableBreeds.length);
    const [breed] = availableBreeds.splice(index, 1);
    return breed;
  });
}

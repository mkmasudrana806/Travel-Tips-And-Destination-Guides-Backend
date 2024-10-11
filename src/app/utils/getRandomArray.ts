// Function to randomize the array
export function getRandomArray<T>(existingArray: T[]): T[] {
  const newArray: T[] = [];
  const tempArray = [...existingArray]; // Deep copy of the array

  while (tempArray.length > 0) {
    const randomIndex = Math.floor(Math.random() * tempArray.length);
    newArray.push(tempArray[randomIndex]);
    tempArray.splice(randomIndex, 1);
  }

  return newArray;
}



const eqArrays = (array1, array2) => {
  if (array1.length !== array2.length) {
    return false;
  } else {
    for (const i in array1) {
      if (array1[i] !== array2[i]) {
        return false;
      }
    }
  }
  return true;
};

const eqObjects = (object1, object2) => {
  const keysArray1 = Object.keys(object1);
  const keysArray2 = Object.keys(object2);

  // If both arrays are not the same length, return false.
  if (keysArray1.length !== keysArray2.length) {
    return false;
  }

  // Loop through and compare the target elemenet from two arrays.
  for (const element1 of keysArray1) {
    for (const element2 of keysArray2) {

      // If the target element (key name) in both arrays are the same then, 
      if (element1 === element2) {

        // If neither of the key-values in are objects then,
        if (typeof object1[element1] !== 'object' && typeof object1[element1] !== 'object') {

          // If both key-values are not the same, then return false.
          if (object1[element1] !== object2[element2]) {
            return false;
          }

        // Otherwise, if one key-value is not an object, but the other one is, then return false,
        } else if (typeof object1[element1] !== 'object' && typeof object1[element1] === 'object') {
          return false;
        
        // Otherwise, if both key-values are objects, pass in both key-values into the eqArray function to determine if they match.
        } else {
          return eqArrays(object1[element1], object2[element2]);
        }
      }
    }
  }

  // Return true as a default if none of the above conditions are met.
  return true;
}

module.exports = { eqObjects };
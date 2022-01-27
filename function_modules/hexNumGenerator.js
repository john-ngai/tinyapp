// Generate a random hexidecimal number up to the number of digits called by the parameter.
const hexNumGenerator = (digits) => {
  if (typeof digits !== 'number') {
    return new Error(
      'The function argument is not a number.'
    );
  }
  if (!digits > 0) {
    return new Error('The function argument is less than or equal to zero.');
  }
  if (!Number.isInteger(digits)) {
    return new Error('The function argument is not an integer.')
  }
  const firstIndex = 2;
  const lastIndex = digits + 2;
  return Math.random().toString(36).slice(firstIndex, lastIndex);
};

module.exports = { hexNumGenerator };
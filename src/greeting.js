/**
 * Generates a greeting message, optionally personalized with a name.
 *
 * @param {string} [name] - The name of the person sending the greeting (optional).
 * @returns {string} A greeting message. Returns "Hello world!" if no name is provided,
 *                   or "Hello world! From [name]" if a name is provided.
 *
 * @example
 * // Returns "Hello world!"
 * getGreeting();
 *
 * @example
 * // Returns "Hello world! From Alice"
 * getGreeting('Alice');
 */
function getGreeting(name) {
  // update test
  const greeting = 'Hello world!';

  // Convertir name en string si ce n'est pas déjà une string, null ou undefined
  if (name !== null && name !== undefined && name !== '') {
    const wisher = `From ${name}`;

    return `${greeting} ${wisher}`;
  }

  return greeting;
}

module.exports = { getGreeting };

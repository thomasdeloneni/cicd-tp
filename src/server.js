/**
 * Express server providing greeting endpoints.
 *
 * This server provides two HTTP endpoints for generating personalized greetings:
 * - GET /hello/:name? - Accepts an optional name as URL parameter
 * - POST /hello - Accepts a name via the 'x-name' HTTP header
 *
 * @module server
 */

const express = require("express");
const helmet = require("helmet");
const { getGreeting } = require("./greeting");

/**
 * Express application instance.
 * @type {express.Application}
 */
const app = express();

/**
 * Server port. Defaults to 3000 if PORT environment variable is not set.
 * @type {number}
 * @default 3000
 */
const PORT = process.env.PORT || 3000;

/**
 * GET endpoint for greeting.
 * Generates a greeting message with an optional name from URL parameter.
 *
 * @route GET /hello/:name?
 * @param {express.Request} req - Express request object
 * @param {string} [req.params.name] - Optional name for personalized greeting
 * @param {express.Response} res - Express response object
 * @returns {void} Sends greeting text as response
 *
 * @example
 * // GET /hello
 * // Response: "Hello world!"
 *
 * @example
 * // GET /hello/Alice
 * // Response: "Hello world! From Alice"
 */
// Middleware de sécurité
app.use(helmet({
  contentSecurityPolicy: false, // Désactivé pour simplifier les tests
  crossOriginEmbedderPolicy: false
}));

// Route principale
app.get('/', (req, res) => {
  res.send(getGreeting());
});

// Routes hello existantes
app.get('/hello/:name?', (req, res) => {
  const name = req.params.name;
  res.send(getGreeting(name));
});

/**
 * POST endpoint for greeting.
 * Generates a greeting message with a name from the 'x-name' HTTP header.
 *
 * @route POST /hello
 * @param {express.Request} req - Express request object
 * @param {string} [req.headers.x-name] - Name from custom HTTP header
 * @param {express.Response} res - Express response object
 * @returns {void} Sends greeting text as response
 *
 * @example
 * // POST /hello
 * // Headers: { "x-name": "Bob" }
 * // Response: "Hello world! From Bob"
 */
app.post("/hello", (req, res) => {
  const name = req.headers["x-name"];
  res.send(getGreeting(name));
});

/**
 * Start the server if this file is run directly (not imported as a module).
 * Listens on the configured PORT and logs the server status.
 */
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

module.exports = app;

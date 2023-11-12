const dotenv = require('dotenv');
const { server } = require('./utils/socket');

dotenv.config({ path: './.env' });
const PORT = process.env.PORT || 8000;

/* eslint-disable */
server.listen(PORT, () => {
  console.log(`API listening on PORT ${PORT} `);
});
/* eslint-enable */

// Export the Express API

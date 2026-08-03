'use strict';

// All root-level test fixtures resolve application files from the repository,
// independent of the directory from which Node is invoked.
var path = require('path');
module.exports = path.resolve(__dirname, '..');

/*jshint node:true*/
module.exports = {
  "framework": "qunit",
  "test_page": "tests/index.html?hidepassed",
  "disable_watching": true,
  "parallel": 2,
  "launch_in_ci": [
    "Firefox"
  ],
  "launch_in_dev": [
    "Firefox",
    "Chrome"
  ]
};

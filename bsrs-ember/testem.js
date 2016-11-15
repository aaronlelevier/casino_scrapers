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
}

// /*jshint node:true*/
// module.exports = {
//   "framework": "qunit",
//   "test_page": [
//     "tests/index.html?hidepassed&filter=/^Unit/i",
//     "tests/index.html?hidepassed&filter=/^Integration/i",
//     "tests/index.html?hidepassed&filter=/General/i",
//     "tests/index.html?hidepassed&filter=/Tab/i",
//     "tests/index.html?hidepassed&filter=/Grid/i"
//   ],
//   "disable_watching": true,
//   "parallel": 6,
//   "launch_in_ci": [
//     "Firefox"
//   ],
//   "launch_in_dev": [
//     "Chrome"
//   ]
// };;

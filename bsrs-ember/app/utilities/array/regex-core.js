/* @method regex_core
* @params - takes in closure functions from regex-property.js
*/
var regex_core = function(object, property, array_func, func, regex) {
    let attr;
    const array = /\[([^\]]*)\]/g;
    while (attr = array.exec(property)) {
        return array_func.call(attr[1], object, property, regex);
    }
    return func.call(this, object, property, regex);
};

export default regex_core;

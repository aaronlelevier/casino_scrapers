var get_value = function(object, property) {
    return object.get(property) ? object.get(property).toLowerCase() : null;
};

var regex_property = function(object, property, regex) {
    let attr;
    const array = /\[([^\]]*)\]/g;
    while (attr = array.exec(property)) {
        let result;
        const prop = property.match(/^[^\[]+/);
        object.get(prop[0]).forEach((model, index) => {
            let value = get_value(model, attr[1]);
            let legit = regex.test(value);
            result = index > 0 ? result || legit : legit;
        });
        return result;
    }
    return regex.test(get_value(object, property));
};

export default regex_property;

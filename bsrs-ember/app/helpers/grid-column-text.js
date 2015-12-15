import Ember from 'ember';

var GridColumnText = Ember.Helper.helper((params) => {
    let attr;
    const object = params[0];
    const property = params[1];
    const array = /\[([^\]]*)\]/g;
    while (attr = array.exec(property)) {
        let result;
        const prop = property.match(/^[^\[]+/);
        object.get(prop[0]).forEach((model, index) => {
            const value = model.get(attr[1]);
            result = index > 0 ? `${result} &#8226; ${value}` : value;
        });
        return Ember.String.htmlSafe(result);
    }
    return object.get(property);
});
//TODO: make this forgiving (ie- not blow up)
//TODO: share code here w/ the regex_property

export default GridColumnText;

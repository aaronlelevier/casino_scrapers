var LoopAttrsModel = function attrs(obj, ...excluded_attrs) {
    let notInExcluded = (attribute) => {
        let bool = true;
        excluded_attrs.forEach((ex_attr) => {
            if (ex_attr === attribute) { bool = false; }
        });
        return bool;
    };
    let all_attributes = [];
    let factory = obj.get('constructor.ClassMixin.ownerConstructor');
    factory.eachComputedProperty(function (key, meta) {
        if (meta.isAttribute) {
            all_attributes.push(key);
        }
    });
    let all_undefined = true;
    all_attributes.forEach((attribute) => {
        if (obj.get(attribute) !== undefined && notInExcluded(attribute)) {
            all_undefined = false;
        } 
    });
    return all_undefined;
};

export default LoopAttrsModel;

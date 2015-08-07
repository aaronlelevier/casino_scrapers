var LoopAttrsModel = function attrs(obj) {
    var all = [];
    var factory = obj.get('constructor.ClassMixin.ownerConstructor');
    factory.eachComputedProperty(function (key, meta) {
        if (meta.isAttribute) {
            all.push(key);
        }
    });
    return all;
};
export default LoopAttrsModel;

import Ember from 'ember';

function factory(obj) {
    return obj.get('constructor.ClassMixin.ownerConstructor');
}

function clone(obj) {
    var copy = {};
    factory(obj).eachComputedProperty(function (key, meta) {
        if (meta.isAttribute) {
            copy[key] = obj.get(key);
        }
    });
    return copy;
}

var CopyMixin = Ember.Mixin.create({
    copy(obj) {
        return clone(obj);
    }
});

export default CopyMixin;


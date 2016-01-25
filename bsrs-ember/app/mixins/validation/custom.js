import Ember from 'ember';

function factory(mixin) {
    return mixin.get('constructor.ClassMixin.ownerConstructor');
}

function attrs(mixin) {
    var attributes = [];
    factory(mixin).eachComputedProperty(function(field, meta) {
        if (field.indexOf('Validation') > 0) {
            attributes.push(field);
        }
        if (meta.validateEach) {
            mixin.get('model').forEach(function(model, index) {
                attributes.push(field + index + 'Validation');
            });
        }
    });
    return attributes;
}

var CustomValidMixin = Ember.Mixin.create({
    valid: Ember.computed(function() {
        let result = true;
        attrs(this).forEach((attr) => {
            const index = parseInt(attr.match(/\d+/), 10);
            const complexName = attr.split(index)[0];
            const capitalLetter = complexName.match(/[A-Z]/);
            const attrName = complexName.split(capitalLetter)[0];
            const attrValue = this.get('model').objectAt(index).get(attrName);
            const hasValue = attrValue ? attrValue.trim().length > 0 : false;
            if(hasValue) {
                result = this.get(attr) && result;
            }
        });
        return result;
    })
});

export default CustomValidMixin;

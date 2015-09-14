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
        let self = this;
        let result = true;
        attrs(this).forEach(function(attr) {
            let index = parseInt(attr.match(/\d+/), 10);
            let complexName = attr.split(index)[0];
            let capitalLetter = complexName.match(/[A-Z]/);
            let attrName = complexName.split(capitalLetter)[0];
            let attrValue = self.get('model').objectAt(index).get(attrName);
            let hasValue = attrValue ? attrValue.trim().length > 0 : false;
            if(hasValue) {
                result = self.get(attr) && result;
            }
        });
        return result;
    })
});

export default CustomValidMixin;

import Ember from 'ember';

var RelaxedMixin = Ember.Mixin.create({
    all_components_valid: function() {
        var value = true;
        Object.keys(this.child_validators).forEach((key) => {
            value = this.child_validators[key] && value;
        });
        return this.get('valid') && value === true;
    }
});

export default RelaxedMixin;

import Ember from 'ember';

var StrictMixin = Ember.Mixin.create({
    all_components_valid() {
        let value = true;
        Object.keys(this.child_validators).forEach((key) => {
            value = this.child_validators[key] && value;
        });
        const legit = this.get('valid') && value === true;
        const children = this.get('child_components').get('length');
        const verified = Object.keys(this.child_validators).length;
        return legit && children === verified;
    }
});

export default StrictMixin;

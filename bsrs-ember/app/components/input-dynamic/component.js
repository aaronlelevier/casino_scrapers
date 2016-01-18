import Ember from 'ember';

var InputDynamic = Ember.TextField.extend({
    classNames: ['t-new-entry form-control input-md'],
    value: Ember.computed('obj', {
        get(key){
            var prop = this.get('prop');
            return this.get('obj.' + prop);
        },
        set(key, value){
            var prop = this.get('prop');
            if (prop.indexOf('.') > -1) {
                const [object, field] = prop.split('.');
                const obj = Ember.Object.create();
                obj[field] = value;
                this.set('obj.' + object, obj);
            }else{
                this.set('obj.' + prop, value);
            }
            return this.get('obj.' + prop, value);
        }
    })
});

export default InputDynamic;

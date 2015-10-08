import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';

var TabModel = Ember.Object.extend({
    init() {
        var dynamicField = this.get('templateModelField');
        Ember.defineProperty(this, 'modelBindingToTemplate', Ember.computed(function() {
            var model = this.get('model');
            if (model.get('content')) {
                return model.get(dynamicField);
            }
        }).property('model.' + dynamicField));
    },
    store: inject('main'),
    model: Ember.computed(function() {
        return this.get('store').find(this.get('doc_type'), this.get('id'));
    }),
    parent: Ember.computed('modelBindingToTemplate', function(){
        return this.get('modelBindingToTemplate') || this.get('doc_type');
    })
});

export default TabModel;

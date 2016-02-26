import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';

var TabModel = Ember.Object.extend({
    i18n: Ember.inject.service(),
    init() {
        const dynamicField = this.get('templateModelField');
        Ember.defineProperty(this, 'modelBindingToTemplate', Ember.computed(function() {
            const model = this.get('model');
            if (model.get('content')) {
                switch(dynamicField) {
                    case 'categories':
                        return `#${model.get('number')} - ${model.get('leaf_category.name')}`;
                    default:
                        return model.get('new') ? `${this.get('i18n').t('general.new')} ${dynamicField}` : model.get(dynamicField);
                }
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

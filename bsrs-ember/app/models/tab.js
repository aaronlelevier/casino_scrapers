import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';

var TabModel = Ember.Object.extend({
  modalIsShowing: false,
  previousLocation: undefined,
  currentLocation: undefined, //only used for new tabs right now
  i18n: Ember.inject.service(),
  init() {
    const dynamicField = this.get('templateModelField') || [];
    Ember.defineProperty(this, 'modelBindingToTemplate', Ember.computed(function() {
      const model = this.get('model').get('id') ? this.get('model') : this.get('singleTabModel');
      if (model.get('content')) {
        switch(dynamicField) {
          case 'categories':
            return `#${model.get('number')} - ${model.get('leaf_category.name')}`;
          case 'singleTab':
            let tabTitle = this.get('tabTitle');
            return this.get('i18n').t(tabTitle);
          default:
            return model.get('new') ? `${this.get('i18n').t('general.new')} ${dynamicField}` : model.get(dynamicField);
        }
      }
    }).property('model.' + dynamicField));
  },
  store: inject('main'),
  model: Ember.computed(function() {
    return this.get('store').find(this.get('module'), this.get('id'));
  }),
  singleTabModel: Ember.computed('model_id', function() {
    return this.get('store').find(this.get('module'), this.get('model_id'));
  }),
  parent: Ember.computed('modelBindingToTemplate', function(){
    return this.get('displayText') || this.get('modelBindingToTemplate');
  }),
  tab_count: Ember.computed(function(){
    const filter = (tab) => {
      return true;
    };
    return this.get('store').find('tab', filter);
  })
});

export default TabModel;

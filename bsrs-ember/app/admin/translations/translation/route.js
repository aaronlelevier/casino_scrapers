import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/route';

var TransitionRoute = TabRoute.extend({
  repository: inject('translation'),
  redirectRoute: Ember.computed(function() { return 'admin.translations.index'; }),
  module: Ember.computed(function() { return 'translation'; }),
  templateModelField: Ember.computed(function() { return 'key'; }),
  i18n: Ember.inject.service(),
  model(params) {
    let translation_pk = params.translation_key;
    let translation = this.get('simpleStore').find('translation', translation_pk);
    let repository = this.get('repository');
    if (!translation.get('length') || translation.get('isNotDirty')) {
      translation = repository.findById(translation_pk);
    }
    /* MOBILE SPECIFIC */
    const hashComponents = [
      {'title': '', 'component': 'translations/detail-section', active: 'active'}
    ];
    return {
      model: translation,
      hashComponents: hashComponents,
      repository: repository
    };

  },
  setupController: function(controller, hash) {
    controller.setProperties(hash);
  }
});

export default TransitionRoute;

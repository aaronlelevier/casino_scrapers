import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/route';

var TransitionRoute = TabRoute.extend({
    repository: inject('translation'),
    redirectRoute: Ember.computed(function() { return 'admin.translations.index'; }),
    module: Ember.computed(function() { return 'translation'; }),
    templateModelField: Ember.computed(function() { return 'key'; }),
    model(params) {
        let translation_pk = params.translation_key;
        let translation = this.get('simpleStore').find('translation', translation_pk);
        let repository = this.get('repository');
        if (!translation.get('length') || translation.get('isNotDirty')) {
            translation = repository.findById(translation_pk);
        }
        return {
            model: translation
        };

    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
    }
});

export default TransitionRoute;

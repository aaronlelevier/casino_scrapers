import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import { validate } from 'ember-cli-simple-validation/mixins/validate';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import EditMixin from 'bsrs-ember/mixins/components/tab/edit';

var GeneralSettings = Ember.Component.extend(TabMixin, EditMixin, {
    repository: inject('setting'),
    classNames: ['wrapper', 'form'],
    simpleStore: Ember.inject.service(),
    dashboardTextValidation: validate('model.dashboard_text'),
    actions: {
        save() {
            this.set('submitted', true);
            this._super();
        },
        changeBool(key, value) {
            const store = this.get('simpleStore');
            let setting = store.find('setting', this.get('model.id'));
            var obj = {};
            obj['id'] = setting.get('id');
            obj[key] = !value;
            store.push('setting', obj);
        }
    }
});

export default GeneralSettings;

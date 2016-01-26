import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';
import { belongs_to, change_belongs_to, belongs_to_dirty, belongs_to_rollback, belongs_to_save } from 'bsrs-ember/utilities/belongs-to';

export default Ember.Object.extend({
    store: inject('main'),
    hats: belongs_to('users', 'hat'),
    hat: Ember.computed.alias('hats.firstObject'),
    change_hat: change_belongs_to('users', 'hat'),
    hatIsDirty: belongs_to_dirty('hat_fk', 'hat'),
    hatIsNotDirty: Ember.computed.not('hatIsDirty'),
    rollbackHat: belongs_to_rollback('hat_fk', 'hat', 'change_hat'),
    saveHat: belongs_to_save('user', 'hat', 'hat_fk'),
});

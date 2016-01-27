import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';
import { belongs_to, change_belongs_to, belongs_to_dirty, belongs_to_rollback, belongs_to_save } from 'bsrs-ember/utilities/belongs-to';
import { many_to_many, many_to_many_ids, many_to_many_dirty, many_to_many_rollback, many_to_many_save, add_many_to_many, remove_many_to_many, many_models, many_models_ids } from 'bsrs-ember/utilities/many-to-many';
import equal from 'bsrs-ember/utilities/equal';

var run = Ember.run;

export default Ember.Object.extend({
    store: inject('main'),
    hats: belongs_to('users', 'hat'),
    hat: Ember.computed.alias('hats.firstObject'),
    change_hat: change_belongs_to('users', 'hat'),
    hatIsDirty: belongs_to_dirty('hat_fk', 'hat'),
    hatIsNotDirty: Ember.computed.not('hatIsDirty'),
    rollbackHat: belongs_to_rollback('hat_fk', 'hat', 'change_hat'),
    saveHat: belongs_to_save('user', 'hat', 'hat_fk'),
    user_shoes_ids: many_to_many_ids('user_shoes'),
    user_shoes: many_to_many('user-shoe', 'user_pk'),
    shoes_ids: many_models_ids('shoes'),
    shoes: many_models('user_shoes', 'shoe_pk', 'shoe'),
    shoesIsDirty: many_to_many_dirty('shoes', 'user_shoes_ids', 'user_shoes_fks'),
    shoesIsNotDirty: Ember.computed.not('shoesIsDirty'),
    add_shoe: add_many_to_many('user-shoe', 'shoe', 'shoe_pk', 'user_pk'),
    remove_shoe: remove_many_to_many('user-shoe', 'shoe_pk', 'user_shoes'),
    rollbackShoe: many_to_many_rollback('user-shoe', 'user_shoes_fks', 'user_pk'),
    saveShoe: many_to_many_save('user_shoes', 'user_shoes_ids', 'user_shoes_fks'),
});

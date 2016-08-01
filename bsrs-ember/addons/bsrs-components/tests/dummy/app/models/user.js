import Ember from 'ember';
const { run } = Ember;
import { belongs_to, change_belongs_to } from 'bsrs-components/attr/belongs-to';
import { many_to_many } from 'bsrs-components/attr/many-to-many';
import equal from 'bsrs-components/utils/equal';
import OPT_CONF from 'dummy/mixins/user_config';


export default Ember.Object.extend(OPT_CONF, {
  init() {
    this._super(...arguments);

    /**
     * Creates methods defined on owning model
     *   - * assuming 'status' is passed as first argument
     *   - status (belongs to association to access users status)
     *   - change_status
     *   - rollbackStatus
     *   - saveStatus
     *   - statusIsDirty
     *   - statusIsNotDirty
     *
     * @method belongs_to
     * @param {string} status owning model
     * @param {string} user belongs to model
     */
    belongs_to.bind(this)('hat', 'user', {bootstrapped:true});
    belongs_to.bind(this)('shirt', 'user');
    belongs_to.bind(this)('user_status', 'user', {bootstrapped:true});

    /**
     * Creates methods defined on join model
     *   - * assuming 'shoe' is passed as first argument
     *   - status (belongs to association to access users status)
     *
     * @method many_to_many
     * @param {string} shoe related model singular case
     * @param {string} user main lookup model
     */
    many_to_many.bind(this)('shoe', 'user', {'plural':true});
    many_to_many.bind(this)('feet', 'user', {'unlessAddedM2MDirty':true});
    many_to_many.bind(this)('finger', 'user', {'plural':true});
  },
  simpleStore: Ember.inject.service(),
  user_shoes_fks: [],
  user_feet_fks: [],
  //still able to use attrs when needed
  change_fk: change_belongs_to('hat'),
  change_full: change_belongs_to('hat'),
});

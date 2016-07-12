import Ember from 'ember';
import GridRepositoryMixin from 'bsrs-ember/mixins/repositories/grid';
import FindByIdMixin from 'bsrs-ember/mixins/repositories/findById';
import CRUDMixin from 'bsrs-ember/mixins/repositories/crud';

export default Ember.Object.extend(GridRepositoryMixin, FindByIdMixin, CRUDMixin, {});
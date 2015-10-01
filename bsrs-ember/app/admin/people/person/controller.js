import Ember from 'ember';
import BaseController from 'bsrs-ember/controller/base-controller';

var PersonController = BaseController.extend({
    queryParams: ['search', 'role_change'],
    search: undefined,
    role_change: undefined,
});

export default PersonController;


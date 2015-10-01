import Ember from 'ember';
import BaseController from 'bsrs-ember/controller/base-controller';

var CategoryNewController = BaseController.extend({
    queryParams: ['search'],
    search: undefined,
});

export default CategoryNewController;



import PromiseMixin from 'bsrs-ember/mixins/promise';
import errorFunction from 'bsrs-ember/utilities/error-function';

export function initialize() {
    PromiseMixin.onError = errorFunction;
} 

export default {
    name: 'global-error-handling',
    initialize: initialize
};


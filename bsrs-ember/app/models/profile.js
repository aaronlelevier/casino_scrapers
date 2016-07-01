import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';

const orderDefault = 0;

export default Model.extend({
    description: attr(''),
    order: attr(orderDefault),
    assignee_id: attr(''),
    serialize() {
        return {
            id: this.get('id'),
            description: this.get('description'),
            order: this.get('order') || orderDefault,
            assignee_id: this.get('assignee_id'),
        };
    },
});

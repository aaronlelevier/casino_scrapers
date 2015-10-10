import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';
import injectUUID from 'bsrs-ember/utilities/uuid';

var TicketModel = Model.extend({
    serialize() {
        return {
            id: this.get('id'),
            number: this.get('number'),
            status: this.get('status')
        };
    },
});

export default TicketModel;

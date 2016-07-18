import Ember from 'ember';
import TetherDialog from 'ember-modal-dialog/components/tether-dialog';

export default TetherDialog.extend({
  didInsertElement: function() {
    this._super(...arguments);
    Ember.$('.ember-modal-dialog input:first').focus();
  }
});

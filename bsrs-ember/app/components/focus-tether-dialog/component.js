import TetherDialog from 'ember-modal-dialog/components/tether-dialog';

export default TetherDialog.extend({
    didInsertElement: function() {
        this._super();
        Ember.$('.ember-modal-dialog .t-new-entry').focus();
    }
});

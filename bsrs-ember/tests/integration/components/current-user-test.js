import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import translation from "bsrs-ember/instance-initializers/ember-i18n";

moduleForComponent('current-user', 'integration: current-user test', {
    integration: true,
    setup() {
        translation.initialize(this);
    }
});

test('when click logout, redirects to login page', function(assert){
    this.render(hbs`{{current-user}}`);
    var $component = this.$('.t-current-user');
    var $logout_link = this.$('.t-logout');
    assert.equal($component.length, 1);
    assert.equal($logout_link.text(), 'Logout');
    assert.equal(this.$('.t-person-profile-link').text(), 'Profile');
    assert.equal(this.$('.t-current-user-fullname').length, 1);
});

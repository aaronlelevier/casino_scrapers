import Ember from 'ember';
const { run } = Ember;
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import config from 'bsrs-ember/config/environment';
import { dtd_payload, dtd_payload_two } from 'bsrs-ember/tests/helpers/payloads/dtd';
import DTD from 'bsrs-ember/vendor/defaults/dtd';
import LINK from 'bsrs-ember/vendor/defaults/link';
import DTDF from 'bsrs-ember/vendor/dtd_fixtures';
import TP from 'bsrs-ember/vendor/defaults/ticket-priority';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import random from 'bsrs-ember/models/random';
import page from 'bsrs-ember/tests/pages/dtd';
import generalPage from 'bsrs-ember/tests/pages/general';
import ticketPage from 'bsrs-ember/tests/pages/tickets';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_dtd_url;
const DTD_URL = `${BASE_URL}/index`;
const DETAIL_URL = `${BASE_URL}/${DTD.idOne}`;
const DT_PUT_URL = `${PREFIX}${DETAIL_URL}/`;
// const LETTER_A = {keyCode: 65};
// const SPACEBAR = {keyCode: 32};
const BACKSPACE = {keyCode: 8};

let application, store, endpoint, list_xhr, detail_xhr, detail_data;

module('Acceptance | dtd detail', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        endpoint = `${PREFIX}${BASE_URL}/`;
        list_xhr = xhr(`${endpoint}?page=1`, 'GET', null, {}, 200, DTDF.list());
        detail_data = DTDF.detail(DTD.idOne);
        detail_xhr = xhr(`${endpoint}${DTD.idOne}/`, 'GET', null, {}, 200, detail_data);
    },
    afterEach() {
        Ember.run(application, 'destroy');
    }
});

test('decision tree definition displays data and saves correctly', (assert) => {
    page.visitDetail();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find('.t-dtd-key').val(), DTD.keyOne);
        assert.equal(find('.t-dtd-description').val(), DTD.descriptionOne);
        assert.equal(find('.t-dtd-prompt').val(), DTD.promptOne);
        assert.equal(find('.t-dtd-note').val(), DTD.noteOne);
        assert.equal(find('.t-dtd-link-action_button').prop('checked'), LINK.action_buttonOne);
        assert.equal(find('.t-dtd-link-is_header').prop('checked'), LINK.is_headerOne);
        assert.equal(find('.t-dtd-link-request').val(), LINK.requestOne);
        assert.equal(ticketPage.priorityInput, TP.priorityOne);
    });
    xhr(DT_PUT_URL, 'PUT', JSON.stringify(dtd_payload), {}, 200, {});
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), DTD_URL);
    });
});

test('dtd payload to update all fields', (assert) => {
    page.visitDetail();
    andThen(() => {
        assert.ok(find('.t-dtd-link-action_button').prop('checked'));
        assert.ok(find('.t-dtd-link-is_header').prop('checked'));
    });
    page
        .keyFillIn(DTD.keyTwo)
        .descriptionFillIn(DTD.descriptionTwo)
        .promptFillIn(DTD.promptTwo)
        .noteFillIn(DTD.noteTwo)
        .requestFillIn(LINK.requestTwo)
        .action_buttonClick()
        .is_headerClick();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find('.t-dtd-key').val(), DTD.keyTwo);
        assert.equal(find('.t-dtd-description').val(), DTD.descriptionTwo);
        assert.equal(find('.t-dtd-prompt').val(), DTD.promptTwo);
        assert.equal(find('.t-dtd-note').val(), DTD.noteTwo);
        assert.notOk(find('.t-dtd-link-action_button').prop('checked'));
        assert.notOk(find('.t-dtd-link-is_header').prop('checked'));
        assert.equal(find('.t-dtd-link-request').val(), LINK.requestTwo);
    });
    ticketPage.priorityClickDropdown();
    andThen(() => {
        assert.equal(ticketPage.priorityOne, TP.priorityOne);
        assert.equal(ticketPage.priorityTwo, TP.priorityTwo);
        assert.equal(ticketPage.priorityThree, TP.priorityThree);
        assert.equal(ticketPage.priorityFour, TP.priorityFour);
    });
    ticketPage.priorityClickOptionTwo();
    andThen(() => {
        assert.equal(ticketPage.priorityInput, TP.priorityTwo);
    });
    xhr(DT_PUT_URL, 'PUT', JSON.stringify(dtd_payload_two), {}, 200, {});
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), DTD_URL);
    });
});

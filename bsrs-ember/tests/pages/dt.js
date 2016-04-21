import Ember from 'ember';
import PageObject from 'bsrs-ember/tests/page-object';
let { value, visitable, fillable, clickable, hasClass, count, text } = PageObject;
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import DTD from 'bsrs-ember/vendor/defaults/dtd';
import FD from 'bsrs-ember/vendor/defaults/field';
import OD from 'bsrs-ember/vendor/defaults/option';
import { options } from 'bsrs-ember/tests/helpers/power-select-terms';

const DROPDOWN = options;
const BASE_URL = BASEURLS.base_dtd_url;
const DTDS_URL = `${BASE_URL}`;
const NEW_URL = `${BASE_URL}/new/1`;
const DETAIL_URL = `${BASE_URL}/${DTD.idOne}`;

const DESTINATION = '.t-link-destination-select > .ember-basic-dropdown-trigger';
const FIELD_SELECT_OPTION = '.t-dtd-field-select > .ember-basic-dropdown-trigger';

var DTPage = PageObject.create({
    requester: value('.t-dt-ticket-requester'),
    requesterFillin: fillable('.t-dt-ticket-requester'),

    locationsValue: text('.ember-basic-dropdown-trigger'),
    locationsClickDropdown: clickable('.ember-basic-dropdown-trigger'),
    locationsClickOne: clickable('.ember-basic-dropdown-trigger:eq(0)'),
    locationsOptionOneClick: clickable('.ember-power-select-option:eq(0)'),

    clickStart: clickable('.t-dt-start')
});

export default DTPage;

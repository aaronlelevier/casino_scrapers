import PageObject from 'bsrs-ember/tests/page-object';
let { value, visitable, fillable, clickable, hasClass } = PageObject;
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import DTD from 'bsrs-ember/vendor/defaults/dtd';

const BASE_URL = BASEURLS.base_dtd_url;
const DTDS_URL = `${BASE_URL}`;
const NEW_URL = `${BASE_URL}/new/1`;
const DETAIL_URL = `${BASE_URL}/${DTD.idOne}`;

var DTDPage = PageObject.create({
    visit: visitable(DTDS_URL),
    visitDetail: visitable(DETAIL_URL),
    visitNew: visitable(NEW_URL),
    // update: clickable('.t-ticket-action-save'),

    key: value('.t-dtd-single-key'),
    keyFillIn: fillable('.t-dtd-single-key'),
    description: value('.t-dtd-single-description'),
    descriptionFillIn: fillable('.t-dtd-single-description'),
    prompt: value('.t-dtd-prompt'),
    promptFillIn: fillable('.t-dtd-prompt'),
    note: value('.t-dtd-note'),
    noteFillIn: fillable('.t-dtd-note'),

    action_button: value('.t-dtd-link-action_button'),
    action_buttonClick: clickable('.t-dtd-link-action_button'),
    is_header: value('.t-dtd-link-is_header'),
    is_headerClick: clickable('.t-dtd-link-is_header'),
    request: value('.t-dtd-link-request'),
    requestFillIn: fillable('.t-dtd-link-request'),
    text: value('.t-dtd-link-text'),
    textFillIn: fillable('.t-dtd-link-text'),

    isDirty: hasClass('dirty', 'i', {scope: '.t-tab-close'}),
    clickPreviewToggle: clickable('.t-dtd-preview'),
    clickDetailToggle: clickable('.t-dtd-detail'),
    clickListToggle: clickable('.t-dtd-list'),
});

export default DTDPage;

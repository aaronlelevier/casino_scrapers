import PageObject from '../page-object';
let { value, visitable, fillable } = PageObject;
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import DTD from 'bsrs-ember/vendor/defaults/dtd';

const BASE_URL = BASEURLS.base_dtd_url;
const DTDS_URL = `${BASE_URL}/index`;
const NEW_URL = `${BASE_URL}/new/1`;
const DETAIL_URL = `${BASE_URL}/${DTD.idOne}`;

var DTDPage = PageObject.create({
    visitNew: visitable(NEW_URL),
    // visit: visitable(DTDS_URL),
    visitDetail: visitable(DETAIL_URL),
    // update: clickable('.t-ticket-action-save'),

    key: value('.t-dtd-key'),
    keyFillIn: fillable('.t-dtd-key'),
    description: value('.t-dtd-description'),
    descriptionFillIn: fillable('.t-dtd-description'),
});

export default DTDPage;

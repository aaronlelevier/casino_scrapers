import config from 'bsrs_deva/config/environment';
import DRFAdapter from './drf';

//logic for communicating with backend
export default DRFAdapter.extend({
  namespace: config.APP.NAMESPACE,///bsrs_deva
  host: config.APP.API_HOST,
  coalesceFindRequests: true
});

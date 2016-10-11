import inject from 'bsrs-ember/utilities/inject';
import GridViewRoute from 'bsrs-ember/mixins/route/components/grid';

var TranslationIndexRoute = GridViewRoute.extend({
    repository: inject('translation')
});

export default TranslationIndexRoute;

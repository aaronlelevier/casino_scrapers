import Ember from 'ember';
import { many_to_many_extract } from 'bsrs-components/repository/many-to-many';
import { belongs_to_extract, belongs_to_extract_contacts } from 'bsrs-components/repository/belongs-to';

const { run } = Ember;

var DTDDeserializer = Ember.Object.extend({
    deserialize(response, options) {
        if (typeof options === 'undefined') {
            return this.deserialize_list(response);
        } else {
            return this.deserialize_single(response, options);
        }
    },
    deserialize_single(response, id) {
        const store = this.get('store');
        let existing = store.find('dtd', id);
        let return_dtd = existing;
        if (!existing.get('id') || existing.get('isNotDirtyOrRelatedNotDirty')) {
            let link_json = response.links;
            delete response.links;
            let dtd = store.push('dtd', response);
            let [m2m_links, links, links_server_sum] = many_to_many_extract(link_json, store, dtd, 'dtd_links', 'dtd_pk', 'link', 'link_pk');
            m2m_links.forEach((m2m) => {
                run(() => {
                    store.push('dtd-link', m2m);
                });
            });
            // NOTE: (ayl) 3/2 (Aaron was here) maybe remove later
            // links.forEach((model) => {
            //     model.detail = true;
            //     let link;
            //     run(() => {
            //         link = store.push('link', model);
            //     });
            //     belongs_to_extract(link.priority_fk, store, link, 'priority', 'link', 'links');
            // });
            link_json.forEach((model) => {
                const existing = store.push('link', model);
                existing.detail = true;
                belongs_to_extract(model.priority_fk, store, existing, 'priority', 'link', 'links');
            });
            dtd = store.push('dtd', {id: dtd.get('id'), dtd_link_fks: links_server_sum});
            dtd.save();
            return_dtd = dtd;
        }
    },
    deserialize_list(response) {
        const store = this.get('store');
        const return_array = [];
        response.results.forEach((model) => {
            const dtd = store.push('dtd-list', model);
            return_array.push(dtd);
        });
        return return_array;
    }
});

export default DTDDeserializer;







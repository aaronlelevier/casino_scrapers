import Ember from 'ember';
const { run } = Ember;
import inject from 'bsrs-ember/utilities/store';
import { attr, Model } from 'ember-cli-simple-store/model';
import { validator, buildValidations } from 'ember-cp-validations';
import { many_to_many, many_to_many_ids, many_to_many_dirty, many_to_many_rollback, many_to_many_save, add_many_to_many, remove_many_to_many, many_models, many_models_ids } from 'bsrs-components/attr/many-to-many';

const Validations = buildValidations({
    key: validator('presence', {
        presence: true,
        message: 'Key must be provided'
    }),
});

var DTDModel = Model.extend(Validations, {
    store: inject('main'),
    key: attr(''),
    description: attr(''),
    note: attr(''),
    note_type: attr(''),
    prompt: attr(''),
    link_type: attr(''),
    dtd_link_fks: [],
    linksIsDirtyContainer: many_to_many_dirty('dtd_link_ids', 'dtd_link_fks'),
    linksIsDirty: Ember.computed('links.@each.{isDirtyOrRelatedDirty}', 'linksIsDirtyContainer', function() {
        const links = this.get('links');
        return links.isAny('isDirtyOrRelatedDirty') || this.get('linksIsDirtyContainer');
    }),
    linksIsNotDirty: Ember.computed.not('linksIsDirty'),
    links: many_models('dtd_links', 'link_pk', 'link'),
    dtd_links: many_to_many('dtd-link', 'dtd_pk'),
    dtd_link_ids: many_to_many_ids('dtd_links'),
    add_link: add_many_to_many('dtd-link', 'link', 'link_pk', 'dtd_pk'),
    remove_link:remove_many_to_many('dtd-link', 'link_pk', 'dtd_links'),
    isDirtyOrRelatedDirty: Ember.computed('isDirty', 'linksIsDirty', function() {
        return this.get('isDirty') || this.get('linksIsDirty');
    }),
    isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
    serialize(){
        const links = this.get('links').map((link) => {
            return link.serialize();
        });
        return {
            id: this.get('id'),
            key: this.get('key'),
            description: this.get('description'),
            prompt: this.get('prompt'),
            note: this.get('note'),
            note_type: this.get('note_type'),
            link_type: this.get('link_type'),
            links: links
        };
    },
    rollbackRelated() {
        this.linkRollbackContainer();
        this.linkRollback();
    },
    linkRollbackContainer() {
        const links = this.get('links');
        links.forEach((link) => {
            link.rollback();
            link.rollbackRelated();
        });
    },
    linkRollback: many_to_many_rollback('dtd-link', 'dtd_link_fks', 'dtd_pk'),
    saveRelated(){
        this.saveLinksContainer();
        this.saveLinks();
    },
    saveLinksContainer() {
        const links = this.get('links');
        links.forEach((link) => {
            link.saveRelated();
            link.save();
        });
    },
    saveLinks: many_to_many_save('dtd', 'dtd_links', 'dtd_link_ids', 'dtd_link_fks'),
    removeRecord(){
        run(() => {
            this.get('store').remove('dtd', this.get('id'));
        });
    },
});


export default DTDModel;


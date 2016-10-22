import Ember from 'ember';
const { Component } = Ember;
import inject from 'bsrs-ember/utilities/inject';
import injectUUID from 'bsrs-ember/utilities/uuid';
import parseError from 'bsrs-ember/utilities/error-response';

const ImageDrop = Component.extend({
  repository: inject('attachment'),
  uuid: injectUUID('uuid'),
  active: false,
  attributeBindings: ['style'],
  classNames: ['image-drop'],
  classNameBindings: [
    'active',
  ],
  droppedImage: null,

  simpleStore: Ember.inject.service(),

  style: Ember.computed('droppedImage', function() {
    let backgroundStyle = '';

    if (this.get('droppedImage')) {
      backgroundStyle = `background-image: url(${this.get('droppedImage')});`;
    } 

    return Ember.String.htmlSafe(backgroundStyle);
  }),

  didInsertElement() {
    this.setup();
  },
  setup() {
    this.$('input').on('change', (event) => {
      this.handleFileDrop(event.target.files[0]);
    });
  },

  willDestroyElement() {
    this.$('input').off('change');
  },

  dragLeave() {
    this.set('active', false);
  },

  dragOver() {
    this.set('active', true);
  },

  /**
   * @method drop
   * Ember provided event on Component - HTML5 spec
   * dataTransfer is a method provided on a drop event
   * preventDefault - prevent further propogation of the event, thus preventing normal implementation
   */
  drop(event) {
    event.preventDefault();

    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      return this.handleFileDrop(event.dataTransfer.files[0]);
    }
  },

  /** 
   * @method handleFileDrop
   * read it, set it to the droppedImage (user.photo)
   * currently only uploads one photo.  uses 'change_photo'.  If multiple, need refactor
   */
  handleFileDrop(file) {
    if (file == null) {
      return;
    }
    const repoUpload = (i, files) => {
      const uuid = this.get('uuid');
      const id = uuid.v4();
      const model = this.get('model');
      const repository = this.get('repository');
      repository.upload(id, files[i], model).then((attachment) => {
        this.dragLeave();
        /* jshint ignore:start */
        model.change_photo({ ...attachment });
        this.get('simpleStore').push('attachment', { ...attachment });
        /* jshint ignore:end */
      }).catch((xhr) => {
        this.dragLeave();
        const error = parseError(xhr.status, xhr.responseText);
        this.get('onError')(error);
      });
    };
    repoUpload(0, [file]);
  }
});

export default ImageDrop;

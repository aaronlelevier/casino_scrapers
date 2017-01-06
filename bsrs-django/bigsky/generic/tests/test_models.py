import os
from os.path import dirname, join

from django.test import TestCase
from django.conf import settings
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.files.uploadedfile import SimpleUploadedFile

from model_mommy import mommy
from rest_framework.exceptions import ValidationError

from category.tests.factory import create_categories
from generic.models import Attachment, AttachmentManager, AttachmentQuerySet, SavedSearch
from generic.tests.factory import create_file_attachment, create_image_attachment
from person.tests.factory import create_single_person
from ticket.tests.factory import create_ticket
from utils.helpers import media_path
from utils.tests.helpers import remove_attachment_test_files


class SavedSearchTests(TestCase):

    def setUp(self):
        self.person = create_single_person()
        self.saved_search = mommy.make(SavedSearch, person=self.person, name="foo",
            endpoint_name="admin.people.index")

    ### MODEL TESTS

    def test_create(self):
        self.assertIsInstance(self.saved_search, SavedSearch)

    def test_meta(self):
        self.assertEqual(self.saved_search._meta.ordering,  ('-modified',))
        self.assertEqual(self.saved_search._meta.verbose_name_plural, "Saved searches")

    def test_str(self):
        self.assertEqual(str(self.saved_search), self.saved_search.name)

    def test_validate_person_and_name_unique(self):
        with self.assertRaises(ValidationError):
            mommy.make(SavedSearch, person=self.person, name="foo",
                endpoint_name="admin.people.index")

    def test_validate_person_name_unique_diff_endpoint_name(self):
        mommy.make(SavedSearch, person=self.person, name="foo",
            endpoint_name="tickets.index")
        self.assertEqual(SavedSearch.objects.count(), 2)

    def test_to_dict(self):
        self.assertEqual(len(self.saved_search.to_dict()), 4)
        self.assertIsInstance(self.saved_search.to_dict(), dict)

    ### MANAGER TESTS

    def test_person_saved_searches(self):
        ret = SavedSearch.objects.person_saved_searches(self.person)
        self.assertIsInstance(ret, list)
        self.assertIsInstance(ret[0], dict)


class AttachmentManagerTests(TestCase):

    def setUp(self):
        create_image_attachment()

    def test_queryset_cls(self):
        self.assertEqual(AttachmentManager.queryset_cls, AttachmentQuerySet)

    def test_to_dict_full(self):
        self.assertEqual(
            Attachment.objects.to_dict_full(),
            [x.to_dict_full() for x in Attachment.objects.all()]
        )


class AttachmentTests(TestCase):

    def setUp(self):
        # this can be any Model here, ``Attachment`` just requires a
        # model UUID to reference b/c the attachments are assoc. w/ models.
        create_categories()
        create_single_person()
        self.ticket = create_ticket()

        # test upload file save in source control
        self.base_dir = dirname(dirname(dirname(__file__)))

        self.file = join(settings.MEDIA_ROOT, "test_in/es.csv")
        self.file_filename = os.path.split(self.file)[1]

        self.image = join(settings.MEDIA_ROOT, "test_in/aaron.jpeg")
        self.image_filename = os.path.split(self.image)[1]

        self.attachment_kwargs = {
            'content_object': self.ticket,
            'object_id': self.ticket.id
        }

    def tearDown(self):
        # remove test attachements after running test
        remove_attachment_test_files()

    def test_files_exist(self):
        self.assertTrue(os.path.isfile(self.image))
        self.assertTrue(os.path.isfile(self.file))

    def test_upload_file(self):
        with open(self.file, 'rb') as infile:
            _file = SimpleUploadedFile(self.file_filename, infile.read())
            
            attachment = Attachment.objects.create(file=_file, **self.attachment_kwargs)

            self.assertIsInstance(attachment, Attachment)
            self.assertEqual(attachment.content_object, self.ticket)
            self.assertEqual(attachment.filename, self.file_filename)
            self.assertFalse(attachment.is_image)
            self.assertTrue(attachment.file)
            self.assertFalse(attachment.image_full)
            self.assertFalse(attachment.image_medium)
            self.assertFalse(attachment.image_thumbnail)

    def test_upload_image(self):
        with open(self.image, 'rb') as infile:
            _file = SimpleUploadedFile(self.image_filename, infile.read())

            attachment = Attachment.objects.create(file=_file, **self.attachment_kwargs)

            self.assertIsInstance(attachment, Attachment)
            self.assertEqual(attachment.content_object, self.ticket)
            self.assertEqual(attachment.filename, self.image_filename)
            self.assertTrue(attachment.is_image)
            self.assertTrue(attachment.file)
            self.assertTrue(attachment.image_full)
            self.assertTrue(attachment.image_medium)
            self.assertTrue(attachment.image_thumbnail)

    def test_upload_size(self):
        with self.settings(MAX_UPLOAD_SIZE=0):
            with open(self.image, 'rb') as infile:
                with self.assertRaises(DjangoValidationError):
                    _file = SimpleUploadedFile(self.image_filename, infile.read())
                    _file.size = 1 # Force file size w/ ``SimpleUploadedFile``
                    attachment = Attachment.objects.create(file=_file, **self.attachment_kwargs)


    def test_to_dict(self):
        attachment = create_file_attachment()

        ret = attachment.to_dict()

        self.assertEqual(ret['id'], str(attachment.id))
        self.assertEqual(ret['filename'], attachment.filename)
        self.assertEqual(ret['file'], media_path(attachment.file))
        self.assertEqual(ret['image_thumbnail'], media_path(attachment.image_thumbnail))


    def test_to_dict(self):
        attachment = create_image_attachment()

        ret = attachment.to_dict_full()

        self.assertEqual(ret['id'], str(attachment.id))
        self.assertEqual(ret['filename'], attachment.filename)
        self.assertEqual(ret['file'], media_path(attachment.file))
        self.assertEqual(ret['image_full'], media_path(attachment.image_full))
        self.assertEqual(ret['image_medium'], media_path(attachment.image_medium))
        self.assertEqual(ret['image_thumbnail'], media_path(attachment.image_thumbnail))

    # related objects tests

    def test_related_ticket(self):
        with open(self.image, 'rb') as infile:
            _file = SimpleUploadedFile(self.image_filename, infile.read())

            attachment = Attachment.objects.create(file=_file, **self.attachment_kwargs)

            self.assertEqual(Attachment.objects.filter(object_id=self.ticket.id).count(), 1)
            self.assertIn(attachment, self.ticket.attachments.all())

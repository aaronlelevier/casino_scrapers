import os
from os.path import dirname, join
import shutil

from django.test import TestCase
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth.models import ContentType

from model_mommy import mommy
from rest_framework.exceptions import ValidationError

from category.tests.factory import create_categories
from generic.models import MainSetting, Attachment, SavedSearch
from location.models import LocationLevel
from person.tests.factory import create_single_person
from ticket.tests.factory import create_ticket
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
        self.saved_search._meta.ordering = ('-modified',)
        self.saved_search._meta.verbose_name_plural = "Saved Searches"

    def test_str(self):
        self.assertEqual(str(self.saved_search), self.saved_search.name)

    def test_validate_endpoint_name(self):
        self.assertIsNone(self.saved_search.validate_endpoint_name())
        
    def test_validate_endpoint_name_raise(self):
        self.saved_search.endpoint_name = "not a valid endpoint_name"
        with self.assertRaises(DjangoValidationError):
            self.saved_search.save()

    def test_validate_person_name_unique(self):
        with self.assertRaises(ValidationError):
            mommy.make(SavedSearch, person=self.person, name="foo",
                endpoint_name="admin.people.index")

    def test_to_dict(self):
        self.assertEqual(len(self.saved_search.to_dict()), 4)
        self.assertIsInstance(self.saved_search.to_dict(), dict)

    ### MANAGER TESTS

    def test_person_saved_searches(self):
        ret = SavedSearch.objects.person_saved_searches(self.person)
        self.assertIsInstance(ret, list)
        self.assertIsInstance(ret[0], dict)


class AttachmentModelTests(TestCase):

    def setUp(self):
        # this can be any Model here, ``Attachment`` just requires a
        # model UUID to reference b/c the attachments are assoc. w/ models.
        create_categories()
        create_single_person()
        self.ticket = create_ticket()

        # test upload file save in source control
        self.base_dir = dirname(dirname(dirname(__file__)))

        self.file = join(self.base_dir, "source/test_in/es.csv")
        self.file_filename = os.path.split(self.file)[1]

        self.image = join(self.base_dir, "source/test_in/aaron.jpeg")
        self.image_filename = os.path.split(self.image)[1]

    def tearDown(self):
        # remove test attachements after running test
        remove_attachment_test_files()

    def test_files_exist(self):
        self.assertTrue(os.path.isfile(self.image))
        self.assertTrue(os.path.isfile(self.file))

    def test_upload_file(self):
        with open(self.file, 'rb') as infile:
            _file = SimpleUploadedFile(self.file_filename, infile.read())
            attachment = Attachment.objects.create(
                ticket=self.ticket,
                file=_file
            )
            self.assertIsInstance(attachment, Attachment)
            self.assertEqual(attachment.ticket, self.ticket)
            self.assertEqual(attachment.filename, self.file_filename)
            self.assertFalse(attachment.is_image)
            self.assertTrue(attachment.file)
            self.assertFalse(attachment.image_full)
            self.assertFalse(attachment.image_medium)
            self.assertFalse(attachment.image_thumbnail)

    def test_upload_image(self):
        with open(self.image, 'rb') as infile:
            _file = SimpleUploadedFile(self.image_filename, infile.read())
            attachment = Attachment.objects.create(
                ticket=self.ticket,
                file=_file
            )
            self.assertIsInstance(attachment, Attachment)
            self.assertEqual(attachment.ticket, self.ticket)
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
                    attachment = Attachment.objects.create(
                        ticket=self.ticket,
                        file=_file
                    )

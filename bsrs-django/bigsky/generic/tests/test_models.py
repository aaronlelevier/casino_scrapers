import os
from os.path import dirname, join

from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.exceptions import ValidationError
from django.contrib.auth.models import ContentType

from model_mommy import mommy

from generic.models import MainSetting, Attachment
from location.models import LocationLevel
from person.tests.factory import create_single_person


class MainSettingTests(TestCase):
    # Only testing one ``Setting` Model b/c they are inheriting
    # from the same Base Model

    def setUp(self):
        self.person = create_single_person()

    def test_setting(self):
        ct = ContentType.objects.get(app_label='person', model='person')
        s = MainSetting.objects.create(
            content_type=ct,
            object_id=self.person.id,
            content_object=self.person
            )
        self.assertEqual(s.content_object, self.person)


class AttachmentModelTests(TestCase):

    def setUp(self):
        # this can be any Model here, ``Attachment`` just requires a 
        # model UUID to reference b/c the attachments are assoc. w/ models.
        self.model = mommy.make(LocationLevel)

        # test upload file save in source control
        base_dir = dirname(dirname(dirname(__file__)))
        self.image = join(base_dir, "source/attachments/test_in/test-mountains.jpg")
        self.file = join(base_dir, "source/attachments/test_in/es.csv")

    def test_files_exist(self):
        self.assertTrue(os.path.isfile(self.image))
        self.assertTrue(os.path.isfile(self.file))

    def test_create(self):
        _file = SimpleUploadedFile(self.image, "file_content",
            content_type="image/jpeg")
        attachment = Attachment.objects.create(
            model_id=self.model.id,
            file=_file
        )
        self.assertIsInstance(attachment, Attachment)
        self.assertEqual(
            attachment.filename,
            self.image.split('/')[-1] # test-mountains.jpg
        )

    def test_upload_size(self):
        with self.settings(MAX_UPLOAD_SIZE=0):
            with open(self.image) as f:
                with self.assertRaises(ValidationError):
                    _file = SimpleUploadedFile(self.image, "file_content",
                        content_type="image/jpeg")
                    attachment = Attachment.objects.create(
                        model_id=self.model.id,
                        file=_file
                    )

    def test_upload_image(self):
        _file = SimpleUploadedFile(self.image, "file_content",
            content_type="image/jpeg")
        attachment = Attachment.objects.create(
            model_id=self.model.id,
            file=_file
        )
        self.assertTrue(attachment.is_image)
        self.assertTrue(attachment.image_full)

    def test_upload_file(self):
        _file = SimpleUploadedFile(self.file, "file_content",
            content_type="text/csv")
        attachment = Attachment.objects.create(
            model_id=self.model.id,
            file=_file
        )
        self.assertFalse(attachment.is_image)
        self.assertFalse(attachment.image_full)

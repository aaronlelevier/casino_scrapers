import os

from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.exceptions import ValidationError

from model_mommy import mommy

from generic.models import Attachment
from location.models import LocationLevel


class AttachmentModelTests(TestCase):

    def setUp(self):
        # this can be any Model here, ``Attachment`` just requires a 
        # model UUID to reference b/c the attachments are assoc. w/ models.
        self.model = mommy.make(LocationLevel)

        # test upload file save in source control
        self.image = "/Users/alelevier/Documents/bsrs/bsrs-django/\
bigsky/source/attachments/test_in/test-mountains.jpg"
        self.file = "/Users/alelevier/Documents/bsrs/bsrs-django/\
bigsky/source/attachments/test_in/es.csv"

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
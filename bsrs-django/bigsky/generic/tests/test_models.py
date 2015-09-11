import os

from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.exceptions import ValidationError

from model_mommy import mommy

from generic.models import Attachment
from util.models import Tester


class AttachmentModelTests(TestCase):

    def setUp(self):
        self.model = mommy.make(Tester)
        self.filename = "/Users/alelevier/Documents/bsrs/bsrs-django/\
bigsky/source/attachments/test_in/test-mountains.jpg"

    def test_create(self):
        _file = SimpleUploadedFile(self.filename, "file_content",
            content_type="image/jpeg")

        attachment = Attachment.objects.create(
            model_id=self.model.id,
            file=_file
        )
        self.assertIsInstance(attachment, Attachment)

    def test_upload_size(self):
        with self.settings(MAX_UPLOAD_SIZE=0):
            with open(self.filename) as f:
                with self.assertRaises(ValidationError):
                    _file = SimpleUploadedFile(self.filename, "file_content",
                        content_type="image/jpeg")

                    attachment = Attachment.objects.create(
                        model_id=self.model.id,
                        file=_file
                    )
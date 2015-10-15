from django.test import TestCase
from django.core.exceptions import ValidationError as DjangoValidationError
from django.contrib.auth.models import ContentType

from model_mommy import mommy
from rest_framework.exceptions import ValidationError

from generic.models import MainSetting, Attachment, SavedSearch
from person.tests.factory import create_single_person


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


# class AttachmentModelTests(TestCase):

#     def setUp(self):
#         # this can be any Model here, ``Attachment`` just requires a 
#         # model UUID to reference b/c the attachments are assoc. w/ models.
#         self.model = mommy.make(LocationLevel)

#         # test upload file save in source control
#         base_dir = dirname(dirname(dirname(__file__)))
#         self.image = join(base_dir, "source/attachments/test_in/test-mountains.jpg")
#         self.file = join(base_dir, "source/attachments/test_in/es.csv")

#     def test_files_exist(self):
#         self.assertTrue(os.path.isfile(self.image))
#         self.assertTrue(os.path.isfile(self.file))

#     def test_create(self):
#         _file = SimpleUploadedFile(self.image, "file_content",
#             content_type="image/jpeg")
#         attachment = Attachment.objects.create(
#             model_id=self.model.id,
#             file=_file
#         )
#         self.assertIsInstance(attachment, Attachment)
#         self.assertEqual(
#             attachment.filename,
#             self.image.split('/')[-1] # test-mountains.jpg
#         )

#     def test_upload_size(self):
#         with self.settings(MAX_UPLOAD_SIZE=0):
#             with open(self.image) as f:
#                 with self.assertRaises(DjangoValidationError):
#                     _file = SimpleUploadedFile(self.image, "file_content",
#                         content_type="image/jpeg")
#                     attachment = Attachment.objects.create(
#                         model_id=self.model.id,
#                         file=_file
#                     )

#     def test_upload_image(self):
#         _file = SimpleUploadedFile(self.image, "file_content",
#             content_type="image/jpeg")
#         attachment = Attachment.objects.create(
#             model_id=self.model.id,
#             file=_file
#         )
#         self.assertTrue(attachment.is_image)
#         self.assertTrue(attachment.image_full)

#     def test_upload_file(self):
#         _file = SimpleUploadedFile(self.file, "file_content",
#             content_type="text/csv")
#         attachment = Attachment.objects.create(
#             model_id=self.model.id,
#             file=_file
#         )
#         self.assertFalse(attachment.is_image)
#         self.assertFalse(attachment.image_full)

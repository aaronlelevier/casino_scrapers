import os
import json
import uuid
from io import BytesIO
from mock import patch
from os.path import dirname, join

from django.contrib.auth.models import ContentType
from django.conf import settings
from django.db import models
from django.http.request import QueryDict
from django.utils.timezone import localtime, now

from model_mommy import mommy
from pretend import stub
from rest_framework.exceptions import ValidationError
from rest_framework.test import APITestCase

from generic.models import SavedSearch, Attachment
from generic.serializers import SavedSearchSerializer
from generic.views import ExportData
from person.tests.factory import PASSWORD, create_single_person, create_person
from ticket.models import Ticket
from ticket.tests.factory import create_ticket
from translation.tests.factory import create_translation_keys_for_fixtures
from utils.helpers import local_strftime
from utils.tests.helpers import remove_attachment_test_files


class SavedSearchTests(APITestCase):

    def setUp(self):
        # Role
        self.person = create_single_person()
        self.client.login(username=self.person.username, password=PASSWORD)
        self.saved_search = mommy.make(SavedSearch, person=self.person,
            endpoint_name='admin.people.index')

    def tearDown(self):
        self.client.logout()

    def test_create(self):
        data = {
            "id": str(uuid.uuid4()),
            "name": "my new search",
            "endpoint_name": self.saved_search.endpoint_name,
            "endpoint_uri": "/api/admin/phone-numbers/"
        }
        response = self.client.post('/api/admin/saved-searches/', data, format='json')
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.content.decode('utf8'))
        self.assertIsInstance(SavedSearch.objects.get(id=data['id']), SavedSearch)

    def test_list(self):
        response = self.client.get('/api/admin/saved-searches/')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['endpoint_name'], self.saved_search.endpoint_name)
        self.assertTrue(data['results'][0]['created'])

    def test_detail(self):
        response = self.client.get('/api/admin/saved-searches/{}/'.format(self.saved_search.id))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.saved_search.id))

    def test_update(self):
        # Setup
        serializer = SavedSearchSerializer(self.saved_search)
        data = serializer.data
        data['endpoint_uri'] = "/api/admin/emails/?ordering=-email"
        # test
        response = self.client.put('/api/admin/saved-searches/{}/'.format(self.saved_search.id),
            data=data, format='json')
        self.assertEqual(response.status_code, 200)
        new_data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['endpoint_uri'], new_data['endpoint_uri'])

    def test_data(self):
        response = self.client.get('/api/admin/saved-searches/{}/'.format(self.saved_search.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.saved_search.id))
        self.assertEqual(data['name'], self.saved_search.name)
        self.assertEqual(data['endpoint_name'], self.saved_search.endpoint_name)
        self.assertEqual(data['endpoint_uri'], self.saved_search.endpoint_uri)

    ### util.UniqueForActiveValidator - two key tests

    def test_unique_for_active_two_keys(self):
        serializer = SavedSearchSerializer(self.saved_search)
        data = serializer.data
        data['id'] = str(uuid.uuid4())
        response = self.client.post('/api/admin/saved-searches/', data=data, format='json')
        self.assertEqual(response.status_code, 400)

    def test_unique_for_active_two_keys_deleted(self):
        # Ignore deleted models when checking for uniqueness
        self.saved_search.delete()
        serializer = SavedSearchSerializer(self.saved_search)
        data = serializer.data
        data['id'] = str(uuid.uuid4())
        response = self.client.post('/api/admin/saved-searches/', data=data, format='json')
        self.assertEqual(response.status_code, 201)


class AttachmentTests(APITestCase):

    def setUp(self):
        self.person = create_single_person()

        self.base_dir = dirname(dirname(dirname(__file__)))
        # file
        self.file = join(settings.MEDIA_ROOT, "test_in/es.csv")
        self.file_filename = os.path.split(self.file)[1]
        # file2
        self.file2 = join(settings.MEDIA_ROOT, "test_in/jp.csv")
        self.file2_filename = os.path.split(self.file2)[1]

        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

        # remove test attachements after running test
        remove_attachment_test_files()

    def test_create_file(self):
        id = str(uuid.uuid4())
        with open(self.file) as data:
            post_data = {
                'id': id,
                'filename': self.file_filename,
                'file': data
            }

            response = self.client.post("/api/admin/attachments/", post_data)

            self.assertEqual(response.status_code, 201)
            data = json.loads(response.content.decode('utf8'))
            self.assertEqual(data['id'], id)
            self.assertEqual(data['filename'], self.file_filename)
            # verify file save location
            attachment = Attachment.objects.get(id=id)
            self.assertIn(
                "/".join([settings.FILES_SUB_PATH, self.file_filename.split(".")[0]]),
                str(attachment.file)
            )

    def test_create_image(self):
        id = str(uuid.uuid4())

        # This is a 1x1 black png
        simple_png = BytesIO(b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\rIDATx\x9cc````\x00\x00\x00\x05\x00\x01\xa5\xf6E@\x00\x00\x00\x00IEND\xaeB`\x82')
        simple_png.name = 'test.png'

        post_data = {
            'id': id,
            'filename': simple_png.name,
            'file': simple_png
        }

        response = self.client.post("/api/admin/attachments/", post_data)

        self.assertEqual(response.status_code, 201)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], id)
        self.assertEqual(data['filename'], simple_png.name)
        # verify file save location
        attachment = Attachment.objects.get(id=id)
        self.assertEqual(
            "/".join([settings.IMAGE_FULL_SUB_PATH, simple_png.name]),
            str(attachment.file)
        )
        self.assertEqual(
            "/".join([settings.IMAGE_FULL_SUB_PATH, simple_png.name]),
            str(attachment.image_full)
        )

    def test_delete_file(self):
        # intial create
        id = str(uuid.uuid4())
        with open(self.file) as data:
            post_data = {
                'id': id,
                'filename': self.file_filename,
                'file': data
            }

            response = self.client.post("/api/admin/attachments/", post_data)

            file_object = Attachment.objects.get(id=id)
            self.assertEqual(response.status_code, 201)
            self.assertTrue(os.path.isfile(
                os.path.join(settings.MEDIA_ROOT, str(file_object.file))))

            # delete - record and file from 'file system'
            response = self.client.delete(
                "/api/admin/attachments/{}/".format(id),
                {'override': True}
            )
            self.assertEqual(response.status_code, 204)
            self.assertFalse(os.path.isfile(
                os.path.join(settings.MEDIA_ROOT, str(file_object.file))))

    def test_batch_delete(self):
        # create files
        id = str(uuid.uuid4())
        with open(self.file) as data:
            post_data = {
                'id': id,
                'filename': self.file_filename,
                'file': data
            }
            response = self.client.post("/api/admin/attachments/", post_data)
            self.assertEqual(response.status_code, 201)

        id2 = str(uuid.uuid4())
        with open(self.file2) as data:
            post_data = {
                'id': id2,
                'filename': self.file2_filename,
                'file': data
            }
            response = self.client.post("/api/admin/attachments/", post_data)
            self.assertEqual(response.status_code, 201)

        attachments = Attachment.objects.all()

        # batch delete
        response = self.client.delete("/api/admin/attachments/batch-delete/",
            {'ids': [id, id2]}, format='json')

        self.assertEqual(response.status_code, 204)
        self.assertFalse(Attachment.objects_all.filter(
            id__in=[id, id2]).exists())
        for a in attachments:
            self.assertFalse(os.path.isfile(
                os.path.join(settings.MEDIA_ROOT, str(a.file))))


class ExportDataTests(APITestCase):

    def setUp(self):
        # Role
        self.person = create_single_person(name='aaa')
        create_person(_many=10)
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_post(self):
        response = self.client.post("/api/export-data/person/")
        self.assertEqual(response.status_code, 405)

    def test_filename(self):
        iso_format_date = localtime(now()).date().isoformat().replace('-', '')
        model_name = "person"
        raw_ret = "{}_{}.csv".format(model_name, iso_format_date)

        ret = ExportData()._filename_with_datestamp(model_name)

        self.assertEqual(ret, raw_ret)

    @patch("generic.views.ExportData._write_file")
    def test_export(self, mock_func):
        model_name = "person"
        content_type = ContentType.objects.get(model=model_name)
        model = content_type.model_class()
        # file info
        export_data = ExportData()
        raw_content = "{}{}{}".format(settings.MEDIA_URL,
                                      export_data.downloads_sub_path,
                                      export_data._filename_with_datestamp(model_name))

        response = self.client.get("/api/export-data/{}/".format(model_name))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.content.decode('utf-8'),
            raw_content
        )
        # mocked file create
        self.assertEqual(len(mock_func.call_args[0]), 2)
        # filepath
        self.assertEqual(
            mock_func.call_args[0][0],
            os.path.join(settings.MEDIA_ROOT,
                         "{}{}".format(export_data.downloads_sub_path,
                                       export_data._filename_with_datestamp(model_name)))
        )
        # query_params
        self.assertEqual(mock_func.call_args[0][1], {})

    @patch("generic.views.ExportData._write_file")
    def test_export__filtered(self, mock_func):
        model_name = "person"
        content_type = ContentType.objects.get(model=model_name)
        model = content_type.model_class()
        export_data = ExportData()
        raw_content = "{}{}{}".format(settings.MEDIA_URL,
                                      export_data.downloads_sub_path,
                                      export_data._filename_with_datestamp(model_name))

        response = self.client.get("/api/export-data/{}/?username={}"
                                   .format(model_name, self.person.username))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.content.decode('utf8'),
            raw_content
        )
        # mocked file create
        self.assertEqual(len(mock_func.call_args[0]), 2)
        # filepath
        self.assertEqual(
            mock_func.call_args[0][0],
            os.path.join(settings.MEDIA_ROOT,
                         "{}{}".format(export_data.downloads_sub_path,
                                       export_data._filename_with_datestamp(model_name)))
        )
        # query_params
        self.assertIsInstance(mock_func.call_args[0][1], QueryDict)
        self.assertEqual(len(mock_func.call_args[0][1]), 1)
        self.assertEqual(mock_func.call_args[0][1]['username'], self.person.username)

    @patch("generic.views.ExportData._filter_with_fields")
    def test_filtered__query_params(self, mock_func):
        response = self.client.get("/api/export-data/person/?username={}&first_name__icontains={}"
                                   .format(self.person.username, 'a'))

        self.assertIsInstance(mock_func.call_args[0][0], QueryDict)
        self.assertEqual(len(mock_func.call_args[0][0]), 2)
        self.assertEqual(mock_func.call_args[0][0]['username'], self.person.username)
        self.assertEqual(mock_func.call_args[0][0]['first_name__icontains'], 'a')

    def test_invalid_model(self):
        model_name = "foo"

        response = self.client.get("/api/export-data/{}/".format(model_name))

        self.assertEqual(response.status_code, 400)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data), 1)
        self.assertEqual(
            data[0],
            "Model with model name: {} DoesNotExist".format(model_name)
        )

    def test_set_model(self):
        model_names = ['assignment', 'category', 'dtd', 'location',
                       'location-level', 'person', 'role', 'ticket']

        for name in model_names:
            try:
                ed = ExportData()
                ed._set_model(name)
                self.assertTrue(issubclass(ed.model, models.Model))
            except ValidationError:
                self.fail("%s is not the string name of a model class" % name)

    def test_set_model__raises_validation_error_for_invalid_model_name(self):
        with self.assertRaises(ValidationError):
            ExportData()._set_model('foo')

    def test_search__order__filter(self):
        model_name = "ticket"

        response = self.client.get("/api/export-data/{}/?ordering=number&search=a&status__name__icontains=b".format(model_name))

        self.assertEqual(response.status_code, 200)

    def test_get_values_to_write(self):
        translation = create_translation_keys_for_fixtures()
        self.person.locale = translation.locale
        self.person.save()
        self.assertEqual(self.person.translation_values, translation.values)
        # export
        export_data = ExportData()
        export_data.model = Ticket
        export_data.request = stub(user=self.person, GET={'timezone': 'America/Los_Angeles'})
        t = create_ticket()
        t = Ticket.objects.filter_export_data({'id': t.id}).first()

        ret = export_data._get_values_to_write(self.person.translation_values, t)

        self.assertEqual(
            ret,
            [t.priority.get_i18n_value('name'), t.status.get_i18n_value('name'),
             t.number, local_strftime(t.created, 'America/Los_Angeles'), t.location.name,
             t.assignee.fullname, t.category, t.request]
        )

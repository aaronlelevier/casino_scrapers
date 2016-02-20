import os
from os.path import dirname, join
import json
import uuid
from io import BytesIO

from django.conf import settings
from django.core.urlresolvers import reverse
from django.apps import apps

from model_mommy import mommy
from rest_framework.test import APITestCase

from generic.models import SavedSearch, Attachment
from generic.serializers import SavedSearchSerializer, SettingSerializer
from generic.settings import DEFAULT_GENERAL_SETTINGS
from generic.tests.factory import create_general_setting
from person.tests.factory import PASSWORD, create_single_person, create_person
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


class ExportDataTests(APITestCase):

    def setUp(self):
        # Role
        self.person = create_single_person()
        create_person(_many=10)
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_get(self):
        response = self.client.get(reverse("export_data"))
        self.assertEqual(response.status_code, 403)

    def test_post_bad_data(self):
        data = {
            'app_name': 'person',
            'model_name': 'person'
        }
        response = self.client.post(reverse("export_data"), data, format='json')
        self.assertEqual(response.status_code, 400)

    def test_post_good(self):
        data = {
            'app_name': 'person',
            'model_name': 'person',
            'fields': ['id', 'username'],
            'query_params': {'username__icontains': 'aaron'}
        }
        model = apps.get_model(data['app_name'], data['model_name'])
        response = self.client.post(reverse("export_data"), data, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEquals(
            response.get('Content-Disposition'),
            'attachment; filename="{name}.csv"'.format(
                name=model._meta.verbose_name_plural)
        )


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


class SettingTests(APITestCase):

    def setUp(self):
        self.person = create_single_person()
        self.client.login(username=self.person.username, password=PASSWORD)
        self.maxDiff = None

    def tearDown(self):
        self.client.logout()

    def test_list(self):
        general_setting = create_general_setting()

        response = self.client.get('/api/admin/settings/')
        data = json.loads(response.content.decode('utf8'))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['id'], str(general_setting.id))
        self.assertEqual(data['results'][0]['name'], general_setting.name)
        self.assertNotIn('settings', data['results'][0])

    def test_detail(self):
        general_setting = create_general_setting()

        response = self.client.get('/api/admin/settings/{}/'.format(general_setting.id))
        data = json.loads(response.content.decode('utf8'))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['id'], str(general_setting.id))
        self.assertEqual(data['name'], general_setting.name)
        # settings
        for key in DEFAULT_GENERAL_SETTINGS.keys():
            for field in ['value', 'inherited_from']:
                self.assertEqual(data['settings'][key][field], DEFAULT_GENERAL_SETTINGS[key][field])

    def test_create__does_not_have_settings(self):
        raw_data = {
            'id': str(uuid.uuid4()),
            'name': 'general'
        }

        response = self.client.post('/api/admin/settings/', raw_data, format='json')
        data = json.loads(response.content.decode('utf8'))

        self.assertEqual(response.status_code, 201)
        self.assertEqual(raw_data['id'], data['id'])
        self.assertEqual(raw_data['name'], data['name'])
        self.assertNotIn('settings', data)

    def test_update(self):
        new_welcome_text = "Bueno"
        general_setting = create_general_setting()
        serializer = SettingSerializer(general_setting)
        raw_data = serializer.data
        raw_data['settings'] = {'welcome_text': new_welcome_text}

        response = self.client.put('/api/admin/settings/{}/'.format(general_setting.id), raw_data, format='json')
        data = json.loads(response.content.decode('utf8'))

        self.assertEqual(response.status_code, 200)
        # welcome_text
        self.assertEqual(data['settings']['welcome_text']['value'], new_welcome_text)
        self.assertEqual(data['settings']['welcome_text']['inherited_from'], 'general')

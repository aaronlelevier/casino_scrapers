import json

from rest_framework.test import APITestCase

from person.tests.factory import create_person, PASSWORD
from translation.models import Locale, Translation
from translation.serializers import LocaleSerializer, TranslationSerializer
from translation.tests.factory import create_locales, create_translations


class LocaleTests(APITestCase):

    def setUp(self):
        create_locales()
        self.locale = Locale.objects.first()
        self.person = create_person()
        self.data = LocaleSerializer(self.locale).data
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_list(self):
        response = self.client.get('/api/admin/locales/')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], Locale.objects.count())

    def test_get(self):
        response = self.client.get('/api/admin/locales/{}/'.format(self.locale.id))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.locale.id))

    def test_update(self):
        # setup
        init_name = self.data['name']
        new_name = 'English New'
        self.assertNotEqual(init_name, new_name)
        self.data['name'] = new_name
        # test
        response = self.client.put('/api/admin/locales/{}/'.format(self.locale.id),
            self.data, format='json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['name'], new_name)


class TranslationTests(APITestCase):

    def setUp(self):
        create_translations()
        self.translation = Translation.objects.first()
        self.person = create_person()
        self.data = TranslationSerializer(self.translation).data
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    ### List

    def test_list_multiple_translations(self):
        response = self.client.get('/api/translations/')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertIsInstance(data, list)
        self.assertTrue(data)

    def test_list_no_en_translation(self):
        Translation.objects.get(locale__locale='en').delete(override=True)
        response = self.client.get('/api/translations/')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertIsInstance(data, list)
        self.assertFalse(data)

    def test_list_keys(self):
        response = self.client.get('/api/translations/')
        data = json.loads(response.content.decode('utf8'))
        self.assertIn(
            data[0],
            Translation.objects.get(locale__locale='en').values
        )

    ### "/api/admin/translations/{translation-key}/" list_route

    def test_detail_with_key_get(self):
        key = list(self.translation.values.keys())[0]
        response = self.client.get('/api/translations/{}/'.format(key))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertIn(str(self.translation.id), [d['id'] for d in data])
        self.assertIn(
            str(self.translation.locale.id),
            [d['translations']['locale'] for d in data]
        )
        self.assertTrue([d['translations']['text'] for d in data])

    ### "/api/admin/translations/boostrap/{locale}/" list_route

    def test_filter(self):
        # Assumes there is a single Locale fixture with the name "en"
        response = self.client.get('/api/translations/bootstrap/en/')
        data = json.loads(response.content.decode('utf8'))
        self.assertTrue(any('en' in d for d in data))
        self.assertEqual(len(data), 1)

    def test_filter_multiple_returns(self):
        # Assumes there is an "en" and "en-us" translation. It should 
        # return both.
        response = self.client.get('/api/translations/bootstrap/en-us/')
        data = json.loads(response.content.decode('utf8'))
        self.assertTrue(any('en' in d for d in data))
        self.assertTrue(any('en-us' in d for d in data))
        self.assertEqual(len(data), 2)

    def test_filter_not_found(self):
        response = self.client.get('/api/translations/bootstrap/123/')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertFalse(data)

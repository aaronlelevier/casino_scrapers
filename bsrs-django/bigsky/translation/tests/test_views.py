import json

from django.conf import settings

from rest_framework.test import APITestCase

from person.tests.factory import create_person, PASSWORD
from translation.models import Locale, Translation
from translation.serializers import LocaleSerializer, TranslationSerializer
from translation.tests.factory import create_locales, create_translations
from utils import create
from utils.tests.helpers import build_dict


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


class TranslationBootstrapTests(APITestCase):

    def setUp(self):
        create_translations()
        self.translation = Translation.objects.first()
        self.person = create_person()
        self.data = TranslationSerializer(self.translation).data
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_list_multiple_translations(self):
        response = self.client.get('/api/translations/')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertIsInstance(data, dict)

    def test_filter(self):
        # Assumes there is a single Locale fixture with the name "en"
        locale = 'en'
        response = self.client.get('/api/translations/?locale={}'.format(locale))
        data = json.loads(response.content.decode('utf8'))
        self.assertIn(locale, data)
        self.assertEqual(len(data), 1)
        for d in data:
            self.assertTrue(d.startswith(locale))

    def test_filter_multiple_returns(self):
        # Assumes there is an "en" and "en-us" translation. It should 
        # return both.
        response = self.client.get('/api/translations/?locale=en-us')
        data = json.loads(response.content.decode('utf8'))
        self.assertIn('en', data)
        self.assertIn('en-us', data)
        self.assertEqual(len(data), 2)

    def test_filter_not_found(self):
        response = self.client.get('/api/translations/?locale=123')
        self.assertEqual(response.status_code, 404)

    def test_timezone(self):
        locale = 'en'
        timezone = 'UTC'
        self.assertIsNone(self.client.session.get('timezone'))
        response = self.client.get('/api/translations/?locale={}&timezone={}'.format(locale, timezone))
        self.assertEqual(self.client.session.get('timezone'), timezone)

    def test_timezone__not_sent_so_session_unaffected(self):
        locale = 'en'
        self.assertIsNone(self.client.session.get('timezone'))
        response = self.client.get('/api/translations/?locale={}'.format(locale))
        self.assertIsNone(self.client.session.get('timezone'))


class TranslationReadTests(APITestCase):

    # List, Detail, and Bootstrap

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

    def test_list_keys__for_gridview(self):
        response = self.client.get('/api/admin/translations/')

        data = json.loads(response.content.decode('utf8'))
        self.assertIn('count', data)
        self.assertIn('next', data)
        self.assertIn('previous', data)
        self.assertIsInstance(data['results'], list)

    def test_list_size(self):
        response = self.client.get('/api/admin/translations/')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data['results']), 10)

    def test_list_order(self):
        response = self.client.get('/api/admin/translations/')

        data = json.loads(response.content.decode('utf8'))
        sorted_trans = Translation.objects.all_distinct_keys()
        for i, x in enumerate(data['results']):
            self.assertEqual(x, sorted_trans[i])

    def test_list_pagination(self):
        """
        Page two should still be indexing the sorted list of 
        Translation keys correctly.
        """
        response = self.client.get('/api/admin/translations/?page=2')

        data = json.loads(response.content.decode('utf8'))
        sorted_trans = Translation.objects.all_distinct_keys()

        self.assertEqual(
            data['results'][0],
            sorted_trans[settings.PAGE_SIZE]
        )

    def test_list_search(self):
        keyword = 'a'

        response = self.client.get('/api/admin/translations/?search={}'.format(keyword))

        data = json.loads(response.content.decode('utf8'))
        raw_ret = Translation.objects.search_multi(keyword)
        self.assertEqual(data['count'], len(raw_ret))

    # get_translations_by_key

    def test_get_translations_by_key(self):
        key = list(self.translation.values.keys())[0]

        response = self.client.get('/api/admin/translations/{}/'.format(key))

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], key)
        self.assertEqual(data['key'], key)
        self.assertIn('locales', data)
        self.assertIsInstance(data['locales'], list)
        self.assertTrue(len(data['locales']) > 0)
        # Locales of the Translation
        db_locale = Translation.objects.filter(values__has_key=key)[0].locale
        d = build_dict(data['locales'], key="locale")
        self.assertEqual(d[str(db_locale.id)]['locale'], str(db_locale.id))
        self.assertEqual(
            d[str(db_locale.id)]['translation'],
            db_locale.translation.values.get(key, "")
        )

    def test_get_translations_by_key__empty_values_are_blank(self):
        new_locale = Locale.objects.create(locale='jp', name='jp')
        new_translation = Translation.objects.create(
            locale=new_locale, values={}, context={})
        key = list(self.translation.values.keys())[0]

        response = self.client.get('/api/admin/translations/{}/'.format(key))

        data = json.loads(response.content.decode('utf8'))

        d = build_dict(data['locales'], key="locale")
        self.assertEqual(d[str(new_locale.id)]['locale'], str(new_locale.id))
        self.assertEqual(d[str(new_locale.id)]['translation'], "")


class TranslationWriteTests(APITestCase):

    # Create, Update, Delete

    def setUp(self):
        create_translations()

        self.translation = Translation.objects.first()
        self.translation_two = Translation.objects.last()

        self.locale = self.translation.locale
        self.locale_two = self.translation_two.locale

        self.person = create_person()

        self.key = list(self.translation.values.keys())[0]
        # Create Data 1
        self.value = create._generate_chars()
        self.data = {
            'id': self.key,
            'key': self.key,
            'locales': [{
                'locale': str(self.locale.id),
                'translation': self.value
            }]
        }
        # Create Data 2
        self.value_two = create._generate_chars()
        self.data_two = {
            'id': self.key,
            'key': self.key,
            'locales': [{
                'locale': str(self.locale.id),
                'translation': self.value
            },{
                'locale': str(self.locale_two.id),
                'translation': self.value_two
            }]
        }

        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_create_new_key_value(self):
        self.key = create._generate_chars()
        self.data.update({
            'id': self.key,
            'key': self.key
        })

        response = self.client.post('/api/admin/translations/{}/'.format(self.key),
            self.data, format='json')

        self.assertEqual(response.status_code, 200)
        trans = Translation.objects.get(locale=self.locale,
            values__has_key=self.key)
        self.assertEqual(
            trans.values.get(self.key, None),
            self.value
        )

    def test_update_key_value(self):
        init_value = self.locale.translation.values.get(self.key, "")

        response = self.client.post('/api/admin/translations/{}/'.format(self.key),
            self.data, format='json')

        self.assertEqual(response.status_code, 200)
        trans = Translation.objects.get(locale=self.locale,
            values__has_key=self.key)
        self.assertNotEqual(self.value, init_value)
        self.assertEqual(
            trans.values.get(self.key, None),
            self.value
        )

    def test_update_key_value__for_missing_translation(self):
        """
        A missing 'translation' will remove the key from 
        ``translation.values``.
        """
        self.data['locales'][0]['translation'] = ""

        response = self.client.post('/api/admin/translations/{}/'.format(self.key),
            self.data, format='json')

        self.assertEqual(response.status_code, 200)
        with self.assertRaises(Translation.DoesNotExist):
            Translation.objects.get(locale=self.locale,
                values__has_key=self.key)

    def test_response_data(self):
        response = self.client.post('/api/admin/translations/{}/'.format(self.key),
            self.data, format='json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], self.data['id'])
        self.assertEqual(data['key'], self.data['key'])
        self.assertEqual(data['locales'][0]['locale'],
            self.data['locales'][0]['locale'])
        self.assertEqual(data['locales'][0]['translation'],
            self.data['locales'][0]['translation'])

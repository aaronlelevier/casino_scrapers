import json
import uuid

from rest_framework.test import APITestCase

from person.tests.factory import create_person, PASSWORD
from translation.models import Locale, Translation
from translation.serializers import LocaleSerializer, TranslationSerializer
from translation.tests.factory import (create_locales, create_locale,
    create_translations)
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

    def test_list_multiple_translations(self):
        response = self.client.get('/api/admin/translations/')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertIsInstance(data, list)
        self.assertTrue(data)

    def test_list_no_en_translation(self):
        Translation.objects.get(locale__locale='en').delete(override=True)
        response = self.client.get('/api/admin/translations/')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertIsInstance(data, list)
        self.assertFalse(data)

    def test_list_keys(self):
        response = self.client.get('/api/admin/translations/')
        data = json.loads(response.content.decode('utf8'))
        self.assertIn(
            data[0],
            Translation.objects.get(locale__locale='en').values
        )

    # get_translations_by_key

    def test_get_translations_by_key(self):
        key = list(self.translation.values.keys())[0] # key="admin.address.add" for example

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

        self.locale = self.translation.locale # create_locale(create._generate_chars())
        self.locale_two = self.translation_two.locale # create_locale(create._generate_chars())

        self.person = create_person()

        self.key = list(self.translation.values.keys())[0] # key="admin.address.add" for example
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
                'locale': str(self.locale_two.id),
                'translation': self.value_two
            }]
        }

        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    ### Create

    def test_create__for_existing_translation(self):
        new_locale = Locale.objects.create(locale='jp', name='jp')
        new_translation = Translation.objects.create(
            locale=new_locale, values={}, context={})

        # init_count = Translation.objects.count()
        # self.assertFalse(Translation.objects.filter(values__has_key=self.key).exists())
        response = self.client.post('/api/admin/translations/{}/'.format(self.key), self.data, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(Translation.objects.filter(values__has_key=self.key).exists())
        # count check
        post_count = Translation.objects.count()
        self.assertEqual(init_count+1, post_count)

    # def test_create_double(self):
    #     init_count = Translation.objects.count()
    #     self.assertFalse(Translation.objects.filter(values__has_key=self.key).exists())
    #     response = self.client.post('/api/admin/translations/{}/'.format(self.key),
    #         [self.data, self.data_two], format='json')
    #     self.assertEqual(response.status_code, 201)
    #     self.assertTrue(Translation.objects.filter(values__has_key=self.key).exists())
    #     # count check
    #     post_count = Translation.objects.count()
    #     self.assertEqual(init_count+2, post_count)

    # def test_create_validate_locale(self):
    #     self.data['translations']['locale'] = str(uuid.uuid4())
    #     response = self.client.post('/api/admin/translations/{}/'.format(self.key), [self.data], format='json')
    #     self.assertEqual(response.status_code, 400)

    # def test_create_no_text(self):
    #     self.data['translations'].pop('text','')
    #     response = self.client.post('/api/admin/translations/{}/'.format(self.key), [self.data], format='json')
    #     self.assertEqual(response.status_code, 400)

    # def test_create_context_not_required(self):
    #     self.data['translations'].pop('helper','')
    #     response = self.client.post('/api/admin/translations/{}/'.format(self.key), [self.data], format='json')
    #     self.assertEqual(response.status_code, 201)

    # ### Update

    # def test_update_single(self):
    #     key = next(iter(self.translation.values))
    #     # update
    #     init_value = self.translation.values[key]
    #     self.data['id'] = str(self.translation.id)
    #     self.data['translations']['locale'] = str(self.locale.id)
    #     # POST
    #     response = self.client.post('/api/admin/translations/{}/'.format(key), [self.data], format='json')
    #     self.assertEqual(response.status_code, 200)
    #     # check
    #     post_trans = Translation.objects.get(id=self.translation.id)
    #     post_value = post_trans.values[key]
    #     self.assertNotEqual(init_value, post_value)

    # def test_update_multiple(self):
    #     key = next(iter(self.translation.values))
    #     # 1st update
    #     init_value = self.translation.values[key]        
    #     self.data['id'] = str(self.translation.id)
    #     self.data['translations']['locale'] = str(self.locale.id)
    #     # 2nd update
    #     self.translation_two.values.update({key: create._generate_chars()})
    #     self.translation_two.save()
    #     init_value_two = self.translation_two.values[key]
    #     self.data_two['id'] = str(self.translation_two.id)
    #     self.data_two['translations']['locale'] = str(self.locale_two.id)
    #     # POST
    #     response = self.client.post('/api/admin/translations/{}/'.format(key),
    #         [self.data, self.data_two], format='json')
    #     self.assertEqual(response.status_code, 200)
    #     # 1st check
    #     post_trans = Translation.objects.get(id=self.translation.id)
    #     post_value = post_trans.values[key]
    #     self.assertNotEqual(init_value, post_value)
    #     # 2nd check
    #     post_trans_two = Translation.objects.get(id=self.translation_two.id)
    #     post_value_two = post_trans_two.values[key]
    #     self.assertNotEqual(init_value_two, post_value_two)

    # ### Delete

    # def test_delete_single(self):
    #     key = next(iter(self.translation.values))
    #     # update
    #     self.data['id'] = str(self.translation.id)
    #     self.data['translations']['locale'] = str(self.locale.id)
    #     self.data['translations']['text'] = ''
    #     # POST
    #     response = self.client.post('/api/admin/translations/{}/'.format(key), [self.data], format='json')
    #     self.assertEqual(response.status_code, 200)
    #     # check
    #     trans = Translation.objects.get(id=self.translation.id)
    #     with self.assertRaises(KeyError):
    #         trans.values[key]


    ### possible leaky state b/c not giving reliable test results. 
    ### comment out for the time being.

    # def test_delete_multiple(self):
    #     key = next(iter(self.translation.values))
    #     # 1st update
    #     self.data['id'] = str(self.translation.id)
    #     self.data['translations']['locale'] = str(self.locale.id)
    #     self.data['translations']['text'] = ''
    #     # 2nd update
    #     self.data_two['id'] = str(self.translation_two.id)
    #     self.data_two['translations']['locale'] = str(self.locale_two.id)
    #     self.data_two['translations']['text'] = ''
    #     # POST
    #     response = self.client.post('/api/admin/translations/{}/'.format(key),
    #         [self.data, self.data_two], format='json')
    #     self.assertEqual(response.status_code, 200)
    #     # 1st check
    #     trans = Translation.objects.get(id=self.translation.id)
    #     with self.assertRaises(KeyError):
    #         trans.values[key]
    #     # 2nd check
    #     trans = Translation.objects.get(id=self.translation_two.id)
    #     with self.assertRaises(KeyError):
    #         trans.values[key]

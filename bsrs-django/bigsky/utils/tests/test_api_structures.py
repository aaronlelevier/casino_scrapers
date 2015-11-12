import os
import importlib
import inspect

from django.test import TestCase
from django.conf import settings
from django.utils.text import capfirst

from rest_framework.serializers import ModelSerializer
from rest_framework.viewsets import ModelViewSet

from accounting.serializers import CurrencySerializer
from category.serializers import CategoryListSerializer
from person.views import PersonViewSet
from utils.api_structures import (ViewSetFileWriter, SerializerData,
    AppsAndViewSets, ViewSetHandler)


class SerializerDataTests(TestCase):

    def test_top_level(self):
        serializer_data = SerializerData(CurrencySerializer)
        data = serializer_data.data
        # normal serializer
        serializer = CurrencySerializer()

        self.assertEqual(data['id'], serializer.get_fields()['id'].__class__.__name__)
        self.assertEqual(data['name'], serializer.get_fields()['name'].__class__.__name__)
        self.assertEqual(data['name_plural'], serializer.get_fields()['name_plural'].__class__.__name__)

    def test_foreign_key(self):
        serializer_data = SerializerData(CategoryListSerializer)
        data = serializer_data.data
        # normal serializer
        serializer = CategoryListSerializer()

        self.assertEqual(
            data['parent']['id'],
            serializer.get_fields()['parent'].get_fields()['id'].__class__.__name__
        )
        self.assertEqual(
            data['parent']['name'],
            serializer.get_fields()['parent'].get_fields()['name'].__class__.__name__
        )

    def test_many_to_many_data(self):
        serializer_data = SerializerData(CategoryListSerializer)
        data = serializer_data.data
        # normal serializer
        serializer = CategoryListSerializer()

        self.assertEqual(
            data['children']['id'],
            serializer.get_fields()['children']._kwargs['child'].get_fields()['id'].__class__.__name__
        )
        self.assertEqual(
            data['children']['name'],
            serializer.get_fields()['children']._kwargs['child'].get_fields()['name'].__class__.__name__
        )


class AppsAndViewSetsTests(TestCase):

    def setUp(self):
        self.apps_and_viewsets = AppsAndViewSets()

    def test_get_local_apps(self):
        apps = self.apps_and_viewsets.get_local_apps()

        self.assertEqual(len(apps), len(settings.LOCAL_APPS))
        for app in apps:
            self.assertIn(app, settings.LOCAL_APPS)

    def test_get_viewsets_for_app(self):
        app = self.apps_and_viewsets.get_local_apps()[0]

        viewsets = self.apps_and_viewsets.get_viewsets_for_app(app)

        # expect
        module = importlib.import_module('{}.views'.format(app))
        for name, obj in inspect.getmembers(module):
            if inspect.isclass(obj) and issubclass(obj, ModelViewSet):
                inspected_viewset = obj
                break
        # test
        self.assertIn(inspected_viewset, viewsets)
        self.assertTrue(issubclass(viewsets[0], ModelViewSet))


class ViewSetHandlerTests(TestCase):

    def setUp(self):
        self.viewset_handler = ViewSetHandler(PersonViewSet)

    def test_name(self):
        self.assertEqual(
            self.viewset_handler.name,
            PersonViewSet().__class__.__name__
        )

    def test_model(self):
        self.assertEqual(
            self.viewset_handler.model,
            PersonViewSet().model().__class__.__name__
        )

    def test_formatted_action(self):
        action = 'list'
        self.assertEqual(
            self.viewset_handler.formatted_action(action),
            capfirst(action)
        )

    def test_formatted_serializer_data(self):
        serializer = CurrencySerializer
        serializer_data = SerializerData(serializer)

        self.assertEqual(
            serializer_data.formated_data,
            self.viewset_handler.formatted_serializer_data(serializer)
        )

    def test_serializer_actions(self):
        actions = ['list', 'retrieve', 'update', 'create']

        self.assertEqual(
            len(actions),
            len(self.viewset_handler.serializer_actions)
        )
        for action in actions:
            self.assertIn(action, self.viewset_handler.serializer_actions)

    def test_get_serializers(self):
        serializers = self.viewset_handler.get_serializers()

        self.assertEqual(
            len(serializers),
            len(self.viewset_handler.serializer_actions),
        )
        for serializer in serializers:
            self.assertTrue(issubclass(serializer, ModelSerializer))

    def test_get_serializer_for_action(self):
        action = 'list'
        viewset = PersonViewSet()
        viewset.action = action
        list_serializer = viewset.get_serializer_class()

        self.assertEqual(
            list_serializer,
            self.viewset_handler.get_serializer_for_action(action)
        )


class ViewSetFileWriterTests(TestCase):

    def setUp(self):
        dirname = "/Users/alelevier/Desktop"
        name = 'test.txt'
        self.filename = os.path.join(dirname, name)

    def tearDown(self):
        os.remove(self.filename)
        self.assertFalse(os.path.isfile(self.filename))

    def test_isfile(self):
        myfile = ViewSetFileWriter(self.filename)
        myfile.write('bob')
        myfile.close()

        self.assertTrue(os.path.isfile(self.filename))

    def test_write(self):
        text = 'bob'
        myfile = ViewSetFileWriter(self.filename)
        myfile.write(text)
        myfile.close()

        with open(self.filename, 'r') as f:
            self.assertEqual(f.read(), "{}\n".format(text))

    def test_write_code_block_start(self):
        myfile = ViewSetFileWriter(self.filename)
        myfile.write_code_block_start()
        myfile.close()

        with open(self.filename, 'r') as f:
            self.assertEqual(f.read(), "```python\n")

    def test_write_code_block_end(self):
        myfile = ViewSetFileWriter(self.filename)
        myfile.write_code_block_end()
        myfile.close()

        with open(self.filename, 'r') as f:
            self.assertEqual(f.read(), "```\n\n\n")

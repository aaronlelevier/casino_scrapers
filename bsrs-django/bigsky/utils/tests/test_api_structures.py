import importlib
import inspect

from django.test import TestCase
from django.conf import settings

from rest_framework.serializers import ModelSerializer
from rest_framework.viewsets import ModelViewSet

from accounting.serializers import CurrencySerializer
from category.serializers import CategoryListSerializer
from person.views import PersonViewSet
from utils.api_structures import SerializerData, AppsAndViewSets


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

    def test_serializer_actions(self):
        actions = ['list', 'retrieve', 'update', 'create']

        self.assertEqual(
            len(actions),
            len(self.apps_and_viewsets.serializer_actions)
        )
        for action in actions:
            self.assertIn(action, self.apps_and_viewsets.serializer_actions)

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

    def test_get_serializers_for_viewset(self):
        serializers = self.apps_and_viewsets.get_serializers_for_viewset(PersonViewSet)

        self.assertEqual(
            len(serializers),
            len(self.apps_and_viewsets.serializer_actions),
        )
        for serializer in serializers:
            self.assertTrue(issubclass(serializer, ModelSerializer))

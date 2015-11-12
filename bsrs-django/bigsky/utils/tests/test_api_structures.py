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
        # debug file settings (uncomment if needed for debugging)
        # self.maxDiff = None

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

    def test_write_viewset(self):
        # viewset
        viewset = PersonViewSet
        viewset_handler = ViewSetHandler(viewset)
        # action blocks
        action_blocks = ""
        for action in viewset_handler.serializer_actions:
            action_blocks += "### {}\n".format(
                viewset_handler.formatted_action(action))
            action_blocks += "```python\n"

            serializer = viewset_handler.get_serializer_for_action(action)
            action_blocks += "{}\n".format(
                viewset_handler.formatted_serializer_data(serializer))

            action_blocks += "```\n\n"
        # file
        myfile = ViewSetFileWriter(self.filename, viewset=viewset)
        myfile.write_viewset()
        myfile.close()

        with open(self.filename, 'r') as f:
            self.assertEqual(
                f.read(),
                """# {name}\n## {model}\n{action_blocks}""".format(
                    name=viewset_handler.name,
                    model=viewset_handler.model,
                    action_blocks=action_blocks
                )
            )

    def test_viewset_name(self):
        viewset = PersonViewSet
        viewset_handler = ViewSetHandler(viewset)

        myfile = ViewSetFileWriter(self.filename, viewset=viewset)

        self.assertEqual(myfile.viewset_name, "# {}".format(viewset_handler.name))

    def test_viewset_model(self):
        viewset = PersonViewSet
        viewset_handler = ViewSetHandler(viewset)

        myfile = ViewSetFileWriter(self.filename, viewset=viewset)

        self.assertEqual(myfile.viewset_model, "## {}".format(viewset_handler.model))

    def test_viewset_action(self):
        # viewset
        action = 'list'
        viewset = PersonViewSet
        viewset_handler = ViewSetHandler(viewset)
        # file
        myfile = ViewSetFileWriter(self.filename, viewset=viewset)

        self.assertEqual(
            myfile.viewset_action(action),
            "### {}".format(viewset_handler.formatted_action(action))
        )

    def test_viewset_serializer_data_for_action(self):
        # viewset
        action = 'list'
        viewset = PersonViewSet
        viewset_handler = ViewSetHandler(viewset)
        serializer = viewset_handler.get_serializer_for_action(action)
        # file
        myfile = ViewSetFileWriter(self.filename, viewset=viewset)

        self.assertEqual(
            myfile.viewset_serializer_data_for_action(action),
            viewset_handler.formatted_serializer_data(serializer)
        )

    def test_code_block_start(self):
        myfile = ViewSetFileWriter(self.filename, viewset=PersonViewSet)

        self.assertEqual(myfile.code_block_start, "```python")

    def test_code_block_end(self):
        myfile = ViewSetFileWriter(self.filename, viewset=PersonViewSet)

        self.assertEqual(myfile.code_block_end, "```\n")

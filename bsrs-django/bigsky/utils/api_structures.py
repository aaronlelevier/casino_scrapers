import os
import sys
import json
import pprint
import importlib
import inspect

from django.conf import settings
from django.utils.text import capfirst

from rest_framework.viewsets import ModelViewSet
from rest_framework.serializers import ModelSerializer, ListSerializer

from category.serializers import CategoryListSerializer
from category.views import CategoryViewSet


class SerializerData(object):

    def __init__(self, serializer):
        self.serializer = serializer
        self._data = {}

    @property
    def data(self):
        self.construct_data()
        return self._data

    @property
    def formated_data(self):
        # data = json.dumps(data, sort_keys=True, indent=4, separators=(',', ': '))
        # or 
        pp = pprint.PrettyPrinter(indent=2)
        data = pp.pformat(self.data)
        return data

    def construct_data(self):
        serializer = self.serializer()

        for k,v in serializer.get_fields().items():

            if isinstance(v, ModelSerializer):
                self.construct_foreign_key_data(k=k, v=v)
            elif isinstance(v, ListSerializer):
                self.construct_many_to_many_data(k=k, v=v)
            else:
                self.construct_top_level_data(k=k, v=v)

    def construct_foreign_key_data(self, k, v):
        nested = {}
        for key, value in v.get_fields().items():
            nested.update({key: value.__class__.__name__})
        self._data.update({k: nested})

    def construct_many_to_many_data(self, k, v):
        nested = {}
        for key, value in v._kwargs['child'].get_fields().items():
            nested.update({key: value.__class__.__name__})
        self._data.update({k: nested})

    def construct_top_level_data(self, k, v):
        self._data.update({k: v.__class__.__name__})


class AppsAndViewSets(object):

    def __init__(self):
        pass

    @staticmethod
    def get_local_apps():
        return settings.LOCAL_APPS

    @staticmethod
    def get_viewsets_for_app(app):
        module = importlib.import_module('{}.views'.format(app))

        viewsets = []
        for name, obj in inspect.getmembers(module):
            if inspect.isclass(obj) and issubclass(obj, ModelViewSet):
                viewsets.append(obj)

        return viewsets


class ViewSetHandler(object):

    def __init__(self, viewset):
        self.viewset = viewset()

    # These properties will return strings to be used by
    # the ``ViewSetFileWriter``

    @property
    def name(self):
        "Returns viewset name as a string"
        return self.viewset.__class__.__name__

    @property
    def model(self):
        "Returns the viewset's model name as a sting"
        return self.viewset.model().__class__.__name__

    def formatted_action(self, action):
        return capfirst(action)

    def formatted_serializer_data(self, serializer):
        serializer_data = SerializerData(serializer)
        return serializer_data.formated_data

    # Supporting Methods

    @property
    def serializer_actions(self):
        return ['list', 'retrieve', 'update', 'create']

    def get_serializers(self):
        serializers = []
        for action in self.serializer_actions:
            self.viewset.action = action
            serializer = self.viewset.get_serializer_class()
            serializers.append(serializer)
        return serializers

    def get_serializer_for_action(self, action):
        self.viewset.action = action
        return self.viewset.get_serializer_class()


class ViewSetFileWriter(object):
    "Adds newline onto the end of all writes."

    def __init__(self, name, mode='w', viewset=None):
        self.viewset = ViewSetHandler(viewset) if viewset else None
        self.file = open(name, mode)

    def __enter__ (self):
        return self.file

    def __exit__ (self, exc_type, exc_value, traceback):
        self.file.close()

    def close(self):
        self.file.close()

    def write(self, string):
        self.file.writelines(string + '\n')

    def write_viewset(self):
        self.write(self.viewset_name)
        self.write(self.viewset_model)
        
        for action in self.viewset.serializer_actions:
            self.write(self.viewset_action(action))
            self.write(self.code_block_start)
            self.write(self.viewset_serializer_data_for_action(action))
            self.write(self.code_block_end)

    @property
    def viewset_name(self):
        return "# {}".format(self.viewset.name)

    @property
    def viewset_model(self):
        return "## {}".format(self.viewset.model)

    @property
    def code_block_start(self):
        return "```python"

    @property
    def code_block_end(self):
        return "```\n"

    def viewset_action(self, action):
        return "### {}".format(self.viewset.formatted_action(action))

    def viewset_serializer_data_for_action(self, action):
        serializer = self.viewset.get_serializer_for_action(action)
        return self.viewset.formatted_serializer_data(serializer)

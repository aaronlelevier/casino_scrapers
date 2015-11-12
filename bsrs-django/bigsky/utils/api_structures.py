import os
import sys
import json
import pprint
import importlib
import inspect

from django.conf import settings

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

    @property
    def formated_data(data):
        # data = json.dumps(data, sort_keys=True, indent=4, separators=(',', ': '))
        # or 
        pp = pprint.PrettyPrinter(indent=2)
        data = pp.pformat(self.data)
        return data


class AppsAndViewSets(object):

    def __init__(self):
        pass

    @property
    def serializer_actions(self):
        return ['list', 'retrieve', 'update', 'create']

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

    def get_serializers_for_viewset(self, viewset):
        viewset = viewset()

        serializers = []
        for action in self.serializer_actions:
            viewset.action = action
            serializer = viewset.get_serializer_class()
            serializers.append(serializer)

        return serializers




# def create_file(action, data):
#     filename = 'test.md'
#     path = '/Users/alelevier/Desktop'

#     with open(os.path.join(path, filename), 'w') as f:
#         f.write("```json")
#         f.write("\n")
#         f.write(format_data(data))
#         f.write("\n")
#         f.write("```")


def format_data(data):
    # data = json.dumps(data, sort_keys=True, indent=4, separators=(',', ': '))
    # or 
    pp = pprint.PrettyPrinter(indent=2)
    data = pp.pformat(data)

    return data


def write_serializer_data():
    viewset_class = CategoryViewSet
    viewset = viewset_class()

    filename = 'test.md'
    path = '/Users/alelevier/Desktop'
    with open(os.path.join(path, filename), 'w') as f:
        f.write("# CategoryViewSet\n\n")

        actions = ['list', 'retrieve']
        for action in actions:
            setattr(viewset, 'action', action)
            serializer = viewset.get_serializer_class()
            data = serialize_data(serializer)

            f.write("### {}\n".format(action))
            f.write("\n")
            f.write("```json")
            f.write("\n")
            f.write(format_data(data))
            f.write("\n")
            f.write("```")
            f.write("\n\n")

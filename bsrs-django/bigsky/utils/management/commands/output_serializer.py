import os
import sys
import json
import pprint

from django.core.management.base import BaseCommand

from rest_framework import serializers

from category.serializers import CategoryListSerializer
from category.views import CategoryViewSet


serializer = CategoryListSerializer()


def serialize_data(serializer_class=CategoryListSerializer):
    serializer = serializer_class()

    data = {}
    for k,v in serializer.get_fields().items():
        if isinstance(v, serializers.ModelSerializer):
            nested = {}
            for key, value in v.get_fields().items():
                nested.update({key: value.__class__.__name__})
            data.update({k: nested})
        elif isinstance(v, serializers.ListSerializer):
            nested = {}
            for key, value in v._kwargs['child'].get_fields().items():
                nested.update({key: value.__class__.__name__})
            data.update({k: nested})
        else:
            data.update({k: v.__class__.__name__})

    return data


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


class Command(BaseCommand):
    help = 'Write the structure of a serializer to a file'

    def handle(self, *args, **options):
        write_serializer_data()

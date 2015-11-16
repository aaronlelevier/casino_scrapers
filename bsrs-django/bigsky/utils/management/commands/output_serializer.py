import os
from os.path import dirname, join
import shutil

from django.core.management.base import BaseCommand

from rest_framework.exceptions import MethodNotAllowed

from utils.api_structures import ModulesAndMembers, ViewSetFileWriter


class Command(BaseCommand):
    help = "Write the structure of the project serializers to: \
'docs/serializers'."

    def handle(self, *args, **options):
        # bsrs-django/bigsky/utils/management/commands/
        project_dir = dirname(dirname(dirname(dirname(dirname(__file__)))))
        serializers_dir = join(project_dir, "docs/serializers")

        # remove prior docs
        shutil.rmtree(serializers_dir)
        # rebuild dir
        os.makedirs(serializers_dir)

        x = ModulesAndMembers()
        views = x.get_modules()

        for view in views:
            viewsets = x.get_classes_for_module(view)

            view_dir = join(serializers_dir, view.__name__)
            os.makedirs(view_dir)

            for viewset in viewsets:
                if hasattr(viewset, 'model'):
                    filename = join(view_dir, "{}.md".format(viewset.__name__))

                    try:
                        file_writer = ViewSetFileWriter(filename, viewset=viewset)
                        file_writer.write_viewset()
                        file_writer.close()
                    except MethodNotAllowed:
                        pass

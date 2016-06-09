import os
from os import path

from django.core.management.commands.startapp import Command as StartAppCommand


class Command(StartAppCommand):
    help = (
        "(DRF version with separate directory for tests)"
        "Creates a Django app directory structure for the given app name in "
        "the current directory or optionally in the given directory."
    )
    missing_args_message = "You must provide an application name."

    def handle(self, **options):
        app_name = options.get('name')
        top_dir = path.join(os.getcwd(), app_name)

        super(Command, self).handle(**options)

        # Remove
        os.remove(path.join(top_dir, 'tests.py'))

        # Add
        # app files
        with open(path.join(top_dir, 'serializers.py'), 'wb') as f: pass

        # test dir, and files
        test_dir = path.join(top_dir, 'tests')
        os.mkdir(test_dir)

        for file in ['__init__.py', 'test_models.py', 'test_views.py']:
            with open(path.join(test_dir, file), 'wb') as f: pass

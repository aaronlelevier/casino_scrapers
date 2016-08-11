from django.core.management.base import BaseCommand

from location.tests.factory import create_locations


class Command(BaseCommand):

    def handle(self, *args, **options):
        create_locations()

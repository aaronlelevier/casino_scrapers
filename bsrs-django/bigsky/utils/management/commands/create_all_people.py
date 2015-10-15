from django.core.management.base import BaseCommand

from person.tests.factory import create_all_people


class Command(BaseCommand):
    help = 'create all People objects in database for testing'

    def handle(self, *args, **options):
        create_all_people()
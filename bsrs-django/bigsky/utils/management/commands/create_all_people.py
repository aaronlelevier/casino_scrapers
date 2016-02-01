from django.core.management.base import BaseCommand

from person.tests.factory import create_all_people, create_person_statuses


class Command(BaseCommand):
    help = 'create all People objects in database for testing'

    def handle(self, *args, **options):
        create_person_statuses()
        create_all_people()

from django.core.management.base import BaseCommand

from utils_transform.tperson.tests.factory import create_domino_person


class Command(BaseCommand):

    def handle(self, *args, **options):
        create_domino_person()

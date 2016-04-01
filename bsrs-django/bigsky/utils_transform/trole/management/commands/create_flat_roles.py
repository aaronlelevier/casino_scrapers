from django.core.management.base import BaseCommand

from utils_transform.trole.tests.factory import create_domino_role


class Command(BaseCommand):

    def handle(self, *args, **options):
        create_domino_role()

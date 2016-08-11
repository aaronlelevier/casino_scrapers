from django.core.management.base import BaseCommand

from category.tests.factory import create_categories


class Command(BaseCommand):

    def handle(self, *args, **options):
        create_categories()

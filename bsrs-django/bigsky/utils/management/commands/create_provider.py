from django.core.management.base import BaseCommand

from provider.tests.factory import create_providers


class Command(BaseCommand):

    def handle(self, *args, **options):
        create_providers()

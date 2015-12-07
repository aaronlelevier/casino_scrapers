from django.core.management.base import BaseCommand

from selenium_tests.factory.person import setup_fake_role

class Command(BaseCommand):
    help = 'run fixture code for selenium'

    def handle(self, *args, **options):
        setup_fake_role()

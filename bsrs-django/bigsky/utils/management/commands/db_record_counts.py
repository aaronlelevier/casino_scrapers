import os

from django.core.management.base import BaseCommand

from utils import db_record_counts


PATH = os.path.join(os.environ['VIRTUAL_ENV'],
                    "lib/python3.4/site-packages/django/contrib/admin")


class Command(BaseCommand):
    help = 'Return the counts off all registered database tables'

    def handle(self, *args, **options):
        db_record_counts()

from django.core.management.base import BaseCommand

from utils_transform.tperson.management.commands._etl_utils import (
    run_person_migrations,)


class Command(BaseCommand):

    def handle(self, *args, **options):
        run_person_migrations()

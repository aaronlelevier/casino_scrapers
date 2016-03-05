from django.core.management.base import BaseCommand

from utils_transform.tcategory.management.commands._etl_utils import (
    run_category_issue_migrations,)


class Command(BaseCommand):

    def handle(self, *args, **options):
        run_category_issue_migrations()

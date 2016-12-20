from django.conf import settings

from celery import shared_task

from translation.models import Translation


@shared_task
def debug_task(x):
    return x


@shared_task
def gspread_get_all_csv():
    Translation.objects.gspread_get_all_csv()


@shared_task
def import_all_csv():
    Translation.objects.import_all_csv()


@shared_task
def update_translations():
    gspread_get_all_csv()
    import_all_csv()

from django.contrib import admin

from utils import models


@admin.register(models.Tester)
class TesterAdmin(admin.ModelAdmin):
    pass
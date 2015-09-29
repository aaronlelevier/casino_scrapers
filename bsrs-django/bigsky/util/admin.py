from django.contrib import admin

from util import models


@admin.register(models.Tester)
class TesterAdmin(admin.ModelAdmin):
    pass
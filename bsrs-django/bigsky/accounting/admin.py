from django.contrib import admin

from accounting import models


@admin.register(models.Currency)
class CurrencyAdmin(admin.ModelAdmin):
    pass

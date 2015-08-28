from django.contrib import admin

from translation import models


@admin.register(models.Locale)
class LocaleAdmin(admin.ModelAdmin):
    pass


@admin.register(models.Translation)
class TranslationAdmin(admin.ModelAdmin):
    pass

from django.contrib import admin

from translation import models


@admin.register(models.Locale)
class LocaleAdmin(admin.ModelAdmin):
    list_display = ('id', 'name',)


@admin.register(models.Translation)
class TranslationAdmin(admin.ModelAdmin):
    pass

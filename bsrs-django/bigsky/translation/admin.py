from django.contrib import admin

from translation import models


@admin.register(models.Locale)
class LocaleAdmin(admin.ModelAdmin):
    list_display = ('name', 'id', 'created', 'modified',)


@admin.register(models.Translation)
class TranslationAdmin(admin.ModelAdmin):
    list_display = ('locale', 'created', 'modified',)

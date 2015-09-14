from django.contrib import admin

from generic import models


@admin.register(models.Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    pass

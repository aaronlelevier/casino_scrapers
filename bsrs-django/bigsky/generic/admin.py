from django.contrib import admin

from generic import models


@admin.register(models.Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    readonly_fields = ('filename', 'is_image', 'image_thumbnail',
                       'image_medium', 'image_full',)
    fieldsets = [
        ('Fields', {'fields': ['model_id', 'file']}),
        ('Read-only Fields', {'fields': ['filename', 'is_image', 
            'image_thumbnail', 'image_medium', 'image_full',]}),
    ]

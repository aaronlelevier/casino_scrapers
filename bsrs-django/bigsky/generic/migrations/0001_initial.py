# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import generic.models
import uuid


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Attachment',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, serialize=False, editable=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text=b'If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True, blank=True)),
                ('model_id', models.UUIDField(help_text=b'UUID of the Model for which this Attachment applies.')),
                ('filename', models.CharField(max_length=100, blank=True)),
                ('file', models.FileField(null=True, upload_to=generic.models.upload_to_files, blank=True)),
                ('is_image', models.BooleanField(default=False)),
                ('image_thumbnail', models.ImageField(null=True, upload_to=generic.models.upload_to_images_thumbnail, blank=True)),
                ('image_medium', models.ImageField(null=True, upload_to=generic.models.upload_to_images_medium, blank=True)),
                ('image_full', models.ImageField(null=True, upload_to=generic.models.upload_to_images_full, blank=True)),
            ],
            options={
                'ordering': ('id',),
                'abstract': False,
            },
        ),
    ]

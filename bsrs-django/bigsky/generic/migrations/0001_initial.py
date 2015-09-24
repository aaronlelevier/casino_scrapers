# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import uuid
import generic.models


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Attachment',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(null=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True)),
                ('model_id', models.UUIDField(help_text='UUID of the Model Instance that the Attachment is related to.')),
                ('filename', models.CharField(max_length=100, blank=True)),
                ('file', models.FileField(upload_to=generic.models.upload_to, null=True, blank=True)),
                ('is_image', models.BooleanField(default=False)),
                ('image_full', models.ImageField(upload_to=generic.models.upload_to, null=True, blank=True)),
                ('image_medium', models.ImageField(upload_to=generic.models.upload_to_images_medium, null=True, blank=True)),
                ('image_thumbnail', models.ImageField(upload_to=generic.models.upload_to_images_thumbnail, null=True, blank=True)),
            ],
            options={
                'ordering': ('id',),
                'abstract': False,
            },
        ),
    ]

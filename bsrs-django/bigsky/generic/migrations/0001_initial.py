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
                ('model_id', models.UUIDField(help_text=b'UUID of the Model Instance that the Attachment is related to.')),
                ('filename', models.CharField(max_length=100, blank=True)),
                ('file', models.FileField(null=True, upload_to=generic.models.upload_to, blank=True)),
                ('is_image', models.BooleanField(default=False)),
                ('image_full', models.ImageField(null=True, upload_to=generic.models.upload_to, blank=True)),
                ('image_medium', models.ImageField(null=True, upload_to=generic.models.upload_to_images_medium, blank=True)),
                ('image_thumbnail', models.ImageField(null=True, upload_to=generic.models.upload_to_images_thumbnail, blank=True)),
            ],
            options={
                'ordering': ('id',),
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='CustomSetting',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, serialize=False, editable=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text=b'If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True, blank=True)),
                ('settings', models.TextField(help_text=b'JSON Dict saved as a string in DB', blank=True)),
                ('object_id', models.UUIDField()),
            ],
            options={
                'ordering': ('id',),
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='MainSetting',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, serialize=False, editable=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text=b'If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True, blank=True)),
                ('settings', models.TextField(help_text=b'JSON Dict saved as a string in DB', blank=True)),
                ('object_id', models.UUIDField()),
            ],
            options={
                'ordering': ('id',),
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='SavedSearch',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, serialize=False, editable=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text=b'If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True, blank=True)),
                ('name', models.CharField(help_text=b'name of the saved search that the Person designates.', max_length=254)),
                ('endpoint_name', models.CharField(help_text=b"the Ember List API route name. i.e. 'admin.people.index'.", max_length=254)),
                ('endpoint_uri', models.CharField(help_text=b'API Endpoint that this search is saved for. With all keywords ordering, and filters, etc...', max_length=2048)),
            ],
            options={
                'ordering': ('-modified',),
                'verbose_name_plural': 'Saved Searches',
            },
        ),
    ]

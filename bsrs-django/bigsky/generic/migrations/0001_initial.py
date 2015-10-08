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
                ('id', models.UUIDField(editable=False, default=uuid.uuid4, serialize=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(null=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True)),
                ('model_id', models.UUIDField(help_text='UUID of the Model Instance that the Attachment is related to.')),
                ('filename', models.CharField(max_length=100, blank=True)),
                ('file', models.FileField(null=True, upload_to=generic.models.upload_to, blank=True)),
                ('is_image', models.BooleanField(default=False)),
                ('image_full', models.ImageField(null=True, upload_to=generic.models.upload_to, blank=True)),
                ('image_medium', models.ImageField(null=True, upload_to=generic.models.upload_to_images_medium, blank=True)),
                ('image_thumbnail', models.ImageField(null=True, upload_to=generic.models.upload_to_images_thumbnail, blank=True)),
            ],
            options={
                'abstract': False,
                'ordering': ('id',),
            },
        ),
        migrations.CreateModel(
            name='CustomSetting',
            fields=[
                ('id', models.UUIDField(editable=False, default=uuid.uuid4, serialize=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(null=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True)),
                ('settings', models.TextField(help_text='JSON Dict saved as a string in DB', blank=True)),
                ('object_id', models.UUIDField()),
            ],
            options={
                'abstract': False,
                'ordering': ('id',),
            },
        ),
        migrations.CreateModel(
            name='MainSetting',
            fields=[
                ('id', models.UUIDField(editable=False, default=uuid.uuid4, serialize=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(null=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True)),
                ('settings', models.TextField(help_text='JSON Dict saved as a string in DB', blank=True)),
                ('object_id', models.UUIDField()),
            ],
            options={
                'abstract': False,
                'ordering': ('id',),
            },
        ),
        migrations.CreateModel(
            name='SavedSearch',
            fields=[
                ('id', models.UUIDField(editable=False, default=uuid.uuid4, serialize=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(null=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True)),
                ('name', models.CharField(help_text='name of the saved search that the Person designates.', max_length=254)),
                ('endpoint_name', models.CharField(help_text="the Ember List API route name. i.e. 'admin.people.index'.", max_length=254)),
                ('endpoint_uri', models.CharField(help_text='API Endpoint that this search is saved for. With all keywords ordering, and filters, etc...', max_length=2048)),
            ],
            options={
                'verbose_name_plural': 'Saved Searches',
                'ordering': ('-modified',),
            },
        ),
    ]

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
                ('deleted', models.DateTimeField(blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True)),
                ('model_id', models.UUIDField(help_text='UUID of the Model Instance that the Attachment is related to.')),
                ('filename', models.CharField(blank=True, max_length=100)),
                ('file', models.FileField(blank=True, null=True, upload_to=generic.models.upload_to)),
                ('is_image', models.BooleanField(default=False)),
                ('image_full', models.ImageField(blank=True, null=True, upload_to=generic.models.upload_to)),
                ('image_medium', models.ImageField(blank=True, null=True, upload_to=generic.models.upload_to_images_medium)),
                ('image_thumbnail', models.ImageField(blank=True, null=True, upload_to=generic.models.upload_to_images_thumbnail)),
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
                ('deleted', models.DateTimeField(blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True)),
                ('settings', models.TextField(blank=True, help_text='JSON Dict saved as a string in DB')),
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
                ('deleted', models.DateTimeField(blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True)),
                ('settings', models.TextField(blank=True, help_text='JSON Dict saved as a string in DB')),
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
                ('deleted', models.DateTimeField(blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True)),
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

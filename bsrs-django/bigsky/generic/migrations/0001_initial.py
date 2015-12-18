# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import uuid
import generic.models


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
                ('filename', models.CharField(max_length=100, blank=True)),
                ('is_image', models.BooleanField(default=False)),
                ('file', models.FileField(blank=True, upload_to=generic.models.upload_to, null=True)),
                ('image_full', models.ImageField(blank=True, upload_to=generic.models.upload_to, null=True)),
                ('image_medium', models.ImageField(blank=True, upload_to=generic.models.upload_to_images_medium, null=True)),
                ('image_thumbnail', models.ImageField(blank=True, upload_to=generic.models.upload_to_images_thumbnail, null=True)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='CustomSetting',
            fields=[
                ('id', models.UUIDField(editable=False, default=uuid.uuid4, serialize=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True)),
                ('settings', models.TextField(help_text='JSON Dict saved as a string in DB', blank=True)),
                ('object_id', models.UUIDField()),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='MainSetting',
            fields=[
                ('id', models.UUIDField(editable=False, default=uuid.uuid4, serialize=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True)),
                ('settings', models.TextField(help_text='JSON Dict saved as a string in DB', blank=True)),
                ('object_id', models.UUIDField()),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='SavedSearch',
            fields=[
                ('id', models.UUIDField(editable=False, default=uuid.uuid4, serialize=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True)),
                ('name', models.CharField(max_length=254, help_text='name of the saved search that the Person designates.')),
                ('endpoint_name', models.CharField(max_length=254, help_text="the Ember List API route name. i.e. 'admin.people.index'.")),
                ('endpoint_uri', models.CharField(max_length=2048, help_text='API Endpoint that this search is saved for. With all keywords ordering, and filters, etc...')),
            ],
            options={
                'verbose_name_plural': 'Saved Searches',
                'ordering': ('-modified',),
            },
        ),
    ]

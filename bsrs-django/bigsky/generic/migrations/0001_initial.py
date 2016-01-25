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
                ('id', models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, serialize=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True)),
                ('filename', models.CharField(blank=True, max_length=100)),
                ('is_image', models.BooleanField(default=False)),
                ('file', models.FileField(null=True, blank=True, upload_to=generic.models.upload_to)),
                ('image_full', models.ImageField(null=True, blank=True, upload_to=generic.models.upload_to)),
                ('image_medium', models.ImageField(null=True, blank=True, upload_to=generic.models.upload_to_images_medium)),
                ('image_thumbnail', models.ImageField(null=True, blank=True, upload_to=generic.models.upload_to_images_thumbnail)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='SavedSearch',
            fields=[
                ('id', models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, serialize=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True)),
                ('name', models.CharField(help_text='name of the saved search that the Person designates.', max_length=254)),
                ('endpoint_name', models.CharField(help_text="the Ember List API route name. i.e. 'admin.people.index'.", max_length=254)),
                ('endpoint_uri', models.CharField(help_text='API Endpoint that this search is saved for. With all keywords ordering, and filters, etc...', max_length=2048)),
            ],
            options={
                'ordering': ('-modified',),
                'verbose_name_plural': 'Saved Searches',
            },
        ),
    ]

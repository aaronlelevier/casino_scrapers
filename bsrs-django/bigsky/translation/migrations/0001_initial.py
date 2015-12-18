# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import uuid
import django.contrib.postgres.fields.hstore
from django.contrib.postgres.operations import HStoreExtension
import translation.models


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        HStoreExtension(),
        migrations.CreateModel(
            name='Locale',
            fields=[
                ('id', models.UUIDField(editable=False, default=uuid.uuid4, serialize=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True)),
                ('locale', models.SlugField(help_text='Example values: en, en-US, en-x-Sephora')),
                ('default', models.BooleanField(default=False)),
                ('name', models.CharField(max_length=50, help_text="Human readable name in forms. i.e. 'English'")),
                ('native_name', models.CharField(blank=True, max_length=50, null=True)),
                ('presentation_name', models.CharField(blank=True, max_length=50, null=True)),
                ('rtl', models.BooleanField(default=False)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Translation',
            fields=[
                ('id', models.UUIDField(editable=False, default=uuid.uuid4, serialize=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True)),
                ('values', django.contrib.postgres.fields.hstore.HStoreField(default={}, blank=True)),
                ('context', django.contrib.postgres.fields.hstore.HStoreField(default={}, blank=True)),
                ('csv', models.FileField(blank=True, upload_to=translation.models.translation_file, null=True)),
                ('locale', models.OneToOneField(to='translation.Locale', blank=True, null=True)),
            ],
            options={
                'abstract': False,
            },
        ),
    ]

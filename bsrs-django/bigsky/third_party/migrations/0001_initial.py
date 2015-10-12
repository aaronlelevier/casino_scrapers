# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import uuid


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='ThirdParty',
            fields=[
                ('id', models.UUIDField(editable=False, serialize=False, primary_key=True, default=uuid.uuid4)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(null=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True)),
                ('name', models.CharField(max_length=100, unique=True)),
                ('number', models.CharField(null=True, max_length=50, blank=True)),
            ],
            options={
                'abstract': False,
                'ordering': ('id',),
            },
        ),
        migrations.CreateModel(
            name='ThirdPartyStatus',
            fields=[
                ('id', models.UUIDField(editable=False, serialize=False, primary_key=True, default=uuid.uuid4)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(null=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True)),
                ('name', models.CharField(max_length=100, unique=True)),
                ('description', models.CharField(max_length=100, choices=[('active', 'active'), ('two', 'two')], default='active')),
            ],
            options={
                'abstract': False,
                'ordering': ('id',),
            },
        ),
        migrations.AddField(
            model_name='thirdparty',
            name='status',
            field=models.ForeignKey(to='third_party.ThirdPartyStatus', blank=True, null=True),
        ),
    ]

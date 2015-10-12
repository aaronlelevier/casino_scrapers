# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import uuid


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Country',
            fields=[
                ('id', models.UUIDField(editable=False, serialize=False, primary_key=True, default=uuid.uuid4)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(null=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True)),
                ('name', models.CharField(max_length=100, unique=True)),
            ],
            options={
                'verbose_name_plural': 'Countries',
            },
        ),
        migrations.CreateModel(
            name='Location',
            fields=[
                ('id', models.UUIDField(editable=False, serialize=False, primary_key=True, default=uuid.uuid4)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(null=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True)),
                ('name', models.CharField(max_length=50)),
                ('number', models.CharField(null=True, max_length=50, blank=True)),
                ('children', models.ManyToManyField(to='location.Location', related_name='parents', blank=True)),
            ],
            options={
                'ordering': ('name', 'number'),
            },
        ),
        migrations.CreateModel(
            name='LocationLevel',
            fields=[
                ('id', models.UUIDField(editable=False, serialize=False, primary_key=True, default=uuid.uuid4)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(null=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True)),
                ('name', models.CharField(max_length=100, unique=True)),
                ('children', models.ManyToManyField(to='location.LocationLevel', related_name='parents', blank=True)),
            ],
            options={
                'abstract': False,
                'ordering': ('id',),
            },
        ),
        migrations.CreateModel(
            name='LocationStatus',
            fields=[
                ('id', models.UUIDField(editable=False, serialize=False, primary_key=True, default=uuid.uuid4)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(null=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True)),
                ('name', models.CharField(max_length=100, unique=True)),
            ],
            options={
                'abstract': False,
                'ordering': ('id',),
            },
        ),
        migrations.CreateModel(
            name='LocationType',
            fields=[
                ('id', models.UUIDField(editable=False, serialize=False, primary_key=True, default=uuid.uuid4)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(null=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True)),
                ('name', models.CharField(max_length=100, unique=True)),
            ],
            options={
                'abstract': False,
                'ordering': ('id',),
            },
        ),
        migrations.CreateModel(
            name='State',
            fields=[
                ('id', models.UUIDField(editable=False, serialize=False, primary_key=True, default=uuid.uuid4)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(null=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True)),
                ('name', models.CharField(max_length=100, unique=True)),
                ('abbr', models.CharField(max_length=2)),
            ],
            options={
                'abstract': False,
                'ordering': ('id',),
            },
        ),
        migrations.AddField(
            model_name='location',
            name='location_level',
            field=models.ForeignKey(to='location.LocationLevel', related_name='locations'),
        ),
        migrations.AddField(
            model_name='location',
            name='status',
            field=models.ForeignKey(help_text="If not provided, will be the default 'LocationStatus'.", blank=True, related_name='locations', null=True, to='location.LocationStatus'),
        ),
        migrations.AddField(
            model_name='location',
            name='type',
            field=models.ForeignKey(to='location.LocationType', related_name='locations', blank=True, null=True),
        ),
    ]

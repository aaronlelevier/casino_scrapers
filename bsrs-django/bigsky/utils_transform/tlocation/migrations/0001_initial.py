# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='LocationDistrict',
            fields=[
                ('id', models.AutoField(auto_created=True, serialize=False, verbose_name='ID', primary_key=True)),
                ('number', models.TextField()),
                ('name', models.TextField()),
                ('regionnumber', models.TextField(null=True, blank=True)),
                ('manager', models.TextField(null=True, blank=True)),
                ('address1', models.TextField(null=True, blank=True)),
                ('address2', models.TextField(null=True, blank=True)),
                ('city', models.TextField(null=True, blank=True)),
                ('state', models.TextField(null=True, blank=True)),
                ('zip', models.TextField(null=True, blank=True)),
                ('country', models.TextField(null=True, blank=True)),
                ('telephone', models.TextField(null=True, blank=True)),
                ('fax', models.TextField(null=True, blank=True)),
                ('email', models.TextField(null=True, blank=True)),
                ('carphone', models.TextField(null=True, blank=True)),
                ('comments', models.TextField(null=True, blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='LocationRegion',
            fields=[
                ('id', models.AutoField(auto_created=True, serialize=False, verbose_name='ID', primary_key=True)),
                ('number', models.TextField()),
                ('name', models.TextField()),
                ('manager', models.TextField(null=True, blank=True)),
                ('address1', models.TextField(null=True, blank=True)),
                ('address2', models.TextField(null=True, blank=True)),
                ('city', models.TextField(null=True, blank=True)),
                ('state', models.TextField(null=True, blank=True)),
                ('zip', models.TextField(null=True, blank=True)),
                ('country', models.TextField(null=True, blank=True)),
                ('telephone', models.TextField(null=True, blank=True)),
                ('fax', models.TextField(null=True, blank=True)),
                ('email', models.TextField(null=True, blank=True)),
                ('carphone', models.TextField(null=True, blank=True)),
                ('comments', models.TextField(null=True, blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='LocationStore',
            fields=[
                ('id', models.AutoField(auto_created=True, serialize=False, verbose_name='ID', primary_key=True)),
                ('number', models.TextField()),
                ('name', models.TextField()),
                ('distnumber', models.TextField(null=True, blank=True)),
                ('manager', models.TextField(null=True, blank=True)),
                ('address1', models.TextField(null=True, blank=True)),
                ('address2', models.TextField(null=True, blank=True)),
                ('city', models.TextField(null=True, blank=True)),
                ('state', models.TextField(null=True, blank=True)),
                ('zip', models.TextField(null=True, blank=True)),
                ('country', models.TextField(null=True, blank=True)),
                ('telephone', models.TextField(null=True, blank=True)),
                ('fax', models.TextField(null=True, blank=True)),
                ('email', models.TextField(null=True, blank=True)),
                ('carphone', models.TextField(null=True, blank=True)),
                ('costcode', models.TextField(null=True, blank=True)),
                ('openingdate', models.DateField(null=True, blank=True)),
                ('comments', models.TextField(null=True, blank=True)),
            ],
        ),
    ]

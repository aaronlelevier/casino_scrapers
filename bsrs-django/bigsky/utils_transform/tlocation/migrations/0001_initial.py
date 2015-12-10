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
                ('id', models.AutoField(verbose_name='ID', auto_created=True, primary_key=True, serialize=False)),
                ('number', models.TextField()),
                ('name', models.TextField()),
                ('regionnumber', models.TextField()),
                ('manager', models.TextField()),
                ('address1', models.TextField()),
                ('address2', models.TextField()),
                ('city', models.TextField()),
                ('state', models.TextField()),
                ('zip', models.TextField()),
                ('country', models.TextField()),
                ('telephone', models.TextField()),
                ('fax', models.TextField()),
                ('email', models.TextField()),
                ('carphone', models.TextField()),
                ('comments', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='LocationRegion',
            fields=[
                ('id', models.AutoField(verbose_name='ID', auto_created=True, primary_key=True, serialize=False)),
                ('number', models.TextField()),
                ('name', models.TextField()),
                ('manager', models.TextField()),
                ('address1', models.TextField()),
                ('address2', models.TextField()),
                ('city', models.TextField()),
                ('state', models.TextField()),
                ('zip', models.TextField()),
                ('country', models.TextField()),
                ('telephone', models.TextField()),
                ('fax', models.TextField()),
                ('email', models.TextField()),
                ('carphone', models.TextField()),
                ('comments', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='LocationStore',
            fields=[
                ('id', models.AutoField(verbose_name='ID', auto_created=True, primary_key=True, serialize=False)),
                ('number', models.TextField()),
                ('name', models.TextField()),
                ('distnumber', models.TextField()),
                ('manager', models.TextField()),
                ('address1', models.TextField()),
                ('address2', models.TextField()),
                ('city', models.TextField()),
                ('state', models.TextField()),
                ('zip', models.TextField()),
                ('country', models.TextField()),
                ('telephone', models.TextField()),
                ('fax', models.TextField()),
                ('email', models.TextField()),
                ('carphone', models.TextField()),
                ('costcode', models.TextField()),
                ('openingdate', models.DateField()),
                ('comments', models.TextField()),
            ],
        ),
    ]

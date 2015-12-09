# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Location',
            fields=[
                ('id', models.AutoField(auto_created=True, verbose_name='ID', serialize=False, primary_key=True)),
                ('number', models.CharField(max_length=1000)),
                ('name', models.CharField(max_length=1000)),
                ('manager', models.CharField(max_length=1000)),
                ('address1', models.CharField(max_length=1000)),
                ('address2', models.CharField(max_length=1000)),
                ('city', models.CharField(max_length=1000)),
                ('state', models.CharField(max_length=1000)),
                ('zip', models.CharField(max_length=1000)),
                ('country', models.CharField(max_length=1000)),
                ('telephone', models.CharField(max_length=1000)),
                ('fax', models.CharField(max_length=1000)),
                ('email', models.CharField(max_length=1000)),
                ('carphone', models.CharField(max_length=1000)),
                ('comments', models.CharField(max_length=1000)),
            ],
        ),
    ]

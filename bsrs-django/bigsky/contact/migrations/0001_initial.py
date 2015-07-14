# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('location', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Address',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('address1', models.CharField(max_length=200, null=True, blank=True)),
                ('address2', models.CharField(max_length=200, null=True, blank=True)),
                ('address3', models.CharField(max_length=200, null=True, blank=True)),
                ('city', models.CharField(max_length=100, null=True, blank=True)),
                ('state', models.CharField(max_length=100, null=True, blank=True)),
                ('country', models.CharField(max_length=100, null=True, blank=True)),
                ('postalcode', models.CharField(max_length=32, null=True, blank=True)),
            ],
            options={
                'ordering': ('type',),
            },
        ),
        migrations.CreateModel(
            name='AddressType',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.BooleanField(default=False)),
                ('order', models.IntegerField()),
                ('name', models.CharField(unique=True, max_length=100)),
            ],
            options={
                'ordering': ('order', 'name'),
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Email',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('email', models.EmailField(unique=True, max_length=255)),
            ],
            options={
                'ordering': ('type', 'email'),
            },
        ),
        migrations.CreateModel(
            name='EmailType',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.BooleanField(default=False)),
                ('order', models.IntegerField()),
                ('name', models.CharField(unique=True, max_length=100)),
            ],
            options={
                'ordering': ('order', 'name'),
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='PhoneNumber',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('number', models.CharField(unique=True, max_length=32)),
                ('location', models.ForeignKey(related_name='phone_numbers', blank=True, to='location.Location', null=True)),
            ],
            options={
                'ordering': ('type', 'number'),
            },
        ),
        migrations.CreateModel(
            name='PhoneNumberType',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.BooleanField(default=False)),
                ('order', models.IntegerField()),
                ('name', models.CharField(unique=True, max_length=100)),
            ],
            options={
                'ordering': ('order', 'name'),
                'abstract': False,
            },
        ),
    ]

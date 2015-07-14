# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0002_auto_20150713_1422'),
        ('location', '0002_auto_20150713_1422'),
        ('contact', '0004_auto_20150713_1441'),
    ]

    operations = [
        migrations.CreateModel(
            name='LocationAddress',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('address1', models.CharField(max_length=200, null=True, blank=True)),
                ('address2', models.CharField(max_length=200, null=True, blank=True)),
                ('address3', models.CharField(max_length=200, null=True, blank=True)),
                ('city', models.CharField(max_length=100, null=True, blank=True)),
                ('state', models.CharField(max_length=100, null=True, blank=True)),
                ('country', models.CharField(max_length=100, null=True, blank=True)),
                ('postalcode', models.CharField(max_length=32, null=True, blank=True)),
                ('location', models.ForeignKey(related_name='addresses', to='location.Location')),
                ('type', models.ForeignKey(to='contact.AddressType')),
            ],
            options={
                'ordering': ('type',),
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='LocationEmail',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('email', models.EmailField(unique=True, max_length=255)),
                ('location', models.ForeignKey(to='location.Location')),
                ('type', models.ForeignKey(to='contact.EmailType')),
            ],
            options={
                'ordering': ('type', 'email'),
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='PersonAddress',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('address1', models.CharField(max_length=200, null=True, blank=True)),
                ('address2', models.CharField(max_length=200, null=True, blank=True)),
                ('address3', models.CharField(max_length=200, null=True, blank=True)),
                ('city', models.CharField(max_length=100, null=True, blank=True)),
                ('state', models.CharField(max_length=100, null=True, blank=True)),
                ('country', models.CharField(max_length=100, null=True, blank=True)),
                ('postalcode', models.CharField(max_length=32, null=True, blank=True)),
                ('person', models.ForeignKey(related_name='addresses', to='person.Person')),
                ('type', models.ForeignKey(to='contact.AddressType')),
            ],
            options={
                'ordering': ('type',),
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='PersonEmail',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('email', models.EmailField(unique=True, max_length=255)),
                ('person', models.ForeignKey(to='person.Person')),
                ('type', models.ForeignKey(to='contact.EmailType')),
            ],
            options={
                'ordering': ('type', 'email'),
                'abstract': False,
            },
        ),
        migrations.RemoveField(
            model_name='address',
            name='location',
        ),
        migrations.RemoveField(
            model_name='address',
            name='person',
        ),
        migrations.RemoveField(
            model_name='address',
            name='type',
        ),
        migrations.RemoveField(
            model_name='email',
            name='location',
        ),
        migrations.RemoveField(
            model_name='email',
            name='person',
        ),
        migrations.RemoveField(
            model_name='email',
            name='type',
        ),
        migrations.DeleteModel(
            name='Address',
        ),
        migrations.DeleteModel(
            name='Email',
        ),
    ]

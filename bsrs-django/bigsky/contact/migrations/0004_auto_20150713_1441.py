# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0002_auto_20150713_1422'),
        ('location', '0002_auto_20150713_1422'),
        ('contact', '0003_auto_20150713_1422'),
    ]

    operations = [
        migrations.CreateModel(
            name='LocationPhoneNumber',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('number', models.CharField(unique=True, max_length=32)),
                ('location', models.ForeignKey(related_name='phone_numbers', blank=True, to='location.Location', null=True)),
                ('type', models.ForeignKey(to='contact.PhoneNumberType')),
            ],
            options={
                'ordering': ('type', 'number'),
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='PersonPhoneNumber',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('number', models.CharField(unique=True, max_length=32)),
                ('person', models.ForeignKey(related_name='phone_numbers', to='person.Person')),
                ('type', models.ForeignKey(to='contact.PhoneNumberType')),
            ],
            options={
                'ordering': ('type', 'number'),
                'abstract': False,
            },
        ),
        migrations.RemoveField(
            model_name='phonenumber',
            name='location',
        ),
        migrations.RemoveField(
            model_name='phonenumber',
            name='person',
        ),
        migrations.RemoveField(
            model_name='phonenumber',
            name='type',
        ),
        migrations.DeleteModel(
            name='PhoneNumber',
        ),
    ]

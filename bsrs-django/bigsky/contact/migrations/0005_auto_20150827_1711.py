# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('contact', '0004_auto_20150818_1436'),
    ]

    operations = [
        migrations.AlterField(
            model_name='address',
            name='deleted',
            field=models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='addresstype',
            name='deleted',
            field=models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='email',
            name='deleted',
            field=models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='emailtype',
            name='deleted',
            field=models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='phonenumber',
            name='deleted',
            field=models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='phonenumbertype',
            name='deleted',
            field=models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True),
        ),
    ]

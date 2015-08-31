# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('util', '0004_delete_state'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customsetting',
            name='deleted',
            field=models.DateTimeField(null=True, blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.'),
        ),
        migrations.AlterField(
            model_name='customsetting',
            name='settings',
            field=models.TextField(blank=True, help_text='JSON Dict saved as a string in DB'),
        ),
        migrations.AlterField(
            model_name='mainsetting',
            name='deleted',
            field=models.DateTimeField(null=True, blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.'),
        ),
        migrations.AlterField(
            model_name='mainsetting',
            name='settings',
            field=models.TextField(blank=True, help_text='JSON Dict saved as a string in DB'),
        ),
        migrations.AlterField(
            model_name='tester',
            name='deleted',
            field=models.DateTimeField(null=True, blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.'),
        ),
    ]

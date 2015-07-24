# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('util', '0001_initial'),
    ]

    operations = [
        migrations.DeleteModel(
            name='Currency',
        ),
        migrations.AlterField(
            model_name='customsetting',
            name='deleted',
            field=models.DateTimeField(help_text=b'If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='mainsetting',
            name='deleted',
            field=models.DateTimeField(help_text=b'If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='tester',
            name='deleted',
            field=models.DateTimeField(help_text=b'If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True, blank=True),
        ),
    ]

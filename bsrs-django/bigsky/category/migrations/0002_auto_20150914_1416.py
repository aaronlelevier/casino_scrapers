# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('category', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='category',
            name='deleted',
            field=models.DateTimeField(null=True, blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.'),
        ),
        migrations.AlterField(
            model_name='category',
            name='label',
            field=models.CharField(null=True, editable=False, blank=True, help_text='This field cannot be set directly.  It is either set from a system setting, or defaulted from the Parent Category.', max_length=100),
        ),
    ]

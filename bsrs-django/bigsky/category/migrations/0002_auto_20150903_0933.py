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
            name='label',
            field=models.CharField(help_text=b'This field cannot be set directly.  It is either set from a system setting, or defaulted from the Parent Category.', max_length=100, null=True, editable=False, blank=True),
        ),
    ]

# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('translation', '0012_auto_20150826_1402'),
        ('person', '0007_auto_20150820_0945'),
    ]

    operations = [
        migrations.AddField(
            model_name='person',
            name='locale',
            field=models.ForeignKey(blank=True, to='translation.Locale', help_text=b"If the Person has not 'Locale', the Accept-Language header will be used or the Site's system setting.", null=True),
        ),
    ]

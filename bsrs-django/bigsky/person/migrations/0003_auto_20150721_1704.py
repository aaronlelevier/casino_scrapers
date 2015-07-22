# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0002_auto_20150721_1701'),
    ]

    operations = [
        migrations.AlterField(
            model_name='person',
            name='covering_user',
            field=models.ForeignKey(related_name='coveringuser', to='person.Person', null=True),
        ),
        migrations.AlterField(
            model_name='person',
            name='next_approver',
            field=models.ForeignKey(related_name='nextapprover', to='person.Person', null=True),
        ),
    ]

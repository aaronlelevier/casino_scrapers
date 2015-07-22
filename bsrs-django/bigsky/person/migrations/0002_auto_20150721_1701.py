# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='coveringuser',
            name='person',
        ),
        migrations.RemoveField(
            model_name='nextapprover',
            name='person',
        ),
        migrations.AddField(
            model_name='person',
            name='covering_user',
            field=models.ForeignKey(related_name='b', to='person.Person', null=True),
        ),
        migrations.AddField(
            model_name='person',
            name='next_approver',
            field=models.ForeignKey(related_name='a', to='person.Person', null=True),
        ),
        migrations.DeleteModel(
            name='CoveringUser',
        ),
        migrations.DeleteModel(
            name='NextApprover',
        ),
    ]

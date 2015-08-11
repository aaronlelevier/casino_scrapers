def update_group(person, group):
    "Will make sure the ``person`` is in one, and only one group."
    for g in person.groups.all():
        person.groups.remove(g)
    person.groups.add(group)
    return person

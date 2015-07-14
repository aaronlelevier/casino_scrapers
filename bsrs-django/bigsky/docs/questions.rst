Questions
=========
1. Does ``TextField`` and ``CharField`` have no overhead difference when indexing?

2. Will ``Role`` be translated w/i the database and have multiple ``Role`` records, 
or will it be translated and archived w/i ".js" files?

3. Full text scan w/i PostgreSQL

4. Take a quick look at Capistrano, and check if it's worth looking at, or use 
SaltStack and work with Bill on putting it on the server

5. Use a ``BaseModel`` w/ ``deleted=False`` kwarg defaulted.

..code-block:: python
    objects = BaseManager()
    objects_all = models.Manager()

6. for ``/util/json_settings/role.json`` are "accept_assign" or "authorized_amount"
needed b/c these fields exist in the Person?


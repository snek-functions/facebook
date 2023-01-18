import json
from sys import argv

import duckdb
import settings as settings

if settings.is_offline:
    con = duckdb.connect(':memory:')
else:
    con = duckdb.connect(database=settings.duckdb_path, read_only=False)

duckdb_cached = settings.duckdb_cached


class DBIO:
    @classmethod
    def create(cls, *args):
        con.execute("DROP TABLE IF EXISTS _blacklist;")
        con.execute(" \
            CREATE TABLE _blacklist( \
                post_id VARCHAR PRIMARY KEY \
            ); \
        ")

        con.execute(" \
            INSERT INTO _blacklist \
            VALUES ('387019078721465_217073037359578'), ('2'), ('3'); \
        ")

        con.execute(
            f"EXPORT DATABASE '{settings.duckdb_data_path}' (FORMAT PARQUET, CODEC 'SNAPPY')"
        )

    @classmethod
    def pull(cls, *args):
        if settings.is_offline:
            con.execute("INSTALL httpfs;")
        con.execute("LOAD httpfs;")

        if settings.s3_access_key_id:
            con.execute(f"SET s3_region='{settings.s3_region}';")
            con.execute(f"SET s3_access_key_id='{settings.s3_access_key_id}';")
            con.execute(
                f"SET s3_secret_access_key='{settings.s3_secret_access_key}';")
        if settings.s3_session_token:
            con.execute(f"SET s3_session_token='{settings.s3_session_token}';")

        # Create a table with all blacklisted posts.
        # Format:
        # page_id | post_id  |
        # VARCHAR | VARCHAR  |
        con.execute("DROP TABLE IF EXISTS _blacklist;")
        con.execute(f" \
            CREATE TABLE '_blacklist' AS \
            SELECT * \
            FROM parquet_scan('{settings.duckdb_data_path}/_blacklist.parquet') \
            ORDER BY post_id; \
        ")

    @classmethod
    def fetch(cls, *args):
        try:
            res = con.execute(" \
                SELECT b.post_id FROM '_blacklist' b \
            ")

            return res.fetchall()

        except:
            return ()

    @classmethod
    def save(cls, *args):
        try:
            con.execute("DROP TABLE IF EXISTS _blacklist;")
            con.execute(" \
                CREATE TABLE _blacklist( \
                    post_id VARCHAR PRIMARY KEY \
                ); \
            ")
            testf = [(x,) for x in json.loads(args[0])['ids']]
            # print(', '.join([str(elem) for elem in testf]))

            # print(f"{[(x,) for x in json.loads(args[0]).ids]}")
            con.execute(" \
                INSERT INTO _blacklist \
                VALUES (?)",
                        (json.loads(args[0])['ids'])
                        )

            con.execute(" \
                INSERT INTO _blacklist \
                VALUES ('387019078721465_217073037359578'), ('2'), ('3'); \
            ")

            con.execute(
                f"EXPORT DATABASE '{settings.duckdb_data_path}' (FORMAT PARQUET, CODEC 'SNAPPY')"
            )
            return True

        except:
            return False

    @ classmethod
    def remove(cls, *args):
        try:

            con.execute(" \
                DELETE FROM _blacklist b \
                WHERE b.post_id=(?::STRING)",
                        (args[0],)
                        )

            return True

        except:
            return False


def commands(cls, cmd):
    return {
        'save': lambda: cls.save,
        'add': lambda: cls.add,
        'remove': lambda: cls.remove,
        'create': lambda: cls.create,
        'fetch': lambda: cls.fetch,
        'pull': lambda: cls.pull,
    }.get(cmd, lambda: cls.help)()


def main(*args):
    out: str = ""

    if args[0] == "fetch":
        DBIO.create()
        fetched = commands(DBIO, args[0])()
        obj = {"ids": [x[0] for x in fetched]}
        out = json.dumps(obj)
    else:
        # print(f"fuck {args}")
        out = f'{commands(DBIO, args[0])(args[1])}'.replace(" ", "")

    print(out)


if __name__ == '__main__':
    main(str(argv[1]), *argv[2:])

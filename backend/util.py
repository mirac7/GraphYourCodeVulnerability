from json import dumps
from git import Git, GitCommandError


def validate_repo_query(query):
    try:
        Git().ls_remote(query)
        return True
    except GitCommandError:
        return False


def json_stream_wrapper(generator):
    for item in generator:
        yield dumps(item)+"\n"

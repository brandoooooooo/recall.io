from typing import Callable

Register = Callable[[str, str, Callable], None]
Route = Callable[[Register, list[Callable]], None]


def wrap_dec(endpoint: Callable, decorators: list[Callable]) -> Callable:
    for dec in decorators:
        endpoint = dec(endpoint)
    return endpoint


def GET(path: str, endpoint: Callable) -> Route:
    return lambda register, decorators: register(
        path, "GET", wrap_dec(endpoint, decorators or [])
    )


def POST(path: str, endpoint: Callable) -> Route:
    return lambda register, decorators: register(
        path, "POST", wrap_dec(endpoint, decorators or [])
    )


def DELETE(path: str, endpoint: Callable) -> Route:
    return lambda register, decorators: register(
        path, "DELETE", wrap_dec(endpoint, decorators or [])
    )


def PUT(path: str, endpoint: Callable) -> Route:
    return lambda register, decorators: register(
        path, "PUT", wrap_dec(endpoint, decorators or [])
    )

from app.utils.base import routes
from app.utils.security import protected

from app.api.creds import cred_routes
from app.api.user import user_routes, user_routes_unprotected
from app.api.chat import chat_routes
from app.api.collection import collection_routes
from app.api.file import file_routes


api_routes = routes(
    ("/creds", cred_routes),
    ("/user", user_routes),
    ("/user", user_routes_unprotected, []),
    ("/file", file_routes),
    ("/chat", chat_routes),
    ("/collection", collection_routes),
    decorators=[protected],
)

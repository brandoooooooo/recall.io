import os
from typing import Callable
from flask import Flask, send_from_directory
from flask_cors import CORS
from app.utils.routes import api_routes
from app.utils.base import session


def init_app() -> Flask:
    app = Flask(__name__, static_folder="../dist")
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # we serve the statically build react app w/ this catch-all and the static_folder
    with app.app_context():

        @app.teardown_appcontext
        def teardown(reason):
            session.remove()

        def register(path: str, method: str, endpoint: Callable):
            app.add_url_rule(
                f"/api/v1{path}",
                f"{method}: /api/v1{path}",
                view_func=endpoint,
                methods=[method],
            )

        api_routes(register)

        @app.route("/", defaults={"path": ""})
        @app.route("/<path:path>")
        def serve(path: str):
            if app.static_folder is None:
                raise Exception("static folder not configured")
            if path != "" and os.path.exists(app.static_folder + "/" + path):
                return send_from_directory(app.static_folder, path)
            else:
                return send_from_directory(app.static_folder, "index.html")

    return app

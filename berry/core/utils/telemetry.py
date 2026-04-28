"""
Telemetry functionality for Berry.
"""

import contextlib
import json
import os
import threading
import uuid

from importlib.metadata import version, PackageNotFoundError
import requests


def get_or_create_uuid():
    try:
        uuid_file_path = os.path.join(
            os.path.expanduser("~"), ".cache", "berry", "telemetry_user_id"
        )
        os.makedirs(
            os.path.dirname(uuid_file_path), exist_ok=True
        )  # Ensure the directory exists

        if os.path.exists(uuid_file_path):
            with open(uuid_file_path, "r") as file:
                return file.read()
        else:
            new_uuid = str(uuid.uuid4())
            with open(uuid_file_path, "w") as file:
                file.write(new_uuid)
            return new_uuid
    except:
        # Non blocking
        return "idk"


user_id = get_or_create_uuid()


def send_telemetry(event_name, properties=None):
    """
    Telemetry is disabled in the Berry Edition.
    """
    pass




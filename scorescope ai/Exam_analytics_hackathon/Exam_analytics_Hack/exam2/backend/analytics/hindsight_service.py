import logging
import os
from typing import Any, Optional
from django.utils import timezone

try:
    from hindsight_client import Hindsight
except:
    Hindsight = None

logger = logging.getLogger(__name__)


class HindsightService:

    def __init__(self):
        self.api_key = os.getenv("HINDSIGHT_API_KEY")
        self.client = None

        if Hindsight:
            try:
                self.client = Hindsight(api_key=self.api_key)
            except:
                logger.exception("Hindsight init failed")

    def _bank(self, user_id):
        return f"user_{user_id}"

    def reflect_chat(self, user, message, study_context=None):
        if not self.client:
            return ""

        try:
            resp = self.client.reflect(
                bank_id=self._bank(user.id),
                query=f"{study_context}\nUser: {message}",
                max_tokens=300
            )
            return getattr(resp, "text", "") or ""
        except:
            return ""

    def retain_chat_exchange(self, user, msg, reply):
        if not self.client:
            return

        try:
            self.client.retain(
                bank_id=self._bank(user.id),
                content=f"{msg} -> {reply}",
                timestamp=timezone.now().isoformat()
            )
        except:
            pass


hindsight_service = HindsightService()
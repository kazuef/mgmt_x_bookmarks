from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        # env_prefix='DIFY_API_KEY_',
        env_file="bookmarks_categorize/env/.env",
        env_file_encoding="utf-8",
    )

    dify_api_key_csv_to_json: str | None = Field(default=None, alias="DIFY_API_KEY_CSV_TO_JSON")
    dify_api_key_categorize_json: str | None = Field(default=None, alias="DIFY_API_KEY_CATEGORIZE_JSON")
    dify_base_url: str | None = Field(default=None, alias="DIFY_BASE_URL")
    dify_user: str | None = Field(default=None, alias="DIFY_USER")

    x_client_id: str | None = Field(default=None, alias="X_CLIENT_ID")
    x_client_secret: str | None = Field(default=None, alias="X_CLIENT_SECRET")
    x_redirect_uri: str | None = Field(default=None, alias="X_REDIRECT_URI")
    x_scopes: list[str] | None = Field(default=None, alias="X_SCOPES")
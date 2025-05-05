FROM python:3.12

# 環境変数を設定（Poetry が仮想環境を作らないように）
ENV POETRY_VERSION=1.8.4 \
    POETRY_VIRTUALENVS_CREATE=false \
    POETRY_NO_INTERACTION=1

# Poetry インストール
RUN pip install --upgrade pip \
    && pip install poetry==$POETRY_VERSION

WORKDIR /app

# Poetryファイルを先にコピー（キャッシュを効かせる）
COPY pyproject.toml poetry.lock* ./

RUN poetry install --no-root

COPY . .

CMD ["uvicorn", "bookmarks_categorize.main:app", "--host", "0.0.0.0", "--port", "8000"]

EXPOSE 8000

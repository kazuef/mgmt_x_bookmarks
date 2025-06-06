import ast
import json
import uuid
from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel
from ..modules.dify import DifyModule
from ..modules.x import XModule
from ..modules.crud import get_or_create_category, insert_bookmark, get_bookmarks_by_category, get_all_categories
from ..schemas.bookmark import Request, Response
from ..config import Settings

class CategoryCreate(BaseModel):
    name: str

router = APIRouter()

settings = Settings()

difyModule = DifyModule(
    dify_api_key_categorize_json = settings.dify_api_key_categorize_json,
    dify_api_key_csv_to_json = settings.dify_api_key_csv_to_json,
    dify_base_url = settings.dify_base_url,
    dify_user = settings.dify_user
)

xModule = XModule(
    client_id = settings.x_client_id,
    client_secret = settings.x_client_secret,
    redirect_uri = settings.x_redirect_uri,
    scopes = settings.x_scopes
)

# , response_model=Response.categorizeBookmark
@router.post("/categorize")
async def categorize_bookmarks(file: UploadFile = File(...)):
    # ファイルの内容を読み込む
    content = await file.read()
    # try:
    bookmarks_json_list = json.loads(content.decode("utf-8"))
    run_workflow_result_list = []
    for bookmark_json in bookmarks_json_list:
        # print(f"type(bookmark_json): \n{type(bookmark_json)}\nEnd")
        bookmark_json_str = json.dumps(bookmark_json, ensure_ascii=False)
        # print(f"len(bookmark_json_str): \n{len(bookmark_json_str)}\nEnd")
        run_workflow_result = difyModule.categorized_json(bookmark_json_str)
        run_workflow_result_list.append(run_workflow_result)

    #　分類結果をbookmark_jsonと統合
    categorized_bookmark_json_list = []
    for i in range(len(run_workflow_result_list)):
        # 理想の形 → {"分類項目1": {"LLM": {bookmarkの中身}}}
        categorized_bookmark_json_result = run_workflow_result_list[i]["data"]["outputs"]["categorized_bookmark_json"]
        categorized_bookmark_json = json.loads(categorized_bookmark_json_result)["分類項目"]
        categorized_bookmark_json_list.append(ast.literal_eval("{ " + f"\"bookmark_category\": \"{categorized_bookmark_json}\", " + f"\"tweet_content\": {bookmarks_json_list[i]}" + "}"))
        # categorized_bookmark_json_list.append(ast.literal_eval("{ " + f"\"分類項目{i+1}\": " + "{" + f"\"{categorized_bookmark_json}\": {bookmarks_json_list[i]}" + "} }"))

    # 分類されたbookmark_jsonをDBに保存
    try:
        for item in categorized_bookmark_json_list:
            category_name = item["bookmark_category"]
            tweet = item["tweet_content"]
            
            # 1. カテゴリ登録 or 取得
            cat_id = get_or_create_category(category_name)
            
            # 2. Bookmark 登録（tweet の中にユニークIDが含まれている前提）
            bookmark_id = str(uuid.uuid4())
            insert_bookmark(bookmark_id, cat_id, tweet)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"データベース保存エラー: {str(e)}")

    return categorized_bookmark_json_list
    #     json_string = json.dumps(json_content, ensure_ascii=False, indent=2)
    #     return {"json_string": json_string}
    # except json.JSONDecodeError:
    #     return {"error": "Invalid JSON file"}

@router.get("/categories")
async def get_categories():
    """全てのカテゴリを取得する"""
    try:
        categories = get_all_categories()
        return {"categories": categories}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"カテゴリ取得エラー: {str(e)}")

@router.get("/")
async def get_bookmarks(category_id: int = None):
    """ブックマークを取得する（カテゴリIDが指定されている場合はそのカテゴリのみ）"""
    try:
        bookmarks = get_bookmarks_by_category(category_id)
        return {"bookmarks": bookmarks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ブックマーク取得エラー: {str(e)}")

@router.post("/categories")
async def create_category(category: CategoryCreate):
    """新しいカテゴリを作成する"""
    try:
        category_id = get_or_create_category(category.name)
        # 作成したカテゴリを取得
        categories = get_all_categories()
        for cat in categories:
            if cat["id"] == category_id:
                return {"category": cat}
        raise HTTPException(status_code=500, detail="カテゴリの作成に成功しましたが、取得に失敗しました")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"カテゴリ作成エラー: {str(e)}")

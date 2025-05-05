import os
import requests
import json
import ast
from dotenv import load_dotenv
import streamlit as st


class DifyModule:

    def __init__(
            self,
            dify_api_key_categorize_json: str,
            dify_api_key_csv_to_json: str,
            dify_base_url: str,
            dify_user: str
        ) -> None:
        self.dify_api_key_categorize_json = dify_api_key_categorize_json
        self.dify_api_key_csv_to_json = dify_api_key_csv_to_json
        self.dify_base_url = dify_base_url
        self.dify_user = dify_user

    def categorized_json(self, bookmark_json: str) -> str:
        '''xのブックマークのJsonファイルをカテゴリごとに分類'''
        target_url = f"{self.dify_base_url}/workflows/run"
        headers = {
            "Authorization": f"Bearer {self.dify_api_key_categorize_json}",
            "Content-Type": "application/json"
        }

        input = {
            # Dify ワークフローの入力フィールド名と一致させる
            "bookmark_json": bookmark_json
        }

        payload = {
            "inputs": input,
            "response_mode": "blocking",
            "user": self.dify_user
        }

        try:
            response = requests.post(target_url, headers=headers, json=payload)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise f"ワークフロー実行エラー: {str(e)}"
            # st.error(f"ワークフロー実行エラー: {str(e)}")
            # return None

    def upload_file(self, file):
        target_url = f"{self.dify_base_url}/files/upload"

        headers = {
            "Authorization": f"Bearer {self.dify_api_key_csv_to_json}",
        }

        try:
            response = requests.post(
                target_url,
                headers=headers,
                files={"file": (file.name, file.read(), file.type)},
                data={"user": self.dify_user},
            )

            if response.status_code == 201:
                return response.json()
            else:
                st.error(f"アップロードエラー: {response.status_code}")
                return None

        except Exception as e:
            raise f"予期しないエラーが発生しました: {str(e)}"
            # st.error(f"予期しないエラーが発生しました: {str(e)}")
            # return None


    def convert_csv_to_json(self, file_id: str) -> str:
        '''xのブックマークのcsvファイルをJson形式に変換'''
        target_url = f"{self.dify_base_url}/workflows/run"
        headers = {
            "Authorization": f"Bearer {self.dify_api_key_csv_to_json}",
            "Content-Type": "application/json"
        }

        input = {
            # Dify ワークフローの入力フィールド名と一致させる
            "bookmark_csv": {
                "type": "document",
                "transfer_method": "local_file",
                "upload_file_id": file_id
            }
        }

        payload = {
            "inputs": input,
            "response_mode": "blocking",
            "user": self.dify_user
        }

        try:
            response = requests.post(target_url, headers=headers, json=payload)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise f"ワークフロー実行エラー: {str(e)}"
            # st.error(f"ワークフロー実行エラー: {str(e)}")
            # return None


    # def categorized_json(self, bookmark_json: str) -> str:
    #     '''xのブックマークのJsonファイルをカテゴリごとに分類'''
    #     target_url = f"{self.DIFY_BASE_URL}/workflows/run"
    #     headers = {
    #         "Authorization": f"Bearer {dify_api_key.categorize_json}",
    #         "Content-Type": "application/json"
    #     }

    #     input = {
    #         # Dify ワークフローの入力フィールド名と一致させる
    #         "bookmark_json": bookmark_json
    #     }

    #     payload = {
    #         "inputs": input,
    #         "response_mode": "blocking",
    #         "user": self.DIFY_USER
    #     }

    #     try:
    #         response = requests.post(target_url, headers=headers, json=payload)
    #         response.raise_for_status()
    #         return response.json()
    #     except requests.exceptions.RequestException as e:
    #         raise f"ワークフロー実行エラー: {str(e)}"
    #         # st.error(f"ワークフロー実行エラー: {str(e)}")
    #         # return None




    
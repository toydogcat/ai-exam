import os
import json

JSON_DIR = "/home/toymsi/documents/examination/json"
DOCS_DIR = "/home/toymsi/documents/examination/Github/ai-exam/docs"

def generate_pages():
    for agency in os.listdir(JSON_DIR):
        agency_path = os.path.join(JSON_DIR, agency)
        if os.path.isdir(agency_path):
            for year in os.listdir(agency_path):
                year_path = os.path.join(agency_path, year)
                if os.path.isdir(year_path):
                    for file in os.listdir(year_path):
                        if file.endswith(".json") and file != "catalog.json":
                            subject = os.path.splitext(file)[0]
                            # Create a slug-friendly filename
                            filename = f"{agency}-{year}-{subject}.md".replace("/", "-").replace(" ", "-")
                            md_path = os.path.join(DOCS_DIR, filename)
                            
                            content = f"""---
layout: page
title: {year} 年 {subject}
pageClass: exam-page
---

<Paper agency="{agency}" year="{year}" subject="{subject}" />
"""
                            with open(md_path, 'w', encoding='utf-8') as f:
                                f.write(content)
                            print(f"Generated: {filename}")

if __name__ == "__main__":
    generate_pages()

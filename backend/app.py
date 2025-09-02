from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
from datetime import datetime

app = Flask(__name__)
CORS(app)  # allow requests from React frontend

# Load dataset
df = pd.read_csv("data.csv")

def check_anomalies(row):
    today = datetime.now().date()
    warranty_end = datetime.strptime(row["WarrantyEnd"], "%Y-%m-%d").date()
    last_inspection = datetime.strptime(row["LastInspection"], "%Y-%m-%d").date()
    
    issues = []
    if today > warranty_end:
        issues.append("Warranty Expired")
    if (today - last_inspection).days > 365:
        issues.append("Inspection Overdue")
    return issues if issues else ["OK"]

def row_with_ai(row):
    r = row.to_dict()
    r["AI_Status"] = check_anomalies(row)
    return r

# Root route for sanity
@app.route("/")
def home():
    return "Flask backend running!"

# Get all items
@app.route("/api/items", methods=["GET"])
def get_all_items():
    items = [row_with_ai(r) for _, r in df.iterrows()]
    return jsonify(items)

# Get single item by ID
@app.route("/api/item/<item_id>", methods=["GET"])
def get_item(item_id):
    row = df.loc[df["ItemID"] == item_id]
    if row.empty:
        return jsonify({"error": "Item not found"}), 404
    return jsonify(row_with_ai(row.iloc[0]))

if __name__ == "__main__":
    app.run(port=5000, debug=True)

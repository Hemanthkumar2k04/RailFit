import csv
import json

with open('asset_import_updated_50.csv', 'r') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

vendors = list(set(r['vendor_id'] for r in rows))

sql = "DO $$\nDECLARE\n"
for i, v in enumerate(vendors):
    sql += f"  v_{i} UUID;\n"
sql += "BEGIN\n"

for i, v in enumerate(vendors):
    safe_v = v.replace("'", "''")
    # We should use ON CONFLICT or just check. Since we don't have constraints, let's just insert them nicely. 
    # But wait, there might be duplicates if we re-run. Let's just insert.
    sql += f"  INSERT INTO vendors (name) SELECT '{safe_v}' WHERE NOT EXISTS (SELECT 1 FROM vendors WHERE name = '{safe_v}');\n"
    sql += f"  SELECT vendor_id INTO v_{i} FROM vendors WHERE name = '{safe_v}' LIMIT 1;\n"

sql += "  INSERT INTO assets (type, location, vendor_id, install_date, warranty_period, health_score, status, condition, metadata) VALUES \n"

val_strings = []
for r in rows:
    v_idx = vendors.index(r['vendor_id'])
    
    # Handle bad row mapping where condition shifted to status or something like Information Board row
    r_status = r['status']
    r_cond = r['condition']
    if r_status not in ['active', 'under_maintenance', 'retired', 'not_installed']:
        r_status = 'retired' # Fallback
        
    if r_cond not in ['excellent', 'good', 'ok', 'critical']:
        if r['health_category'].lower() in ['excellent', 'good', 'ok', 'critical']:
            r_cond = r['health_category'].lower()
        else:
            r_cond = 'good' # Fallback

    meta = {
        "description": r.get('description', ''),
        "serial_number": r.get('serial_number', ''),
        "model": r.get('model', ''),
        "manufacturer": r.get('manufacturer', ''),
        "health_category": r.get('health_category', '')
    }
    meta_str = json.dumps(meta).replace("'", "''")
    safe_loc = r['location'].replace("'", "''")
    
    val_strings.append(f"  ('{r['type']}', '{safe_loc}', v_{v_idx}, '{r['install_date']}', {r['warranty_period']}, {r['health_score']}, '{r_status}', '{r_cond}', '{meta_str}'::jsonb)")

sql += ",\n".join(val_strings) + ";\nEND $$;\n"

with open('insert_assets_from_csv.sql', 'w') as f:
    f.write(sql)
print("SQL generated successfully.")

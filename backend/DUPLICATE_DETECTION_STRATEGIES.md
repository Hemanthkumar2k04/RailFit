# Duplicate Detection Strategies for Asset Import

## Current Issue
The bulk import always creates new assets without checking for existing ones.

## Strategy 1: Serial Number Uniqueness (RECOMMENDED)
- Use serial_number as unique identifier
- Check if asset with same serial_number exists
- Update existing or skip if duplicate found

## Strategy 2: Composite Key Approach
- Check for existing assets using combination of:
  - type + location + model + manufacturer
  - If match found, update existing asset
  - If no match, create new asset

## Strategy 3: User Choice Strategy
- Detect potential duplicates during import
- Present user with options:
  - Skip duplicates
  - Update existing assets
  - Create new assets anyway
  - Merge data

## Strategy 4: Location-Based Deduplication
- For assets in same location with same type
- Check if they might be the same physical asset
- Useful for infrastructure assets that don't move

## Implementation Options:

### Option A: Strict Duplicate Prevention
```python
# Check for existing asset by serial number
existing_asset = await check_existing_asset(serial_number)
if existing_asset:
    # Skip or update existing
    continue
```

### Option B: Smart Merge
```python
# Check multiple criteria
potential_duplicates = await find_potential_duplicates(
    type=asset_type, 
    location=location, 
    serial_number=serial_number
)
if potential_duplicates:
    # Merge or update with new data
    updated_asset = await update_existing_asset(potential_duplicates[0], new_data)
```

### Option C: Import Mode Selection
```python
# Let user choose import behavior
if import_mode == "skip_duplicates":
    # Skip existing assets
elif import_mode == "update_existing":
    # Update existing assets with new data
elif import_mode == "create_anyway":
    # Create new assets regardless
```
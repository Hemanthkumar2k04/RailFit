from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_alerts():
    return [
        {
            "id": 1,
            "type": "Critical",
            "message": "Track misalignment detected near Sector 12.",
            "affected": "Track #45"
        },
        {
            "id": 2,
            "type": "Warning",
            "message": "Inspection overdue by 3 days.",
            "affected": "Bridge #7"
        },
        {
            "id": 3,
            "type": "Critical",
            "message": "Signal failure detected, requires immediate attention.",
            "affected": "Signal Tower A"
        },
        {
            "id": 4,
            "type": "Warning",
            "message": "Unusual vibration levels reported during inspection.",
            "affected": "Track #102"
        },
        {
            "id": 5,
            "type": "Critical",
            "message": "Overheating reported in axle sensor.",
            "affected": "Train Unit 21"
        },
        {
            "id": 6,
            "type": "Warning",
            "message": "Loose fastening detected in sleeper joint.",
            "affected": "Track #78"
        },
    ]

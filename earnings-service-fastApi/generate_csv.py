import csv
import random
from datetime import date, timedelta

def generate_random_date(start_date, end_date):
    time_between_dates = end_date - start_date
    days_between_dates = time_between_dates.days
    random_number_of_days = random.randrange(days_between_dates)
    return start_date + timedelta(days=random_number_of_days)

def main():
    filename = "random_earnings.csv"
    
    # Configuration
    num_records = 100
    platforms = ["Foodpanda", "Bykea", "Uber", "InDrive", "Careem"]
    city = "Lahore"
    city_zones = ["Johar Town", "DHA", "Model Town", "Gulberg", "Bahria Town", "Wapda Town"]
    statuses = ["pending", "verified", "unverifiable", "flagged"]
    
    start_date = date(2025, 1, 1)
    end_date = date(2026, 12, 31)

    headers = [
        "platform", "city", "city_zone", "date", "hours_worked", 
        "gross_earned", "deduction", "net_received", "screenshot_url", "status"
    ]

    with open(filename, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(headers)

        for i in range(num_records):
            platform = random.choice(platforms)
            zone = random.choice(city_zones)
            record_date = generate_random_date(start_date, end_date)
            hours_worked = round(random.uniform(1.0, 12.0), 2)
            
            # Simple logic for payment: ~500 PKR per hour
            hourly_rate = random.uniform(300, 800)
            gross_earned = round(hours_worked * hourly_rate, 2)
            
            # Deductions (e.g., 10% - 20% of gross)
            deduction_pct = random.uniform(0.1, 0.2)
            deduction = round(gross_earned * deduction_pct, 2)
            
            net_received = round(gross_earned - deduction, 2)
            
            # Dummy screenshot
            screenshot_url = f"https://example.com/screenshots/proof_{i+1}.jpg"
            status = random.choice(statuses)

            writer.writerow([
                platform,
                city,
                zone,
                record_date.isoformat(),
                hours_worked,
                gross_earned,
                deduction,
                net_received,
                screenshot_url,
                status
            ])

    print(f"Successfully generated {num_records} records in '{filename}'.")

if __name__ == "__main__":
    main()
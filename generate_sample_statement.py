"""
Generate a realistic sample bank statement PDF for testing the Impendios app.
The PDF format matches what parse_transactions() expects:
  each line = "<date> <description tokens...> <amount>"
"""

from fpdf import FPDF

TRANSACTIONS = [
    # date,       description,                      amount
    ("01/02/2026", "Payroll Direct Deposit",          3250.00),
    ("01/03/2026", "Starbucks Coffee",                -5.75),
    ("01/04/2026", "Kroger Grocery",                  -87.32),
    ("01/05/2026", "Netflix Subscription",            -15.99),
    ("01/06/2026", "Shell Gas Station",               -42.10),
    ("01/07/2026", "Chick Fil A Sandwich",            -9.45),
    ("01/08/2026", "Amazon Purchase Electronics",     -129.99),
    ("01/09/2026", "Monthly Rent Payment",            -1200.00),
    ("01/10/2026", "Electric Bill Payment",           -95.40),
    ("01/10/2026", "ATT Phone Bill",                  -78.00),
    ("01/11/2026", "Uber Ride",                       -14.50),
    ("01/12/2026", "CVS Pharmacy Prescription",       -22.30),
    ("01/13/2026", "Spotify Premium",                 -10.99),
    ("01/14/2026", "Target Store",                    -63.21),
    ("01/15/2026", "Freelance Payment Received",       800.00),
    ("01/16/2026", "Chipotle Burrito Bowl",           -11.25),
    ("01/17/2026", "Gym Membership Monthly",          -29.99),
    ("01/18/2026", "Parking Garage Fee",              -12.00),
    ("01/19/2026", "Walmart Grocery Pickup",          -54.88),
    ("01/20/2026", "Movie Theater Ticket",            -16.50),
    ("01/21/2026", "Doctor Office Visit Copay",       -40.00),
    ("01/22/2026", "Venmo Payment Sent",              -25.00),
    ("01/23/2026", "McDonalds Burger Meal",           -8.99),
    ("01/24/2026", "Water Bill",                      -35.60),
    ("01/25/2026", "Adobe Creative Cloud",            -54.99),
    ("01/26/2026", "Lyft Ride Fare",                  -18.75),
    ("01/27/2026", "Publix Supermarket",              -41.15),
    ("01/28/2026", "Best Buy Electronics",            -199.99),
    ("01/29/2026", "Interest Earned Savings",           4.12),
    ("01/30/2026", "Comcast Xfinity Bill",            -89.00),
    ("01/31/2026", "Taco Bell Drive Thru",            -7.49),
]


def generate_pdf(output_path: str = "sample_bank_statement.pdf"):
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    # Header
    pdf.set_font("Helvetica", "B", 18)
    pdf.cell(0, 12, "First National Bank", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.set_font("Helvetica", "", 12)
    pdf.cell(0, 8, "Monthly Statement  -  January 2026", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.ln(4)

    # Account info
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 6, "Account Holder: Jane Doe", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 6, "Account Number: ****7294", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 6, "Statement Period: 01/01/2026 - 01/31/2026", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(6)

    # Column headers
    pdf.set_font("Helvetica", "B", 10)
    pdf.cell(30, 7, "Date", border="B")
    pdf.cell(110, 7, "Description", border="B")
    pdf.cell(40, 7, "Amount", border="B", align="R")
    pdf.ln()

    # Transaction rows — each line: "date description amount"
    pdf.set_font("Helvetica", "", 10)
    for date, desc, amount in TRANSACTIONS:
        pdf.cell(30, 6, date)
        pdf.cell(110, 6, desc)
        pdf.cell(40, 6, f"{amount:.2f}", align="R")
        pdf.ln()

    pdf.ln(8)
    pdf.set_font("Helvetica", "I", 9)
    pdf.cell(0, 6, "This is a sample statement generated for testing purposes only.", align="C")

    pdf.output(output_path)
    print(f"Sample bank statement saved to: {output_path}")


if __name__ == "__main__":
    generate_pdf()

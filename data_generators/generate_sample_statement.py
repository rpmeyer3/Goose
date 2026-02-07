"""
Generate a realistic sample bank statement PDF for testing the Impendios app.
The PDF format matches what parse_transactions() expects:
  each line = "<date> <description tokens...> <amount>"
"""

from fpdf import FPDF

TRANSACTIONS = [
    # date,       description,                              amount (in Galleons)
    ("01/02/2026", "Ministry Auror Salary",                  450.00),
    ("01/03/2026", "Honeydukes Sweet Shop",                  -3.50),
    ("01/04/2026", "Slug & Jiggers Apothecary",             -27.80),
    ("01/05/2026", "Daily Prophet Subscription",             -2.99),
    ("01/06/2026", "Floo Powder Network Travel",            -12.00),
    ("01/07/2026", "Three Broomsticks Inn",                  -8.75),
    ("01/08/2026", "Quality Quidditch Supplies",            -85.50),
    ("01/09/2026", "Gringotts Vault Rental",               -180.00),
    ("01/10/2026", "Owl Post Service Monthly",              -15.40),
    ("01/10/2026", "WWN Wireless Subscription",              -6.00),
    ("01/11/2026", "Knight Bus Emergency Fare",              -4.50),
    ("01/12/2026", "St Mungos Hospital Treatment",          -35.00),
    ("01/13/2026", "Witch Weekly Magazine",                  -1.99),
    ("01/14/2026", "Madam Malkins Robes",                   -47.30),
    ("01/15/2026", "Freelance Curse Breaking Payment",      250.00),
    ("01/16/2026", "Leaky Cauldron Meal",                    -9.25),
    ("01/17/2026", "Quidditch Match Season Pass",           -42.00),
    ("01/18/2026", "Broomstick Parking Permit",              -8.00),
    ("01/19/2026", "Flourish and Blotts",                   -34.65),
    ("01/20/2026", "Quidditch World Cup Tickets",           -55.00),
    ("01/21/2026", "Madam Pomfrey Consultation",            -25.00),
    ("01/22/2026", "Gringotts Transfer Fee",                 -5.00),
    ("01/23/2026", "Butterbeer at Hogsmeade",                -4.50),
    ("01/24/2026", "Ministry of Magic Fees",                -28.00),
    ("01/25/2026", "Transfiguration Today Subscription",    -12.99),
    ("01/26/2026", "Hogwarts Express Ticket",               -11.00),
    ("01/27/2026", "Eeylops Owl Emporium",                  -16.75),
    ("01/28/2026", "Ollivanders Wand Shop",                -135.00),
    ("01/29/2026", "Gringotts Interest Earned",               7.50),
    ("01/30/2026", "Magical Insurance Premium",             -52.00),
    ("01/31/2026", "Chocolate Frogs Box",                    -3.25),
    ("02/01/2026", "Hogwarts Tuition Payment",            -500.00),
    ("02/02/2026", "Cauldron Thick Copper Purchase",        -21.00),
    ("02/03/2026", "Pepper-Up Potion Prescription",         -14.50),
    ("02/04/2026", "Wizard Chess Set Deluxe",               -29.99),
    ("02/05/2026", "Dragon Hide Boots Protective",          -68.00),
    ("02/06/2026", "Essence of Dittany Bottle",             -31.25),
    ("02/07/2026", "House-elf Service Monthly",             -95.00),
    ("02/08/2026", "Protective Ward Installation",         -175.00),
    ("02/09/2026", "Pumpkin Pasties Dozen",                  -6.50),
    ("02/10/2026", "Wand Registration Renewal",             -18.00),
    ("02/11/2026", "Apparition License Exam",               -12.00),
    ("02/12/2026", "Concert Weird Sisters",                 -45.00),
    ("02/13/2026", "Unicorn Hair from Diagon Alley",        -89.00),
    ("02/14/2026", "Dress Robes Formal Occasion",           -72.50),
    ("02/15/2026", "Prophecy Divination Payment",           185.00),
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

from fpdf import FPDF

# This data will trigger the "Grumpy Goblin" mode in Gemini
TRANSACTIONS = [
    # date,       description,                              amount (in Galleons)
    ("01/02/2026", "Ministry Junior Clerk Salary",           120.00), # Very low income
    ("01/03/2026", "Honeydukes Bulk Sugar Quills",          -45.50), # Reckless sweets
    ("01/04/2026", "Borgin and Burkes Cursed Object",      -350.00), # Dark arts / Suspicious
    ("01/05/2026", "Gringotts Overdraft Penalty",           -50.00), # The Bank is angry
    ("01/06/2026", "Firebolt Supreme Broom Polish",         -85.00), # Luxury vanity
    ("01/07/2026", "Ludo Bagman Gambling Debt",            -500.00), # MASSIVE RECKLESSNESS
    ("01/08/2026", "Quality Quidditch Gold-Plated Kit",    -250.50), # Living beyond means
    ("01/09/2026", "Gringotts Vault Rental (DELINQUENT)",  -180.00),
    ("01/10/2026", "Daily Prophet Late Fee",                -15.40),
    ("01/12/2026", "St Mungos (Self-Inflicted Hex)",       -120.00),
    ("01/14/2026", "Twilfitt and Tatting Silk Robes",      -247.30), # Overpriced clothing
    ("01/16/2026", "Dragon Egg (Illegal Market)",          -800.00), # Huge debt trigger
    ("01/17/2026", "Gringotts Urgent Collections Fee",     -100.00),
    ("01/20/2026", "Weasleys Wizard Wheezes Fireworks",     -95.00),
    ("01/23/2026", "Premium Butterbeer (10 rounds)",        -45.00),
    ("01/25/2026", "Fortune Teller (Scam)",                 -30.00),
    ("01/28/2026", "Gringotts Interest on Debt",            -12.00),
    ("02/01/2026", "Hogwarts Late Tuition Fine",           -500.00),
    ("02/05/2026", "Dragon Hide Boots (Pure Gold)",        -268.00),
    ("02/07/2026", "House-elf Service (Premium Plus)",     -195.00),
]

def generate_pdf(output_path: str = "bad_bank_statement.pdf"):
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    # Header
    pdf.set_font("Helvetica", "B", 18)
    pdf.cell(0, 12, "Gringotts Wizarding Bank", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.set_font("Helvetica", "", 12)
    pdf.cell(0, 8, "FINAL NOTICE - Account Delinquent", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.ln(4)

    # Account info
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 6, "Account Holder: Reckless Wizard", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 6, "Vault Number: ****0001 (Under Observation)", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(6)

    # Column headers
    pdf.set_font("Helvetica", "B", 10)
    pdf.cell(30, 7, "Date", border="B")
    pdf.cell(110, 7, "Description", border="B")
    pdf.cell(40, 7, "Amount", border="B", align="R")
    pdf.ln()

    # Transaction rows
    pdf.set_font("Helvetica", "", 10)
    for date, desc, amount in TRANSACTIONS:
        pdf.cell(30, 6, date)
        pdf.cell(110, 6, desc)
        # Display as negative or positive
        pdf.cell(40, 6, f"{amount:.2f}", align="R")
        pdf.ln()

    pdf.ln(10)
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(200, 0, 0)
    pdf.cell(0, 6, "WARNING: NEGATIVE BALANCE. UNLEASHING THE DRAGONS SHORTLY.", align="C")

    pdf.output(output_path)
    print(f"Bad bank statement saved to: {output_path}")

if __name__ == "__main__":
    generate_pdf()
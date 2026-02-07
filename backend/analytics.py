from typing import List, Dict
from collections import defaultdict
from datetime import datetime
from training_data import get_category_display_name, CATEGORY_INFO


class TransactionAnalytics:
    """
    Analyze categorized transactions and generate insights
    """

    def __init__(self, transactions: List[Dict]):
        self.transactions = transactions

    def get_category_breakdown(self) -> List[Dict]:
        """
        Calculate spending breakdown by category
        """
        category_totals = defaultdict(lambda: {"total": 0, "count": 0, "transactions": []})

        # Calculate totals per category (only debits/expenses)
        for transaction in self.transactions:
            if transaction.get('amount', 0) < 0:  # Only count expenses (negative amounts)
                category = transaction.get('category', 'uncategorized')
                amount = abs(transaction['amount'])

                category_totals[category]['total'] += amount
                category_totals[category]['count'] += 1
                category_totals[category]['transactions'].append(transaction)

        # Calculate total spending
        total_spending = sum(cat['total'] for cat in category_totals.values())

        # Format the breakdown
        breakdown = []
        for category, data in category_totals.items():
            percentage = (data['total'] / total_spending * 100) if total_spending > 0 else 0

            breakdown.append({
                "category": category,
                "category_name": get_category_display_name(category),
                "total_amount": round(data['total'], 2),
                "transaction_count": data['count'],
                "percentage": round(percentage, 2),
                "icon": CATEGORY_INFO.get(category, {}).get('icon', '💰')
            })

        # Sort by total amount descending
        breakdown.sort(key=lambda x: x['total_amount'], reverse=True)

        return breakdown

    def get_top_expenses(self, limit: int = 10) -> List[Dict]:
        """
        Get the largest expenses
        """
        # Filter only debits (negative amounts)
        expenses = [t for t in self.transactions if t.get('amount', 0) < 0]

        # Sort by amount (most negative first)
        expenses.sort(key=lambda x: x['amount'])

        # Return top N with absolute values
        top_expenses = []
        for transaction in expenses[:limit]:
            expense = transaction.copy()
            expense['amount'] = abs(expense['amount'])
            top_expenses.append(expense)

        return top_expenses

    def get_spending_over_time(self) -> Dict:
        """
        Analyze spending patterns over time (by month)
        """
        monthly_spending = defaultdict(float)

        for transaction in self.transactions:
            if transaction.get('amount', 0) < 0 and transaction.get('date'):
                try:
                    # Parse date and get month
                    date_obj = datetime.strptime(transaction['date'], '%Y-%m-%d')
                    month_key = date_obj.strftime('%Y-%m')

                    monthly_spending[month_key] += abs(transaction['amount'])
                except (ValueError, TypeError):
                    continue

        # Format for charting
        timeline = []
        for month, total in sorted(monthly_spending.items()):
            timeline.append({
                "month": month,
                "total": round(total, 2)
            })

        return {
            "timeline": timeline,
            "total_months": len(timeline)
        }

    def get_daily_average(self) -> float:
        """
        Calculate average daily spending
        """
        if not self.transactions:
            return 0.0

        # Get date range
        dates = [t['date'] for t in self.transactions if t.get('date')]
        if not dates:
            return 0.0

        try:
            start_date = datetime.strptime(min(dates), '%Y-%m-%d')
            end_date = datetime.strptime(max(dates), '%Y-%m-%d')
            days = (end_date - start_date).days + 1

            # Calculate total spending (debits only)
            total_spending = sum(abs(t['amount']) for t in self.transactions if t.get('amount', 0) < 0)

            return round(total_spending / days, 2) if days > 0 else 0.0
        except (ValueError, TypeError):
            return 0.0

    def get_category_trends(self) -> List[Dict]:
        """
        Get top 5 categories with their trends
        """
        breakdown = self.get_category_breakdown()

        # Return top 5 categories
        return breakdown[:5]

    def get_insights(self) -> List[str]:
        """
        Generate automatic insights from the data
        """
        insights = []

        breakdown = self.get_category_breakdown()

        if breakdown:
            # Top spending category
            top_category = breakdown[0]
            insights.append(
                f"Your highest expense category is {top_category['category_name']}, "
                f"accounting for {top_category['percentage']}% of total spending "
                f"({top_category['transaction_count']} transactions)."
            )

            # Check if any category dominates
            if top_category['percentage'] > 40:
                insights.append(
                    f"⚠️ {top_category['category_name']} represents a significant portion "
                    f"of your spending. Consider reviewing these expenses."
                )

            # Check for high transaction count categories
            high_frequency = [c for c in breakdown if c['transaction_count'] > 10]
            if high_frequency:
                insights.append(
                    f"You made frequent purchases in: {', '.join([c['category_name'] for c in high_frequency[:3]])}."
                )

        # Daily average
        daily_avg = self.get_daily_average()
        if daily_avg > 0:
            insights.append(
                f"Your average daily spending is {daily_avg} Galleons."
            )

        # Top single expense
        top_expenses = self.get_top_expenses(1)
        if top_expenses:
            top = top_expenses[0]
            insights.append(
                f"Your largest expense was {top['amount']} Galleons on {top['description']}."
            )

        return insights

    def get_complete_analysis(self) -> Dict:
        """
        Get comprehensive analysis of all transactions
        """
        return {
            "category_breakdown": self.get_category_breakdown(),
            "top_expenses": self.get_top_expenses(10),
            "spending_timeline": self.get_spending_over_time(),
            "daily_average": self.get_daily_average(),
            "insights": self.get_insights(),
            "total_transactions": len(self.transactions),
            "total_categories": len(self.get_category_breakdown())
        }


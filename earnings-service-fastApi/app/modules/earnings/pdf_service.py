from datetime import datetime
from html import escape
import importlib

from app.modules.earnings.schemas import WorkerDashboardResponse


class EarningsPdfService:
    @staticmethod
    def _format_currency(value: float) -> str:
        return f"PKR {value:,.2f}"

    @staticmethod
    def _format_percentage(value: float) -> str:
        return f"{value:,.2f}%"

    @staticmethod
    def _build_html(
        dashboard: WorkerDashboardResponse,
        platform: str | None,
        start_date: str | None,
        end_date: str | None,
    ) -> str:
        selected_platform = platform or "All Platforms"
        selected_start = start_date or "Beginning"
        selected_end = end_date or "Today"

        trend_rows = "".join(
            (
                "<tr>"
                f"<td>{escape(item.period)}</td>"
                f"<td>{EarningsPdfService._format_currency(item.net)}</td>"
                f"<td>{EarningsPdfService._format_currency(item.effective_hourly_rate)}/hr</td>"
                "</tr>"
            )
            for item in dashboard.earning_trend
        )

        platform_rows = "".join(
            (
                "<tr>"
                f"<td>{escape(item.platform)}</td>"
                f"<td>{EarningsPdfService._format_percentage(item.avg_commission_rate)}</td>"
                f"<td>{EarningsPdfService._format_currency(item.total_earned)}</td>"
                "</tr>"
            )
            for item in dashboard.platform_breakdown
        )

        if not trend_rows:
            trend_rows = '<tr><td colspan="3">No trend data available.</td></tr>'

        if not platform_rows:
            platform_rows = '<tr><td colspan="3">No platform breakdown available.</td></tr>'

        return f"""
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Worker Dashboard Report</title>
    <style>
      body {{
        font-family: Arial, sans-serif;
        color: #0f172a;
        margin: 32px;
      }}
      .header {{
        border-bottom: 2px solid #cbd5e1;
        padding-bottom: 12px;
        margin-bottom: 20px;
      }}
      .title {{
        font-size: 24px;
        font-weight: 700;
        margin: 0;
      }}
      .subtitle {{
        margin: 6px 0 0 0;
        color: #475569;
        font-size: 12px;
      }}
      .grid {{
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin: 16px 0 24px 0;
      }}
      .card {{
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 12px;
      }}
      .label {{
        color: #64748b;
        font-size: 12px;
        margin-bottom: 6px;
      }}
      .value {{
        font-size: 16px;
        font-weight: 700;
      }}
      h2 {{
        margin: 22px 0 10px 0;
        font-size: 16px;
      }}
      table {{
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
      }}
      th, td {{
        border: 1px solid #e2e8f0;
        padding: 8px;
        text-align: left;
      }}
      th {{
        background: #f8fafc;
      }}
      .muted {{
        color: #64748b;
      }}
      .footer {{
        margin-top: 20px;
        font-size: 11px;
        color: #64748b;
      }}
    </style>
  </head>
  <body>
    <div class="header">
      <p class="title">Earnings Analytics Report</p>
      <p class="subtitle">Platform: {escape(selected_platform)} | Range: {escape(selected_start)} to {escape(selected_end)}</p>
      <p class="subtitle">Generated at: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC</p>
    </div>

    <div class="grid">
      <div class="card">
        <div class="label">Verified Net</div>
        <div class="value">{EarningsPdfService._format_currency(dashboard.summary.total_verified_net)}</div>
      </div>
      <div class="card">
        <div class="label">Current Hourly Rate</div>
        <div class="value">{EarningsPdfService._format_currency(dashboard.summary.current_hourly_rate)}/hr</div>
      </div>
      <div class="card">
        <div class="label">City Benchmark ({escape(dashboard.benchmarks.city)})</div>
        <div class="value">{EarningsPdfService._format_currency(dashboard.benchmarks.city_median)}/hr</div>
      </div>
      <div class="card">
        <div class="label">Benchmark Status</div>
        <div class="value">{escape(dashboard.benchmarks.status)}</div>
      </div>
    </div>

    <h2>Platform Breakdown</h2>
    <table>
      <thead>
        <tr>
          <th>Platform</th>
          <th>Avg Commission Rate</th>
          <th>Total Earned</th>
        </tr>
      </thead>
      <tbody>
        {platform_rows}
      </tbody>
    </table>

    <h2>Earning Trend</h2>
    <table>
      <thead>
        <tr>
          <th>Period</th>
          <th>Net</th>
          <th>Effective Hourly Rate</th>
        </tr>
      </thead>
      <tbody>
        {trend_rows}
      </tbody>
    </table>

    <p class="footer muted">This report is generated from Worker Dashboard analytics data.</p>
  </body>
</html>
"""

    @staticmethod
    async def generate_worker_dashboard_pdf(
        dashboard: WorkerDashboardResponse,
        platform: str | None,
        start_date: str | None,
        end_date: str | None,
    ) -> bytes:
        async_playwright = importlib.import_module("playwright.async_api").async_playwright

        html = EarningsPdfService._build_html(
            dashboard=dashboard,
            platform=platform,
            start_date=start_date,
            end_date=end_date,
        )

        async with async_playwright() as playwright:
            browser = await playwright.chromium.launch()
            page = await browser.new_page()
            await page.set_content(html, wait_until="networkidle")
            pdf_bytes = await page.pdf(
                format="A4",
                print_background=True,
                margin={"top": "20mm", "right": "12mm", "bottom": "20mm", "left": "12mm"},
            )
            await browser.close()

        return pdf_bytes

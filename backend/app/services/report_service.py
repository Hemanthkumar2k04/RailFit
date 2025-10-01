"""
Report Service for generating comprehensive PDF reports
Generates various asset management reports including:
- Summary Report
- Health & Maintenance Report  
- Traceability Report
- Utilization & Performance Report
"""

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak, Image
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from io import BytesIO
from datetime import datetime
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)


class ReportService:
    """Service for generating comprehensive asset management reports"""
    
    @staticmethod
    def generate_comprehensive_report(
        assets: List[Dict[str, Any]], 
        vendors: List[Dict[str, Any]],
        inspections: List[Dict[str, Any]],
        alerts: List[Dict[str, Any]],
        report_type: str = "comprehensive"
    ) -> BytesIO:
        """
        Generate a comprehensive PDF report with multiple sections
        
        Args:
            assets: List of asset dictionaries
            vendors: List of vendor dictionaries
            inspections: List of inspection dictionaries
            alerts: List of alert dictionaries
            report_type: Type of report to generate
            
        Returns:
            BytesIO: PDF file in memory
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72,
                              topMargin=72, bottomMargin=18)
        
        # Container for the 'Flowable' objects
        elements = []
        
        # Define styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=12,
            spaceBefore=12,
            fontName='Helvetica-Bold'
        )
        
        subheading_style = ParagraphStyle(
            'CustomSubHeading',
            parent=styles['Heading3'],
            fontSize=12,
            textColor=colors.HexColor('#374151'),
            spaceAfter=8,
            fontName='Helvetica-Bold'
        )
        
        # Add title
        title = Paragraph("RailFit Asset Management Report", title_style)
        elements.append(title)
        
        # Add report metadata
        report_date = datetime.now().strftime("%B %d, %Y at %I:%M %p")
        meta_text = f"<b>Generated:</b> {report_date}<br/><b>Report Type:</b> Comprehensive Asset Analysis"
        elements.append(Paragraph(meta_text, styles['Normal']))
        elements.append(Spacer(1, 20))
        
        # 1. SUMMARY REPORT
        elements.extend(ReportService._generate_summary_section(assets, heading_style, subheading_style))
        elements.append(PageBreak())
        
        # 2. HEALTH & MAINTENANCE REPORT
        elements.extend(ReportService._generate_health_maintenance_section(
            assets, inspections, alerts, heading_style, subheading_style
        ))
        elements.append(PageBreak())
        
        # 3. TRACEABILITY REPORT
        elements.extend(ReportService._generate_traceability_section(
            assets, vendors, heading_style, subheading_style
        ))
        elements.append(PageBreak())
        
        # 4. UTILIZATION & PERFORMANCE REPORT
        elements.extend(ReportService._generate_utilization_performance_section(
            assets, heading_style, subheading_style
        ))
        
        # Build PDF
        doc.build(elements)
        buffer.seek(0)
        return buffer
    
    @staticmethod
    def _generate_summary_section(assets: List[Dict], heading_style, subheading_style) -> List:
        """Generate Summary Report section"""
        elements = []
        styles = getSampleStyleSheet()
        
        elements.append(Paragraph("1. Summary Report", heading_style))
        elements.append(Spacer(1, 12))
        
        # Total assets
        total_assets = len(assets)
        elements.append(Paragraph(f"<b>Total Assets:</b> {total_assets}", styles['Normal']))
        elements.append(Spacer(1, 12))
        
        # Categorize by type
        type_counts = {}
        for asset in assets:
            asset_type = asset.get('type', 'Unknown')
            type_counts[asset_type] = type_counts.get(asset_type, 0) + 1
        
        # Type breakdown table
        elements.append(Paragraph("Assets by Type", subheading_style))
        type_data = [['Asset Type', 'Count', 'Percentage']]
        for asset_type, count in sorted(type_counts.items(), key=lambda x: x[1], reverse=True):
            percentage = (count / total_assets * 100) if total_assets > 0 else 0
            type_data.append([asset_type, str(count), f"{percentage:.1f}%"])
        
        type_table = Table(type_data, colWidths=[3*inch, 1.5*inch, 1.5*inch])
        type_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3b82f6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(type_table)
        elements.append(Spacer(1, 20))
        
        # Categorize by region/location
        region_counts = {}
        for asset in assets:
            region = asset.get('region', 'Unknown')
            region_counts[region] = region_counts.get(region, 0) + 1
        
        elements.append(Paragraph("Assets by Region", subheading_style))
        region_data = [['Region', 'Count', 'Percentage']]
        for region, count in sorted(region_counts.items(), key=lambda x: x[1], reverse=True)[:10]:
            percentage = (count / total_assets * 100) if total_assets > 0 else 0
            region_data.append([region, str(count), f"{percentage:.1f}%"])
        
        region_table = Table(region_data, colWidths=[3*inch, 1.5*inch, 1.5*inch])
        region_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#10b981')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(region_table)
        elements.append(Spacer(1, 20))
        
        # Categorize by status
        status_counts = {}
        for asset in assets:
            status = asset.get('status', 'unknown')
            status_counts[status] = status_counts.get(status, 0) + 1
        
        elements.append(Paragraph("Assets by Status", subheading_style))
        status_data = [['Status', 'Count', 'Percentage']]
        for status, count in sorted(status_counts.items(), key=lambda x: x[1], reverse=True):
            percentage = (count / total_assets * 100) if total_assets > 0 else 0
            status_display = status.replace('_', ' ').title()
            status_data.append([status_display, str(count), f"{percentage:.1f}%"])
        
        status_table = Table(status_data, colWidths=[3*inch, 1.5*inch, 1.5*inch])
        status_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f59e0b')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(status_table)
        
        return elements
    
    @staticmethod
    def _generate_health_maintenance_section(
        assets: List[Dict], 
        inspections: List[Dict],
        alerts: List[Dict],
        heading_style, 
        subheading_style
    ) -> List:
        """Generate Health & Maintenance Report section"""
        elements = []
        styles = getSampleStyleSheet()
        
        elements.append(Paragraph("2. Health & Maintenance Report", heading_style))
        elements.append(Spacer(1, 12))
        
        # Health score distribution
        health_categories = {'Excellent': 0, 'Good': 0, 'Fair': 0, 'Critical': 0, 'Unknown': 0}
        for asset in assets:
            health_score = asset.get('health_score')
            if health_score is None:
                health_categories['Unknown'] += 1
            elif health_score >= 90:
                health_categories['Excellent'] += 1
            elif health_score >= 75:
                health_categories['Good'] += 1
            elif health_score >= 50:
                health_categories['Fair'] += 1
            else:
                health_categories['Critical'] += 1
        
        elements.append(Paragraph("Health Score Distribution", subheading_style))
        health_data = [['Health Category', 'Count', 'Percentage']]
        total = len(assets)
        for category, count in health_categories.items():
            if count > 0:
                percentage = (count / total * 100) if total > 0 else 0
                health_data.append([category, str(count), f"{percentage:.1f}%"])
        
        health_table = Table(health_data, colWidths=[3*inch, 1.5*inch, 1.5*inch])
        health_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#8b5cf6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(health_table)
        elements.append(Spacer(1, 20))
        
        # Assets due for inspection
        elements.append(Paragraph("Inspection Status", subheading_style))
        total_inspections = len(inspections)
        recent_inspections = sum(1 for i in inspections if i.get('inspection_date'))
        elements.append(Paragraph(f"<b>Total Inspections Completed:</b> {total_inspections}", styles['Normal']))
        elements.append(Paragraph(f"<b>Assets Inspected:</b> {len(set(i.get('asset_id') for i in inspections if i.get('asset_id')))}", styles['Normal']))
        elements.append(Spacer(1, 12))
        
        # Critical alerts
        elements.append(Paragraph("Active Alerts", subheading_style))
        alert_priority = {'high': 0, 'medium': 0, 'low': 0}
        for alert in alerts:
            priority = alert.get('priority', 'low')
            alert_priority[priority] = alert_priority.get(priority, 0) + 1
        
        alert_data = [['Priority', 'Count']]
        alert_data.append(['High Priority', str(alert_priority.get('high', 0))])
        alert_data.append(['Medium Priority', str(alert_priority.get('medium', 0))])
        alert_data.append(['Low Priority', str(alert_priority.get('low', 0))])
        alert_data.append(['Total Alerts', str(len(alerts))])
        
        alert_table = Table(alert_data, colWidths=[4*inch, 2*inch])
        alert_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#ef4444')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#fee2e2'))
        ]))
        elements.append(alert_table)
        elements.append(Spacer(1, 20))
        
        # Predictive maintenance
        elements.append(Paragraph("Predictive Maintenance Insights", subheading_style))
        rul_categories = {'Immediate Attention (<30 days)': 0, 'Short Term (30-90 days)': 0, 'Long Term (>90 days)': 0}
        for asset in assets:
            rul = asset.get('predicted_rul')
            if rul is not None:
                if rul < 1:  # months
                    rul_categories['Immediate Attention (<30 days)'] += 1
                elif rul < 3:
                    rul_categories['Short Term (30-90 days)'] += 1
                else:
                    rul_categories['Long Term (>90 days)'] += 1
        
        for category, count in rul_categories.items():
            elements.append(Paragraph(f"<b>{category}:</b> {count} assets", styles['Normal']))
        
        return elements
    
    @staticmethod
    def _generate_traceability_section(
        assets: List[Dict],
        vendors: List[Dict],
        heading_style,
        subheading_style
    ) -> List:
        """Generate Traceability Report section"""
        elements = []
        styles = getSampleStyleSheet()
        
        elements.append(Paragraph("3. Traceability Report", heading_style))
        elements.append(Spacer(1, 12))
        
        # Vendor mapping
        elements.append(Paragraph("Vendor/Supplier Mapping", subheading_style))
        vendor_dict = {v.get('vendor_id', v.get('id')): v.get('name', 'Unknown') for v in vendors}
        vendor_counts = {}
        for asset in assets:
            vendor_id = asset.get('vendor_id')
            vendor_name = vendor_dict.get(vendor_id, 'Unknown Vendor')
            vendor_counts[vendor_name] = vendor_counts.get(vendor_name, 0) + 1
        
        vendor_data = [['Vendor/Supplier', 'Assets Count', 'Percentage']]
        total = len(assets)
        for vendor, count in sorted(vendor_counts.items(), key=lambda x: x[1], reverse=True)[:15]:
            percentage = (count / total * 100) if total > 0 else 0
            vendor_data.append([vendor, str(count), f"{percentage:.1f}%"])
        
        vendor_table = Table(vendor_data, colWidths=[3*inch, 1.5*inch, 1.5*inch])
        vendor_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#06b6d4')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige)
        ]))
        elements.append(vendor_table)
        elements.append(Spacer(1, 20))
        
        # Installation sites
        elements.append(Paragraph("Installation Sites", subheading_style))
        location_counts = {}
        for asset in assets:
            location = asset.get('location', 'Unknown')
            # Limit location string length
            location = location[:50] + '...' if len(location) > 50 else location
            location_counts[location] = location_counts.get(location, 0) + 1
        
        location_data = [['Installation Site', 'Assets Count']]
        for location, count in sorted(location_counts.items(), key=lambda x: x[1], reverse=True)[:15]:
            location_data.append([location, str(count)])
        
        location_table = Table(location_data, colWidths=[4.5*inch, 1.5*inch])
        location_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#14b8a6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige)
        ]))
        elements.append(location_table)
        elements.append(Spacer(1, 20))
        
        # Lifecycle history
        elements.append(Paragraph("Lifecycle Overview", subheading_style))
        current_year = datetime.now().year
        install_years = {}
        for asset in assets:
            install_date = asset.get('install_date')
            if install_date:
                try:
                    year = datetime.fromisoformat(install_date.replace('Z', '+00:00')).year
                    install_years[year] = install_years.get(year, 0) + 1
                except:
                    pass
        
        if install_years:
            lifecycle_data = [['Installation Year', 'Assets Installed']]
            for year in sorted(install_years.keys(), reverse=True):
                lifecycle_data.append([str(year), str(install_years[year])])
            
            lifecycle_table = Table(lifecycle_data, colWidths=[3*inch, 3*inch])
            lifecycle_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#a855f7')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige)
            ]))
            elements.append(lifecycle_table)
        
        return elements
    
    @staticmethod
    def _generate_utilization_performance_section(
        assets: List[Dict],
        heading_style,
        subheading_style
    ) -> List:
        """Generate Utilization & Performance Report section"""
        elements = []
        styles = getSampleStyleSheet()
        
        elements.append(Paragraph("4. Utilization & Performance Report", heading_style))
        elements.append(Spacer(1, 12))
        
        # Assets in use vs idle
        elements.append(Paragraph("Asset Utilization Status", subheading_style))
        status_usage = {
            'active': 0,
            'under_maintenance': 0,
            'retired': 0,
            'not_installed': 0
        }
        for asset in assets:
            status = asset.get('status', 'unknown')
            if status in status_usage:
                status_usage[status] += 1
        
        total = len(assets)
        usage_data = [['Status', 'Count', 'Percentage']]
        usage_data.append(['Active (In Use)', str(status_usage['active']), 
                          f"{(status_usage['active']/total*100) if total > 0 else 0:.1f}%"])
        usage_data.append(['Under Maintenance', str(status_usage['under_maintenance']),
                          f"{(status_usage['under_maintenance']/total*100) if total > 0 else 0:.1f}%"])
        usage_data.append(['Retired (Idle)', str(status_usage['retired']),
                          f"{(status_usage['retired']/total*100) if total > 0 else 0:.1f}%"])
        usage_data.append(['Not Installed (Idle)', str(status_usage['not_installed']),
                          f"{(status_usage['not_installed']/total*100) if total > 0 else 0:.1f}%"])
        
        usage_table = Table(usage_data, colWidths=[3*inch, 1.5*inch, 1.5*inch])
        usage_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2563eb')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige)
        ]))
        elements.append(usage_table)
        elements.append(Spacer(1, 20))
        
        # Performance efficiency metrics
        elements.append(Paragraph("Performance Efficiency Metrics", subheading_style))
        
        # Calculate average health score
        health_scores = [a.get('health_score') for a in assets if a.get('health_score') is not None]
        avg_health = sum(health_scores) / len(health_scores) if health_scores else 0
        
        # Calculate condition distribution
        condition_counts = {}
        for asset in assets:
            condition = asset.get('condition', 'unknown')
            condition_counts[condition] = condition_counts.get(condition, 0) + 1
        
        metrics_text = f"""
        <b>Average Health Score:</b> {avg_health:.1f}/100<br/>
        <b>Assets in Excellent Condition:</b> {condition_counts.get('excellent', 0)}<br/>
        <b>Assets in Good Condition:</b> {condition_counts.get('good', 0)}<br/>
        <b>Assets in OK Condition:</b> {condition_counts.get('ok', 0)}<br/>
        <b>Assets in Critical Condition:</b> {condition_counts.get('critical', 0)}<br/>
        <b>Overall Utilization Rate:</b> {(status_usage['active']/total*100) if total > 0 else 0:.1f}%<br/>
        <b>Maintenance Rate:</b> {(status_usage['under_maintenance']/total*100) if total > 0 else 0:.1f}%
        """
        elements.append(Paragraph(metrics_text, styles['Normal']))
        elements.append(Spacer(1, 20))
        
        # Performance by type
        elements.append(Paragraph("Performance by Asset Type", subheading_style))
        type_performance = {}
        for asset in assets:
            asset_type = asset.get('type', 'Unknown')
            health_score = asset.get('health_score')
            if health_score is not None:
                if asset_type not in type_performance:
                    type_performance[asset_type] = []
                type_performance[asset_type].append(health_score)
        
        perf_data = [['Asset Type', 'Avg Health Score', 'Count']]
        for asset_type, scores in sorted(type_performance.items()):
            avg_score = sum(scores) / len(scores) if scores else 0
            perf_data.append([asset_type, f"{avg_score:.1f}", str(len(scores))])
        
        perf_table = Table(perf_data, colWidths=[3*inch, 1.5*inch, 1.5*inch])
        perf_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#7c3aed')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige)
        ]))
        elements.append(perf_table)
        
        # Add footer
        elements.append(Spacer(1, 30))
        footer_text = f"<i>Report generated by RailFit Asset Management System on {datetime.now().strftime('%Y-%m-%d')}</i>"
        elements.append(Paragraph(footer_text, styles['Normal']))
        
        return elements

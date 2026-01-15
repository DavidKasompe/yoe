from django.core.management.base import BaseCommand
from analytics.services.grid_service import GridService
from analytics.services.analytics import AnalyticsService

class Command(BaseCommand):
    help = 'Ingest and analyze a match from GRID (or mock)'

    def add_arguments(self, parser):
        parser.add_argument('match_id', type=str, help='The GRID Match ID to ingest')

    def handle(self, *args, **options):
        match_id = options['match_id']
        
        self.stdout.write(f"Starting ingestion pipeline for match {match_id}...")
        
        # 1. Ingest
        grid_service = GridService()
        match = grid_service.ingest_match(match_id)
        
        self.stdout.write(self.style.SUCCESS(f"Successfully ingested Match {match.id} (GRID: {match.grid_match_id})"))
        
        # 2. Analyze
        self.stdout.write("Running analytics & AI pipeline...")
        analytics_service = AnalyticsService()
        analytics_service.analyze_match(match)
        
        self.stdout.write(self.style.SUCCESS("Analysis complete. Insights generated."))

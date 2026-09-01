/**
 * Standalone CLI Runner for SEO Audit
 * Usage: npm run seo:audit
 */
import { SeoAuditService } from './SeoAuditService';

async function main() {
  console.log('🔍 Starting Comprehensive AetherPix SEO & Tool Metadata Audit...');
  try {
    const summary = await SeoAuditService.runFirestoreAudit(true);
    console.log('\n==================================================');
    console.log(`📊 SEO AUDIT SUMMARY`);
    console.log(`- Overall Health Score:    ${summary.overallHealthScore}/100`);
    console.log(`- Total Items Audited:     ${summary.totalScanned}`);
    console.log(`- Optimized Perfect Items: ${summary.optimizedCount}`);
    console.log(`- Critical Issues:         ${summary.criticalIssuesCount}`);
    console.log(`- Warning Issues:          ${summary.warningsCount}`);
    console.log('==================================================\n');

    if (summary.criticalIssuesCount > 0) {
      console.log(`⚠️ Found items with critical issues:`);
      summary.items
        .filter((i) => i.issues.some((iss) => iss.severity === 'critical'))
        .slice(0, 10)
        .forEach((item) => {
          console.log(`  • [${item.route}] ${item.name || item.metaStatus?.metaTitle || item.slug}`);
          item.issues
            .filter((iss) => iss.severity === 'critical')
            .forEach((iss) => console.log(`      ✕ ${iss.message}`));
        });
    } else {
      console.log('✅ All tools, blog posts, and routes pass SEO validation successfully!');
    }
  } catch (err: any) {
    console.error('Audit encountered an issue:', err.message || err);
  } finally {
    process.exit(0);
  }
}

main();


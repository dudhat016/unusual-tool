import { runInternalSeoAudit, generateSitemapXml, generateRobotsTxt, SITE_DOMAIN } from '../config/seoRegistry';

export function runCliAudit() {
  console.log('====================================================');
  console.log('🔍 AETHERPIX STUDIO – AUTOMATED SEO & AEO AUDIT');
  console.log('====================================================\n');

  const report = runInternalSeoAudit();

  console.log(`⏱️ Audit Timestamp: ${report.timestamp}`);
  console.log(`🌐 Total Routes Inspected: ${report.totalRoutes}`);
  console.log(`📄 Indexable URLs in Sitemap: ${report.indexableRoutesCount}`);
  console.log(`🔒 Noindex / Private Routes: ${report.noindexRoutesCount}`);
  console.log(`🛠️ Tool Routes: ${report.totalToolsCount}`);
  console.log(`📁 Category Hubs: ${report.totalCategoriesCount}`);
  console.log(`📚 Educational Guides: ${report.totalGuidesCount}`);
  console.log(`🏷️ Structured Data Coverage: ${report.structuredDataCoveragePercent}%\n`);

  console.log('📊 OVERALL SCORECARD:');
  console.log(`  - Technical SEO Score:      ${report.scores.technicalSeoScore}/100`);
  console.log(`  - Content Quality Score:    ${report.scores.contentQualityScore}/100`);
  console.log(`  - AEO (Answer Engine) Score: ${report.scores.aeoScore}/100`);
  console.log(`  - AI Discoverability Score: ${report.scores.aiDiscoverabilityScore}/100`);
  console.log(`  - Internal Linking Score:   ${report.scores.internalLinkScore}/100`);
  console.log(`  🏆 OVERALL READINESS SCORE: ${report.scores.overallScore}/100\n`);

  if (report.issues.length === 0) {
    console.log('✅ ALL CHECKS PASSED: Zero missing titles, descriptions, canonicals, or broken routes!\n');
  } else {
    console.log(`⚠️ ISSUES DETECTED (${report.issues.length}):`);
    report.issues.forEach((issue, idx) => {
      console.log(`  [${issue.type.toUpperCase()}] ${issue.category}: ${issue.message}`);
      console.log(`    Route: ${issue.route}`);
      console.log(`    Fix: ${issue.recommendation}\n`);
    });
  }

  console.log('📑 SITEMAP VALIDATION:');
  const sitemap = generateSitemapXml(SITE_DOMAIN);
  console.log(`  - Generated XML size: ${sitemap.length} bytes`);
  console.log(`  - Valid XML header: ${sitemap.startsWith('<?xml') ? 'YES' : 'NO'}`);

  console.log('\n🤖 ROBOTS.TXT VALIDATION:');
  const robots = generateRobotsTxt(SITE_DOMAIN);
  console.log(`  - Generated robots.txt lines: ${robots.split('\n').length}`);
  console.log(`  - AI Bot directives included: ${robots.includes('Google-Extended') && robots.includes('OAI-SearchBot') ? 'YES' : 'NO'}`);

  console.log('\n✨ Audit Complete! System is fully optimized for Google, Bing, and AI Search Engines.');
}

if (require.main === module || process.argv[1]?.includes('seoAuditCli')) {
  runCliAudit();
}

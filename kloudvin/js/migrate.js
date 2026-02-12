/* ================================================================
   KloudVin — Data Migration Utility
   Migrate articles from localStorage to Azure SQL Database
   
   Usage: Open browser console and run: migrateLocalStorageToDatabase()
   ================================================================ */

/**
 * Migrate articles from localStorage to Azure SQL Database
 * This function reads articles from localStorage and saves them to the database
 */
async function migrateLocalStorageToDatabase() {
  console.log('🚀 Starting migration from localStorage to Azure SQL Database...');
  
  // Check if db.js functions are available
  if (typeof createArticle !== 'function') {
    console.error('❌ Error: db.js not loaded. Make sure the page includes db.js');
    return;
  }
  
  // Get articles from localStorage
  const localArticles = localStorage.getItem('kloudvin_articles');
  
  if (!localArticles) {
    console.log('ℹ️ No articles found in localStorage');
    return;
  }
  
  let articles;
  try {
    articles = JSON.parse(localArticles);
  } catch (error) {
    console.error('❌ Error parsing localStorage data:', error);
    return;
  }
  
  if (!Array.isArray(articles) || articles.length === 0) {
    console.log('ℹ️ No articles to migrate');
    return;
  }
  
  console.log(`📦 Found ${articles.length} articles in localStorage`);
  
  let successCount = 0;
  let errorCount = 0;
  const errors = [];
  
  // Migrate each article
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    console.log(`\n📝 Migrating article ${i + 1}/${articles.length}: "${article.title}"`);
    
    try {
      // Transform article to match database schema
      const dbArticle = {
        id: article.id,
        title: article.title,
        description: article.desc || article.description || '',
        content: article.content || '',
        category: article.category || 'Cloud',
        read_time: article.readTime || article.read_time || '5 min read',
        tags: article.tags || [],
        date_published: article.date || article.date_published || new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }),
        author_id: null // Will be set to current user if logged in
      };
      
      // Attempt to create article in database
      await createArticle(dbArticle);
      successCount++;
      console.log(`✅ Successfully migrated: "${article.title}"`);
      
    } catch (error) {
      errorCount++;
      const errorMsg = `Failed to migrate "${article.title}": ${error.message}`;
      errors.push(errorMsg);
      console.error(`❌ ${errorMsg}`);
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Migration Summary');
  console.log('='.repeat(60));
  console.log(`✅ Successfully migrated: ${successCount} articles`);
  console.log(`❌ Failed: ${errorCount} articles`);
  console.log(`📦 Total processed: ${articles.length} articles`);
  
  if (errors.length > 0) {
    console.log('\n⚠️ Errors encountered:');
    errors.forEach((err, idx) => {
      console.log(`  ${idx + 1}. ${err}`);
    });
  }
  
  if (successCount > 0) {
    console.log('\n✨ Migration completed! You can now refresh the page to see your articles loaded from the database.');
    console.log('💡 Tip: You can safely clear localStorage now by running: localStorage.removeItem("kloudvin_articles")');
  }
  
  return {
    total: articles.length,
    success: successCount,
    failed: errorCount,
    errors: errors
  };
}

/**
 * Export articles from database to JSON file
 * Useful for backup or moving between environments
 */
async function exportArticlesToJSON() {
  console.log('📤 Exporting articles from database...');
  
  if (typeof getArticles !== 'function') {
    console.error('❌ Error: db.js not loaded');
    return;
  }
  
  try {
    const articles = await getArticles();
    
    if (!articles || articles.length === 0) {
      console.log('ℹ️ No articles found in database');
      return;
    }
    
    const exportData = {
      exported_at: new Date().toISOString(),
      article_count: articles.length,
      articles: articles
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `kloudvin-articles-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log(`✅ Exported ${articles.length} articles to JSON file`);
    
  } catch (error) {
    console.error('❌ Error exporting articles:', error);
  }
}

/**
 * Import articles from JSON file
 * @param {File} file - JSON file containing articles
 */
async function importArticlesFromJSON(file) {
  console.log('📥 Importing articles from JSON file...');
  
  if (typeof createArticle !== 'function') {
    console.error('❌ Error: db.js not loaded');
    return;
  }
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async function(e) {
      try {
        const data = JSON.parse(e.target.result);
        const articles = data.articles || data;
        
        if (!Array.isArray(articles)) {
          throw new Error('Invalid JSON format. Expected an array of articles.');
        }
        
        console.log(`📦 Found ${articles.length} articles in file`);
        
        let successCount = 0;
        let errorCount = 0;
        
        for (const article of articles) {
          try {
            await createArticle(article);
            successCount++;
            console.log(`✅ Imported: "${article.title}"`);
          } catch (error) {
            errorCount++;
            console.error(`❌ Failed to import "${article.title}":`, error.message);
          }
        }
        
        console.log(`\n✅ Import complete: ${successCount} succeeded, ${errorCount} failed`);
        resolve({ success: successCount, failed: errorCount });
        
      } catch (error) {
        console.error('❌ Error parsing JSON file:', error);
        reject(error);
      }
    };
    
    reader.onerror = function() {
      console.error('❌ Error reading file');
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Clear all articles from database (use with caution!)
 */
async function clearAllArticles() {
  const confirmed = confirm('⚠️ WARNING: This will delete ALL articles from the database. This action cannot be undone. Are you sure?');
  
  if (!confirmed) {
    console.log('ℹ️ Operation cancelled');
    return;
  }
  
  console.log('🗑️ Clearing all articles from database...');
  
  if (typeof getArticles !== 'function' || typeof deleteArticle !== 'function') {
    console.error('❌ Error: db.js not loaded');
    return;
  }
  
  try {
    const articles = await getArticles();
    
    if (!articles || articles.length === 0) {
      console.log('ℹ️ No articles to delete');
      return;
    }
    
    let deletedCount = 0;
    
    for (const article of articles) {
      try {
        const success = await deleteArticle(article.id);
        if (success) {
          deletedCount++;
          console.log(`🗑️ Deleted: "${article.title}"`);
        }
      } catch (error) {
        console.error(`❌ Failed to delete "${article.title}":`, error.message);
      }
    }
    
    console.log(`\n✅ Deleted ${deletedCount} articles`);
    
  } catch (error) {
    console.error('❌ Error clearing articles:', error);
  }
}

/**
 * Initialize database with default articles
 */
async function initializeDefaultArticles() {
  console.log('🌱 Initializing database with default articles...');
  
  if (typeof initializeDefaultArticles !== 'function') {
    console.error('❌ Error: initializeDefaultArticles function not found in app.js');
    return;
  }
  
  try {
    await window.initializeDefaultArticles();
    console.log('✅ Default articles initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing default articles:', error);
  }
}

// Make functions available globally for console access
window.migrateLocalStorageToDatabase = migrateLocalStorageToDatabase;
window.exportArticlesToJSON = exportArticlesToJSON;
window.importArticlesFromJSON = importArticlesFromJSON;
window.clearAllArticles = clearAllArticles;
window.initializeDefaultArticles = initializeDefaultArticles;

console.log('🔧 Migration utilities loaded. Available commands:');
console.log('  - migrateLocalStorageToDatabase() - Migrate from localStorage to database');
console.log('  - exportArticlesToJSON() - Export articles to JSON file');
console.log('  - importArticlesFromJSON(file) - Import articles from JSON file');
console.log('  - clearAllArticles() - Delete all articles (use with caution!)');
console.log('  - initializeDefaultArticles() - Add default sample articles');

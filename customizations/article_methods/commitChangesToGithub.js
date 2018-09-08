const _ = require('lodash');
const github = require('../../lib/Github');
const cleanPath = require('../../lib/cleanPath');
const diff = require('diff');

function different(a, b) {
  if (a === b) { return false; }
  if ((a && !b) || (b && !a)) { return true; }
  if ((typeof a === 'string') && (typeof b === 'string')) {
    if (!(a.trim() === b.trim())) {
      console.log('difference in strings:', diff.diffLines(a, b));
      return true;
    }
  }
  if (_.isDate(a) && _.isDate(b)) {
    return a.getTime() === b.getTime();
  }
  return true;
}

module.exports = (Article, datasource) => {
  return async () => {
    let githubArticles = await github.getArticles();
    for (let a of githubArticles) { a.path = a.full_path; delete a.full_path; }
    let dbArticles = await Article.findAll();

    let githubArticlesByPath = new Map();

    for (let article of githubArticles) {
      if (!(article && article.meta)) {
        continue;
      }
      if (article.dir === '.backups') {
        continue;
      }

      if (article.path) {
        githubArticlesByPath.set(cleanPath(article.path), article);
      }
    }

    let changedArticles = [];

    for (let dbArticle of dbArticles) {
      if (!githubArticlesByPath.has((dbArticle.path))) {
        console.log('new article', dbArticle.path);
        changedArticles.push(dbArticle);
      } else {
        let githubArticle = githubArticlesByPath.get((dbArticle.path));

        if (different(dbArticle.title, githubArticle.meta.title)) {
          changedArticles.push(dbArticle);
          continue;
        }

        if (different(dbArticle.content, githubArticle.content)) {
          console.log('different content:', diff.diffLines(dbArticle.content, githubArticle.content));
          changedArticles.push(dbArticle);
          continue;
        }
      }
    }

    //@TODO: write back go a commit
  };
};

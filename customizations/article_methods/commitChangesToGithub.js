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
          console.log(dbArticle.path, 'different title:', dbArticle.title, githubArticle.meta.title);
          changedArticles.push(dbArticle);
          continue;
        }

        if (different(dbArticle.content, githubArticle.content)) {
          console.log(dbArticle.path, 'different content:', diff.diffLines(dbArticle.content, githubArticle.content));
          changedArticles.push(dbArticle);
          continue;
        }

        if (different(Boolean(dbArticle.onHomepage), Boolean(githubArticle.meta.on_homepage))) {
          console.log(dbArticle.path, 'different on_homepage:', Boolean(dbArticle.onHomepage),  Boolean(githubArticle.meta.on_homepage));
          changedArticles.push(dbArticle);
          continue;
        }

        if (different(Boolean(dbArticle.published), Boolean(!githubArticle.meta.hide))) {
          console.log(dbArticle.path, 'different published:', Boolean(dbArticle.published), Boolean(!githubArticle.meta.hide));
          changedArticles.push(dbArticle);
          continue;
        }
      }
    }

    let files = await Promise.all(changedArticles.map(a => a.toBlob()));
    files = _(files)
      .compact()
      .flatten()
      .value();

    return github.newCommit(files);

    // @TODO: write back go a commit
  };
};

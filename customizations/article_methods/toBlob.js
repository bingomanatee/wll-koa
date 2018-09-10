const Github = require('./../../lib/Github');

module.exports = (Article, datasource) => {
  return async function ()  {
    const path = this.path;
    let content = this.content;

    if (!(path && content)) {
      console.log('Missing content and/or path', this);
      return false;
    }

    let sha = await Github.textToBlob(content);
    let contentData = {
      sha,
      type: 'blob',
      mode: '100644',
      path
    };

    let articleJson = {
      on_homepage: this.onHomepage,
      revised: new Date().toISOString(),
      hide: !this.published,
      title: this.title,
      intro: this.description
    };

    let ajText = JSON.stringify(articleJson, true, 4);

    let dataSha = await Github.textToBlob(ajText);

    let metaData = {
      sha: dataSha,
      type: 'blob',
      mode: '100644',
      path: path.replace(/\.md$/i, '.json')
    };

    return [contentData, metaData];
  };
};

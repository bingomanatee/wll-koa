'use strict';

const github = require('../../../lib/Github');

describe('Github', () => {
  it('should get the repo', async () =>{
    expect.assertions(1);
    const result = await github.getRepo();
    expect(result).toBeTruthy();
  });

  it('should get the latest latestMasterCommit', async () => {
    expect.assertions(2);
    const commit = await github.latestMasterCommit();
    expect(commit).toBeTruthy();
    expect(commit.tree.sha).toBeTruthy();
  });

  it('should get the tree', async () => {
    expect.assertions(4);

    const { sha, tree } = await github.getLatestTree();

    expect(sha).toBeTruthy();
    expect(tree).toBeTruthy();
    expect(Array.isArray(tree)).toBeTruthy();
    expect(tree.length).toBeGreaterThan(1);
  });

  it('should get the article tree', async () => {
    expect.assertions(2);

    const tree = await github.getParsedArticleTree();

    expect(Array.isArray(tree)).not.toBeTruthy();
    expect(Array.isArray(tree.dirs)).toBeTruthy();
  }, 30000);

  it('should get all the getArticles', async () => {
    expect.assertions(1);

    const files = await github.getArticles();
    expect(Array.isArray(files)).toBeTruthy();
  }, 30000);
});

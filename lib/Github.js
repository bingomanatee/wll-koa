const path = require('path');
const fs = require('fs');
const octokit = require('@octokit/rest')();
const _ = require('lodash');

octokit.authenticate({
  type: 'token',
  token: process.env.GITHUB_TOKEN
});

const OWNER = 'bingomanatee';
const WLL_CONTENT = 'wonderland_labs_content';

const REF = 'master';
const SUFFIX_RE = /\.(md|json)$/i;
const IMAGE_ROOT = path.resolve(`${__dirname}/../public/blog_image`);

const Github = {
  getRepo: async () => {
    const { data } = await octokit.repos.get({ owner: OWNER, repo: WLL_CONTENT });
    return data;
  },

  latestMasterCommit: async () => {
    const { data: { commit } } = await octokit.repos.getBranch({ owner: OWNER, repo: WLL_CONTENT, branch: REF });
    return commit.commit;
  },

  getLatestTree: async () => {
    const commit = await Github.latestMasterCommit();
    let tree = commit.tree;

    const { data } = await octokit.gitdata.getTree({ owner: OWNER, repo: WLL_CONTENT, tree_sha: tree.sha });

    return data;
  },

  getArticleTree: async () => {
    const data = await Github.getLatestTree();
    const articleTree = data.tree.filter((dir) => {
      return dir.path === 'articles';
    })[0];

    return Github.folderFromSha(articleTree.sha, 'articles');
  },

  getImageTree: async () => {
    const data = await Github.getLatestTree();
    const articleTree = data.tree.filter((dir) => {
      return dir.path === 'images';
    })[0];

    return Github.folderFromSha(articleTree.sha, 'images');
  },

  getImages: async () => {
    let tree = await Github.getImageTree();
    console.log('blog images: ', require('util').inspect(tree));
    await Promise.all(tree.files.map((file) => {
      const { sha, path } = file;
      return Github.readBlob(sha)
        .then((blob) => {
          let { data: { content } } = blob;
          const contentBuffer = Buffer.from(content, 'base64');
          console.log('content of ', path, contentBuffer.toString().substr(0, 100));
          const filePath = `${IMAGE_ROOT  }/${  path}`;
          fs.writeFileSync(filePath, contentBuffer);
        });
    }));
  },

  /**
   * the primary method to retrieve all the articles in the repo
   * @returns {Promise<*>}
   */
  getParsedArticleTree: async () => {
    const data = await Github.getArticleTree();
    data.matches = Github.matchFiles(data.files);
    Github.setParentDir(data, '');
    Github.matchDirs(data.dirs);
    await Github.loadDirFiles(data);
    return data;
  },

  setParentDir: (data, parent) => {
    data.parent = parent;
    const path = `${parent}/${data.dir}`;
    data.path = path;
    if (data.dirs) {
      for (const dir of data.dirs) {
        Github.setParentDir(dir, path);
      }
    }
  },

  /**
   * compress all metadata into a list of articles
   * @param data {Object} a directory info object
   * @returns {*}
   */
  dirArticles: (data) => {
    let { matches, dirs, dir, parent, path } = data;

    let files = [];
    for (let name of Object.keys(matches)) {
      const full_path = `${path  }/${  name  }.md`;
      files.push(Object.assign({ name, dir, parent, path, full_path }, matches[name]));
    }
    files = (files || []).map(file => Object.assign({}, file, { dir, parent, path }));
    let dirFiles = dirs.map(Github.dirArticles);
    return _.flattenDeep([files, dirFiles]);
  },

  getArticles: async () => {
    let tree = await Github.getParsedArticleTree();

    return Github.dirArticles(tree);
  },

  loadDirFiles: async (dir) => {
    if (dir.dir === '.backups') { return; }
    let promises = [];
    if (dir.matches) {
      const matchValues = Array.from(Object.values(dir.matches));
      promises = promises.concat(matchValues.map(Github.loadFileBlob));
    }

    if (dir.dirs) {
      let nonBackupDirs = dir.dirs.filter(dir => dir.dir !== '.backups');

      if (nonBackupDirs.length) {
        promises = promises.concat(Promise.all(nonBackupDirs.map(Github.loadDirFiles)));
      }
    }

    return Promise.all(promises)
      .then(() => delete dir.files);
  },

  loadFileBlob: async (file) => {
    if (!(file && file.md && file.json)) {
      return;
    }

    return Promise.all([
      async () => {
        let { data: { content } } = await Github.readBlob(file.md);
        const contentStr = Buffer.from(content, 'base64').toString();
        file.content = contentStr;
      },
      async () => {
        let { data: { content } } = await Github.readBlob(file.json);
        const contentStr = Buffer.from(content, 'base64').toString();
        try {
          file.meta = JSON.parse(contentStr);
        } catch (err) {
          console.log('error with meta data: ', err);
          file.meta = {};
        }
      }
    ].map(fn => fn()));
  },

  readBlob: async (file_sha) => {
    return octokit.gitdata.getBlob({ owner: OWNER, repo: WLL_CONTENT, file_sha });
  },

  matchDirs: (dirs) => {
    dirs.forEach((dir) => {
      dir.matches = Github.matchFiles(dir.files);
      if (dir.dirs) {
        Github.matchDirs(dir.dirs);
      }
    });
  },

  matchFiles: (files) => {
    let data = _.groupBy(files, (file) => !(file && file.path) ? '' : file.path.replace(SUFFIX_RE, ''));

    for (let name in data) {
      if (data.hasOwnProperty(name)) {
        data[name] = _.reduce(data[name], (obj, file) => {
          if (!file) {
            return obj;
          }

          let match = SUFFIX_RE.exec(file.path);
          if (match) {
            let suffix = match[1].toLowerCase();
            obj[suffix] = file.sha;
          }
          return obj;
        }, {});
      }
    }

    return data;
  },

  folderFromSha: async (sha, dir = '') => {
    const { data: { tree } } = await octokit.gitdata.getTree({ owner: OWNER, repo: WLL_CONTENT, tree_sha: sha });

    const byType = _.groupBy(tree, 'type');
    let files = byType.blob || [];

    if (!byType.tree) {
      return { dir, files, dirs: [] };
    }

    let dirs = await Promise.all(byType.tree.map((treeItem) => Github.folderFromSha(treeItem.sha, treeItem.path)));
    return { dir, files, dirs };
  }
};

module.exports = Github;

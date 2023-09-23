## Steps to reproduce this documentation

1. [Bootstrap](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/creating-a-github-pages-site-with-jekyll) a GitHub Pages site with Jekyll.

```shell

mkdir docs && cd docs

# Checks out a new branch, with no history or contents, called gh-pages
# Remove the contents from this default branch from the working directory
git checkout --orphan gh-pages
git rm -rf .

# Create a Jekyll site inside docs/
jekyll new --skip-bundle .
```

2. [Configure](https://github.com/pages-themes/architect) the Architect theme.

3. Perform initial commit

```shell
git add .
git commit -m 'Initial GitHub pages site with Jekyll'
```

4. [Start](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/adding-content-to-your-github-pages-site-using-jekyll) adding content and custom Front Matter to the `docs/index.md` file using Markdown syntax.

5. Optionally modify the site layout, 
see [1](https://github.com/pages-themes/architect#layouts) and [2](https://jekyllrb.com/docs/themes/#overriding-theme-defaults).

6. Optionally, [test](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/testing-your-github-pages-site-locally-with-jekyll) the site locally. 

```shell
bundle install
bundle exec jekyll serve
```

## Test locally




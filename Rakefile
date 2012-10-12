
require 'rake'
require 'rake-version'
require 'tmpdir'

ROOT = File.expand_path File.dirname(__FILE__)
SRC = File.join ROOT, 'lib'

desc 'Update GitHub pages (from develop).'
task :pages do |t|

  remote = 'git@github.com:AlphaHydrae/tableling.git'

  Dir.mktmpdir 'tableling-' do |tmp|

    repo = File.join tmp, 'repo'
    Dir.mkdir repo
    raise 'ERROR: could not clone repo' unless system "git clone -b develop #{remote} #{repo}"

    demo = File.join tmp, 'demo'
    Dir.mkdir demo
    raise 'ERROR: could not copy demo' unless system "cd #{repo}/docs/demo && cp -R * #{demo}"

    docs = File.join tmp, 'docs'
    Dir.mkdir docs
    bin = 'docco-central'
    raise 'ERROR: could not generate docs' unless system "cd #{repo} && #{bin} --output #{docs}"

    raise 'ERROR: could not checkout gh-pages' unless system "cd #{repo} && git checkout -b gh-pages origin/gh-pages"
    raise 'ERROR: could not clean gh-pages' unless system "cd #{repo} && rm -fr *"
    raise 'ERROR: could not create directories' unless system "cd #{repo} && mkdir annotated && mkdir demo"
    raise 'ERROR: could not copy docs' unless system "cd #{tmp} && cp -R #{docs}/* #{repo}/annotated"
    raise 'ERROR: could not copy demo' unless system "cd #{tmp} && cp -R #{demo}/* #{repo}/demo"
    raise 'ERROR: could not stage changes' unless system "cd #{repo} && git add -A"
    raise 'ERROR: could not stage changes' unless system "cd #{repo} && git ls-files --deleted -z | xargs -0 git rm"

    h = `cd #{repo} && git log --pretty=format:'%h' -n 1`
    raise 'ERROR: could not commit changes' unless system %/cd #{repo} && git commit -m "Generated from develop@#{h}."/
    raise 'ERROR: could not push changes' unless system "cd #{repo} && git push"
  end
end

# version tasks
RakeVersion::Tasks.new do |v|
  v.copy 'src/tableling.js', 'package.json', 'README.md', 'docs/demo/index.html'
  v.copy '.docco-central.json', :all => true
end

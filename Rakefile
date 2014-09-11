
require 'rake'
require 'rake-version'
require 'tmpdir'
require 'paint'

ROOT = File.expand_path File.dirname(__FILE__)
SRC = File.join ROOT, 'src'
LIB = File.join ROOT, 'lib'
ANNOTATED = File.join ROOT, 'docs', 'annotated'

task :default => :spec

desc 'Run jasmine specs'
task :spec do |t|
  system "grunt jasmine"
end

namespace :build do

  desc 'Build javascript'
  task :lib do |t|
    puts
    puts Paint["Building javascript libs...", :magenta, :bold]
    raise 'ERROR: could not update lib' unless system "grunt"
  end

  desc 'Generate annotated source'
  task :annotated do |t|
    puts
    puts Paint["Generating annotated source...", :magenta, :bold]
    raise 'ERROR: could not generate annotated source' unless system "docker -o docs/annotated -I --exclude docs,lib,node_modules,vendor,wiki"
    raise 'ERROR: could not copy index page' unless system "cp res/index.html docs/annotated/"
  end
end

desc 'Update lib, annotated source and demo'
task :build => [ 'build:lib', 'build:annotated' ]

desc 'Update GitHub pages (from master)'
task :pages do |t|

  remote = 'git@github.com:AlphaHydrae/tableling.git'

  Dir.mktmpdir 'tableling-' do |tmp|

    repo = File.join tmp, 'repo'
    Dir.mkdir repo
    raise 'ERROR: could not clone repo' unless system "git clone -b master #{remote} #{repo}"

    demo = File.join tmp, 'demo'
    Dir.mkdir demo
    raise 'ERROR: could not copy demo' unless system "cd #{repo}/docs/demo && cp -R * #{demo}"

    docs = File.join tmp, 'docs'
    Dir.mkdir docs
    bin = 'docco-central'
    raise 'ERROR: could not generate annotated source' unless system "cd #{repo} && docker -o #{docs} -I --exclude docs,lib,node_modules,vendor,wiki"
    raise 'ERROR: could not copy index page' unless system "cp res/index.html #{docs}"

    raise 'ERROR: could not checkout gh-pages' unless system "cd #{repo} && git checkout -b gh-pages origin/gh-pages"
    raise 'ERROR: could not clean gh-pages' unless system "cd #{repo} && rm -fr *"
    raise 'ERROR: could not create directories' unless system "cd #{repo} && mkdir annotated && mkdir demo"
    raise 'ERROR: could not copy docs' unless system "cd #{tmp} && cp -R #{docs}/* #{repo}/annotated"
    raise 'ERROR: could not copy demo' unless system "cd #{tmp} && cp -R #{demo}/* #{repo}/demo"
    raise 'ERROR: could not stage changes' unless system "cd #{repo} && git add -A"
    raise 'ERROR: could not stage changes' unless system "cd #{repo} && git ls-files --deleted -z | xargs -0 git rm"

    h = `cd #{repo} && git log --pretty=format:'%h' -n 1`
    raise 'ERROR: could not commit changes' unless system %/cd #{repo} && git commit -m "Generated from master@#{h}."/
    raise 'ERROR: could not push changes' unless system "cd #{repo} && git push"
  end
end

# version tasks
RakeVersion::Tasks.new do |v|
  v.copy 'src/tableling.js', 'res/tableling.header.js', 'bower.json', 'package.json', 'README.md', 'docs/demo/index.html', 'spec/javascripts/version.spec.js'
end

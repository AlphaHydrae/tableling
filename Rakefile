
require 'rake'
require 'rake-version'
require 'tmpdir'
require 'paint'

ROOT = File.expand_path File.dirname(__FILE__)
LIB = File.join ROOT, 'lib'
ANNOTATED = File.join ROOT, 'docs', 'annotated'
DEMO = File.join ROOT, 'docs', 'demo'

namespace :update do

  desc 'Update lib'
  task :lib do |t|
    puts
    puts Paint["Building javascript libs in #{LIB}...", :magenta, :bold]
    raise 'ERROR: could not update lib' unless system "grunt"
  end

  desc 'Update annotated source'
  task :annotated do |t|
    puts
    puts Paint["Generating annotated source in #{ANNOTATED}...", :magenta, :bold]
    raise 'ERROR: could not generate annotated source' unless system "docco-central --output #{ANNOTATED} src/tableling.*.js"
  end

  desc 'Update demo'
  task :demo do |t|
    puts Paint["\nCopying tableling.world.min.js to #{DEMO}...", :magenta, :bold]
    world_source = File.join LIB, 'bundles', 'tableling.world.min.js'
    world_target = File.join DEMO, 'tableling.world.min.js'
    raise 'ERROR: could not update demo' unless system "cp #{world_source} #{world_target}"
    puts Paint['Done.', :green, :bold]
  end
end

desc 'Update lib, annotated source and demo'
task :update => [ 'update:lib', 'update:annotated', 'update:demo' ]

desc 'Update GitHub pages (from develop)'
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
  v.copy 'src/tableling.js', 'package.json', 'README.md', 'docs/demo/index.html', 'spec/javascripts/version.spec.js'
  v.copy '.docco-central.json', :all => true
end

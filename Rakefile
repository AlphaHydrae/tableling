
require 'rake'
require 'rake-version'
require 'tmpdir'

DEPS = {
  'jshint' => 'hint',
  'uglify-js' => 'uglifyjs',
  'jasmine-node' => 'jasmine-node'
}

ROOT = File.expand_path File.dirname(__FILE__)
SRC = File.join ROOT, 'lib'

def script_path dep
  File.join ROOT, 'node_modules', dep, 'bin', DEPS[dep]
end

desc 'Run test suite, validate and compress javascript.'
task :build => [ :spec, :check, :minify ]

desc 'Validate javascript.'
task :check => [ :validate_presence_of_deps ] do |t|
  result = system %/#{script_path 'jshint'} #{Dir.glob("#{SRC}/**/*").reject{ |f| f.match /\.min\./ }.join(' ')}/
  fail 'Javascript has errors.' unless result
end

desc 'Compress javascript.'
task :minify => [ :validate_presence_of_deps ] do |t|
  [ 'tableling', 'tableling-bootstrap' ].each do |f|
    result = system %/#{script_path 'uglify-js'} -o "#{File.join SRC, "#{f}.min.js"}" "#{File.join SRC, "#{f}.js"}"/
    fail 'Could not compress javascript.' unless result
  end
end

desc 'Run test suite.'
task :spec => [ :validate_presence_of_deps ] do |t|
  result = system %/#{script_path 'jasmine-node'} #{File.join ROOT, 'spec'}/
  fail 'Test suite failed.' unless result
end

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
  v.copy 'lib/tableling.js', 'lib/tableling-bootstrap.js', 'package.json', 'README.md', 'docs/demo/index.html'
  v.copy '.docco-central.json', :all => true
end

task :validate_presence_of_deps do |t|
  DEPS.each_key do |dep|
    bin_path = script_path dep
    raise "Missing binary #{bin_path}. Run 'npm install'." unless File.exists? bin_path
  end
end
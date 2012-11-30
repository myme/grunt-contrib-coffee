/*
 * grunt-contrib-coffee
 * http://gruntjs.com/
 *
 * Copyright (c) 2012 Eric Woroshow, contributors
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
  'use strict';

  var fs = require('fs');
  var path = require('path');

  // TODO: ditch this when grunt v0.4 is released
  grunt.util = grunt.util || grunt.utils;

  grunt.registerMultiTask('coffee', 'Compile CoffeeScript files into JavaScript', function() {
    var helpers = require('grunt-lib-contrib').init(grunt);

    var options = helpers.options(this, {
      bare: false,
      basePath: false,
      flatten: false
    });

    grunt.verbose.writeflags(options, 'Options');

    // TODO: ditch this when grunt v0.4 is released
    this.files = this.files || helpers.normalizeMultiTaskFiles(this.data, this.target);
    this.files = helpers.expandIndividualDests(this.files, options.basePath, options.flatten);

    var basePath;
    var newFileDest;

    var srcFiles;
    var srcCompiled;
    var taskOutput;

    this.files.forEach(function(file) {
      if (file.src.length === 0) {
        var noSourcesWarning = 'Unable to compile ' + file.dest + '; no valid source files were found.';
        grunt.log.writeln(noSourcesWarning.yellow);
        return;
      }

      if (helpers.isDestUpToDate(file)) {
        grunt.log.writeln('Up to date ' + file.dest.green + '.');
        return;
      }

      taskOutput = file.src.reduce(function(result, srcFile) {
        result.push(compileCoffee(srcFile, options));
        return result;
      }, []);

      if (taskOutput.length > 0) {
        grunt.file.write(file.dest, taskOutput.join('\n') || '');
        grunt.log.writeln('File ' + file.dest.cyan + ' created.');
      }
    });
  });

  var compileCoffee = function(srcFile, options) {
    options = grunt.util._.extend({filename: srcFile}, options);
    delete options.basePath;
    delete options.flatten;

    var srcCode = grunt.file.read(srcFile);

    try {
      return require('coffee-script').compile(srcCode, options);
    } catch (e) {
      grunt.log.error(e);
      grunt.fail.warn('CoffeeScript failed to compile.');
    }
  };
};

'use strict';

module.exports = function(grunt) {

  var path = require('path');
  var ECT  = require('ect');


  grunt.registerMultiTask('ect', 'generates an html file from an ect templates', function() {

    // Data
    var data            = this.data;
    var cwd             = data.cwd;
    var patterns        = data.patterns;
    var dest            = data.dest;

    // ECT and its options
    var options       = data.options;
    var variables     = data.variables || {};
    var ect           = new ECT(options || {});

    // Grunt async
    var done          = this.async();


    var compile = function (files, cwd, variables) {
      var status = true; // Start with no errors
      for (var key in files) {
        if (files.hasOwnProperty(key)) {
          var file = files[key];
          // src && dst are absolute path to ect source and ect dst
          var src = path.resolve(cwd, file);
          // hardcore. Get dest directory. Concat it to file dirname, then concat sum to filename w/o extention. And append '.html' to result
          var dst = path.resolve(dest, path.dirname(file), path.basename(file, path.extname(file))+'.html');
          var html = ect.render(src, variables);
          grunt.file.write(dst, html);
          status = (status && grunt.file.exists(dst));
          status
            ? grunt.log.ok(src+' was compiled to '+dst)
            : grunt.fail.warn('something went wrong when `'+src+'` was compiled to `'+dst+'`');
        }
      }
      return status;
    };


    var getFilesList = function (patterns, cwd) {
      if (!patterns) { return false; }
      patterns = [].concat(patterns);
      var files = [];
      var options = {
        cwd: cwd
      };
      for (var key in patterns) {
        if (!patterns.hasOwnProperty(key)) { continue; }
        var pattern = patterns[key];
        files = files.concat(grunt.file.expand(options, pattern));
      }
      return files;
    };

    var init = function () {
      var status;
      var files = getFilesList(patterns, cwd);
      try {
        status = compile(files, cwd, variables);
      } catch (e) {
        grunt.log.error(e);
      }
      done(status);
    }.bind(this)();


    return init;

  });
};
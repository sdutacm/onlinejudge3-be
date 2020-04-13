const gulp = require('gulp');
const through2 = require('through2');

gulp.task('dist:postprocess', function () {
  return gulp
    .src('./dist/**/*.js')
    .pipe(
      // 手动替换 paths 中的 @ 为相对路径
      // @ref https://github.com/microsoft/TypeScript/issues/26722
      // f**k MS
      through2.obj(function (file, _, cb) {
        if (file.isBuffer()) {
          let content = file.contents.toString();
          const relative = file.relative;
          const pathNum = relative.split('/').length - 1;
          let pathAdd = './';
          if (pathNum > 0) {
            pathAdd = new Array(pathNum).fill('../').join('');
          }
          re = /require\("(@\/\S+)"\)/g;
          let r;
          const replacements = [];
          while ((r = re.exec(content))) {
            if (r && r[1]) {
              console.log(`Replaced "${r[1]}" in dist/${file.relative}`);
              replacements.push(r[1]);
            }
          }
          replacements.forEach((replacement) => {
            content = content.replace(
              `require("${replacement}")`,
              `require("${pathAdd}${replacement.substring(2)}")`,
            );
          });
          file.contents = Buffer.from(content);
        }
        cb(null, file);
      }),
    )
    .pipe(gulp.dest('./dist'));
});

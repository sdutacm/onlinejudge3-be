const apps = [
  {
    name: 'onlinejudge3-data-manager',
    script: `./dist/data-manager.js`,
    // log_date_format: 'YYYY-MM-DD HH:mm:ss',
    max_memory_restart: '256M',
    merge_logs: true,
    min_uptime: '5s',
    cwd: './',
    instance_var: 'INSTANCE_ID',
    ignore_watch: ['node_modules', 'public'],
    env: {
      NODE_ENV: 'production',
    },
    kill_timeout : 5000,
  },
];

module.exports = {
  apps,
};

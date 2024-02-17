const apps = [
  {
    name: 'onlinejudge3-judger-agent',
    script: `./dist/index.js`,
    // log_date_format: 'YYYY-MM-DD HH:mm:ss',
    exec_mode: 'cluster',
    max_memory_restart: '256M',
    instances: parseInt(process.env.WORKERS, 10) || 1,
    merge_logs: true,
    min_uptime: '5s',
    cwd: './',
    instance_var: 'INSTANCE_ID',
    ignore_watch: ['node_modules', 'public'],
    env: {
      NODE_ENV: 'production',
    },
    node_args: ['--unhandled-rejections=warn'],
    kill_timeout : 5000,
  },
];

module.exports = {
  apps,
};

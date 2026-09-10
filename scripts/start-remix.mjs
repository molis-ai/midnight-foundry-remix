import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const [challenge = '000-human-verification-bureau', name = 'my-human-bureau'] = process.argv.slice(2);
if (![challenge, name].every(value => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value))) {
  console.error('名称请使用小写英文、数字和连字符。');
  process.exit(1);
}
const source = join(root, 'challenges', challenge, 'original');
const target = join(root, 'remixes', name);
if (!existsSync(join(source, 'package.json'))) {
  console.error(`找不到挑战：${challenge}`);
  process.exit(1);
}
if (existsSync(target)) {
  console.error(`remixes/${name} 已存在，未覆盖。请沿用已有副本，或提供另一个名称。`);
  process.exit(1);
}
mkdirSync(dirname(target), { recursive: true });
cpSync(source, target, { recursive: true, filter: path => !/(?:^|[/\\])(node_modules|dist|work|test-results|playwright-report|\.local)(?:[/\\]|$)/.test(relative(source, path)) });
cpSync(join(root, 'LICENSE'), join(target, 'LICENSE'));
writeFileSync(join(target, 'REMIX.md'), `# 我的改编\n\n起点：[${challenge}](https://github.com/molis-ai/midnight-foundry-remix/tree/main/challenges/${challenge})，v0.1。\n\n修改者：待填写\n\n我改了什么：待填写\n\n怎么验证：待填写\n\n试玩地址或录屏：待填写（localhost 不能发给别人玩）\n`);
console.log(`已创建 remixes/${name}\n\n接下来：\ncd remixes/${name}\nnpm ci\nnpm run dev -- --port 4188\n\n打开 http://127.0.0.1:4188，先玩一遍，再改一处。`);

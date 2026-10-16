const fs = require('fs');

let content = fs.readFileSync('./src/views/HomeView.vue', 'utf8');

content = content.replace(/bg-surface-alt/g, 'bg-[#2a2a2a]');
content = content.replace(/bg-surface/g, 'bg-[#333333]');
content = content.replace(/bg-surface-hover/g, 'bg-[#3a3a3a]');
content = content.replace(/hover:bg-surface-hover/g, 'hover:bg-[#3a3a3a]');

content = content.replace(/text-primary/g, 'text-white');
content = content.replace(/text-secondary/g, 'text-gray-300');
content = content.replace(/text-tertiary/g, 'text-gray-400');

content = content.replace(/border-divider/g, 'border-white/10');
content = content.replace(/divide-divider/g, 'divide-white/5');

content = content.replace(/color: document\.documentElement\.className\.includes\('dark'\) \? '#ffffff' : '#444746'/g, "color: '#ffffff'");

fs.writeFileSync('./src/views/HomeView.vue', content);
console.log('HomeView reversed context back to hex');

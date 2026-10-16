const fs = require('fs');

function addLightToHome() {
    let content = fs.readFileSync('./src/views/HomeView.vue', 'utf8');

    // Backgrounds
    content = content.replace(/bg-\[\#333333\](?! light:)/g, 'bg-[#333333] light:bg-[#ffffff]');
    content = content.replace(/bg-\[\#2F2F2F\](?! light:)/g, 'bg-[#2F2F2F] light:bg-[#f8fafd]');
    content = content.replace(/bg-\[\#2a2a2a\](?! light:)/g, 'bg-[#2a2a2a] light:bg-[#f8fafd]');

    // Hovers
    content = content.replace(/bg-\[\#3a3a3a\](?! light:)/g, 'bg-[#3a3a3a] light:bg-[#f1f3f4]');
    content = content.replace(/hover:bg-\[\#3a3a3a\](?! light:)/g, 'hover:bg-[#3a3a3a] light:hover:bg-[#f1f3f4]');
    content = content.replace(/hover:bg-white\/5(?! light:)/g, 'hover:bg-white/5 light:hover:bg-[rgba(0,0,0,0.05)]');

    // Text colors
    content = content.replace(/text-white(?! light:)/g, 'text-white light:text-[#1f1f1f]');
    content = content.replace(/text-gray-300(?! light:)/g, 'text-gray-300 light:text-[#444746]');
    content = content.replace(/text-gray-400(?! light:)/g, 'text-gray-400 light:text-[#727775]');
    content = content.replace(/text-gray-500(?! light:)/g, 'text-gray-500 light:text-[#727775]');

    // Borders & Dividers
    content = content.replace(/border-white\/10(?! light:)/g, 'border-white/10 light:border-[rgba(0,0,0,0.08)]');
    content = content.replace(/border-white\/5(?! light:)/g, 'border-white/5 light:border-[rgba(0,0,0,0.08)]');
    content = content.replace(/divide-white\/5(?! light:)/g, 'divide-white/5 light:divide-[rgba(0,0,0,0.08)]');

    setTimeout(() => {
        fs.writeFileSync('./src/views/HomeView.vue', content);
        console.log('HomeView Light Variant Added!');
    }, 100);
}

addLightToHome();

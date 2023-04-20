'use strict'
{
const area_input = document.getElementById('area_input');
const area_output = document.getElementById('area_output');
const button_clear_input = document.getElementById('button_clear_input');
const button_clear_output = document.getElementById('button_clear_output');
const button_convert = document.getElementById('button_convert');
const button_copy = document.getElementById('button_copy');
const output = document.getElementById('output');

button_convert.addEventListener('click', () => {
    const text_input = area_input.value.trim(); // 末尾の余分な改行を除去する
    const array_byLine = text_input.split('\n'); // 1行ずつ配列に格納する
    array_byLine.shift(); // ヘッダ行の分を削除
    array_byLine.sort();  // ソートする（＝URL順になる）

    const num_pages = array_byLine.length;
    const array_title = [];
    const array_url = [];
    const array_depth = [];
    let depth_max = 0;

    // 1行ずつ処理する
    // title, url, depthそれぞれの行ごとの配列を作る
    for (let i = 0; i < num_pages; i++ ){
        // カンマごとに配列に格納する
        // ダブルクオーテーションを取る
        const array_byComma = array_byLine[i].replace(/^\"(.*)\"$/g,'$1').split('","'); 
        const [url, title] = array_byComma;
        const url_tabbed = url.replace(/([^\/])\/([^(\/|\n\$)])/g,'$1\/\t$2');
        const depth = url_tabbed.split('\t').length;

        // 階層の深さが最大を超える場合、最大を上書きする
        depth > depth_max ? depth_max = depth : null;

        // 配列に追加する
        array_title.push(title);
        array_url.push(url + '\t' + url_tabbed);
        array_depth.push(depth);
    }

    // ヘッダ行を作る
    // 最大深度に応じて Root, L2, L3,... の数字が増える
    let header_depth = '';
    for (let i = 0; i < depth_max; i++){
        header_depth += (i === 0) ? 'Root' : `\tL${i+1}`;
    }
    let text_output = `${header_depth}\tURL\t${header_depth}`;

    // 出力文を作る
    for (let i = 0; i < num_pages; i++ ){
        // 階層の深さに合わせてTitleのインデントを調整する
        const num_tabs_before = array_depth[i] - 1;
        const tabs_before = '\t'.repeat(num_tabs_before);
        const num_tabs_after = depth_max - array_depth[i] + 1;
        const tabs_after = '\t'.repeat(num_tabs_after);

        text_output += `\n${tabs_before}${array_title[i]}${tabs_after}${array_url[i]}`;
    }
    area_output.value = text_output;
});

button_clear_input.addEventListener('click', () => {
    area_input.value = '';
});
button_clear_output.addEventListener('click', () => {
    area_output.value = '';
});

button_copy.addEventListener('click', () => {
    navigator.clipboard.writeText(area_output.value);
    const div_message = document.createElement('div');
    div_message.id = 'message';
    div_message.textContent = 'Copied!';
    output.appendChild(div_message);
    setTimeout(() => {
        div_message.remove();
    }, 1000);
});

}//use strict
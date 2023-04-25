'use strict'
{
const area_output = document.getElementById('area_output');
const button_clear_input = document.getElementById('button_clear_input');
const button_clear_output = document.getElementById('button_clear_output');
const button_convert = document.getElementById('button_convert');
const button_copy = document.getElementById('button_copy');
const output = document.getElementById('output');
const input = document.getElementById('input');

const button_input = document.getElementById('button_input');
const button_input_0 = document.getElementById('button_input_0');

const filename = document.getElementById('filename');

const showFilename = (files) => {
    const file = files[0];
    filename.textContent = file.name;
    button_clear_input.classList.remove('hidden');
}
const removeFilename = () => {
    filename.textContent = '';
    button_clear_input.classList.add('hidden');
}

const toggleFilename = (files) => {
    if (files.length > 0) {
        showFilename(files);
    } else {
        removeFilename();
    }
}

const showMessage = (message) => {
    const div_message = document.createElement('div');
    div_message.id = 'message';
    div_message.textContent = message;
    output.appendChild(div_message);
    setTimeout(() => {
        div_message.remove();
    }, 2000);
}

// Drag & Dropでファイル投入
input.addEventListener('dragover', e => {
    e.preventDefault();
    input.classList.add('focus');
});
input.addEventListener('dragleave', e => {
    e.preventDefault();
    input.classList.remove('focus');
});
input.addEventListener('drop', e => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    button_input_0.files = files;
    toggleFilename(files);
    input.classList.remove('focus');
});

// ボタンからファイル投入
button_input.addEventListener('click', () => {
    button_input_0.click();
});
button_input_0.addEventListener('change', e => {
    const files = e.target.files;
    toggleFilename(files);
    button_input.blur();
});

// ファイル削除
button_clear_input.addEventListener('click', () => {
    button_input_0.value = '';
    removeFilename();
})

button_convert.addEventListener('click', () => {
    const file = button_input_0.files[0];
    if (file === undefined){
        showMessage('ファイルが選択されていません。');
        return;
    }
    const reader = new FileReader();
    reader.onload =  () => {
        const content = reader.result.trim();

        // 想定したCSVファイル以外が投入された場合、エラーにする
        if( content.indexOf('"url","Title"')!== 0){
            showMessage('Integrity Plusから出力したCSVファイルではないため、処理できません。');
            return;
        } 

        // 1行ずつ配列に格納する
        const array_byLine = content.split('\n'); 
        // ヘッダ行の分を削除
        array_byLine.shift();
        // ソートする（＝URL順になる）
        array_byLine.sort(); 

        const num_pages = array_byLine.length;
        const array_title = [];
        const array_url = [];
        const array_depth = [];
        let depth_max = 0;

        // 1行ずつ処理する
        // title, url, depthそれぞれの行ごとの配列を作る
        for (let i = 0; i < num_pages; i++ ){
            // ダブルクオーテーションを取り、カンマごとに配列に格納する
            const array_byComma = array_byLine[i].replace(/^\"(.*)\"$/g,'$1').split('","'); 

            // url, titleを取り出し、url_tabbedを作る
            const [url, title] = array_byComma;
            const url_tabbed = url.replace(/([^\/])\/([^(\/|\n\$)])/g,'$1\/\t$2');

            // このurlの階層の深さを記録する
            const depth = url_tabbed.split('\t').length;

            // 階層の深さが最大を超える場合、最大を上書きする
            depth > depth_max ? depth_max = depth : null;

            // それぞれを配列に追加する
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
        
    }
    reader.readAsText(file, 'UTF-8');
});

button_clear_output.addEventListener('click', () => {
    area_output.value = '';
});


button_copy.addEventListener('click', () => {
    navigator.clipboard.writeText(area_output.value);
    showMessage('Copied!');
});

}//use strict
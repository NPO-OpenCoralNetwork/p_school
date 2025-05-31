/**
 * 魔法の書 - 魔法の詠唱パターンと情報を表示するUI
 */
export class SpellBook {
  constructor() {
    this.isVisible = false;
    this.container = null;
    this.createSpellBookUI();
  }

  createSpellBookUI() {
    // 魔法の書のコンテナを作成
    this.container = document.createElement('div');
    this.container.id = 'spellbook';
    this.container.className = 'spellbook-container';
    this.container.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 600px;
      max-height: 80vh;
      background: linear-gradient(135deg, #2a1810, #4a3020);
      border: 3px solid #8b6914;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
      z-index: 1000;
      display: none;
      overflow-y: auto;
      font-family: 'Georgia', serif;
    `;

    // ヘッダー
    const header = document.createElement('div');
    header.className = 'spellbook-header';
    header.style.cssText = `
      background: linear-gradient(90deg, #8b6914, #b8860b);
      padding: 15px;
      text-align: center;
      border-radius: 12px 12px 0 0;
      position: relative;
    `;

    const title = document.createElement('h2');
    title.textContent = '📖 魔法の書';
    title.style.cssText = `
      margin: 0;
      color: #fff;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
      font-size: 24px;
    `;

    // 閉じるボタン
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
      position: absolute;
      top: 10px;
      right: 15px;
      background: none;
      border: none;
      color: #fff;
      font-size: 20px;
      cursor: pointer;
      padding: 5px;
      border-radius: 3px;
      display: block;
    `;
    closeBtn.onclick = () => this.hide();

    header.appendChild(title);
    header.appendChild(closeBtn);

    // コンテンツエリア
    const content = document.createElement('div');
    content.className = 'spellbook-content';
    content.style.cssText = `
      padding: 20px;
      color: #f4e4bc;
      line-height: 1.6;
    `;

    this.container.appendChild(header);
    this.container.appendChild(content);
    document.body.appendChild(this.container);

    this.populateSpellBook(content);
  }
  populateSpellBook(content) {
    // 基本コマンド
    const basicCommands = [
      {
        name: '⚔️ 攻撃',
        stage: 1,
        description: '基本的な攻撃コマンド',
        usage: 'attack ブロックを使用',
        effect: '敵に通常ダメージを与える',
        notes: [
          '最も基本的な戦闘コマンド',
          'HPを消費しない',
          '確実に命中する'
        ],
        difficulty: '初級'
      },
      {
        name: '⌛ 待機',
        stage: 1,
        description: '次のターンまで待機する',
        usage: 'wait ブロックを使用',
        effect: 'ターンを消費する',
        notes: [
          'HPを消費しない',
          'ターン経過による回復や状態変化を待つ時に有効',
          '敵の行動パターンを観察するのに便利'
        ],
        difficulty: '初級'
      }
    ];

    // 回復魔法
    const healingSpells = [
      {
        name: '💚 回復の魔法 (HEALING)',
        stage: 2,
        pattern: '左手 → 右手 → 左手 → 右手 → 左手 → 右手',
        description: 'HPを回復する生命魔法',
        effect: 'HP回復 (10)',
        notes: [
          '長い詠唱パターンが必要',
          '戦闘中の回復に重要',
          '正確な詠唱が必要',
          '失敗すると回復できない',
          '毒状態では回復量が減少する'
        ],
        difficulty: '中級'
      }
    ];

    // 攻撃魔法
    const attackSpells = [
      {
        name: '🔥 炎の魔法 (FIRE)',
        stage: 3,
        pattern: '右手 → 右手 → 左手',
        description: '敵に炎のダメージを与える基本的な攻撃魔法',
        damage: '中程度 (8)',
        notes: [
          '最も基本的な攻撃魔法',
          '詠唱が比較的簡単',
          '氷系の敵に効果的',
          'ファイアゴブリンには効果が低い'
        ],
        difficulty: '初級'
      },
      {
        name: '❄️ 氷の魔法 (ICE)',
        stage: 4,
        pattern: '左手 → 左手',
        description: '敵を氷で攻撃し、動きを鈍らせる魔法',
        damage: '中程度 (6)',
        notes: [
          '詠唱パターンが短い',
          '炎系の敵に効果的',
          '敵の動きを遅くする効果がある',
          'フレイムウルフに対して特に有効'
        ],
        difficulty: '初級'
      },
      {
        name: '⚡ 雷の魔法 (THUNDER)',
        stage: 7,
        pattern: '右手 → 左手 → 右手 → 左手',
        description: '強力な雷撃で敵を攻撃する高級魔法',
        damage: '高威力 (15)',
        notes: [
          '最も複雑な詠唱パターン',
          '金属系の敵に絶大な効果',
          '装甲を貫通する力がある',
          'メタルスライムの防御を無視できる',
          '詠唱に失敗しやすいので注意'
        ],
        difficulty: '中級'
      }
    ];

    // 薬学
    const alchemy = [
      {
        name: '💊 解毒薬作成',
        stage: 6,
        usage: 'brew_antidote ブロックを使用',
        description: '解毒薬を調合する',
        effect: '毒状態を治療できる薬を作成',
        notes: [
          '作成には1ターン必要',
          '作成した解毒薬は任意のタイミングで使用可能',
          'ポイズンコングの毒攻撃に備えて作成しておくと良い',
          '一度に複数個持つことはできない'
        ],
        difficulty: '中級'
      },
      {
        name: '🧪 ポーション使用',
        stage: 6,
        usage: 'use_potion ブロックを使用',
        description: '調合した薬を使用する',
        effect: '対応する状態異常を治療',
        notes: [
          '解毒薬を使用すると毒状態が治療される',
          '使用するには事前に調合が必要',
          '使用しても新しい毒には再度かかる可能性がある',
          'タイミングを見極めて使用することが重要'
        ],
        difficulty: '中級'
      }
    ];

    // 制御構造
    const controlStructures = [
      {
        name: '🔄 2回繰り返し',
        stage: 8,
        usage: 'repeat_twice ブロックを使用',
        description: '指定したコマンドを2回連続で実行',
        effect: 'ブロック内の処理を2回繰り返す',
        notes: [
          'ブロック内に複数のコマンドを配置可能',
          '攻撃や魔法を連続で放つのに便利',
          'HPの残量に注意して使用する',
          'ゴブリン部隊への全体攻撃と組み合わせると効果的',
          '繰り返しの途中でHPが0になると中断される'
        ],
        difficulty: '中級'
      }
    ];    // カテゴリごとにコンテンツを作成
    [
      { title: '⚔️ 基本コマンド', items: basicCommands },
      { title: '💚 回復魔法', items: healingSpells },
      { title: '🔮 攻撃魔法', items: attackSpells },
      { title: '🧪 薬学', items: alchemy },
      { title: '🔄 制御構造', items: controlStructures }
    ].forEach(category => {
      // カテゴリヘッダー
      const categoryHeader = document.createElement('h2');
      categoryHeader.textContent = category.title;
      categoryHeader.style.cssText = `
        color: #ffd700;
        margin: 30px 0 15px 0;
        font-size: 24px;
        text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
        border-bottom: 2px solid #8b6914;
        padding-bottom: 10px;
      `;
      content.appendChild(categoryHeader);

      // カテゴリ内の各アイテム
      category.items.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'spell-entry';
        itemDiv.style.cssText = `
          margin-bottom: 25px;
          padding: 15px;
          background: rgba(0, 0, 0, 0.3);
          border-left: 4px solid #8b6914;
          border-radius: 8px;
        `;

        const itemName = document.createElement('h3');
        itemName.textContent = `${item.name} ${item.stage ? `(ステージ${item.stage}〜)` : ''}`;
        itemName.style.cssText = `
          margin: 0 0 10px 0;
          color: #ffd700;
          font-size: 18px;
        `;

        const description = document.createElement('p');
        description.textContent = item.description;
        description.style.cssText = `
          margin: 10px 0;
          font-style: italic;
          color: #e6d3a3;
        `;

        // パターンまたは使用方法
        if (item.pattern || item.usage) {
          const patternDiv = document.createElement('div');
          patternDiv.style.cssText = `
            background: rgba(255, 215, 0, 0.1);
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
            border: 1px solid #8b6914;
          `;
          
          const patternLabel = document.createElement('strong');
          patternLabel.textContent = item.pattern ? '詠唱パターン: ' : '使用方法: ';
          patternLabel.style.color = '#ffd700';
          
          const patternText = document.createElement('span');
          patternText.textContent = item.pattern || item.usage;
          patternText.style.cssText = `
            font-family: 'Courier New', monospace;
            color: #fff;
            font-weight: bold;
          `;
          
          patternDiv.appendChild(patternLabel);
          patternDiv.appendChild(patternText);
          itemDiv.appendChild(patternDiv);
        }

        // 効果情報
        const effectInfo = document.createElement('div');
        effectInfo.style.cssText = `
          margin: 10px 0;
          font-size: 14px;
        `;
        
        if (item.damage) {
          const damageSpan = document.createElement('span');
          damageSpan.innerHTML = `<strong>威力:</strong> ${item.damage}`;
          damageSpan.style.color = '#ff6b6b';
          effectInfo.appendChild(damageSpan);
        }
        
        if (item.effect) {
          const effectSpan = document.createElement('span');
          effectSpan.innerHTML = `<strong>効果:</strong> ${item.effect}`;
          effectSpan.style.color = '#51cf66';
          effectInfo.appendChild(effectSpan);
        }

        // 難易度
        if (item.difficulty) {
          const difficulty = document.createElement('div');
          difficulty.innerHTML = `<strong>難易度:</strong> ${item.difficulty}`;
          difficulty.style.cssText = `
            margin: 5px 0;
            font-size: 14px;
            color: ${item.difficulty === '初級' ? '#51cf66' : '#ffd43b'};
          `;
          itemDiv.appendChild(difficulty);
        }

        // 注意事項
        if (item.notes && item.notes.length > 0) {
          const notesTitle = document.createElement('h4');
          notesTitle.textContent = '📝 注意事項';
          notesTitle.style.cssText = `
            margin: 15px 0 5px 0;
            color: #ffd700;
            font-size: 14px;
          `;
          itemDiv.appendChild(notesTitle);

          const notesList = document.createElement('ul');
          notesList.style.cssText = `
            margin: 10px 0;
            padding-left: 20px;
            color: #c9b037;
          `;
          
          item.notes.forEach(note => {
            const li = document.createElement('li');
            li.textContent = note;
            li.style.cssText = `
              margin: 5px 0;
              color: #d4c77a;
            `;
            notesList.appendChild(li);
          });
          
          itemDiv.appendChild(notesList);
        }

        itemDiv.appendChild(itemName);
        itemDiv.appendChild(description);
        if (effectInfo.hasChildNodes()) {
          itemDiv.appendChild(effectInfo);
        }
        
        content.appendChild(itemDiv);
      });
    });
    // 使用方法の説明を追加
    const usage = document.createElement('div');
    usage.style.cssText = `
      margin-top: 30px;
      padding: 15px;
      background: rgba(139, 105, 20, 0.2);
      border-radius: 8px;
      border: 1px solid #8b6914;
    `;
    
    usage.innerHTML = `
      <h3 style="color: #ffd700; margin-top: 0;">📚 魔法の使用方法</h3>
      <ol style="color: #d4c77a; line-height: 1.8;">
        <li><strong>魔法詠唱ブロック</strong>を配置します</li>
        <li>詠唱する魔法の種類を選択します</li>
        <li><strong>左手で詠唱</strong>・<strong>右手で詠唱</strong>ブロックを正しい順序で配置します</li>
        <li>パターンが正確でないと魔法は失敗します</li>
        <li>魔法の書でパターンを確認してから詠唱しましょう</li>
      </ol>
      <p style="color: #ff6b6b; font-style: italic; margin-bottom: 0;">
        💡 ヒント: 複雑な魔法ほど威力が高いですが、詠唱に失敗しやすくなります
      </p>
    `;
    
    content.appendChild(usage);
  }

  show() {
    this.isVisible = true;
    this.container.style.display = 'block';
    
    // フェードイン効果
    this.container.style.opacity = '0';
    this.container.style.transform = 'translate(-50%, -50%) scale(0.9)';
    
    setTimeout(() => {
      this.container.style.transition = 'all 0.3s ease';
      this.container.style.opacity = '1';
      this.container.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 10);
  }

  hide() {
    this.container.style.transition = 'all 0.3s ease';
    this.container.style.opacity = '0';
    this.container.style.transform = 'translate(-50%, -50%) scale(0.9)';
    
    setTimeout(() => {
      this.container.style.display = 'none';
      this.isVisible = false;
    }, 300);
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }
}

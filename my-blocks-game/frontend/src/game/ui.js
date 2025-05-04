export class UI {
    constructor() {
      this.logArea = null; // Phaserのテキストオブジェクト用
      this.logMessages = []; // メッセージ履歴
    }
  
    log(message) {
      console.log("Game log:", message); // デバッグ用

      // logAreaがPhaserのテキストオブジェクトの場合
      if (this.logArea && this.logArea.setText) {
        // 最大3行までのメッセージを保持
        this.logMessages.push(message);
        if (this.logMessages.length > 3) {
          this.logMessages.shift(); // 古いメッセージを削除
        }
        
        // 表示用テキストを作成
        const displayText = this.logMessages.join('\n');
        this.logArea.setText(displayText);
      } 
      // DOMエレメントの場合（バックアップ処理）
      else if (this.logArea && this.logArea.appendChild) {
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        this.logArea.appendChild(messageElement);
        
        // スクロール到達点を下部に設定
        this.logArea.scrollTop = this.logArea.scrollHeight;
      }
      // logAreaがない場合はコンソールのみに出力
    }
  
    updateHP(playerHP, enemyHP) {
      // このメソッドの実装はindexで上書きされているため、このデフォルト実装はシンプルに
      console.log(`HP更新 - プレイヤー: ${playerHP}, 敵: ${enemyHP}`);
    }
}

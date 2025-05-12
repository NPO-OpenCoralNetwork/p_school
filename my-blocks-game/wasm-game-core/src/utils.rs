// WebAssemblyでのパニック時にエラーメッセージを出力するためのフック
pub fn set_panic_hook() {
    // デバッグビルドでのみコンパイルされるコード
    #[cfg(debug_assertions)]
    console_error_panic_hook::set_once();
}
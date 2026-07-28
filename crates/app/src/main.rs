fn main() {
    if let Err(error) = window::run_window() {
        eprintln!("Application error: {error}");
    }
}

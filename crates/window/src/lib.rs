use fs::FileSystemEngine;
use serde::Deserialize;
use tao::{
    dpi::LogicalSize,
    event::{Event, StartCause, WindowEvent},
    event_loop::{ControlFlow, EventLoopBuilder},
    window::WindowBuilder,
};
use wry::{WebViewBuilder, http::Request};

#[derive(Debug)]
enum UserEvent {
    ToggleShadows,
    IpcResponse(String),
}

#[derive(Deserialize)]
#[serde(tag = "cmd", rename_all = "camelCase")]
enum FsCommand {
    ReadDir {
        id: String,
        path: String,
    },
    ReadFile {
        id: String,
        path: String,
    },
    WriteFile {
        id: String,
        path: String,
        content: String,
    },
    CreateDir {
        id: String,
        path: String,
    },
    DeleteNode {
        id: String,
        path: String,
    },
}

/// Parses incoming IPC string payloads and dispatches calls to `odeli-fs`
fn process_fs_ipc(message: &str) -> Option<String> {
    let cmd: FsCommand = serde_json::from_str(message).ok()?;

    let response = match cmd {
        FsCommand::ReadDir { id, path } => match FileSystemEngine::read_dir(path) {
            Ok(items) => serde_json::json!({ "id": id, "data": items }),
            Err(err) => serde_json::json!({ "id": id, "error": err.to_string() }),
        },
        FsCommand::ReadFile { id, path } => match FileSystemEngine::read_file(path) {
            Ok(content) => serde_json::json!({ "id": id, "data": content }),
            Err(err) => serde_json::json!({ "id": id, "error": err.to_string() }),
        },
        FsCommand::WriteFile { id, path, content } => {
            match FileSystemEngine::write_file(path, &content) {
                Ok(_) => serde_json::json!({ "id": id, "data": true }),
                Err(err) => serde_json::json!({ "id": id, "error": err.to_string() }),
            }
        }
        FsCommand::CreateDir { id, path } => match FileSystemEngine::create_dir(path) {
            Ok(_) => serde_json::json!({ "id": id, "data": true }),
            Err(err) => serde_json::json!({ "id": id, "error": err.to_string() }),
        },
        FsCommand::DeleteNode { id, path } => match FileSystemEngine::delete_node(path) {
            Ok(_) => serde_json::json!({ "id": id, "data": true }),
            Err(err) => serde_json::json!({ "id": id, "error": err.to_string() }),
        },
    };

    Some(format!("window.__ODELI_IPC_RESPONSE__({});", response))
}

pub fn run_window() -> wry::Result<()> {
    let event_loop = EventLoopBuilder::<UserEvent>::with_user_event().build();

    let window = WindowBuilder::new()
        .with_title("Odeli")
        .with_decorations(false)
        .with_inner_size(LogicalSize::new(600.0, 400.0))
        .with_min_inner_size(LogicalSize::new(300.0, 200.0))
        .build(&event_loop)
        .unwrap();

    let proxy = event_loop.create_proxy();

    let handler = move |request: Request<String>| {
        let message = request.body();

        if message == "toggleShadows" {
            proxy.send_event(UserEvent::ToggleShadows).unwrap();
        } else if let Some(js_code) = process_fs_ipc(message) {
            proxy.send_event(UserEvent::IpcResponse(js_code)).unwrap();
        } else {
            println!("Unknown IPC message: {}", message);
        }
    };

    let builder = WebViewBuilder::new()
        .with_url("http://localhost:3000")
        .with_ipc_handler(handler)
        .with_accept_first_mouse(true);

    #[cfg(any(
        target_os = "windows",
        target_os = "macos",
        target_os = "ios",
        target_os = "android"
    ))]
    let webview = builder.build(&window)?;

    #[cfg(target_os = "linux")]
    let webview = {
        use tao::platform::unix::WindowExtUnix;
        use wry::WebViewBuilderExtUnix;

        let vbox = window.default_vbox().unwrap();

        builder.build_gtk(vbox)?
    };

    let mut shadows = true;

    event_loop.run(move |event, _, control_flow| {
        *control_flow = ControlFlow::Wait;

        match event {
            Event::NewEvents(StartCause::Init) => {
                println!("Odeli started");
            }

            Event::WindowEvent {
                event: WindowEvent::CloseRequested,
                ..
            } => {
                println!("Closing Odeli");

                *control_flow = ControlFlow::Exit;
            }

            Event::UserEvent(UserEvent::ToggleShadows) => {
                shadows = !shadows;

                println!("Shadow state: {}", shadows);

                #[cfg(windows)]
                {
                    use tao::platform::windows::WindowExtWindows;

                    window.set_undecorated_shadow(shadows);
                }
            }

            Event::UserEvent(UserEvent::IpcResponse(js_code)) => {
                if let Err(err) = webview.evaluate_script(&js_code) {
                    eprintln!("Failed to evaluate JS IPC response: {}", err);
                }
            }

            _ => {}
        }
    });
}

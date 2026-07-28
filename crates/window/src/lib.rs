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
    // ButtonClicked,
}

pub fn run_window() -> wry::Result<()> {
    let event_loop = EventLoopBuilder::<UserEvent>::with_user_event().build();

    let window = WindowBuilder::new()
        .with_title("Odeli")
        .with_inner_size(LogicalSize::new(600.0, 400.0))
        .with_min_inner_size(LogicalSize::new(300.0, 200.0))
        .build(&event_loop)
        .unwrap();

    let proxy = event_loop.create_proxy();

    let handler = move |request: Request<String>| {
        let message = request.body();

        match message.as_str() {
            "toggleShadows" => {
                proxy.send_event(UserEvent::ToggleShadows).unwrap();
            }

            _ => {
                println!("Unknown IPC message: {}", message);
            }
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

    let _webview = webview;

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

            _ => {}
        }
    });
}

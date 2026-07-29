//this is the entry file for all typescript code, served through index.html
import { createShell } from "./layout/shell.js";
function bootstrap_app() {
    let app = document.getElementById("app");
    
    if (!app){
        throw new Error("Root Element Not found");
    }
    app.className = "bg-black"
    app.append(createShell())
    // app.className="bg-red-0"
}

bootstrap_app()

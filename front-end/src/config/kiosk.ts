/**
 * Trava o zoom no totem.
 *
 * O CSS e a meta viewport já cobrem a pinça e o duplo toque, mas sobram
 * dois caminhos quando há teclado ou mouse ligados na máquina: o
 * Ctrl + roda do mouse e o Ctrl + "+" / "-" / "0". E o Safari ignora
 * `user-scalable=no`, então os eventos de gesto também são bloqueados.
 */
export function lockZoom() {
    // Ctrl + roda do mouse
    window.addEventListener(
        "wheel",
        (event) => {
            if (event.ctrlKey) event.preventDefault();
        },
        { passive: false },
    );

    // Ctrl + "+", "-", "0" e o numérico
    window.addEventListener("keydown", (event) => {
        if (!event.ctrlKey && !event.metaKey) return;

        if (["+", "-", "=", "_", "0"].includes(event.key)) {
            event.preventDefault();
        }
    });

    // gestos de pinça do Safari, que ignora user-scalable=no
    for (const tipo of ["gesturestart", "gesturechange", "gestureend"]) {
        document.addEventListener(tipo, (event) => event.preventDefault());
    }
}

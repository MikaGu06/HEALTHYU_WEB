

function inicializarFormularioContacto() {
  const form = document.getElementById("formContacto");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    alert("Mensaje enviado (simulado para la tarea).");

    form.reset();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Misma lógica de nav / tema que usas en el resto de páginas
  if (typeof iniciarTema === "function") iniciarTema();
  if (typeof actualizarNavAuth === "function") actualizarNavAuth();

  inicializarFormularioContacto();
});

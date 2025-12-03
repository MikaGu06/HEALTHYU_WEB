// pedido.js
// Lógica específica de la página de pedido

document.addEventListener("DOMContentLoaded", () => {
  // Inicializar tema y navbar usando las funciones globales
  if (typeof iniciarTema === "function") iniciarTema();
  if (typeof actualizarNavAuth === "function") actualizarNavAuth();
  if (typeof actualizarCarritoNav === "function") actualizarCarritoNav();

  // Si ya tienes funciones globales login/register en script.js, las reutilizamos
  const formLogin = document.getElementById("formLoginPedido");
  if (formLogin && typeof login === "function") {
    formLogin.addEventListener("submit", (e) => {
      e.preventDefault();
      login();
    });
  }

  const formRegister = document.getElementById("formRegisterPedido");
  if (formRegister && typeof register === "function") {
    formRegister.addEventListener("submit", (e) => {
      e.preventDefault();
      register();
    });
  }

  // Aquí puedes llamar a tu lógica de cargar carrito si la tienes en script.js,
  // por ejemplo: if (typeof inicializarPedido === "function") inicializarPedido();
});

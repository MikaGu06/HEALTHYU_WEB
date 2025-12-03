// Lógica específica de la página "Mi cuenta"

document.addEventListener("DOMContentLoaded", async () => {
  if (typeof iniciarTema === "function") iniciarTema();
  if (typeof actualizarNavAuth === "function") actualizarNavAuth();

  const usuario = typeof obtenerUsuario === "function" ? obtenerUsuario() : null;

  if (!usuario) {
    alert("Debes iniciar sesión para acceder a Mi Cuenta.");
    window.location.href = "index.html";
    return;
  }

  const campoNombreUsuario = document.getElementById("campoNombreUsuario");
  const campoEstado = document.getElementById("campoEstado");

  if (campoNombreUsuario) {
    campoNombreUsuario.value = usuario.nombre_usuario || "";
  }
  if (campoEstado) {
    campoEstado.value =
      usuario.estado === 0 || usuario.estado === false ? "Inactivo" : "Activo";
  }

  let perfilCompleto = false;

  function actualizarEstadoPerfil() {
    const idsObligatorios = [
      "campoNombreCompleto",
      "campoCorreo",
      "campoCelular",
      "campoFechaNac",
      "campoDireccion",
      "campoSexo",
      "campoTipoSangre",
      "campoCiPaciente"
      // No hay edad y el centro NO es obligatorio
    ];

    perfilCompleto = idsObligatorios.every((id) => {
      const elemento = document.getElementById(id);
      return elemento && String(elemento.value).trim() !== "";
    });

    const aviso = document.getElementById("avisoPerfil");
    if (!aviso) return;

    if (perfilCompleto) {
      aviso.classList.add("d-none");
    } else {
      aviso.classList.remove("d-none");
    }
  }

  function bloquearNavegacionSiIncompleto() {
    const enlaces = document.querySelectorAll("a.nav-link, a[href$='.html']");

    enlaces.forEach((enlace) => {
      enlace.addEventListener("click", (evento) => {
        const href = enlace.getAttribute("href") || "";
        const esCuenta =
          href === "#" || href === "" || href.includes("cuenta.html");

        if (!perfilCompleto && !esCuenta) {
          evento.preventDefault();
          alert(
            "Completa tus datos básicos de paciente en Mi Cuenta antes de continuar."
          );
        }
      });
    });
  }

  // ================== CARGAR PERFIL DESDE LA API ==================
  async function cargarPerfilDesdeAPI() {
    const mensajePerfil = document.getElementById("mensajePerfil");

    try {
      const respuesta = await fetch(
        `${API_BASE}/pacientes/por-usuario/${usuario.id_usuario}`
      );

      if (respuesta.status === 404) {
        if (mensajePerfil) {
          mensajePerfil.textContent =
            "Aún no tienes datos de paciente, completa el formulario.";
          mensajePerfil.className = "text-muted text-small";
        }
        actualizarEstadoPerfil();
        return;
      }

      if (!respuesta.ok) {
        throw new Error("Error al cargar el perfil");
      }

      const datos = await respuesta.json();
      const paciente = datos.paciente || datos;

      document.getElementById("campoCiPaciente").value =
        paciente.ci_paciente ?? "";
      document.getElementById("campoNombreCompleto").value =
        paciente.nombre_completo ?? "";
      document.getElementById("campoCorreo").value = paciente.correo ?? "";
      document.getElementById("campoCelular").value = paciente.celular ?? "";
      document.getElementById("campoDireccion").value =
        paciente.direccion ?? "";

      if (paciente.fecha_nacimiento) {
        document.getElementById("campoFechaNac").value = String(
          paciente.fecha_nacimiento
        ).substring(0, 10);
      }

      const campoSexo = document.getElementById("campoSexo");
      if (campoSexo) {
        if (paciente.sexo === 0 || paciente.sexo === 1) {
          campoSexo.value = String(paciente.sexo);
        } else {
          campoSexo.value = "";
        }
      }

      const campoTipoSangre = document.getElementById("campoTipoSangre");
      if (campoTipoSangre && paciente.id_tipo_sangre) {
        campoTipoSangre.value = paciente.id_tipo_sangre;
      }

      const campoCentro = document.getElementById("campoCentro");
      if (campoCentro && paciente.id_centro) {
        campoCentro.value = paciente.id_centro;
      }

      if (mensajePerfil) {
        mensajePerfil.textContent =
          "Datos cargados desde la base de datos.";
        mensajePerfil.className = "text-success text-small";
      }

      actualizarEstadoPerfil();
    } catch (error) {
      console.error(error);
      if (mensajePerfil) {
        mensajePerfil.textContent =
          "No se pudieron cargar los datos del paciente.";
        mensajePerfil.className = "text-danger text-small";
      }
    }
  }

  // ================== GUARDAR PERFIL EN LA API ==================
  async function guardarPerfilEnAPI(evento) {
    evento.preventDefault();

    actualizarEstadoPerfil();
    if (!perfilCompleto) {
      alert("Completa todos los campos obligatorios (*) antes de guardar.");
      return;
    }

    const mensajePerfil = document.getElementById("mensajePerfil");

    const datosEnviar = {
      ci_paciente: Number(
        document.getElementById("campoCiPaciente").value
      ),
      nombre_completo: document
        .getElementById("campoNombreCompleto")
        .value.trim(),
      correo: document.getElementById("campoCorreo").value.trim(),
      celular: document.getElementById("campoCelular").value.trim(),
      fecha_nacimiento: document.getElementById("campoFechaNac").value,
      direccion: document.getElementById("campoDireccion").value.trim(),
      sexo: Number(document.getElementById("campoSexo").value),
      id_tipo_sangre: Number(
        document.getElementById("campoTipoSangre").value
      )
      // Edad NO se envía; la puedes calcular en backend si quieres
    };

    const campoCentro = document.getElementById("campoCentro");
    if (campoCentro && campoCentro.value.trim() !== "") {
      datosEnviar.id_centro = Number(campoCentro.value);
    }

    try {
      const respuesta = await fetch(
        `${API_BASE}/pacientes/por-usuario/${usuario.id_usuario}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datosEnviar)
        }
      );

      const datos = await respuesta.json().catch(() => ({}));

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || "Error al guardar los datos");
      }

      if (mensajePerfil) {
        mensajePerfil.textContent =
          "Datos de paciente guardados correctamente en la base de datos.";
        mensajePerfil.className = "text-success text-small";
      }

      actualizarEstadoPerfil();
    } catch (error) {
      console.error(error);
      if (mensajePerfil) {
        mensajePerfil.textContent =
          error.message || "No se pudieron guardar los datos.";
        mensajePerfil.className = "text-danger text-small";
      }
    }
  }

  // ================== CAMBIO DE CONTRASEÑA ==================
  async function cambiarContrasena() {
    const contrasenaActual = document
      .getElementById("campoPassActual")
      .value.trim();
    const contrasenaNueva = document
      .getElementById("campoPassNueva")
      .value.trim();
    const contrasenaRepetir = document
      .getElementById("campoPassRepetir")
      .value.trim();

    const mensajePass = document.getElementById("mensajePass");

    if (!contrasenaActual || !contrasenaNueva || !contrasenaRepetir) {
      if (mensajePass) {
        mensajePass.textContent = "Completa todos los campos.";
        mensajePass.className = "text-danger text-small";
      }
      return;
    }

    if (contrasenaNueva.length < 6) {
      if (mensajePass) {
        mensajePass.textContent =
          "La nueva contraseña debe tener al menos 6 caracteres.";
        mensajePass.className = "text-danger text-small";
      }
      return;
    }

    if (contrasenaNueva !== contrasenaRepetir) {
      if (mensajePass) {
        mensajePass.textContent = "Las contraseñas nuevas no coinciden.";
        mensajePass.className = "text-danger text-small";
      }
      return;
    }

    try {
      const respuesta = await fetch(`${API_BASE}/auth/cambiar-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: usuario.id_usuario,
          contrasenaActual,
          contrasenaNueva
        })
      });

      const datos = await respuesta.json().catch(() => ({}));

      if (!respuesta.ok) {
        throw new Error(
          datos.mensaje || "No se pudo actualizar la contraseña"
        );
      }

      if (mensajePass) {
        mensajePass.textContent = "Contraseña actualizada correctamente.";
        mensajePass.className = "text-success text-small";
      }

      document.getElementById("campoPassActual").value = "";
      document.getElementById("campoPassNueva").value = "";
      document.getElementById("campoPassRepetir").value = "";
    } catch (error) {
      console.error(error);
      if (mensajePass) {
        mensajePass.textContent =
          error.message || "Error al actualizar la contraseña.";
        mensajePass.className = "text-danger text-small";
      }
    }
  }

  // ================== ELIMINAR CUENTA ==================
  async function eliminarCuenta() {
    const confirmar = confirm(
      "Esta acción eliminará tu cuenta y no podrás volver a iniciar sesión con este usuario. ¿Deseas continuar?"
    );
    if (!confirmar) return;

    try {
      const respuesta = await fetch(
        `${API_BASE}/auth/eliminar-cuenta/${usuario.id_usuario}`,
        { method: "DELETE" }
      );

      const datos = await respuesta.json().catch(() => ({}));

      if (!respuesta.ok) {
        throw new Error(
          datos.mensaje || "No se pudo eliminar la cuenta."
        );
      }

      alert("Tu cuenta se eliminó correctamente.");
      if (typeof logout === "function") logout();
    } catch (error) {
      console.error(error);
      alert(error.message || "Error al eliminar la cuenta.");
    }
  }

  // ================== INICIALIZAR EVENTOS ==================
  await cargarPerfilDesdeAPI();
  actualizarEstadoPerfil();
  bloquearNavegacionSiIncompleto();

  const formularioPerfil = document.getElementById("formPerfil");
  if (formularioPerfil) {
    formularioPerfil.addEventListener("submit", guardarPerfilEnAPI);
    formularioPerfil.querySelectorAll("input, select").forEach((elemento) => {
      elemento.addEventListener("input", actualizarEstadoPerfil);
      elemento.addEventListener("change", actualizarEstadoPerfil);
    });
  }

  const botonCambiarPass = document.getElementById("btnCambiarPass");
  if (botonCambiarPass) {
    botonCambiarPass.addEventListener("click", cambiarContrasena);
  }

  const botonEliminarCuenta = document.getElementById("botonEliminarCuenta");
  if (botonEliminarCuenta) {
    botonEliminarCuenta.addEventListener("click", eliminarCuenta);
  }
});

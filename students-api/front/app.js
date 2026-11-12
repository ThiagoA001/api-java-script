const API_URL = 'http://localhost:8080/api/students';

// Elementos globales del DOM (se asignan al cargar la página)
let form, inputId, inputName, inputLastname, inputEmail, inputAge, btnSave, btnCancel, tableBody, alertBox;

document.addEventListener('DOMContentLoaded', () => {
    form = document.getElementById('student-form');
    inputId = document.getElementById('student-id');
    inputName = document.getElementById('name');
    inputLastname = document.getElementById('lastname');
    inputEmail = document.getElementById('email');
    inputAge = document.getElementById('age');
    btnSave = document.getElementById('btn-save');
    btnCancel = document.getElementById('btn-cancel');
    tableBody = document.getElementById('students-table-body');
    alertBox = document.getElementById('alert-message');

    // Cargar los estudiantes al iniciar
    cargarEstudiantes();

    if (form) {
        form.addEventListener('submit', guardarEstudiante);
    }
    if (btnCancel) {
        btnCancel.addEventListener('click', resetearFormulario);
    }
});

// 1. Listar estudiantes (GET)
async function cargarEstudiantes() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`Error ${response.status}`);

        const estudiantes = await response.json();
        
        if (tableBody) {
            tableBody.innerHTML = '';

            if (!estudiantes || estudiantes.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center;">No hay estudiantes registrados</td></tr>`;
                return;
            }

            estudiantes.forEach(estudiante => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${estudiante.id}</td>
                    <td>${estudiante.firstName || estudiante.name || ''}</td>
                    <td>${estudiante.lastName || estudiante.lastname || ''}</td>
                    <td>${estudiante.email}</td>
                    <td>${estudiante.age || ''}</td>
                    <td>
                        <button type="button" class="btn-edit" onclick="editarEstudiante(${estudiante.id})">Editar</button>
                        <button type="button" class="btn-delete" onclick="eliminarEstudiante(${estudiante.id})">Eliminar</button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
        }
    } catch (error) {
        console.error("Error al conectar con la API para listar:", error);
        mostrarAlerta('No se pudo conectar con el servidor', true);
    }
}

// 2. Crear (POST) y Editar (PUT)
async function guardarEstudiante(e) {
    e.preventDefault();
    ocultarAlerta();

    const id = inputId.value;
    const payload = {
        firstName: inputName.value,
        lastName: inputLastname.value,
        email: inputEmail.value,
        age: parseInt(inputAge.value, 10)
    };

    const esEdicion = Boolean(id);
    const url = esEdicion ? `${API_URL}/${id}` : API_URL;
    const method = esEdicion ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            mostrarAlerta(errorData.message || 'Ocurrió un error en la solicitud.', true);
            return;
        }

        mostrarAlerta(esEdicion ? 'Estudiante actualizado con éxito.' : 'Estudiante registrado con éxito.');
        resetearFormulario();
        cargarEstudiantes();
    } catch (error) {
        console.error("Error de red:", error);
        mostrarAlerta('No se pudo conectar con el servidor', true);
    }
}

// 3. Cargar datos en el formulario para Editar (GET por ID)
async function editarEstudiante(id) {
    ocultarAlerta();
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) {
            mostrarAlerta('No se pudo obtener el estudiante.', true);
            return;
        }

        const estudiante = await response.json();

        // Rellenar los inputs con los datos obtenidos
        inputId.value = estudiante.id;
        inputName.value = estudiante.firstName || estudiante.name || '';
        inputLastname.value = estudiante.lastName || estudiante.lastname || '';
        inputEmail.value = estudiante.email;
        inputAge.value = estudiante.age || '';

        // Cambiar texto del botón para que indique actualización
        if (btnSave) btnSave.textContent = 'Actualizar';
        
        // Desplazarse arriba suavemente hacia el formulario
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
        console.error("Error al editar:", error);
        mostrarAlerta('Error al conectar con el servidor', true);
    }
}

// 4. Eliminar estudiante (DELETE)
async function eliminarEstudiante(id) {
    ocultarAlerta();
    const confirmado = confirm('¿Estás seguro de que deseas eliminar este estudiante?');
    if (!confirmado) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            mostrarAlerta('No se pudo eliminar el estudiante.', true);
            return;
        }

        mostrarAlerta('Estudiante eliminado con éxito.');
        cargarEstudiantes();
    } catch (error) {
        console.error("Error al eliminar:", error);
        mostrarAlerta('Error al conectar con el servidor', true);
    }
}

// Funciones auxiliares
function mostrarAlerta(mensaje, esError = false) {
    if (!alertBox) return;
    alertBox.textContent = mensaje;
    alertBox.className = `alert ${esError ? 'alert-error' : 'alert-success'}`;
    alertBox.classList.remove('hidden');
}

function ocultarAlerta() {
    if (!alertBox) return;
    alertBox.classList.add('hidden');
    alertBox.textContent = '';
}

function resetearFormulario() {
    if (form) form.reset();
    if (inputId) inputId.value = '';
    if (btnSave) btnSave.textContent = 'Guardar';
}
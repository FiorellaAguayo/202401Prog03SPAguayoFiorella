const apiUrl = "https://examenesutn.vercel.app/api/PersonaCiudadanoExtranjero";

let personasList = [];

function getElementById(id) { 
    return document.getElementById(id); 
}

document.addEventListener("DOMContentLoaded", function () {
    showPersonList();
    getElementById("btnAgregar").addEventListener("click", () => {
        addPerson();
        showHeader("Alta");
    });
    getElementById("btnCancelar").addEventListener("click", () => {
        hideAbmForm();
    });
    getElementById("btnAceptar").addEventListener("click", () => {
        handleAccept();
    });
    getElementById("selectTipo").addEventListener("change", function() {
        updateFieldVisibility(this.value);
    });
});

function showPersonList() {
    showSpinner();
    const xhr = new XMLHttpRequest();
    xhr.open("GET", apiUrl);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            personasList = JSON.parse(xhr.responseText);
            renderTable();
            hideSpinner();
        }
    };
    xhr.send();
}

function renderTable() {
    const tbody = getElementById("tablaPersonas").getElementsByTagName("tbody")[0];
    tbody.innerHTML = "";
    personasList.forEach(persona => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${persona.id}</td>
            <td>${persona.nombre}</td>
            <td>${persona.apellido}</td>
            <td>${persona.fechaNacimiento}</td>
            <td>${persona.dni || 'N/A'}</td>
            <td>${persona.paisOrigen || 'N/A'}</td>
            <td>
                <button class="btnModify" onclick="editPerson(${persona.id})">Modificar</button>           
            </td>
            <td>
                <button class="btnDelete" onclick="showDeleteForm(${persona.id})">Eliminar</button>
            </td>
            `;
        tbody.appendChild(tr);
    });
}

function addPerson() {
    clearAbmForm();
    Array.from(document.querySelectorAll('#formularioAbm input, #formularioAbm select')).forEach(element => {
        element.readOnly = false;
        element.disabled = false;
    });
    getElementById("abmId").setAttribute('readonly', true);
    getElementById("abmId").setAttribute('disabled', true);
    getElementById("formularioAbm").style.display = "block";
    getElementById("formularioLista").style.display = "none";
}

function handleAccept() {
    const newPerson = getFormData();
    if(newPerson) {
        if(!validateFields(newPerson)) {
            return;
        }
        if(newPerson.id) {
            updatePerson(newPerson);
        }else {
            savePerson(newPerson);
        }
    }
}

async function savePerson(persona) {
    showSpinner();
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify(persona)
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Error al guardar persona: ${response.status} ${errorMessage}`);
        }

        const data = await response.json();
        persona.id = data.id;
        personasList.push(persona);
        renderTable();
        hideAbmForm();
    } catch (error) {
        console.error(error);
    } finally {
        hideSpinner();
    }
}

function updatePerson(persona) {
    showSpinner();
    fetch(apiUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify(persona)
    })
    .then(response => {
        if (response.ok) {
            return response.text();
        } else {
            throw new Error(`Error al actualizar persona: ${response.status}`);
        }
    })
    .then(data => {
        console.log(data);
        const index = personasList.findIndex(p => p.id.toString() == persona.id.toString());
        if (index !== -1) {
            personasList[index] = persona;
        }
        renderTable();
        hideAbmForm();
    })
    .catch(error => {
        alert(error.message);
        hideAbmForm();
    })
    .finally(() => {
        hideSpinner();
    });
}

function getFormData() {
    const id = getElementById("abmId").value;
    const nombre = getElementById("abmNombre").value;
    const apellido = getElementById("abmApellido").value;
    const fecha = getElementById("abmFecha").value;
    const tipo = getElementById("selectTipo").value;
    let persona;

    if (tipo === "Ciudadano") {
        const dni = getElementById("abmDni").value;
        persona = id ? new Ciudadano(id, nombre, apellido, fecha, dni) : new Ciudadano(null, nombre, apellido, fecha, dni);
    } else {
        const paisOrigen = getElementById("abmPaisOrigen").value;
        persona = id ? new Extranjero(id, nombre, apellido, fecha, paisOrigen) : new Extranjero(null, nombre, apellido, fecha, paisOrigen);
    }

    if (!persona.id) {
        delete persona.id;
    }
    return persona;
}

function showSpinner() {
    getElementById("spinner").style.display = "block";
    getElementById("spinnerContainer").style.display = "flex";
}

function hideSpinner() {
    getElementById("spinner").style.display = "none";
    getElementById("spinnerContainer").style.display = "none";
}

function editPerson(id) {
    showHeader("Modificación");
    const persona = personasList.find(p => p.id.toString() == id.toString());
    if (!persona) return;

    getElementById("abmId").value = persona.id;
    getElementById("abmNombre").value = persona.nombre;
    getElementById("abmApellido").value = persona.apellido;
    getElementById("abmFecha").value = persona.fechaNacimiento;
    getElementById("selectTipo").value = persona instanceof Ciudadano ? "Ciudadano" : "Extranjero";
    Array.from(document.querySelectorAll('#formularioAbm input, #formularioAbm select')).forEach(element => {
        element.readOnly = false;
        element.disabled = false;
    });
    getElementById("abmId").setAttribute('readonly', true);
    getElementById("abmId").setAttribute('disabled', true);

    updateFieldVisibility(getElementById("selectTipo").value);
    if (persona instanceof Ciudadano) {
        getElementById("abmDni").value = persona.dni;
    } else {
        getElementById("abmPaisOrigen").value = persona.paisOrigen;
    }
    getElementById("formularioAbm").style.display = "block";
    getElementById("formularioLista").style.display = "none";
}

function showHeader(mode) {
    getElementById("encabezadoAbm").innerHTML = `${mode} de persona`;
}

function hideAbmForm() {
    getElementById("formularioAbm").style.display = "none";
    getElementById("formularioLista").style.display = "block";
}

function clearAbmForm() {
    getElementById("abmId").value = "";
    getElementById("abmNombre").value = "";
    getElementById("abmApellido").value = "";
    getElementById("abmFecha").value = "";
    getElementById("abmDni").value = "";
    getElementById("abmPaisOrigen").value = "";
}

function updateFieldVisibility(tipo) {
    if (tipo === "Ciudadano") {
        getElementById("ciudadano").style.display = "block";
        getElementById("extranjero").style.display = "none";
    } else {
        getElementById("ciudadano").style.display = "none";
        getElementById("extranjero").style.display = "block";
    }
}

function deletePerson(id) {
    showSpinner();
    const xhr = new XMLHttpRequest();
    xhr.open("DELETE", apiUrl);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                personasList = personasList.filter(p => p.id.toString() !== id.toString());
                renderTable();
            } else {
                alert("Error al eliminar persona.");
            }
            hideSpinner();
            hideAbmForm();
        }
    };
    xhr.send(JSON.stringify({ id: id }));
}

function showDeleteForm(id) {
    showHeader("Baja");
    const persona = personasList.find(p => p.id.toString() == id.toString());
    if (!persona) return;

    getElementById("abmId").value = persona.id;
    getElementById("abmNombre").value = persona.nombre;
    getElementById("abmApellido").value = persona.apellido;
    getElementById("abmFecha").value = persona.fechaNacimiento;

    Array.from(document.querySelectorAll('#formularioAbm input, #formularioAbm select')).forEach(element => {
        element.readOnly = true;
        element.disabled = true;
    });

    if (persona.dni !== undefined) {
        getElementById("selectTipo").value = "Ciudadano";
        getElementById("abmDni").value = persona.dni;
        getElementById("ciudadano").style.display = "block";
        getElementById("extranjero").style.display = "none";
    } else {
        getElementById("selectTipo").value = "Extranjero";
        getElementById("abmPaisOrigen").value = persona.paisOrigen;
        getElementById("ciudadano").style.display = "none";
        getElementById("extranjero").style.display = "block";
    }

    getElementById("formularioAbm").style.display = "block";
    getElementById("formularioLista").style.display = "none";
    getElementById("btnAceptar").onclick = function() {
        deletePerson(persona.id);
    };
}

function validateFields(persona) {
    if (!persona.nombre || !persona.apellido || !persona.fechaNacimiento) {
        alert("Complete los campos Nombre, Apellido y Fecha correctamente.");
        return false;
    }

    if (persona.dni !== undefined) {
        if (!persona.dni || isNaN(persona.dni)) {
            alert("Ingrese un DNI numérico.");
            return false;
        }
    }

    if (persona.paisOrigen !== undefined) {
        if (!persona.paisOrigen || typeof persona.paisOrigen !== 'string') {
            alert("Ingrese un país de origen válido.");
            return false;
        }
    }

    return true;
}
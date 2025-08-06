document.addEventListener('DOMContentLoaded', function() {
    // Obtener elementos del DOM
    const reservaForm = document.getElementById('reservaForm');
    const reservasBody = document.getElementById('reservasBody');
    const filtroFecha = document.getElementById('filtroFecha');
    const btnFiltrar = document.getElementById('btnFiltrar');
    const btnExportar = document.getElementById('btnExportar');
    
    // Array para almacenar las reservas
    let reservas = JSON.parse(localStorage.getItem('reservas')) || [];
    
    // Cargar reservas al iniciar
    cargarReservas();
    
    // Manejar el envío del formulario
    reservaForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Obtener valores del formulario
        const nombre = document.getElementById('nombre').value;
        const email = document.getElementById('email').value;
        const telefono = document.getElementById('telefono').value;
        const bicicleta = document.getElementById('bicicleta').value;
        const fecha = document.getElementById('fecha').value;
        const hora = document.getElementById('hora').value;
        
        // Validar que la bicicleta no esté reservada en ese horario
        const bicicletaReservada = reservas.some(reserva => 
            reserva.bicicleta === bicicleta && 
            reserva.fecha === fecha && 
            reserva.hora === hora
        );
        
        if (bicicletaReservada) {
            alert('Esta bicicleta ya está reservada para el horario seleccionado.');
            return;
        }
        
        // Crear nueva reserva
        const nuevaReserva = {
            id: Date.now(),
            nombre,
            email,
            telefono,
            bicicleta,
            fecha,
            hora
        };
        
        // Agregar a las reservas
        reservas.push(nuevaReserva);
        
        // Guardar en localStorage
        localStorage.setItem('reservas', JSON.stringify(reservas));
        
        // Recargar la tabla
        cargarReservas();
        
        // Limpiar formulario
        reservaForm.reset();
        
        // Mostrar mensaje de éxito
        alert('Reserva realizada con éxito!');
    });
    
    // Función para cargar las reservas en la tabla
    function cargarReservas(filtro = null) {
        reservasBody.innerHTML = '';
        
        let reservasMostrar = reservas;
        
        // Aplicar filtro si existe
        if (filtro) {
            reservasMostrar = reservas.filter(reserva => reserva.fecha === filtro);
        }
        
        // Ordenar por fecha y hora
        reservasMostrar.sort((a, b) => {
            if (a.fecha === b.fecha) {
                return a.hora.localeCompare(b.hora);
            }
            return a.fecha.localeCompare(b.fecha);
        });
        
        // Mostrar cada reserva
        reservasMostrar.forEach(reserva => {
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td>Bicicleta ${reserva.bicicleta}</td>
                <td>${reserva.nombre}</td>
                <td>${formatearFecha(reserva.fecha)}</td>
                <td>${reserva.hora}</td>
                <td class="acciones">
                    <button class="btn-accion btn-editar" data-id="${reserva.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-accion btn-eliminar" data-id="${reserva.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            reservasBody.appendChild(tr);
        });
        
        // Agregar eventos a los botones de editar y eliminar
        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                eliminarReserva(id);
            });
        });
        
        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                editarReserva(id);
            });
        });
    }
    
    // Función para formatear la fecha
    function formatearFecha(fechaStr) {
        const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
        const fecha = new Date(fechaStr);
        return fecha.toLocaleDateString('es-ES', opciones);
    }
    
    // Función para eliminar una reserva
    function eliminarReserva(id) {
        if (confirm('¿Estás seguro de que deseas eliminar esta reserva?')) {
            reservas = reservas.filter(reserva => reserva.id !== id);
            localStorage.setItem('reservas', JSON.stringify(reservas));
            cargarReservas();
        }
    }
    
    // Función para editar una reserva
    function editarReserva(id) {
        const reserva = reservas.find(r => r.id === id);
        if (!reserva) return;
        
        // Llenar el formulario con los datos de la reserva
        document.getElementById('nombre').value = reserva.nombre;
        document.getElementById('email').value = reserva.email;
        document.getElementById('telefono').value = reserva.telefono;
        document.getElementById('bicicleta').value = reserva.bicicleta;
        document.getElementById('fecha').value = reserva.fecha;
        document.getElementById('hora').value = reserva.hora;
        
        // Eliminar la reserva original
        reservas = reservas.filter(r => r.id !== id);
        localStorage.setItem('reservas', JSON.stringify(reservas));
        
        // Recargar la tabla
        cargarReservas();
    }
    
    // Manejar el filtrado por fecha
    btnFiltrar.addEventListener('click', function() {
        if (filtroFecha.value) {
            cargarReservas(filtroFecha.value);
        } else {
            cargarReservas();
        }
    });
    
    // Manejar la exportación a CSV
    btnExportar.addEventListener('click', function() {
        exportarACSV();
    });
    
    // Función para exportar a CSV
    function exportarACSV() {
        if (reservas.length === 0) {
            alert('No hay reservas para exportar.');
            return;
        }
        
        // Crear el contenido CSV
        let csvContent = "data:text/csv;charset=utf-8,";
        
        // Encabezados
        csvContent += "Bicicleta,Nombre,Email,Teléfono,Fecha,Hora\n";
        
        // Datos
        reservas.forEach(reserva => {
            csvContent += `Bicicleta ${reserva.bicicleta},${reserva.nombre},${reserva.email},${reserva.telefono},${reserva.fecha},${reserva.hora}\n`;
        });
        
        // Crear enlace de descarga
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "reservas_ciclismo.csv");
        document.body.appendChild(link);
        
        // Descargar el archivo
        link.click();
        
        // Limpiar
        document.body.removeChild(link);
    }
    
    // Establecer la fecha mínima en el campo de fecha como hoy
    document.getElementById('fecha').min = new Date().toISOString().split("T")[0];
    filtroFecha.min = new Date().toISOString().split("T")[0];
});
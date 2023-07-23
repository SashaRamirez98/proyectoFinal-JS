let products = []; // Array para almacenar los productos
let priceOptions = []; // Array para almacenar las opciones de precio predeterminado

// Función para mostrar un mensaje de error
function mostrarError(mensaje) {
  const mensajeElemento = document.getElementById("mensaje");
  mensajeElemento.textContent = mensaje;
  mensajeElemento.style.display = "block";
}

// Función para ocultar el mensaje
function ocultarMensaje() {
  const mensajeElemento = document.getElementById("mensaje");
  mensajeElemento.style.display = "none";
}

// Función para actualizar el precio según la opción seleccionada
function actualizarPrecio() {
    const opcionesPrecio = document.getElementById("opcionesPrecio");
    const precioManual = document.getElementById("precioManual");
  
    if (opcionesPrecio.value !== "") {
      precioManual.value = opcionesPrecio.value; // Asignar el valor seleccionado al campo manual
      precioManual.disabled = true;
    } else {
      precioManual.disabled = false;
    }
  }

// Función para calcular el total de los productos
function calcularTotal() {
  let total = 0;

  for (const product of products) {
    total += Number(product.price) * Number(product.quantity);
  }

  return total;
}

// Función para actualizar el valor total
function actualizarTotal() {
  const totalElemento = document.getElementById("total");
  totalElemento.textContent = `Total: ${calcularTotal().toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  })}`;
}

// Función para agregar un producto
function agregarProducto() {
    const productoNombre = document.getElementById("productoNombre").value.trim();
    const opcionesPrecio = document.getElementById("opcionesPrecio").value;
    const precioManual = document.getElementById("precioManual").value;
    const productoCantidad = document.getElementById("productoCantidad").value;
  
    if (productoNombre === "") {
      mostrarError("Por favor, ingresa un nombre válido para el producto.");
      return;
    }
  
    let precio = "";
  
    if (opcionesPrecio !== "") {
      precio = opcionesPrecio;
    } else if (precioManual !== "") {
      precio = precioManual;
    }
  
    if (precio === "") {
      mostrarError("Por favor, ingresa un precio válido para el producto.");
      return;
    }
  
    if (isNaN(Number(precio))) {
      mostrarError("El precio ingresado no es válido. Por favor, ingresa un número válido para el precio del producto.");
      return;
    }
  
    if (productoCantidad === "" || isNaN(Number(productoCantidad))) {
      mostrarError("La cantidad ingresada no es válida. Por favor, ingresa un número válido para la cantidad del producto.");
      return;
    }
  
    const product = {
      name: productoNombre,
      price: precio,
      quantity: productoCantidad
    };
  
    products.push(product);
    guardarProductosEnLocalStorage();
    mostrarProductosEnTabla();
  
    // Limpiar campos
    document.getElementById("productoNombre").value = "";
    document.getElementById("opcionesPrecio").value = "";
    document.getElementById("precioManual").disabled = false; // Habilitar el campo manual siempre al agregar un producto
    document.getElementById("precioManual").value = ""; // Limpiar el campo manual
    document.getElementById("productoCantidad").value = "";
  
    // Actualizar total
    actualizarTotal();
    ocultarMensaje();
  }

// Función para eliminar un producto
function eliminarProducto(rowIndex) {
  products.splice(rowIndex, 1);
  guardarProductosEnLocalStorage();
  mostrarProductosEnTabla();
  actualizarTotal();
}

// Función para guardar los productos en el Local Storage
function guardarProductosEnLocalStorage() {
    localStorage.setItem("products", JSON.stringify(products));
  }

// Función para cargar las opciones de precio predeterminado desde el archivo JSON utilizando fetch y promesas
function cargarOpcionesPrecioDesdeJSON() {
    return new Promise((resolve, reject) => {
      fetch("JSON/data.json") // Modificar la ruta al archivo "data.json" dentro de la carpeta "JSON"
        .then(response => {
          if (!response.ok) {
            throw new Error("Error al cargar las opciones de precio");
          }
          return response.json();
        })
        .then(data => {
          priceOptions = data.priceOptions;
          llenarSelectOpcionesPrecio();
          resolve();
        })
        .catch(error => {
          reject(error);
        });
    });
  }

// Función para llenar el elemento <select> con las opciones de precio predeterminado
function llenarSelectOpcionesPrecio() {
    const opcionesPrecioSelect = document.getElementById("opcionesPrecio");
    opcionesPrecioSelect.innerHTML = '<option value="" disabled selected>Selecciona un precio</option>';
    
    for (const option of priceOptions) {
      const optionElement = document.createElement("option");
      optionElement.value = option.value;
      optionElement.textContent = option.label;
      opcionesPrecioSelect.appendChild(optionElement);
    }
  }

// Función para cargar los productos desde el Local Storage
function cargarProductosDesdeLocalStorage() {
    return new Promise((resolve, reject) => {
      const productosGuardados = localStorage.getItem("products");
      if (productosGuardados) {
        products = JSON.parse(productosGuardados);
        mostrarProductosEnTabla();
        actualizarTotal();
      }
      resolve();
    });
  }
// Función para mostrar los productos en la tabla
function mostrarProductosEnTabla() {
  const table = document.getElementById("productTable").getElementsByTagName("tbody")[0];
  table.innerHTML = "";

  for (let i = 0; i < products.length; i++) {
    const product = products[i];

    const row = table.insertRow(-1);

    const nameCell = row.insertCell(0);
    nameCell.textContent = product.name;

    const priceCell = row.insertCell(1);
    priceCell.textContent = Number(product.price).toLocaleString("en-US", {
      style: "currency",
      currency: "USD"
    });

    const quantityCell = row.insertCell(2);
    quantityCell.textContent = product.quantity;

    const unitPriceCell = row.insertCell(3);
    unitPriceCell.textContent = Number(product.price).toLocaleString("en-US", {
      style: "currency",
      currency: "USD"
    });

    const totalCell = row.insertCell(4);
    totalCell.textContent = (Number(product.price) * Number(product.quantity)).toLocaleString("en-US", {
      style: "currency",
      currency: "USD"
    });

    const deleteCell = row.insertCell(5);
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Eliminar";
    deleteBtn.addEventListener("click", function () {
      eliminarProducto(i);
    });
    deleteCell.appendChild(deleteBtn);
  }
}

// Función para exportar la tabla a un archivo Excel
function exportarTablaExcel() {
  const table = document.getElementById("productTable");
  const workbook = XLSX.utils.table_to_book(table, { sheet: "Productos" });
  const fechaActual = new Date().toISOString().slice(0, 10); // Obtener fecha actual
  const nombreArchivo = `productos_${fechaActual}.xlsx`; // Nombre del archivo

  // Convertir el libro a un archivo Excel y descargarlo
  XLSX.writeFile(workbook, nombreArchivo);
}

/// Función principal para inicializar la aplicación
async function init() {
    const agregarProductoBtn = document.getElementById("agregarProductoBtn");
    agregarProductoBtn.addEventListener("click", async () => {
      await cargarOpcionesPrecioDesdeJSON();
      agregarProducto();
    });
  
    await cargarProductosDesdeLocalStorage(); // Esperar a que los productos se carguen desde el Local Storage
  }

// Ejecutar la función de inicialización
init();
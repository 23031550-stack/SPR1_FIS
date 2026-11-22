// Importación de las librerías de Three.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* =====================================================
   1. INICIALIZACIÓN DE LA INTERFAZ GRÁFICA (UI)
   ===================================================== */
// Crear los foquitos navideños de forma dinámica
const COLORES_LUCES = ['#c8102e', '#e0a526', '#1f6b4a', '#244b8f'];
document.getElementById('lights').innerHTML = Array.from({ length: 12 }, (_, i) =>
  `<i style="color:${COLORES_LUCES[i % 4]}"></i>`).join('');


/* =====================================================
   2. CONFIGURACIÓN BÁSICA DE THREE.JS
   ===================================================== */
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
// Fondo transparente para que el CSS sea el que dé el color
scene.background = null; 

const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// Luces para dar volumen al modelo 3D
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(5, 5, 5);
scene.add(dirLight);


/* =====================================================
   3. CONTROLES DE CÁMARA (Requisito del PDF)
   ===================================================== */
// OrbitControls limitado: Solo permite rotar, no hacer zoom ni paneo.
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false; 
controls.enablePan = false;  
controls.enableDamping = true; 


/* =====================================================
   4. CREACIÓN DEL MODELO 3D (Placeholder)
   ===================================================== */
// NOTA: Aquí se usaría GLTFLoader para cargar el .glb real.
let modeloActual;
const geometry = new THREE.CylinderGeometry(1.2, 1.2, 2.5, 32);
const material = new THREE.MeshStandardMaterial({ color: 0xc8102e, roughness: 0.7 });
modeloActual = new THREE.Mesh(geometry, material);
scene.add(modeloActual);

// Función para el cambio de modelo (Preparada para expansión)
let corteSeleccionado = null;

// Función para el cambio de modelo (Preparada para expansión)
window.cargarModelo = function(nombre, boton) {
    // Guarda únicamente el último modelo elegido
    corteSeleccionado = nombre;

    // Resalta el botón seleccionado
    document.querySelectorAll('#modelos .opt').forEach(b => b.classList.remove('active'));
    boton.classList.add('active');

    // Actualiza la vista previa conservando talla y patrón previos
    const tag = document.getElementById('tag');
    if (tag) {
        tag.textContent = `Vista previa 3D: ${corteSeleccionado}`;
    }

    modeloActual.material.color.setHex(0xc8102e);
};


/* =====================================================
   5. CARGA DE TEXTURAS CON CANVAS (Requisito del PDF)
   ===================================================== */
// Creamos un canvas oculto en memoria
const canvasTexturas = document.createElement("canvas");
canvasTexturas.width = 512; 
canvasTexturas.height = 512;
const ctx = canvasTexturas.getContext("2d");
let canvasTexture = new THREE.CanvasTexture(canvasTexturas);

window.aplicarTextura = async function(patron, boton) {
    // Actualizar el botón activo
    document.querySelectorAll('#patrones .opt').forEach(b => b.classList.remove('active'));
    boton.classList.add('active');

    // 1. Pintamos el fondo del lienzo
    ctx.fillStyle = patron === 'renos' ? '#c8102e' : '#1f6b4a';
    ctx.fillRect(0, 0, 512, 512);

    // 2. Dibujamos el diseño (Simulación de la textura)
    ctx.fillStyle = '#fff';
    ctx.font = "40px Arial";
    ctx.fillText(patron === 'renos' ? '🦌 RENOS' : '❄️ COPOS', 100, 256);

    // 3. Convertimos el Canvas en una textura de Three.js y la aplicamos
    canvasTexture.needsUpdate = true;
    modeloActual.material.map = canvasTexture;
    modeloActual.material.needsUpdate = true;
};


/* =====================================================
   6. VALIDACIÓN DE COMPRA (Requisito de Testing)
   ===================================================== */
window.validarCompra = function() {
    const talla = document.getElementById('talla-select').value;
    const msg = document.getElementById('msg');

  if (!corteSeleccionado) {
        msg.textContent = "Elige un modelo de suéter para continuar";
        msg.className = "err"; // Pinta el texto de rojo
    } else if (talla === "") {
        msg.textContent = "Elige una talla para continuar";
        msg.className = "err"; // Pinta el texto de rojo
    } else {
        msg.textContent = `¡Excelente! ${corteSeleccionado} (Talla ${talla}) agregado al carrito.`;
        msg.className = "ok";  // Pinta el texto de verde
    }
   
};

/* =====================================================
   7. BUCLE DE ANIMACIÓN Y RESPONSIVIDAD
   ===================================================== */
// Ajustar la cámara si el usuario cambia el tamaño de la ventana
window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

// Bucle infinito de renderizado
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Necesario para el efecto de amortiguación
    renderer.render(scene, camera);
}
animate();

// Ejecutar la textura inicial al cargar la página
aplicarTextura('renos', document.querySelector('#patrones .opt'));
// Importación de las librerías de Three.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

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
   4. CREACIÓN DEL MODELO 3D
   ===================================================== */

let sweater_cardigan;
let sweater_classic;
let sweater_turtleneck;
let sweater_zip;
precargarModelos();

let modeloActual = sweater_classic;
let escala = 3.5;

let corteSeleccionado = null;

// Función para el cambio de modelo (Preparada para expansión)
window.cargarModelo = function(nombre, boton) {
    try {
        // Guarda únicamente el último modelo elegido
        corteSeleccionado = nombre;

        // Resalta el botón seleccionado
        document.querySelectorAll('#modelos .opt').forEach(b => b.classList.remove('active'));
        boton.classList.add('active');

        scene.remove(modeloActual);

        switch(nombre) {
            case 'Suéter Clásico':
                modeloActual = sweater_classic;
                break;

            case 'Cuello Alto':
                modeloActual = sweater_turtleneck;
                break;

            case 'Cárdigan':
                modeloActual = sweater_cardigan;
                break;

            case 'Con Cierre':
                modeloActual = sweater_zip;
                break;
        }

        modeloActual.scale.set(escala, escala, escala);
        scene.add(modeloActual);

        //mostrar nombre del corte
        const tag = document.getElementById('tag');
        if (tag) {
            tag.textContent = `Vista previa 3D: ${corteSeleccionado}`;
        }

    } catch (error) {
        const tag = document.getElementById('tag');
        if (tag) {
            tag.textContent = `Vista previa 3D`;
        }

        alert("No se pudo cargar el modelo.");
    }


    //las texturas se cargan correctamente pero las coordenadas UV de los modelos necesitan ser ajustadas, ya que no están cargando correctamente la textura.
    try {
       //pruebaCargaTextura();
    } catch (error) {
        
    }
};

function pruebaCargaTextura() {
    const textureLoader = new THREE.TextureLoader();
    const textura = textureLoader.load('texturas/plantilla.png');

    modeloActual.traverse((obj) => {
        if (obj.isMesh) {
            obj.material.map = textura;
            obj.material.needsUpdate = true;
        }
    });
}

function precargarModelos() {
    const loader = new GLTFLoader();
    
    loader.load('modelos/sweater_cardigan.glb', (gltf) => {
        sweater_cardigan = gltf.scene;
    });

    loader.load('modelos/sweater_classic.glb', (gltf) => {
        sweater_classic = gltf.scene;
    });

    loader.load('modelos/sweater_turtleneck.glb', (gltf) => {
        sweater_turtleneck = gltf.scene;
    });

    loader.load('modelos/sweater_zip.glb', (gltf) => {
        sweater_zip = gltf.scene;
    });
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

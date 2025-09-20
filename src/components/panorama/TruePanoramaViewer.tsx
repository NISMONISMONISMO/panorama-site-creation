import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

interface TruePanoramaViewerProps {
  imageUrl: string;
  className?: string;
  onHotspotClick?: (hotspot: any) => void;
  hotspots?: Array<{
    id: string;
    x: number;
    y: number; 
    z: number;
    title: string;
    targetPanorama: string;
  }>;
}

export default function TruePanoramaViewer({ 
  imageUrl, 
  className = "",
  hotspots = [],
  onHotspotClick
}: TruePanoramaViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const hotspotMeshesRef = useRef<THREE.Group[]>([]);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const [isLoading, setIsLoading] = useState(true);
  
  // Управление мышью
  const mouseRef = useRef({ x: 0, y: 0 });
  const isMouseDownRef = useRef(false);
  const phi = useRef(0);
  const theta = useRef(0);

  useEffect(() => {
    if (!mountRef.current || sceneRef.current) return;

    const container = mountRef.current;
    
    // Создаем сцену только один раз
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75, 
      container.clientWidth / container.clientHeight, 
      0.1, 
      1000
    );
    
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance"
    });
    
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Создаем сферу для панорамы (изнутри)
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1); // Инвертируем для просмотра изнутри
    
    const material = new THREE.MeshBasicMaterial();
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Устанавливаем начальную позицию камеры
    camera.position.set(0, 0, 0);
    
    // Сохраняем ссылки
    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;
    sphereRef.current = sphere;

    // Управление мышью
    const onMouseDown = (event: MouseEvent) => {
      isMouseDownRef.current = true;
      mouseRef.current.x = event.clientX;
      mouseRef.current.y = event.clientY;
    };
    
    const onMouseClick = (event: MouseEvent) => {
      // Проверяем клик по хотспоту
      if (!renderer || !camera || !sceneRef.current) return;
      
      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      raycasterRef.current.setFromCamera(mouse, camera);
      
      // Проверяем пересечения с хотспотами
      const intersects = raycasterRef.current.intersectObjects(
        hotspotMeshesRef.current.map(group => group.children).flat()
      );
      
      if (intersects.length > 0) {
        // Нашли пересечение с хотспотом
        const clickedObject = intersects[0].object;
        let hotspotGroup = clickedObject.parent;
        
        // Поднимаемся по иерархии до группы хотспота
        while (hotspotGroup && !hotspotGroup.userData.hotspot) {
          hotspotGroup = hotspotGroup.parent;
        }
        
        if (hotspotGroup && hotspotGroup.userData.hotspot && onHotspotClick) {
          console.log('Hotspot clicked:', hotspotGroup.userData.hotspot);
          onHotspotClick({ hotspot: hotspotGroup.userData.hotspot });
        }
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!isMouseDownRef.current) return;

      const deltaX = event.clientX - mouseRef.current.x;
      const deltaY = event.clientY - mouseRef.current.y;

      // Поворот как в Google Street View
      phi.current -= deltaX * 0.005;
      theta.current += deltaY * 0.005;
      
      // Ограничиваем вертикальный поворот
      theta.current = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, theta.current));

      // Применяем поворот к камере
      const x = Math.cos(phi.current) * Math.cos(theta.current);
      const y = Math.sin(theta.current);
      const z = Math.sin(phi.current) * Math.cos(theta.current);
      
      camera.lookAt(x, y, z);

      mouseRef.current.x = event.clientX;
      mouseRef.current.y = event.clientY;
    };

    const onMouseUp = () => {
      isMouseDownRef.current = false;
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const fov = camera.fov + event.deltaY * 0.05;
      camera.fov = Math.max(30, Math.min(120, fov));
      camera.updateProjectionMatrix();
    };

    // Touch поддержка
    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        isMouseDownRef.current = true;
        mouseRef.current.x = event.touches[0].clientX;
        mouseRef.current.y = event.touches[0].clientY;
      }
    };

    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 1 && isMouseDownRef.current) {
        event.preventDefault();
        
        const deltaX = event.touches[0].clientX - mouseRef.current.x;
        const deltaY = event.touches[0].clientY - mouseRef.current.y;

        phi.current -= deltaX * 0.005;
        theta.current += deltaY * 0.005;
        theta.current = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, theta.current));

        const x = Math.cos(phi.current) * Math.cos(theta.current);
        const y = Math.sin(theta.current);
        const z = Math.sin(phi.current) * Math.cos(theta.current);
        
        camera.lookAt(x, y, z);

        mouseRef.current.x = event.touches[0].clientX;
        mouseRef.current.y = event.touches[0].clientY;
      }
    };

    const onTouchEnd = () => {
      isMouseDownRef.current = false;
    };

    // Добавляем слушатели
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('click', onMouseClick);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('wheel', onWheel);
    renderer.domElement.addEventListener('touchstart', onTouchStart);
    renderer.domElement.addEventListener('touchmove', onTouchMove);
    renderer.domElement.addEventListener('touchend', onTouchEnd);

    // Обработка изменения размера
    const handleResize = () => {
      if (!camera || !renderer || !container) return;
      
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Анимационный цикл
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Анимация хотспотов
      const time = Date.now() * 0.002;
      hotspotMeshesRef.current.forEach((hotspotGroup) => {
        if (hotspotGroup.userData.ringMesh) {
          const ringMesh = hotspotGroup.userData.ringMesh;
          // Пульсация опацити кольца
          ringMesh.material.opacity = 0.3 + 0.3 * Math.sin(time * 3);
          // Вращение кольца
          ringMesh.rotation.z = time;
        }
        
        if (hotspotGroup.userData.sphereMesh) {
          const sphereMesh = hotspotGroup.userData.sphereMesh;
          // Легкое покачивание основного круга
          sphereMesh.scale.setScalar(1 + 0.1 * Math.sin(time * 2));
        }
      });
      
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    };
    animate();

    // Очистка при размонтировании
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (renderer?.domElement) {
        renderer.domElement.removeEventListener('mousedown', onMouseDown);
        renderer.domElement.removeEventListener('click', onMouseClick);
        renderer.domElement.removeEventListener('wheel', onWheel);
        renderer.domElement.removeEventListener('touchstart', onTouchStart);
        renderer.domElement.removeEventListener('touchmove', onTouchMove);
        renderer.domElement.removeEventListener('touchend', onTouchEnd);
      }
      
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      
      // Очищаем hotspot'ы
      hotspotMeshesRef.current.forEach(mesh => {
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(mat => mat.dispose());
          } else {
            mesh.material.dispose();
          }
        }
      });
      
      // Очищаем основные объекты
      if (sphere) {
        if (sphere.geometry) sphere.geometry.dispose();
        if (sphere.material) {
          const mat = sphere.material as THREE.MeshBasicMaterial;
          if (mat.map) mat.map.dispose();
          mat.dispose();
        }
      }
      
      if (scene) scene.clear();
      
      if (renderer) {
        // Принудительно освобождаем WebGL контекст
        const gl = renderer.getContext();
        if (gl) {
          const loseContext = gl.getExtension('WEBGL_lose_context');
          if (loseContext) loseContext.loseContext();
        }
        
        if (container && renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        renderer.dispose();
      }
      
      // Обнуляем ссылки
      sceneRef.current = null;
      rendererRef.current = null;
      cameraRef.current = null;
      sphereRef.current = null;
    };
  }, []); // Зависимости убираем, создаем только один раз

  // Загрузка текстуры панорамы
  useEffect(() => {
    if (!sphereRef.current) return;

    setIsLoading(true);
    
    const loader = new THREE.TextureLoader();
    loader.load(
      imageUrl,
      (texture) => {
        if (sphereRef.current) {
          const material = sphereRef.current.material as THREE.MeshBasicMaterial;
          if (material.map) material.map.dispose(); // Очищаем старую текстуру
          material.map = texture;
          material.needsUpdate = true;
        }
        setIsLoading(false);
      },
      undefined,
      (error) => {
        console.error('Ошибка загрузки панорамы:', error);
        setIsLoading(false);
      }
    );
  }, [imageUrl]);

  // Обновление hotspot'ов
  useEffect(() => {
    console.log('TruePanoramaViewer: Updating hotspots, received:', hotspots.length, 'hotspots');
    console.log('TruePanoramaViewer: Hotspots data:', hotspots);
    
    if (!sceneRef.current) {
      console.log('TruePanoramaViewer: No scene ref, skipping hotspots update');
      return;
    }

    // Удаляем старые hotspot'ы
    hotspotMeshesRef.current.forEach(mesh => {
      sceneRef.current?.remove(mesh);
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(mat => mat.dispose());
        } else {
          mesh.material.dispose();
        }
      }
    });
    hotspotMeshesRef.current = [];

    // Добавляем новые hotspot'ы
    hotspots.forEach((hotspot, index) => {
      // Создаем группу для хотспота (круг + кольцо)
      const hotspotGroup = new THREE.Group();
      
      // Основной круг хотспота
      const sphereGeometry = new THREE.SphereGeometry(12, 16, 16);
      const sphereMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ffff,
        transparent: true,
        opacity: 0.9
      });
      const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
      
      // Пульсирующее кольцо
      const ringGeometry = new THREE.RingGeometry(15, 20, 32);
      const ringMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ffff,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
      });
      const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
      
      // Позиционируем на сфере
      const radius = 480; // Ближе к камере
      const position = new THREE.Vector3(
        hotspot.x * radius,
        hotspot.y * radius,
        hotspot.z * radius
      );
      
      hotspotGroup.position.copy(position);
      
      // Поворачиваем кольцо к камере
      hotspotGroup.lookAt(0, 0, 0);
      
      hotspotGroup.add(sphereMesh);
      hotspotGroup.add(ringMesh);
      
      // Сохраняем данные о hotspot'е
      hotspotGroup.userData = { 
        hotspot, 
        index,
        sphereMesh,
        ringMesh,
        startTime: Date.now() 
      };
      
      sceneRef.current.add(hotspotGroup);
      hotspotMeshesRef.current.push(hotspotGroup);
      
      console.log(`Hotspot ${index} added:`, {
        position,
        hotspot: hotspot.title || `Hotspot ${index + 1}`,
        target: hotspot.targetPanorama
      });
    });
  }, [hotspots]);

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={mountRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ minHeight: '400px' }}
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white text-center">
            <div className="animate-spin w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full mx-auto mb-2"></div>
            <p>Загрузка панорамы...</p>
          </div>
        </div>
      )}

      {/* Инструкция */}
      <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-2 rounded-lg text-sm">
        Перетаскивайте для просмотра 360° • Колесико для масштабирования
      </div>
    </div>
  );
}
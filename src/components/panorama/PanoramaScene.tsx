import { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { Hotspot } from './types';

interface PanoramaSceneProps {
  imageUrl: string;
  hotspots: Hotspot[];
  isEditMode: boolean;
  isTour: boolean;
  isDragging: boolean;
  onLoadingChange: (loading: boolean) => void;
  onCanvasClick: (event: MouseEvent) => void;
  onHotspotClick: (event: MouseEvent) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onHotspotCreate?: (position: { x: number; y: number; z: number }) => void;
}

export default function PanoramaScene({
  imageUrl,
  hotspots,
  isEditMode,
  isTour,
  isDragging,
  onLoadingChange,
  onCanvasClick,
  onHotspotClick,
  onDragStart,
  onDragEnd,
  onHotspotCreate
}: PanoramaSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const hotspotMeshesRef = useRef<THREE.Mesh[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const isMouseDownRef = useRef(false);

  const createHotspotMesh = useCallback((hotspot: Hotspot) => {
    const geometry = new THREE.SphereGeometry(8, 16, 16);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x00ffff,
      transparent: true,
      opacity: 0.8
    });
    const mesh = new THREE.Mesh(geometry, material);
    
    // Позиционируем hotspot на поверхности сферы
    const distance = 480; // Чуть ближе к камере чем сфера панорамы (500)
    mesh.position.set(hotspot.x * distance, hotspot.y * distance, hotspot.z * distance);
    mesh.userData = { hotspot };
    
    return mesh;
  }, []);

  const updateHotspots = useCallback(() => {
    if (!sceneRef.current) return;
    
    // Удаляем старые hotspot'ы
    hotspotMeshesRef.current.forEach(mesh => {
      sceneRef.current?.remove(mesh);
    });
    hotspotMeshesRef.current = [];
    
    // Добавляем новые hotspot'ы
    hotspots.forEach(hotspot => {
      const mesh = createHotspotMesh(hotspot);
      sceneRef.current?.add(mesh);
      hotspotMeshesRef.current.push(mesh);
    });
  }, [hotspots, createHotspotMesh]);

  const handleCanvasClick = useCallback((event: MouseEvent) => {
    console.log('🎯 PanoramaScene: Canvas clicked!', { 
      isEditMode, 
      isDragging, 
      hotspotsLength: hotspots.length,
      hasOnHotspotCreate: !!onHotspotCreate
    });
    
    if (!isEditMode) {
      console.log('❌ Not in edit mode');
      return;
    }
    
    if (!cameraRef.current || !sphereRef.current) {
      console.log('❌ Camera or sphere not ready');
      return;
    }
    
    if (isDragging) {
      console.log('❌ User is dragging');
      return;
    }
    
    if (hotspots.length >= 4) {
      console.log('❌ Too many hotspots');
      alert('Максимум 4 hotspot\'а на панораму');
      return;
    }

    console.log('✅ All checks passed, proceeding with raycast');

    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const mouse = new THREE.Vector2();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    console.log('📍 Mouse coordinates:', { x: mouse.x, y: mouse.y });

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);
    
    const intersects = raycaster.intersectObject(sphereRef.current);
    console.log('🎯 Intersects found:', intersects.length);
    
    if (intersects.length > 0) {
      const point = intersects[0].point;
      const normalizedPoint = point.normalize();
      
      console.log('Creating hotspot at:', normalizedPoint);
      
      // Передаем координаты напрямую в родительский компонент
      if (onHotspotCreate) {
        onHotspotCreate({
          x: normalizedPoint.x,
          y: normalizedPoint.y,
          z: normalizedPoint.z
        });
        console.log('Hotspot creation callback called');
      } else {
        console.log('No onHotspotCreate callback');
      }
    }
  }, [isEditMode, isDragging, hotspots.length, onHotspotCreate]);

  const handleHotspotClick = useCallback((event: MouseEvent) => {
    if (isEditMode || !cameraRef.current) return;
    onHotspotClick(event);
  }, [isEditMode, onHotspotClick]);

  // Инициализация сцены только один раз
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setClearColor(0x000000);
    mountRef.current.appendChild(renderer.domElement);

    // Create sphere for panorama
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    const material = new THREE.MeshBasicMaterial({ side: THREE.BackSide });

    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Set initial camera position
    camera.position.set(0, 0, 0);
    camera.lookAt(1, 0, 0);

    // Store refs
    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;
    sphereRef.current = sphere;

    // Mouse controls
    let phi = 0;
    let theta = 0;
    let mouseDownTime = 0;

    const onMouseDown = (event: MouseEvent) => {
      isMouseDownRef.current = true;
      mouseRef.current.x = event.clientX;
      mouseRef.current.y = event.clientY;
      mouseDownTime = Date.now();
      onDragStart();
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!isMouseDownRef.current) return;

      const deltaX = event.clientX - mouseRef.current.x;
      const deltaY = event.clientY - mouseRef.current.y;

      // Инвертируем управление как в Google Street View
      phi -= deltaX * 0.005; // тащишь вправо - крутит влево
      theta += deltaY * 0.005; // тащишь вниз - поднимает наверх
      
      // Limit vertical rotation
      theta = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, theta));

      // Update camera position
      const x = Math.cos(phi) * Math.cos(theta);
      const y = Math.sin(theta);
      const z = Math.sin(phi) * Math.cos(theta);
      
      camera.lookAt(x, y, z);

      mouseRef.current.x = event.clientX;
      mouseRef.current.y = event.clientY;
    };

    const onMouseUp = (event: MouseEvent) => {
      const clickDuration = Date.now() - mouseDownTime;
      
      console.log('PanoramaScene: onMouseUp', { clickDuration, isEditMode, isTour });
      
      isMouseDownRef.current = false;
      onDragEnd();
      
      // Если это был клик (короткое время), а не drag
      if (clickDuration < 200) {
        console.log('PanoramaScene: Short click detected');
        if (isEditMode) {
          console.log('PanoramaScene: Calling handleCanvasClick');
          handleCanvasClick(event);
        } else if (isTour) {
          console.log('PanoramaScene: Calling handleHotspotClick');
          handleHotspotClick(event);
        }
      } else {
        console.log('PanoramaScene: Long drag, not calling click handlers');
      }
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const fov = camera.fov + event.deltaY * 0.05;
      camera.fov = Math.max(10, Math.min(120, fov));
      camera.updateProjectionMatrix();
    };

    // Touch controls for mobile
    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        isMouseDownRef.current = true;
        mouseRef.current.x = event.touches[0].clientX;
        mouseRef.current.y = event.touches[0].clientY;
        mouseDownTime = Date.now();
        onDragStart();
      }
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!isMouseDownRef.current || event.touches.length !== 1) return;
      event.preventDefault();

      const deltaX = event.touches[0].clientX - mouseRef.current.x;
      const deltaY = event.touches[0].clientY - mouseRef.current.y;

      // Инвертируем управление как в Google Street View для touch
      phi -= deltaX * 0.005; // тащишь вправо - крутит влево
      theta += deltaY * 0.005; // тащишь вниз - поднимает наверх
      
      theta = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, theta));

      const x = Math.cos(phi) * Math.cos(theta);
      const y = Math.sin(theta);
      const z = Math.sin(phi) * Math.cos(theta);
      
      camera.lookAt(x, y, z);

      mouseRef.current.x = event.touches[0].clientX;
      mouseRef.current.y = event.touches[0].clientY;
    };

    const onTouchEnd = (event: TouchEvent) => {
      const clickDuration = Date.now() - mouseDownTime;
      
      isMouseDownRef.current = false;
      onDragEnd();
      
      // Touch click handling
      if (clickDuration < 200 && event.changedTouches.length > 0) {
        const touch = event.changedTouches[0];
        const mockEvent = {
          clientX: touch.clientX,
          clientY: touch.clientY,
          target: event.target
        } as MouseEvent;
        
        if (isEditMode) {
          handleCanvasClick(mockEvent);
        } else if (isTour) {
          handleHotspotClick(mockEvent);
        }
      }
    };

    // Add event listeners
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
    renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: false });
    renderer.domElement.addEventListener('touchmove', onTouchMove, { passive: false });
    renderer.domElement.addEventListener('touchend', onTouchEnd);

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('wheel', onWheel);
      renderer.domElement.removeEventListener('touchstart', onTouchStart);
      renderer.domElement.removeEventListener('touchmove', onTouchMove);
      renderer.domElement.removeEventListener('touchend', onTouchEnd);
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isEditMode, isTour, handleCanvasClick, handleHotspotClick, onDragStart, onDragEnd]);

  // Загрузка текстуры отдельно
  useEffect(() => {
    if (!sphereRef.current) return;

    onLoadingChange(true);
    
    const loader = new THREE.TextureLoader();
    loader.load(
      imageUrl,
      (texture) => {
        if (sphereRef.current) {
          (sphereRef.current.material as THREE.MeshBasicMaterial).map = texture;
          (sphereRef.current.material as THREE.MeshBasicMaterial).needsUpdate = true;
        }
        onLoadingChange(false);
      },
      undefined,
      (error) => {
        console.error('Error loading panorama:', error);
        onLoadingChange(false);
      }
    );
  }, [imageUrl, onLoadingChange]);

  // Update hotspots when they change
  useEffect(() => {
    updateHotspots();
  }, [hotspots, updateHotspots]);

  // Reset view function
  const resetView = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.fov = 75;
      cameraRef.current.updateProjectionMatrix();
      cameraRef.current.lookAt(1, 0, 0);
    }
  }, []);

  // Expose reset function to parent
  useEffect(() => {
    (mountRef.current as any)?.setResetFunction?.(resetView);
  }, [resetView]);

  return <div ref={mountRef} className="w-full h-full" />;
}
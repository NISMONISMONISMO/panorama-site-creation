import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'ru' | 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Переводы для всех языков
const translations: Record<Language, Record<string, string>> = {
  ru: {
    // Навигация
    'nav.home': 'Главная',
    'nav.gallery': 'Галерея',
    'nav.pricing': 'Тарифы',
    'nav.create': 'Создать',
    'nav.upload': 'Загрузить',
    'nav.signIn': 'Войти',
    'nav.back': 'Назад',
    'nav.logout': 'Выйти',
    'nav.profile': 'Профиль',
    'nav.admin': 'Админ',
    
    // Главная страница
    'hero.title1': 'Immersive 360°',
    'hero.title2': 'Virtual Experiences',
    'hero.subtitle': 'Создавайте и исследуйте захватывающие панорамные миры. Профессиональные инструменты для иммерсивного повествования и виртуальных туров.',
    'hero.exploreGallery': 'Исследовать галерею',
    'hero.startCreating': 'Начать создание',
    
    // Категории
    'categories.title': 'Категории панорам',
    'categories.subtitle': 'Изучите различные типы 360° контента',
    'categories.viewAll': 'Смотреть все',
    'categories.premium': 'Премиум',
    'categories.whatDoYouWant': 'Что вы хотите сделать?',
    'categories.chooseHow': 'Выберите, как вы хотите использовать нашу платформу для создания виртуальных впечатлений',
    'categories.panoramas': 'Панорамы',
    'categories.panoramasCount': '150+ работ',
    'categories.panoramasDesc': 'Исследуйте коллекцию 360° панорам от профессиональных фотографов',
    'categories.tours': 'Туры', 
    'categories.toursCount': '45+ работ',
    'categories.toursDesc': 'Интерактивные виртуальные туры с переходами между локациями',
    'categories.getStarted': 'Начать работу',
    'categories.getStartedDesc': 'Создавайте собственные панорамы и виртуальные туры',
    
    // Функции
    'features.title': 'Профессиональные возможности',
    'features.subtitle': 'Все необходимое для создания и публикации иммерсивных виртуальных впечатлений',
    'features.upload.title': 'Простая загрузка',
    'features.upload.desc': 'Загружайте 360° изображения одним кликом. Поддержка всех популярных форматов.',
    'features.viewer.title': 'Иммерсивный просмотр',
    'features.viewer.desc': 'Плавный просмотр с поддержкой VR и мобильных устройств.',
    'features.sharing.title': 'Легкое взаимодействие',
    'features.sharing.desc': 'Делитесь своими творениями и встраивайте их в любые сайты.',
    'features.analytics.title': 'Подробная аналитика',
    'features.analytics.desc': 'Отслеживайте просмотры, взаимодействия и популярность контента.',
    'features.tours.title': 'Виртуальные туры',
    'features.tours.desc': 'Создавайте связанные туры из нескольких панорам с переходами.',
    'features.premium.title': 'Премиум функции',
    'features.premium.desc': 'Расширенные возможности для профессионального использования.',
    'features.interactive.title': 'Интерактивный опыт',
    'features.interactive.desc': 'Плавная навигация по 360° окружению с интуитивно понятным управлением',
    'features.quality.title': 'Премиум качество',
    'features.quality.desc': 'Изображения высокого разрешения обеспечивают исключительную четкость и детализацию',
    'features.virtualTours.title': 'Виртуальные туры',
    'features.virtualTours.desc': 'Создавайте связанные впечатления, которые ведут зрителей через несколько сцен',
    'features.integration.title': 'Простая интеграция',
    'features.integration.desc': 'Встраивайте туры где угодно или делитесь пользовательскими ссылками и в социальных сетях',
    
    // Галерея
    'gallery.title': 'Галерея панорам',
    'gallery.search': 'Поиск панорам...',
    'gallery.all': 'Все',
    'gallery.panoramas': 'Панорамы',
    'gallery.tours': 'Туры',
    'gallery.noResults': 'Ничего не найдено',
    'gallery.noResultsDesc': 'Попробуйте изменить поисковый запрос или фильтры',
    'gallery.views': 'просмотров',
    'gallery.likes': 'лайков',
    'gallery.by': 'от',
    
    // Тарифы
    'pricing.title': 'Выберите свой план',
    'pricing.subtitle': 'Найдите идеальный план для ваших потребностей',
    'pricing.free': 'Бесплатно',
    'pricing.premium': 'Премиум',
    'pricing.business': 'Бизнес',
    'pricing.month': 'мес',
    'pricing.getStarted': 'Начать',
    'pricing.upgrade': 'Обновить',
    'pricing.popular': 'Популярный',
    'pricing.uploads': 'загрузки',
    'pricing.storage': 'хранение',
    'pricing.support': 'поддержка',
    'pricing.analytics': 'аналитика',
    'pricing.branding': 'брендинг',
    'pricing.api': 'API доступ',
    
    // Авторизация
    'auth.signIn': 'Вход',
    'auth.signUp': 'Регистрация',
    'auth.email': 'Email',
    'auth.password': 'Пароль',
    'auth.name': 'Имя',
    'auth.confirmPassword': 'Подтвердите пароль',
    'auth.forgotPassword': 'Забыли пароль?',
    'auth.noAccount': 'Нет аккаунта?',
    'auth.hasAccount': 'Уже есть аккаунт?',
    'auth.signInWith': 'Войти через',
    'auth.google': 'Google',
    'auth.yandex': 'Яндекс',
    'auth.vk': 'VKontakte',
    'auth.close': 'Закрыть',
    
    // Профиль
    'profile.title': 'Профиль',
    'profile.subscription': 'Подписка',
    'profile.uploads': 'Загрузки',
    'profile.storage': 'Хранение',
    'profile.tours': 'Туры',
    'profile.embedding': 'Встраивание',
    'profile.yes': 'Да',
    'profile.no': 'Нет',
    'profile.unlimited': 'Безлимит',
    'profile.permanent': 'Постоянно',
    'profile.upgradeTooltip': 'Улучшить план',
    'profile.edit': 'Редактировать профиль',
    'profile.name': 'Имя',
    'profile.bio': 'О себе',
    'profile.save': 'Сохранить',
    'profile.cancel': 'Отмена',
    'profile.myPanoramas': 'Мои панорамы',
    'profile.myTours': 'Мои туры',
    'profile.analytics': 'Аналитика',
    'profile.totalViews': 'Всего просмотров',
    'profile.totalLikes': 'Всего лайков',
    'profile.rating': 'Рейтинг',
    'profile.activity': 'Активность',
    'profile.uploadedPanoramas': 'Загружено панорам',
    'profile.createdTours': 'Создано туров',
    'profile.registrationDate': 'Дата регистрации',
    
    // Общие
    'common.loading': 'Загрузка...',
    'common.error': 'Ошибка',
    'common.success': 'Успех',
    'common.close': 'Закрыть',
    'common.save': 'Сохранить',
    'common.cancel': 'Отмена',
    'common.edit': 'Изменить',
    'common.delete': 'Удалить',
    'common.share': 'Поделиться',
    'common.view': 'Просмотр',
    'common.download': 'Скачать',
    'common.upload': 'Загрузить',
  },
  
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.gallery': 'Gallery',
    'nav.pricing': 'Pricing',
    'nav.create': 'Create',
    'nav.upload': 'Upload',
    'nav.signIn': 'Sign In',
    'nav.back': 'Back',
    'nav.logout': 'Logout',
    'nav.profile': 'Profile',
    'nav.admin': 'Admin',
    
    // Hero section
    'hero.title1': 'Immersive 360°',
    'hero.title2': 'Virtual Experiences',
    'hero.subtitle': 'Create and explore breathtaking panoramic worlds. Professional tools for immersive storytelling and virtual tours.',
    'hero.exploreGallery': 'Explore Gallery',
    'hero.startCreating': 'Start Creating',
    
    // Categories
    'categories.title': 'Panorama Categories',
    'categories.subtitle': 'Explore different types of 360° content',
    'categories.viewAll': 'View All',
    'categories.premium': 'Premium',
    'categories.whatDoYouWant': 'What would you like to do?',
    'categories.chooseHow': 'Choose how you want to use our platform to create virtual experiences',
    'categories.panoramas': 'Panoramas',
    'categories.panoramasCount': '150+ works',
    'categories.panoramasDesc': 'Explore the collection of 360° panoramas from professional photographers',
    'categories.tours': 'Tours', 
    'categories.toursCount': '45+ works',
    'categories.toursDesc': 'Interactive virtual tours with transitions between locations',
    'categories.getStarted': 'Get Started',
    'categories.getStartedDesc': 'Create your own panoramas and virtual tours',
    
    // Features
    'features.title': 'Professional Features',
    'features.subtitle': 'Everything you need to create and share immersive virtual experiences',
    'features.upload.title': 'Easy Upload',
    'features.upload.desc': 'Upload 360° images with one click. Support for all popular formats.',
    'features.viewer.title': 'Immersive Viewer',
    'features.viewer.desc': 'Smooth viewing with VR and mobile device support.',
    'features.sharing.title': 'Easy Sharing',
    'features.sharing.desc': 'Share your creations and embed them on any website.',
    'features.analytics.title': 'Detailed Analytics',
    'features.analytics.desc': 'Track views, interactions and content popularity.',
    'features.tours.title': 'Virtual Tours',
    'features.tours.desc': 'Create connected tours from multiple panoramas with transitions.',
    'features.premium.title': 'Premium Features',
    'features.premium.desc': 'Advanced capabilities for professional use.',
    'features.interactive.title': 'Interactive Experience',
    'features.interactive.desc': 'Navigate seamlessly through 360° environments with intuitive controls',
    'features.quality.title': 'Premium Quality',
    'features.quality.desc': 'High-resolution imagery delivers exceptional clarity and detail',
    'features.virtualTours.title': 'Virtual Tours',
    'features.virtualTours.desc': 'Create connected experiences that guide viewers through multiple scenes',
    'features.integration.title': 'Easy Integration',
    'features.integration.desc': 'Embed tours anywhere or share with custom links and social media',
    
    // Gallery
    'gallery.title': 'Panorama Gallery',
    'gallery.search': 'Search panoramas...',
    'gallery.all': 'All',
    'gallery.panoramas': 'Panoramas',
    'gallery.tours': 'Tours',
    'gallery.noResults': 'No results found',
    'gallery.noResultsDesc': 'Try changing your search query or filters',
    'gallery.views': 'views',
    'gallery.likes': 'likes',
    'gallery.by': 'by',
    
    // Pricing
    'pricing.title': 'Choose Your Plan',
    'pricing.subtitle': 'Find the perfect plan for your needs',
    'pricing.free': 'Free',
    'pricing.premium': 'Premium',
    'pricing.business': 'Business',
    'pricing.month': 'mo',
    'pricing.getStarted': 'Get Started',
    'pricing.upgrade': 'Upgrade',
    'pricing.popular': 'Popular',
    'pricing.uploads': 'uploads',
    'pricing.storage': 'storage',
    'pricing.support': 'support',
    'pricing.analytics': 'analytics',
    'pricing.branding': 'branding',
    'pricing.api': 'API access',
    
    // Auth
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.name': 'Name',
    'auth.confirmPassword': 'Confirm Password',
    'auth.forgotPassword': 'Forgot password?',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'auth.signInWith': 'Sign in with',
    'auth.google': 'Google',
    'auth.yandex': 'Yandex',
    'auth.vk': 'VKontakte',
    'auth.close': 'Close',
    
    // Profile
    'profile.title': 'Profile',
    'profile.subscription': 'Subscription',
    'profile.uploads': 'Uploads',
    'profile.storage': 'Storage',
    'profile.tours': 'Tours',
    'profile.embedding': 'Embedding',
    'profile.yes': 'Yes',
    'profile.no': 'No',
    'profile.unlimited': 'Unlimited',
    'profile.permanent': 'Permanent',
    'profile.upgradeTooltip': 'Upgrade Plan',
    'profile.edit': 'Edit Profile',
    'profile.name': 'Name',
    'profile.bio': 'Bio',
    'profile.save': 'Save',
    'profile.cancel': 'Cancel',
    'profile.myPanoramas': 'My Panoramas',
    'profile.myTours': 'My Tours',
    'profile.analytics': 'Analytics',
    'profile.totalViews': 'Total Views',
    'profile.totalLikes': 'Total Likes',
    'profile.rating': 'Rating',
    'profile.activity': 'Activity',
    'profile.uploadedPanoramas': 'Uploaded Panoramas',
    'profile.createdTours': 'Created Tours',
    'profile.registrationDate': 'Registration Date',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.close': 'Close',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.share': 'Share',
    'common.view': 'View',
    'common.download': 'Download',
    'common.upload': 'Upload',
  },
  
  es: {
    // Navegación
    'nav.home': 'Inicio',
    'nav.gallery': 'Galería',
    'nav.pricing': 'Precios',
    'nav.create': 'Crear',
    'nav.upload': 'Subir',
    'nav.signIn': 'Iniciar Sesión',
    'nav.back': 'Atrás',
    'nav.logout': 'Cerrar Sesión',
    'nav.profile': 'Perfil',
    'nav.admin': 'Admin',
    
    // Sección principal
    'hero.title1': 'Experiencias 360°',
    'hero.title2': 'Inmersivas Virtuales',
    'hero.subtitle': 'Crea y explora mundos panorámicos impresionantes. Herramientas profesionales para narrativa inmersiva y tours virtuales.',
    'hero.exploreGallery': 'Explorar Galería',
    'hero.startCreating': 'Comenzar a Crear',
    
    // Categorías
    'categories.title': 'Categorías de Panoramas',
    'categories.subtitle': 'Explora diferentes tipos de contenido 360°',
    'categories.viewAll': 'Ver Todo',
    'categories.premium': 'Premium',
    'categories.whatDoYouWant': '¿Qué te gustaría hacer?',
    'categories.chooseHow': 'Elige cómo quieres usar nuestra plataforma para crear experiencias virtuales',
    'categories.panoramas': 'Panoramas',
    'categories.panoramasCount': '150+ trabajos',
    'categories.panoramasDesc': 'Explora la colección de panoramas 360° de fotógrafos profesionales',
    'categories.tours': 'Tours', 
    'categories.toursCount': '45+ trabajos',
    'categories.toursDesc': 'Tours virtuales interactivos con transiciones entre ubicaciones',
    'categories.getStarted': 'Comenzar',
    'categories.getStartedDesc': 'Crea tus propios panoramas y tours virtuales',
    
    // Características
    'features.title': 'Características Profesionales',
    'features.subtitle': 'Todo lo que necesitas para crear y compartir experiencias virtuales inmersivas',
    'features.upload.title': 'Subida Fácil',
    'features.upload.desc': 'Sube imágenes 360° con un clic. Soporte para todos los formatos populares.',
    'features.viewer.title': 'Visor Inmersivo',
    'features.viewer.desc': 'Visualización fluida con soporte para VR y dispositivos móviles.',
    'features.sharing.title': 'Compartir Fácil',
    'features.sharing.desc': 'Comparte tus creaciones e incrústalas en cualquier sitio web.',
    'features.analytics.title': 'Análisis Detallado',
    'features.analytics.desc': 'Rastrea vistas, interacciones y popularidad del contenido.',
    'features.tours.title': 'Tours Virtuales',
    'features.tours.desc': 'Crea tours conectados desde múltiples panoramas con transiciones.',
    'features.premium.title': 'Características Premium',
    'features.premium.desc': 'Capacidades avanzadas para uso profesional.',
    'features.interactive.title': 'Experiencia Interactiva',
    'features.interactive.desc': 'Navega perfectamente por entornos 360° con controles intuitivos',
    'features.quality.title': 'Calidad Premium',
    'features.quality.desc': 'Las imágenes de alta resolución ofrecen claridad y detalle excepcionales',
    'features.virtualTours.title': 'Tours Virtuales',
    'features.virtualTours.desc': 'Crea experiencias conectadas que guían a los espectadores a través de múltiples escenas',
    'features.integration.title': 'Integración Fácil',
    'features.integration.desc': 'Incrusta tours en cualquier lugar o comparte con enlaces personalizados y redes sociales',
    
    // Galería
    'gallery.title': 'Galería de Panoramas',
    'gallery.search': 'Buscar panoramas...',
    'gallery.all': 'Todos',
    'gallery.panoramas': 'Panoramas',
    'gallery.tours': 'Tours',
    'gallery.noResults': 'No se encontraron resultados',
    'gallery.noResultsDesc': 'Intenta cambiar tu consulta de búsqueda o filtros',
    'gallery.views': 'vistas',
    'gallery.likes': 'me gusta',
    'gallery.by': 'por',
    
    // Precios
    'pricing.title': 'Elige Tu Plan',
    'pricing.subtitle': 'Encuentra el plan perfecto para tus necesidades',
    'pricing.free': 'Gratis',
    'pricing.premium': 'Premium',
    'pricing.business': 'Negocio',
    'pricing.month': 'mes',
    'pricing.getStarted': 'Comenzar',
    'pricing.upgrade': 'Actualizar',
    'pricing.popular': 'Popular',
    'pricing.uploads': 'subidas',
    'pricing.storage': 'almacenamiento',
    'pricing.support': 'soporte',
    'pricing.analytics': 'análisis',
    'pricing.branding': 'marca',
    'pricing.api': 'acceso API',
    
    // Autenticación
    'auth.signIn': 'Iniciar Sesión',
    'auth.signUp': 'Registrarse',
    'auth.email': 'Email',
    'auth.password': 'Contraseña',
    'auth.name': 'Nombre',
    'auth.confirmPassword': 'Confirmar Contraseña',
    'auth.forgotPassword': '¿Olvidaste tu contraseña?',
    'auth.noAccount': '¿No tienes una cuenta?',
    'auth.hasAccount': '¿Ya tienes una cuenta?',
    'auth.signInWith': 'Iniciar sesión con',
    'auth.google': 'Google',
    'auth.yandex': 'Yandex',
    'auth.vk': 'VKontakte',
    'auth.close': 'Cerrar',
    
    // Perfil
    'profile.title': 'Perfil',
    'profile.subscription': 'Suscripción',
    'profile.uploads': 'Subidas',
    'profile.storage': 'Almacenamiento',
    'profile.tours': 'Tours',
    'profile.embedding': 'Incrustación',
    'profile.yes': 'Sí',
    'profile.no': 'No',
    'profile.unlimited': 'Ilimitado',
    'profile.permanent': 'Permanente',
    'profile.upgradeTooltip': 'Actualizar Plan',
    'profile.edit': 'Editar Perfil',
    'profile.name': 'Nombre',
    'profile.bio': 'Biografía',
    'profile.save': 'Guardar',
    'profile.cancel': 'Cancelar',
    'profile.myPanoramas': 'Mis Panoramas',
    'profile.myTours': 'Mis Tours',
    'profile.analytics': 'Análisis',
    'profile.totalViews': 'Vistas Totales',
    'profile.totalLikes': 'Me Gusta Totales',
    'profile.rating': 'Calificación',
    'profile.activity': 'Actividad',
    'profile.uploadedPanoramas': 'Panoramas Subidos',
    'profile.createdTours': 'Tours Creados',
    'profile.registrationDate': 'Fecha de Registro',
    
    // Común
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.close': 'Cerrar',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.edit': 'Editar',
    'common.delete': 'Eliminar',
    'common.share': 'Compartir',
    'common.view': 'Ver',
    'common.download': 'Descargar',
    'common.upload': 'Subir',
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'ru';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
export const es = {
    header: {
        home: 'Home',
        about: 'Sobre Mí',
        projects: 'Proyectos',
        experience: 'Experiencia',
        contact: 'Contacto',
    },
    hero: {
        greeting: 'Hola,',
        name: 'Soy',
        staticSubtitle: 'Desarrollador Web Full Stack',
        subtitles: [
            'Desarrollador Web Full Stack',
            'Construyo cosas para la web.',
            'Diseño y desarrollo soluciones digitales.',
            'Resuelvo problemas con tecnología web.',
            'Código limpio, soluciones robustas.',
            'Desarrollo soluciones web preparadas para el futuro.',
        ],
        description:
            'Desarrollador web junior con experiencia full stack. Dos años en entorno profesional con Angular y NestJS en aplicaciones corporativas. Conocimientos sólidos en React y Next.js. Enfocado en colaboración, apoyo al equipo y en asumir nuevas responsabilidades para aportar valor al producto.',
        resumeButton: 'Descargar CV',
        contactButton: 'Contáctame',
    },
    sectionTitles: {
        about: 'Sobre Mí',
        projects: 'Proyectos',
        experience: 'Experiencia',
        contact: 'Contacto',
    },
    about: {
        p1: '¡Hola! Soy Joseph Josué Valderrama Vílchez, desarrollador web junior con base en Asturias y disponibilidad geográfica. Me apasiona construir aplicaciones web funcionales y centradas en el usuario, con experiencia en frontend y backend en entornos corporativos.',
        p2: 'Llevo dos años en la industria trabajando principalmente con Angular y NestJS, y sigo ampliando mi perfil con React, Next.js y buenas prácticas de equipo. Disfruto resolver problemas complejos, optimizar flujos de trabajo y seguir aprendiendo. Idiomas: español (nativo) e inglés (A2).',
        frontend: 'Frontend',
        backend: 'Backend',
        databases: 'Base de Datos',
        tools: 'Herramientas',
    },
    projects: {
        project: 'Proyecto',
        projectName: 'Nombre del Proyecto',
        description: 'Una breve descripción del proyecto, las tecnologías utilizadas y el papel que desempeñé.',
        viewProject: 'Ver Proyecto',
        sourceCode: 'Código Fuente',
        projectsData: [
            {
                name: 'DINEO',
                description:
                    'Un ERP integral para restaurantes que incluye un conjunto de funciones diseñadas para optimizar la gestión de negocios de restauración. Actualmente en fase de desarrollo.',
                image:
                    'data:image/svg+xml,%3Csvg width="400" height="200" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cpattern id="p" width="10" height="10" patternUnits="userSpaceOnUse"%3E%3Ccircle cx="5" cy="5" r="1" fill="%238892b0" opacity="0.2"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100%" height="100%" fill="var(--color-card-background)"/%3E%3Crect width="100%" height="100%" fill="url(%23p)"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="\'Inter\', sans-serif" font-size="24" font-weight="900" letter-spacing="0.1em" fill="var(--color-text-muted)"%3EPRÓXIMAMENTE%3C/text%3E%3C/svg%3E',
                tags: ['React', 'Nest.js', 'React Native', 'Tailwind CSS', 'SQL'],
            },
            {
                name: 'Porfolio Profesional',
                description:
                    'Este es el portafolio profesional que estás viendo. Creado para presentar mi trabajo y habilidades como desarrollador web, cuenta con un diseño moderno, animado y totalmente responsivo.',
                image: 'https://res.cloudinary.com/deqzz76ni/image/upload/v1761154158/cbea39e0-6dbe-4247-b6e4-bf9433f8a253.png',
                tags: ['React', 'TypeScript', 'Tailwind CSS', 'Vercel'],
            },
            {
                name: 'EatTime',
                description:
                    'Plataforma moderna para reservas en restaurantes, proyecto final del CFGS DAW (AFA Formación | Unendo), reconocido con el premio al mejor proyecto de curso. Permite reservar mesas con facilidad y mejora la experiencia del comensal.',
                image: 'https://res.cloudinary.com/deqzz76ni/image/upload/v1761152815/19129c03-d59f-4fcc-8190-3725f06da55b.png',
                link: 'https://eattime.vercel.app',
                github: 'https://github.com/Joseph210388/eattime',
                tags: ['React', 'Next.js', 'Tailwind CSS', 'TypeScript', 'MongoDB'],
            },
            {
                name: 'API Pokémon',
                description:
                    'Una API de Pokémon creada en mi primer año de estudios, utilizando HTML, CSS y JavaScript puros. Desplegada en Vercel para una disponibilidad global.',
                image: 'https://res.cloudinary.com/deqzz76ni/image/upload/v1761153126/839462e3-175e-4313-8c0b-8a5d43d90d38.png',
                link: 'https://pokedex-blond-tau.vercel.app/',
                github: 'https://github.com/Joseph210388/pokecartas',
                tags: ['HTML', 'CSS', 'JavaScript', 'Vercel'],
            },
            {
                name: 'Porfolio 2023',
                description:
                    'Este fue mi primer proyecto personal en el grado superior. Fue desarrollado con HTML, JS y CSS y deplegado con Vercel.',
                image: 'https://res.cloudinary.com/deqzz76ni/image/upload/v1761154321/0b02bff1-e159-471f-b0b0-283cb6a55fff.png',
                link: 'https://porfolio-lsm9xxni5-joseph210388.vercel.app/',
                github: 'https://github.com/Joseph210388/Porfolio',
                tags: ['HTML', 'CSS', 'JavaScript', 'Vercel'],
            },
        ],
    },
    experience: {
        tabsLabel: 'Pestañas de Experiencia',
        work: 'Laboral',
        studies: 'Estudios',
        workExperience: [
            {
                title: 'DESARROLLADOR WEB JUNIOR FRONT/BACK-END',
                company: 'MOBENTIS',
                date: 'ENERO 2025 – ACTUALIDAD • ASTURIAS, ESPAÑA',
                tasks: [
                    'Lideré el análisis y desarrollo de una herramienta interna de gestión de rendimiento (Performance Management), optimizando el seguimiento de objetivos y métricas operativas.',
                    'Implementé módulos de lógica transaccional compleja, gestionando el procesamiento de datos para el cálculo de variables de rendimiento y cumplimiento.',
                    'Coordiné requerimientos técnicos con stakeholders, encargándome de la planificación de tareas de otros miembros del equipo técnico.',
                    'Gestión de persistencia de datos mediante la creación de consultas avanzadas en MySQL y SQL Server.',
                ],
                tech: 'Angular • SQL • NestJS • Bootstrap • JS • Microsoft SQL Server • TypeScript',
                icons: ['Angular', 'NestJS', 'Bootstrap', 'JavaScript', 'TypeScript', 'MySQL', 'SQL Server'],
            },
            {
                title: 'DESARROLLADOR WEB JUNIOR FRONT/BACK-END (CONTRATO DE PRÁCTICAS)',
                company: 'MOBENTIS',
                date: 'JULIO 2024 – ENERO 2025 • ASTURIAS, ESPAÑA',
                tasks: [
                    'Ejecuté la optimización de la capa visual y de experiencia de usuario (UX) para plataformas de logística y distribución de alta disponibilidad.',
                    'Resolví incidencias críticas en el flujo de datos entre el Frontend y el Backend, mejorando la estabilidad de la aplicación.',
                    'Desarrollé interfaces dinámicas y reutilizables con Angular y TypeScript, reduciendo tiempos de carga y mejorando la experiencia de usuario en plataformas de logística.',
                ],
                tech: 'Angular • TypeScript',
                icons: ['Angular', 'TypeScript'],
            },
            {
                title: 'ESTUDIANTE EN PRÁCTICAS',
                company: 'MOBENTIS',
                date: 'ABRIL 2024 – JUNIO 2024 • ASTURIAS, ESPAÑA',
                tasks: [
                    'Participé en el ciclo de vida de desarrollo de software, apoyando en el diseño y construcción de componentes Full Stack.',
                    'Me integré al stack tecnológico de la empresa en un tiempo reducido, contribuyendo activamente al desarrollo de componentes Full Stack desde las primeras semanas.',
                ],
                tech: 'Angular • TypeScript',
                icons: ['Angular', 'TypeScript'],
            },
        ],
        studiesData: [
            {
                title: 'CFGS DESARROLLO DE APLICACIONES WEB (DAW)',
                institution: 'AFA FORMACIÓN | UNENDO',
                date: 'MAYO 2024 • ASTURIAS — PREMIO AL MEJOR PROYECTO FINAL DE CURSO',
            },
            {
                title: 'DISEÑO Y DESARROLLO WEB (96 HORAS)',
                institution: 'IDAT',
                date: '2021',
            },
            {
                title: 'EXCEL 2016 BÁSICO',
                institution: 'CIBERTEC',
                date: '2021',
            },
        ],
    },
    contact: {
        successTitle: '¡Gracias por tu mensaje!',
        successMessage: 'Me pondré en contacto contigo pronto.',
        description:
            'Aunque actualmente estoy trabajando, siempre estoy abierto a nuevos retos. Mi bandeja de entrada siempre está abierta a ofertas o si tienes alguna pregunta, haré todo lo posible por responderla.',
        nameLabel: 'Nombre',
        emailLabel: 'Email',
        messageLabel: 'Mensaje',
        submitButton: 'Enviar Mensaje',
        submittingButton: 'Enviando...',
        validation: {
            nameRequired: 'El nombre es obligatorio.',
            emailRequired: 'El email es obligatorio.',
            emailInvalid: 'El formato del email no es válido.',
            messageRequired: 'El mensaje es obligatorio.',
            messageTooShort: 'El mensaje debe tener al menos 10 caracteres.',
        },
    },
    footer: {
        text: 'Diseñado y Construido por Joseph Valderrama',
    },
};

export const translations = {
    es: {
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
            subtitles: [
                'Construyo cosas para la web.',
                'Diseño y desarrollo soluciones digitales.',
                'Resuelvo problemas con tecnología web.',
                'Código limpio, soluciones robustas.',
                'Desarrollo soluciones web preparadas para el futuro.'
            ],
            description: 'Soy un desarrollador web especializado en construir (y ocasionalmente diseñar) experiencias digitales excepcionales. Actualmente, estoy enfocado en crear productos accesibles y centrados en el ser humano.',
            resumeButton: 'Currículum',
            contactButton: 'Contáctame',
        },
        sectionTitles: {
            about: 'Sobre Mí',
            projects: 'Proyectos',
            experience: 'Experiencia',
            contact: 'Contacto',
        },
        about: {
            p1: '¡Hola! Soy Joseph, un apasionado desarrollador web con un profundo amor por crear aplicaciones web hermosas, funcionales y centradas en el usuario. Con experiencia en todo el espectro del desarrollo, desde el frontend hasta el backend, me especializo en dar vida a las ideas a través de código limpio y eficiente.',
            p2: 'Mi viaje en el desarrollo comenzó con una simple curiosidad que rápidamente se convirtió en una carrera. Disfruto el desafío de resolver problemas complejos y aprender continuamente sobre las nuevas tecnologías que moldean el futuro de la web.',
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
                    description: 'Un ERP integral para restaurantes que incluye un conjunto de funciones diseñadas para optimizar la gestión de negocios de restauración. Actualmente en fase de desarrollo.',
                    image: 'data:image/svg+xml,%3Csvg width="400" height="200" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cpattern id="p" width="10" height="10" patternUnits="userSpaceOnUse"%3E%3Ccircle cx="5" cy="5" r="1" fill="%238892b0" opacity="0.2"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100%" height="100%" fill="var(--color-card-background)"/%3E%3Crect width="100%" height="100%" fill="url(%23p)"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="\'Inter\', sans-serif" font-size="24" font-weight="900" letter-spacing="0.1em" fill="var(--color-text-muted)"%3EPRÓXIMAMENTE%3C/text%3E%3C/svg%3E',
                    tags: ['React', 'Nest.js', 'React Native', 'Tailwind CSS', 'SQL']
                },
                {
                    name: 'Porfolio Profesional',
                    description: 'Este es el portafolio profesional que estás viendo. Creado para presentar mi trabajo y habilidades como desarrollador web, cuenta con un diseño moderno, animado y totalmente responsivo.',
                    image: 'https://res.cloudinary.com/deqzz76ni/image/upload/v1761154158/cbea39e0-6dbe-4247-b6e4-bf9433f8a253.png',
                    tags: ['React', 'TypeScript', 'Tailwind CSS', 'Vercel']
                },
                {
                    name: 'EatTime',
                    description: 'EatTime es una plataforma moderna e intuitiva para la reserva en restaurantes, desarrollada como proyecto final de mi Grado Superior. Permite a los usuarios reservar mesas fácilmente y mejora la experiencia gastronómica con funcionalidades adicionales.',
                    image: 'https://res.cloudinary.com/deqzz76ni/image/upload/v1761152815/19129c03-d59f-4fcc-8190-3725f06da55b.png',
                    link: 'https://eattime.vercel.app',
                    github: 'https://github.com/Joseph210388/eattime',
                    tags: ['React', 'Next.js', 'Tailwind CSS', 'TypeScript', 'MongoDB']
                },
                {
                    name: 'API Pokémon',
                    description: 'Una API de Pokémon creada en mi primer año de estudios, utilizando HTML, CSS y JavaScript puros. Desplegada en Vercel para una disponibilidad global.',
                    image: 'https://res.cloudinary.com/deqzz76ni/image/upload/v1761153126/839462e3-175e-4313-8c0b-8a5d43d90d38.png',
                    link: 'https://pokedex-blond-tau.vercel.app/',
                    github: 'https://github.com/Joseph210388/pokecartas',
                    tags: ['HTML', 'CSS', 'JavaScript', 'Vercel']
                },
                {
                    name: 'Porfolio 2023',
                    description: 'Este fue mi primer proyecto personal en el grado superior. Fue desarrollado con HTML, JS y CSS y deplegado con Vercel.',
                    image: 'https://res.cloudinary.com/deqzz76ni/image/upload/v1761154321/0b02bff1-e159-471f-b0b0-283cb6a55fff.png',
                    link: 'https://porfolio-lsm9xxni5-joseph210388.vercel.app/',
                    github: 'https://github.com/Joseph210388/Porfolio',
                    tags: ['HTML', 'CSS', 'JavaScript', 'Vercel']
                }
            ]
        },
        experience: {
            tabsLabel: 'Pestañas de Experiencia',
            work: 'Laboral',
            studies: 'Estudios',
            workExperience: [
                {
                    title: "DESARROLLADOR DE APLICACIONES WEB",
                    company: "MOBENTIS",
                    date: "ENERO 2024 - ACTUALIDAD",
                    tasks: [
                        "Mantenimiento y desarrollo del Frontend y Backend.",
                        "Desarrollo de lógica de negocio (Business Logic).",
                        "Desarrollo y optimización de consultas SQL.",
                        "Adopción y aplicación del framework NestJS (Node.js) para la construcción de nuevas API/servicios.",
                    ],
                    tech: "Angular • MySQL • Bootstrap • JS • SQL • TypeScript",
                    icons: ['Angular', 'MySQL', 'Bootstrap', 'JavaScript', 'SQL', 'TypeScript']
                },
                {
                    title: "ESTUDIANTE EN PRÁCTICAS",
                    company: "MOBENTIS",
                    date: "ABRIL 2024 - JUNIO 2024",
                    tasks: [
                        "Diseño y desarrollo del Frontend y Backend.",
                        "Aprendizaje de Angular 16.",
                    ],
                    tech: "Angular • MySQL • Bootstrap • JS • TypeScript",
                    icons: ['Angular', 'MySQL', 'Bootstrap', 'JavaScript', 'TypeScript']
                }
            ],
            studiesData: [
                {
                    title: "CFGS DESARROLLO DE APLICACIONES WEB",
                    institution: "AFA FORMACIÓN",
                    date: "2024 - FINALIZADA",
                },
                {
                    title: "DISEÑO Y DESARROLLO WEB (PERÚ) (96 HORAS)",
                    institution: "IDAT",
                    date: "2021 - FINALIZADA",
                },
                {
                    title: "EXCEL 2016 BÁSICO (PERÚ) (22 HORAS)",
                    institution: "CIBERTEC",
                    date: "2021 - FINALIZADA",
                }
            ]
        },
        contact: {
            successTitle: '¡Gracias por tu mensaje!',
            successMessage: 'Me pondré en contacto contigo pronto.',
            description: 'Aunque actualmente estoy trabajando, siempre estoy abierto a nuevos retos. Mi bandeja de entrada siempre está abierta a ofertas o si tienes alguna pregunta, haré todo lo posible por responderla.',
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
                messageTooShort: 'El mensaje debe tener al menos 10 caracteres.'
            }
        },
        footer: {
            text: 'Diseñado y Construido por Joseph Valderrama'
        }
    },
    en: {
        header: {
            home: 'Home',
            about: 'About Me',
            projects: 'Projects',
            experience: 'Experience',
            contact: 'Contact',
        },
        hero: {
            greeting: 'Hello,',
            name: "I'm",
            subtitles: [
                'I build things for the web.',
                'I design and develop digital solutions.',
                'I solve problems with web technology.',
                'Clean code, robust solutions.',
                'Developing future-ready web solutions.'
            ],
            description: "I'm a web developer specializing in building (and occasionally designing) exceptional digital experiences. Currently, I'm focused on building accessible, human-centered products.",
            resumeButton: 'Resume',
            contactButton: 'Contact Me',
        },
        sectionTitles: {
            about: 'About Me',
            projects: 'Projects',
            experience: 'Experience',
            contact: 'Contact',
        },
        about: {
            p1: "Hello! I'm Joseph, a passionate web developer with a deep love for creating beautiful, functional, and user-centered web applications. With experience across the full spectrum of development, from frontend to backend, I specialize in bringing ideas to life through clean and efficient code.",
            p2: "My journey in development began with a simple curiosity that quickly turned into a career. I enjoy the challenge of solving complex problems and continuously learning about the new technologies that are shaping the future of the web.",
            frontend: 'Frontend',
            backend: 'Backend',
            databases: 'Databases',
            tools: 'Tools',
        },
        projects: {
            project: 'Project',
            projectName: 'Project Name',
            description: 'A brief description of the project, the technologies used, and the role I played.',
            viewProject: 'View Project',
            sourceCode: 'Source Code',
            projectsData: [
                {
                    name: 'DINEO',
                    description: 'A comprehensive ERP for restaurants, including a suite of features designed to optimize the management of food service businesses. Currently in development.',
                    image: 'data:image/svg+xml,%3Csvg width="400" height="200" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cpattern id="p" width="10" height="10" patternUnits="userSpaceOnUse"%3E%3Ccircle cx="5" cy="5" r="1" fill="%238892b0" opacity="0.2"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100%" height="100%" fill="var(--color-card-background)"/%3E%3Crect width="100%" height="100%" fill="url(%23p)"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="\'Inter\', sans-serif" font-size="24" font-weight="900" letter-spacing="0.1em" fill="var(--color-text-muted)"%3ECOMING SOON%3C/text%3E%3C/svg%3E',
                    tags: ['React', 'Nest.js', 'React Native', 'Tailwind CSS', 'SQL']
                },
                {
                    name: 'Professional Portfolio',
                    description: 'This is the professional portfolio you are currently viewing. Created to showcase my work and skills as a web developer, it features a modern, animated, and fully responsive design.',
                    image: 'https://res.cloudinary.com/deqzz76ni/image/upload/v1761154158/cbea39e0-6dbe-4247-b6e4-bf9433f8a253.png',
                    tags: ['React', 'TypeScript', 'Tailwind CSS', 'Vercel']
                },
                {
                    name: 'EatTime',
                    description: 'EatTime is a modern and intuitive restaurant reservation platform, developed as the final project for my Higher National Diploma. It allows users to easily book tables and enhances the dining experience with additional features.',
                    image: 'https://res.cloudinary.com/deqzz76ni/image/upload/v1761152815/19129c03-d59f-4fcc-8190-3725f06da55b.png',
                    link: 'https://eattime.vercel.app',
                    github: 'https://github.com/Joseph210388/eattime',
                    tags: ['React', 'Next.js', 'Tailwind CSS', 'TypeScript', 'MongoDB']
                },
                {
                    name: 'Pokémon API',
                    description: 'A Pokémon API project created during my first year of studies, built with pure HTML, CSS, and JavaScript. Deployed on Vercel for global availability.',
                    image: 'https://res.cloudinary.com/deqzz76ni/image/upload/v1761153126/839462e3-175e-4313-8c0b-8a5d43d90d38.png',
                    link: 'https://pokedex-blond-tau.vercel.app/',
                    github: 'https://github.com/Joseph210388/pokecartas',
                    tags: ['HTML', 'CSS', 'JavaScript', 'Vercel']
                },
                {
                    name: 'Portfolio 2023',
                    description: 'This was my first personal project during my higher degree. It was developed with HTML, JS, and CSS, and deployed with Vercel.',
                    image: 'https://res.cloudinary.com/deqzz76ni/image/upload/v1761154321/0b02bff1-e159-471f-b0b0-283cb6a55fff.png',
                    link: 'https://porfolio-lsm9xxni5-joseph210388.vercel.app/',
                    github: 'https://github.com/Joseph210388/Porfolio',
                    tags: ['HTML', 'CSS', 'JavaScript', 'Vercel']
                }
            ]
        },
        experience: {
            tabsLabel: 'Experience Tabs',
            work: 'Work',
            studies: 'Studies',
            workExperience: [
                {
                    title: "WEB APPLICATION DEVELOPER",
                    company: "MOBENTIS",
                    date: "JANUARY 2024 - PRESENT",
                    tasks: [
                        "Maintenance and development of Frontend and Backend.",
                        "Development of Business Logic.",
                        "Development and optimization of SQL queries.",
                        "Adoption and application of the NestJS framework (Node.js) for building new APIs/services.",
                    ],
                    tech: "Angular • MySQL • Bootstrap • JS • SQL • TypeScript",
                    icons: ['Angular', 'MySQL', 'Bootstrap', 'JavaScript', 'SQL', 'TypeScript']
                },
                {
                    title: "INTERN",
                    company: "MOBENTIS",
                    date: "APRIL 2024 - JUNE 2024",
                    tasks: [
                        "Design and development of Frontend and Backend.",
                        "Learning Angular 16.",
                    ],
                    tech: "Angular • MySQL • Bootstrap • JS • TypeScript",
                    icons: ['Angular', 'MySQL', 'Bootstrap', 'JavaScript', 'TypeScript']
                }
            ],
            studiesData: [
                {
                    title: "HND IN WEB APPLICATION DEVELOPMENT",
                    institution: "AFA FORMACIÓN",
                    date: "2024 - COMPLETED",
                },
                {
                    title: "WEB DESIGN AND DEVELOPMENT (PERU) (96 HOURS)",
                    institution: "IDAT",
                    date: "2021 - COMPLETED",
                },
                {
                    title: "BASIC EXCEL 2016 (PERU) (22 HOURS)",
                    institution: "CIBERTEC",
                    date: "2021 - COMPLETED",
                }
            ]
        },
        contact: {
            successTitle: 'Thank you for your message!',
            successMessage: "I'll get back to you soon.",
            description: "Although I'm currently working, I'm always open to new challenges. My inbox is always open to offers, and if you have any questions, I'll do my best to answer them.",
            nameLabel: 'Name',
            emailLabel: 'Email',
            messageLabel: 'Message',
            submitButton: 'Send Message',
            submittingButton: 'Sending...',
            validation: {
                nameRequired: 'Name is required.',
                emailRequired: 'Email is required.',
                emailInvalid: 'Invalid email format.',
                messageRequired: 'Message is required.',
                messageTooShort: 'Message must be at least 10 characters.'
            }
        },
        footer: {
            text: 'Designed & Built by Joseph Valderrama'
        }
    }
};
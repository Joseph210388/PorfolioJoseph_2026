import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import SocialLinks from './components/SocialLinks';
import Section from './components/Section';
import LoadingScreen from './components/LoadingScreen';
import TechnologyCarousel from './components/TechnologyCarousel';
import ContactForm from './components/ContactForm';
import useOnScreen from './hooks/useOnScreen';
import { translations } from './i18n/translations';
import {
    AngularIcon, BootstrapIcon, JavaScriptIcon, MySqlIcon, SqlIcon, TypeScriptIcon,
    ReactIcon, NodeJsIcon, NestJsIcon, TailwindCssIcon,
    NextJsIcon, Html5Icon, Css3Icon, ScssIcon, JwtIcon,
    RestApiIcon, SqlServerIcon, MongoDbIcon, GitIcon, PostmanIcon,
    WebpackIcon, ViteIcon, GithubToolIcon, GithubIcon, ExternalLinkIcon
} from './components/icons';
import ThemeSwitcher from './components/ThemeSwitcher';
import LanguageSwitcher from './components/LanguageSwitcher';

const iconSize = "w-20 h-20";
const iconMutedColor = `${iconSize} text-text-muted`;

const frontendTechnologies = [
    { name: 'React', icon: <ReactIcon className={iconMutedColor} /> },
    { name: 'Angular + Material', icon: <AngularIcon className={iconSize} /> },
    { name: 'Next.js', icon: <NextJsIcon className={iconMutedColor} /> },
    { name: 'TypeScript', icon: <TypeScriptIcon className={iconSize} /> },
    { name: 'JavaScript', icon: <JavaScriptIcon className={iconSize} /> },
    { name: 'HTML5', icon: <Html5Icon className={iconMutedColor} /> },
    { name: 'CSS3', icon: <Css3Icon className={iconMutedColor} /> },
    { name: 'SCSS', icon: <ScssIcon className={iconMutedColor} /> },
    { name: 'Tailwind CSS', icon: <TailwindCssIcon className={iconMutedColor} /> },
    { name: 'Bootstrap', icon: <BootstrapIcon className={iconSize} /> },
];

const backendTechnologies = [
    { name: 'Node.js', icon: <NodeJsIcon className={iconMutedColor} /> },
    { name: 'NestJS', icon: <NestJsIcon className={iconSize} /> },
    { name: 'REST API', icon: <RestApiIcon className={iconMutedColor} /> },
    { name: 'JWT', icon: <JwtIcon className={iconMutedColor} /> },
];

const databaseTechnologies = [
    { name: 'MySQL', icon: <MySqlIcon className={iconSize} /> },
    { name: 'SQL Server', icon: <SqlServerIcon className={iconMutedColor} /> },
    { name: 'MongoDB', icon: <MongoDbIcon className={iconSize} /> },
];

const toolsTechnologies = [
    { name: 'Git', icon: <GitIcon className={iconMutedColor} /> },
    { name: 'GitHub', icon: <GithubToolIcon className={iconMutedColor} /> },
    { name: 'Postman', icon: <PostmanIcon className={iconMutedColor} /> },
    { name: 'Webpack', icon: <WebpackIcon className={iconMutedColor} /> },
    { name: 'Vite', icon: <ViteIcon className={iconMutedColor} /> },
];


const AboutContent: React.FC<{ t: typeof translations.es.about }> = ({ t }) => (
    <div className="max-w-4xl mx-auto text-lg text-text-secondary space-y-4">
        <p>{t.p1}</p>
        <p>{t.p2}</p>
        <div className="space-y-12 pt-8">
            <div>
                <h3 className="text-2xl font-bold text-text-primary mb-4 text-center">{t.frontend}</h3>
                <TechnologyCarousel technologies={frontendTechnologies} />
            </div>
            <div>
                <h3 className="text-2xl font-bold text-text-primary mb-4 text-center">{t.backend}</h3>
                <TechnologyCarousel technologies={backendTechnologies} />
            </div>
            <div>
                <h3 className="text-2xl font-bold text-text-primary mb-4 text-center">{t.databases}</h3>
                <TechnologyCarousel technologies={databaseTechnologies} />
            </div>
            <div>
                <h3 className="text-2xl font-bold text-text-primary mb-4 text-center">{t.tools}</h3>
                <TechnologyCarousel technologies={toolsTechnologies} />
            </div>
        </div>
    </div>
);

const ProjectsContent: React.FC<{ t: typeof translations.es.projects }> = ({ t }) => (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {t.projectsData.map((project, index) => (
            <div key={index} className="group bg-card-background rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl dark:ring-1 dark:ring-white/10 flex flex-col">
                <div className="overflow-hidden h-48">
                    <img src={project.image} alt={project.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-bold text-text-primary">{project.name}</h3>
                        <div className="flex items-center space-x-4 flex-shrink-0">
                            {project.github && project.github !== '#' && (
                                <a href={project.github} target="_blank" rel="noopener noreferrer" aria-label={t.sourceCode} title={t.sourceCode} className="text-text-muted hover:text-accent transition-colors duration-200">
                                    <GithubToolIcon className="w-6 h-6" />
                                </a>
                            )}
                            {project.link && project.link !== '#' && (
                                <a href={project.link} target="_blank" rel="noopener noreferrer" aria-label={t.viewProject} title={t.viewProject} className="text-text-muted hover:text-accent transition-colors duration-200">
                                    <ExternalLinkIcon className="w-6 h-6" />
                                </a>
                            )}
                        </div>
                    </div>
                    <p className="text-text-secondary flex-grow mb-4">{project.description}</p>
                    <div className="mt-auto pt-4 border-t border-border/20">
                        <ul className="flex flex-wrap gap-2" aria-label="Tecnologías usadas">
                            {project.tags.map(tag => (
                                <li key={tag} className="text-xs font-mono bg-accent/10 text-accent px-2 py-1 rounded">
                                    {tag}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

const ExperienceItem: React.FC<{ item: any; index: number }> = ({ item, index }) => {
    const ref = useRef<HTMLDivElement>(null);
    const isVisible = useOnScreen(ref, "-100px");

    return (
        <div
            ref={ref}
            className={`bg-card-background p-6 rounded-lg shadow-lg transition-all duration-500 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                }`}
            style={{ transitionDelay: `${index * 150}ms` }}
        >
            <h3 className="text-xl font-bold text-text-primary">{item.title}</h3>
            <p className="text-md text-accent font-semibold">{item.company}</p>
            <p className="text-sm text-text-muted font-mono mb-2">{item.date}</p>
            <ul className="list-disc list-inside text-text-secondary space-y-2 mt-4">
                {item.tasks.map((task: string, i: number) => <li key={i}>{task}</li>)}
            </ul>
            <div className="flex items-center gap-4 mt-6">
                {item.icons.map((icon: any) => (
                    <div key={icon.name} title={icon.name} className="transform hover:scale-110 transition-transform duration-200">
                        {icon.component}
                    </div>
                ))}
            </div>
            <p className="text-sm text-text-muted mt-4 font-mono">
                {item.tech}
            </p>
        </div>
    );
};

const ExperienceContent: React.FC<{ t: any }> = ({ t }) => (
    <div className="space-y-8">
        {t.map((job: any, index: number) => (
            <ExperienceItem item={job} index={index} key={index} />
        ))}
    </div>
);

const StudyItem: React.FC<{ item: any; index: number }> = ({ item, index }) => {
    const ref = useRef<HTMLDivElement>(null);
    const isVisible = useOnScreen(ref, "-100px");

    return (
        <div
            ref={ref}
            className={`bg-card-background p-6 rounded-lg shadow-lg transition-all duration-500 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                }`}
            style={{ transitionDelay: `${index * 150}ms` }}
        >
            <h3 className="text-xl font-bold text-text-primary">{item.title}</h3>
            <p className="text-md text-accent font-semibold">{item.institution}</p>
            <p className="text-sm text-text-muted font-mono">{item.date}</p>
        </div>
    );
};

const StudiesContent: React.FC<{ t: any }> = ({ t }) => (
    <div className="space-y-8">
        {t.map((study: any, index: number) => (
            <StudyItem item={study} index={index} key={index} />
        ))}
    </div>
);

const ExperienceTabs: React.FC<{ t: typeof translations.es.experience }> = ({ t }) => {
    const [activeTab, setActiveTab] = useState('laboral');

    const tabButtonClasses = "px-6 py-2 rounded-t-lg text-lg font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent";
    const activeTabClasses = "bg-card-background text-text-primary";
    const inactiveTabClasses = "bg-transparent text-text-muted hover:bg-gray-500/10 hover:text-text-secondary transform hover:-translate-y-1";

    const workExperience = t.workExperience.map(job => ({
        ...job,
        icons: job.icons.map(iconName => {
            switch (iconName) {
                case 'Angular': return { name: 'Angular', component: <AngularIcon className="w-7 h-7" /> };
                case 'MySQL': return { name: 'MySQL', component: <MySqlIcon className="w-7 h-7" /> };
                case 'Bootstrap': return { name: 'Bootstrap', component: <BootstrapIcon className="w-7 h-7" /> };
                case 'JavaScript': return { name: 'JavaScript', component: <JavaScriptIcon className="w-7 h-7" /> };
                case 'SQL': return { name: 'SQL', component: <SqlIcon className="w-7 h-7 text-text-muted" /> };
                case 'TypeScript': return { name: 'TypeScript', component: <TypeScriptIcon className="w-7 h-7" /> };
                default: return null;
            }
        }).filter(Boolean)
    }));

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex border-b border-border mb-8" role="tablist" aria-label={t.tabsLabel}>
                <button
                    className={`${tabButtonClasses} ${activeTab === 'laboral' ? activeTabClasses : inactiveTabClasses}`}
                    onClick={() => setActiveTab('laboral')}
                    role="tab"
                    aria-selected={activeTab === 'laboral'}
                    aria-controls="panel-laboral"
                    id="tab-laboral"
                >
                    {t.work}
                </button>
                <button
                    className={`${tabButtonClasses} ${activeTab === 'estudios' ? activeTabClasses : inactiveTabClasses}`}
                    onClick={() => setActiveTab('estudios')}
                    role="tab"
                    aria-selected={activeTab === 'estudios'}
                    aria-controls="panel-estudios"
                    id="tab-estudios"
                >
                    {t.studies}
                </button>
            </div>
            <div>
                {activeTab === 'laboral' && (
                    <div id="panel-laboral" role="tabpanel" tabIndex={0} aria-labelledby="tab-laboral">
                        <ExperienceContent t={workExperience} />
                    </div>
                )}
                {activeTab === 'estudios' && (
                    <div id="panel-estudios" role="tabpanel" tabIndex={0} aria-labelledby="tab-estudios">
                        <StudiesContent t={t.studiesData} />
                    </div>
                )}
            </div>
        </div>
    );
};


const App: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        return savedTheme || (userPrefersDark ? 'dark' : 'light');
    });

    const [language, setLanguage] = useState<'es' | 'en'>(() => {
        const savedLang = localStorage.getItem('language');
        return (savedLang === 'en' || savedLang === 'es') ? savedLang : 'es';
    });

    const t = translations[language];

    const blob1Ref = useRef<HTMLDivElement>(null);
    const blob2Ref = useRef<HTMLDivElement>(null);
    const blob3Ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        document.documentElement.lang = language;
        localStorage.setItem('language', language);
    }, [language]);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000); // 2 segundos de pantalla de carga

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        let animationFrameId: number;

        const handleScroll = () => {
            const scrollY = window.scrollY;
            cancelAnimationFrame(animationFrameId);

            animationFrameId = requestAnimationFrame(() => {
                if (blob1Ref.current) {
                    blob1Ref.current.style.transform = `translateY(${scrollY * 0.2}px)`;
                }
                if (blob2Ref.current) {
                    blob2Ref.current.style.transform = `translateY(${scrollY * -0.1}px)`;
                }
                if (blob3Ref.current) {
                    blob3Ref.current.style.transform = `translateY(${scrollY * 0.15}px)`;
                }
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <>
            <LoadingScreen isLoading={isLoading} />
            <div className="min-h-screen bg-background relative overflow-hidden">
                {/* Background Blobs */}
                <div ref={blob1Ref} className="absolute top-0 -left-4">
                    <div className="w-72 h-72 bg-[var(--color-blob-1)] rounded-full filter blur-3xl opacity-50 animate-blob"></div>
                </div>
                <div ref={blob2Ref} className="absolute top-0 -right-4">
                    <div className="w-72 h-72 bg-[var(--color-blob-2)] rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
                </div>
                <div ref={blob3Ref} className="absolute -bottom-8 left-20">
                    <div className="w-72 h-72 bg-[var(--color-blob-3)] rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
                </div>

                <div className="relative z-10">
                    <Header t={t.header} />
                    <main className="px-6 sm:px-12 md:px-24 pt-20">
                        <Hero t={t.hero} />
                        <Section id="about" title={t.sectionTitles.about}>
                            <AboutContent t={t.about} />
                        </Section>
                        <Section id="proyectos" title={t.sectionTitles.projects}>
                            <ProjectsContent t={t.projects} />
                        </Section>
                        <Section id="experiencia" title={t.sectionTitles.experience}>
                            <ExperienceTabs t={t.experience} />
                        </Section>
                        <Section id="contacto" title={t.sectionTitles.contact}>
                            <ContactForm t={t.contact} />
                        </Section>
                    </main>
                    <footer className="text-center py-8 text-text-muted">
                        <p>{t.footer.text}</p>
                    </footer>
                </div>
            </div>
            <SocialLinks />
            <div className="fixed bottom-4 right-4 z-50 flex flex-col items-center gap-3">
                <LanguageSwitcher language={language} setLanguage={setLanguage} />
                <ThemeSwitcher theme={theme} toggleTheme={toggleTheme} />
            </div>
        </>
    );
};

export default App;
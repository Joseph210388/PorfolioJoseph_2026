import React from 'react';
import {
    AngularIcon,
    BootstrapIcon,
    JavaScriptIcon,
    MySqlIcon,
    TypeScriptIcon,
    ReactIcon,
    NodeJsIcon,
    NestJsIcon,
    TailwindCssIcon,
    NextJsIcon,
    Html5Icon,
    Css3Icon,
    ScssIcon,
    JwtIcon,
    RestApiIcon,
    SqlServerIcon,
    MongoDbIcon,
    SupabaseIcon,
    GitIcon,
    PostmanIcon,
    WebpackIcon,
    ViteIcon,
    VercelIcon,
    GithubToolIcon,
} from '../components/icons';

const iconSize = 'w-20 h-20';
const iconMutedColor = `${iconSize} text-text-muted`;

export const frontendTechnologies = [
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

export const backendTechnologies = [
    { name: 'Node.js', icon: <NodeJsIcon className={iconMutedColor} /> },
    { name: 'NestJS', icon: <NestJsIcon className={iconSize} /> },
    { name: 'REST API', icon: <RestApiIcon className={iconMutedColor} /> },
    { name: 'JWT', icon: <JwtIcon className={iconMutedColor} /> },
];

export const databaseTechnologies = [
    { name: 'MySQL', icon: <MySqlIcon className={iconSize} /> },
    { name: 'SQL Server', icon: <SqlServerIcon className={iconMutedColor} /> },
    { name: 'MongoDB', icon: <MongoDbIcon className={iconSize} /> },
    { name: 'Supabase', icon: <SupabaseIcon className={iconSize} /> },
];

export const toolsTechnologies = [
    { name: 'Git', icon: <GitIcon className={iconMutedColor} /> },
    { name: 'GitHub', icon: <GithubToolIcon className={iconMutedColor} /> },
    { name: 'Postman', icon: <PostmanIcon className={iconMutedColor} /> },
    { name: 'Webpack', icon: <WebpackIcon className={iconMutedColor} /> },
    { name: 'Vite', icon: <ViteIcon className={iconMutedColor} /> },
    { name: 'Vercel', icon: <VercelIcon className={iconMutedColor} /> },
];

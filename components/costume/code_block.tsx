'use client'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'react-syntax-highlighter/dist/esm/languages/prism/python';
import 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import 'react-syntax-highlighter/dist/esm/languages/prism/css';
import 'react-syntax-highlighter/dist/esm/languages/prism/json';
import 'react-syntax-highlighter/dist/esm/languages/prism/csharp';
import 'react-syntax-highlighter/dist/esm/languages/prism/cpp';
import 'react-syntax-highlighter/dist/esm/languages/prism/java';
import 'react-syntax-highlighter/dist/esm/languages/prism/dart';
import { useTheme } from 'next-themes';


export const CodeBlock = ({ code, language = "plaintext" }: CodeBlockProps) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <SyntaxHighlighter
        language={language.toLowerCase()}
        style={isDark ? oneDark : oneLight}
        showLineNumbers={false}
        customStyle={{ borderRadius: 10,
        padding: '1rem',
        fontSize: 13,
        fontFamily: 'JetBrains Mono, monospace',
        fontOpticalSizing: "auto",
        fontWeight: 600,
        fontStyle: "normal",
        background: 'transparent', }}
        >
        {code}
        </SyntaxHighlighter>
    );
};

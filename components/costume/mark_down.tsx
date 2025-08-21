import ReactMarkdown from 'react-markdown';

export default function MarkdownText({ content }: { content: string }) {
  return (
    <div className="prose dark:prose-invert max-w-full break-words overflow-hidden">
      <ReactMarkdown
        components={{
          // Force code blocks to break and scroll
          code: ({node, ...props}) => (
            <code className="break-all overflow-hidden" {...props} />
          ),
          // Force pre blocks to scroll instead of overflow
          pre: ({node, ...props}) => (
            <pre className="overflow-x-auto max-w-full whitespace-pre-wrap" {...props} />
          ),
          // Force links to break
          a: ({node, ...props}) => (
            <a className="break-all" {...props} />
          ),
          // Handle long text in paragraphs
          p: ({node, ...props}) => (
            <p className="break-words overflow-wrap-anywhere" {...props} />
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
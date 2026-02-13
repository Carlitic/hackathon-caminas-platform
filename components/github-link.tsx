'use client';

import { Github } from 'lucide-react';
import { useState, useEffect } from 'react';

export function GithubLink() {
  const [repoUrl, setRepoUrl] = useState<string>('');

  useEffect(() => {
    fetch('/version.json')
      .then((res) => res.json())
      .then((data) => setRepoUrl(data.repository))
      .catch(() => setRepoUrl('https://github.com/Carlitic/hackathon-caminas-platform'));
  }, []);

  return (
    <a
      href={repoUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center w-9 h-9 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
      title="Ver código en GitHub"
    >
      <Github className="h-5 w-5" />
      <span className="sr-only">GitHub Repository</span>
    </a>
  );
}
